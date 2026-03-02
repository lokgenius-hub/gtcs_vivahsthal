"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Lead, Venue, VenueSlot, VenueSearchParams } from "@/lib/types";

// ============================================================
// AUTH ACTIONS
// ============================================================

export async function signUpUser(formData: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: string;
}): Promise<{ error: string | null; needsConfirmation: boolean }> {
  try {
    // Step 1: Create auth user (anon client so cookies/session are set correctly)
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role || "customer",
        },
      },
    });

    // "Database error saving new user" = trigger crashed but auth still created the user in some cases
    // We check if it's a trigger-related error and try to recover via service role
    if (authError) {
      if (authError.message.toLowerCase().includes("database error")) {
        // Supabase trigger may have failed but the user could still exist
        // Try a lookup via service role to recover
        try {
          const serviceClient = await createServiceClient();
          const { data: existing } = await serviceClient.auth.admin.listUsers();
          const existingUser = existing?.users?.find(u => u.email === formData.email);
          if (existingUser) {
            // User was created despite trigger error — upsert profile and continue
            await serviceClient.from("profiles").upsert(
              {
                id: existingUser.id,
                full_name: formData.full_name || formData.email,
                email: formData.email,
                phone: formData.phone || null,
                role: (formData.role as "customer" | "vendor" | "admin" | "rm") || "customer",
              },
              { onConflict: "id" }
            );
            return { error: null, needsConfirmation: true };
          }
        } catch {
          // Recovery failed — fall through to original error
        }
      }
      return { error: authError.message, needsConfirmation: false };
    }

    const user = data?.user;
    if (!user) return { error: "Signup failed. Please try again.", needsConfirmation: false };

    // Step 2: Manually upsert profile using service role — works even if trigger is broken/missing
    const serviceClient = await createServiceClient();
    await serviceClient.from("profiles").upsert(
      {
        id: user.id,
        full_name: formData.full_name || formData.email,
        email: formData.email,
        phone: formData.phone || null,
        role: (formData.role as "customer" | "vendor" | "admin" | "rm") || "customer",
      },
      { onConflict: "id" }
    );
    // We intentionally ignore upsert errors here — the trigger may have already created it

    // If no session, email confirmation is required
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred",
      needsConfirmation: false,
    };
  }
}

/** Upgrade a logged-in customer account to vendor role */
export async function upgradeToVendor(): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    // Update profile role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "vendor" })
      .eq("id", user.id);
    if (profileError) return { error: profileError.message };

    // Update auth user_metadata so JWT reflects new role immediately
    await supabase.auth.updateUser({ data: { role: "vendor" } });

    revalidatePath("/");
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unexpected error" };
  }
}


export async function getVenues(params: VenueSearchParams = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("venues")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.city) query = query.eq("city", params.city);
  if (params.venue_type) query = query.eq("venue_type", params.venue_type);
  if (params.capacity) query = query.gte("capacity_max", params.capacity);
  if (params.budget_min) query = query.gte("price_per_slot", params.budget_min);
  if (params.budget_max) query = query.lte("price_per_slot", params.budget_max);
  if (params.q) query = query.or(`name.ilike.%${params.q}%,city.ilike.%${params.q}%,description.ilike.%${params.q}%`);

  const limit = params.limit || 12;
  const page = params.page || 1;
  const from = (page - 1) * limit;

  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching venues:", error);
    return { venues: [], total: 0 };
  }

  return { venues: (data as Venue[]) || [], total: count || 0 };
}

export async function getVenueBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Venue;
}

/** Get vendor contact info (phone + name) for a given venue */
export async function getVendorContact(venueId: string): Promise<{ full_name: string; phone: string | null; email: string | null } | null> {
  const supabase = await createServiceClient();
  // First get vendor_id from venue
  const { data: venue } = await supabase.from("venues").select("vendor_id").eq("id", venueId).single();
  if (!venue?.vendor_id) return null;
  const { data: profile } = await supabase.from("profiles").select("full_name, phone, email").eq("id", venue.vendor_id).single();
  return profile ?? null;
}

export async function getFeaturedVenues() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("rating", { ascending: false })
    .limit(6);

  return (data as Venue[]) || [];
}

// ============================================================
// AVAILABILITY ACTIONS
// ============================================================

export async function getVenueSlots(venueId: string, month?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("venue_slots")
    .select("*")
    .eq("venue_id", venueId)
    .order("slot_date", { ascending: true });

  if (month) {
    const start = `${month}-01`;
    const end = `${month}-31`;
    query = query.gte("slot_date", start).lte("slot_date", end);
  }

  const { data } = await query;
  return (data as VenueSlot[]) || [];
}

export async function checkAvailability(
  venueId: string,
  date: string,
  slotType: string
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("venue_slots")
    .select("*")
    .eq("venue_id", venueId)
    .eq("slot_date", date)
    .eq("slot_type", slotType)
    .single();

  if (!data) return { available: true, slot: null };
  return { available: data.is_available, slot: data as VenueSlot };
}

// ============================================================
// LEAD ACTIONS
// ============================================================

export async function createLead(formData: FormData) {
  const supabase = await createClient();

  const leadData = {
    venue_id: formData.get("venue_id") as string || null,
    customer_name: formData.get("customer_name") as string,
    customer_email: formData.get("customer_email") as string,
    customer_phone: formData.get("customer_phone") as string,
    event_date: formData.get("event_date") as string || null,
    slot_preference: formData.get("slot_preference") as string || null,
    guest_count: formData.get("guest_count") ? parseInt(formData.get("guest_count") as string) : null,
    budget_range: formData.get("budget_range") as string || null,
    message: formData.get("message") as string || null,
    source: (formData.get("source") as string) || "website",
    status: "new" as const,
  };

  // Try to attach customer_id if logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    (leadData as Record<string, unknown>).customer_id = user.id;
  }

  const { data, error } = await supabase
    .from("leads")
    .insert(leadData)
    .select()
    .single();

  if (error) {
    console.error("Lead creation error:", error);
    return { success: false, error: error.message };
  }

  // TODO: Send SMS/Email notification to vendor here
  // await notifyVendor(data.venue_id, data);

  revalidatePath("/admin/leads");
  return { success: true, lead: data };
}

export async function createLeadFromAI(leadInfo: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  venue_id?: string;
  event_date?: string;
  guest_count?: number;
  message?: string;
}) {
  const serviceClient = await createServiceClient();

  const { data, error } = await serviceClient
    .from("leads")
    .insert({
      ...leadInfo,
      source: "ai_chatbot",
      status: "new",
    })
    .select()
    .single();

  if (error) {
    console.error("AI lead creation error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, lead: data };
}

// ============================================================
// VENDOR ACTIONS
// ============================================================

/** Fetch all venues owned by the currently logged-in vendor */
export async function getMyVenues() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { venues: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { venues: [], error: error.message };
  return { venues: data ?? [], error: null };
}

/** Update a venue's data (only the owning vendor or admin may do this) */
export async function updateVenue(venueId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify ownership
  const { data: existing } = await supabase
    .from("venues")
    .select("vendor_id")
    .eq("id", venueId)
    .single();

  if (!existing) return { success: false, error: "Venue not found" };

  // Check profile for admin bypass
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (existing.vendor_id !== user.id && profile?.role !== "admin") {
    return { success: false, error: "You do not have permission to edit this venue" };
  }

  const imagesRaw = formData.get("images") as string | null;
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : [];
  const coverImage = (formData.get("cover_image") as string | null) || images[0] || null;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const fields = [
    "name", "description", "venue_type", "city", "state",
    "address", "pincode",
  ];
  for (const f of fields) {
    const v = formData.get(f);
    if (v !== null && v !== "") updates[f] = v as string;
  }
  const cap_min = formData.get("capacity_min");
  const cap_max = formData.get("capacity_max");
  const price_slot = formData.get("price_per_slot");
  const price_plate = formData.get("price_per_plate");
  if (cap_min) updates.capacity_min = parseInt(cap_min as string);
  if (cap_max) updates.capacity_max = parseInt(cap_max as string);
  if (price_slot) updates.price_per_slot = parseFloat(price_slot as string);
  if (price_plate) updates.price_per_plate = parseFloat(price_plate as string);

  const amenitiesRaw = formData.get("amenities") as string | null;
  if (amenitiesRaw) updates.amenities = JSON.parse(amenitiesRaw);

  if (images.length > 0) {
    updates.images = images;
    updates.cover_image = coverImage;
  }

  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("id", venueId)
    .select()
    .single();

  if (error) {
    console.error("Venue update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/partner/venues");
  revalidatePath(`/venues/${data.slug}`);
  return { success: true, venue: data };
}

export async function createVenue(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Ensure the profile row exists before inserting a venue (FK constraint)
  // This handles cases where the trigger or signUpUser upsert failed silently
  const serviceClient = await createServiceClient();
  await serviceClient.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || "Vendor",
      email: user.email!,
      phone: user.user_metadata?.phone || null,
      role: "vendor",
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  const imagesRaw = formData.get("images") as string | null;
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : [];
  const coverImage = (formData.get("cover_image") as string | null) || images[0] || null;

  const venueData = {
    vendor_id: user.id,
    name: formData.get("name") as string,
    slug: (formData.get("name") as string)
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-"),
    description: formData.get("description") as string,
    venue_type: formData.get("venue_type") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string || "Bihar",
    address: formData.get("address") as string,
    pincode: formData.get("pincode") as string,
    capacity_min: parseInt(formData.get("capacity_min") as string) || 50,
    capacity_max: parseInt(formData.get("capacity_max") as string) || 500,
    price_per_slot: parseFloat(formData.get("price_per_slot") as string) || 0,
    price_per_plate: formData.get("price_per_plate")
      ? parseFloat(formData.get("price_per_plate") as string)
      : null,
    amenities: JSON.parse(formData.get("amenities") as string || "[]"),
    images,
    cover_image: coverImage,
  };

  const { data, error } = await supabase
    .from("venues")
    .insert(venueData)
    .select()
    .single();

  if (error) {
    console.error("Venue creation error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/partner/dashboard");
  return { success: true, venue: data };
}

export async function updateVenueSlot(
  venueId: string,
  date: string,
  slotType: string,
  isAvailable: boolean,
  isAuspicious: boolean = false,
  priceOverride?: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venue_slots")
    .upsert(
      {
        venue_id: venueId,
        slot_date: date,
        slot_type: slotType,
        is_available: isAvailable,
        is_auspicious: isAuspicious,
        price_override: priceOverride || null,
      },
      { onConflict: "venue_id,slot_date,slot_type" }
    )
    .select()
    .single();

  if (error) {
    console.error("Slot update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/venues/${venueId}`);
  return { success: true, slot: data };
}

// ============================================================
// ADMIN ACTIONS
// ============================================================

export async function getLeads(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*, venue:venues(name, city), customer:profiles!leads_customer_id_fkey(full_name, phone)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return data as Lead[];
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) {
    console.error("Lead status update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

// ============================================================
// AUSPICIOUS DATES
// ============================================================

export async function getAuspiciousDates(year?: number) {
  const supabase = await createClient();

  const currentYear = year || new Date().getFullYear();

  const { data } = await supabase
    .from("auspicious_dates")
    .select("*")
    .eq("year", currentYear)
    .order("date", { ascending: true });

  return data || [];
}
