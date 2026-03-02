import { streamText, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tool, LanguageModel } from "ai";

// Provider imports
import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 60;

// ============================================================
// AI MODEL CONFIGURATION
// ============================================================
// Set AI_PROVIDER in .env.local to one of: groq, google, openrouter, openai
// Each provider needs its own API key env variable.

function getModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  switch (provider) {
    case "groq":
      // Free tier: https://console.groq.com  |  GROQ_API_KEY
      return groq("llama-3.3-70b-versatile");

    case "google":
      // Free tier: https://aistudio.google.com  |  GOOGLE_GENERATIVE_AI_API_KEY
      return google("gemini-2.0-flash");

    case "openrouter": {
      // Free/cheap models: https://openrouter.ai  |  OPENROUTER_API_KEY
      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      return openrouter(process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free");
    }

    case "openai":
      // Paid: https://platform.openai.com  |  OPENAI_API_KEY
      return openai("gpt-4o-mini");

    default:
      return groq("llama-3.3-70b-versatile");
  }
}

const SYSTEM_PROMPT = `You are VivahSthal's AI Wedding Assistant — a warm, knowledgeable virtual Relationship Manager who helps couples find their dream wedding venue in India.

Your personality:
- Warm and congratulatory (this is their special day!)
- Professional yet friendly, like a trusted family advisor
- Culturally aware of Indian wedding traditions
- Knowledgeable about venue types, capacities, and pricing

Your capabilities:
1. Search and suggest venues based on user preferences (city, budget, capacity, type)
2. Check venue availability for specific dates and time slots
3. Capture lead information when users show booking intent
4. Provide information about auspicious wedding dates (Muhurthams)

Guidelines:
- Always ask about their requirements: city, guest count, budget, preferred dates
- Highlight auspicious dates when relevant
- When a user wants to book or shows strong interest, capture their details as a lead
- After capturing a lead, say: "I've noted your requirements! Our specialist will also call you shortly to help finalize everything."
- Suggest morning slots for ceremonies and evening slots for receptions
- Be concise but helpful. Use bullet points for venue suggestions.
- Prices are in Indian Rupees (₹)

You MUST use the provided tools when:
- User asks to find/search venues → use searchVenues
- User wants to book or shows intent → use captureLead
- User asks about availability → mention they can check on the venue page`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const searchVenuesTool: Tool<any, any> = {
    description:
      "Search for wedding venues based on user preferences like city, capacity, budget, and venue type",
    inputSchema: z.object({
      city: z.string().optional().describe("City name to search in"),
      capacity: z.number().optional().describe("Minimum guest capacity needed"),
      budget_max: z.number().optional().describe("Maximum budget in INR"),
      venue_type: z.string().optional().describe("Type of venue like banquet_hall, farmhouse, resort, etc."),
    }),
    execute: async ({ city, capacity, budget_max, venue_type }: {
      city?: string;
      capacity?: number;
      budget_max?: number;
      venue_type?: string;
    }) => {
      const supabase = await createServiceClient();

      let query = supabase
        .from("venues")
        .select("name, slug, city, state, venue_type, capacity_min, capacity_max, price_per_slot, rating, amenities")
        .eq("is_active", true)
        .limit(5);

      if (city) query = query.ilike("city", `%${city}%`);
      if (capacity) query = query.gte("capacity_max", capacity);
      if (budget_max) query = query.lte("price_per_slot", budget_max);
      if (venue_type) query = query.eq("venue_type", venue_type);

      const { data, error } = await query;

      if (error || !data?.length) {
        return {
          found: false as const,
          message: "No venues found matching your criteria. Try adjusting your filters.",
          venues: [],
          count: 0,
        };
      }

      return {
        found: true as const,
        venues: data,
        count: data.length,
        message: "",
      };
    },
  };

  const captureLeadTool: Tool<any, any> = {
    description:
      "Capture user details as a lead when they show intent to book a venue. Ask for name and phone if not provided.",
    inputSchema: z.object({
      customer_name: z.string().describe("Customer's full name"),
      customer_phone: z.string().describe("Customer's phone number"),
      customer_email: z.string().optional().describe("Customer's email"),
      venue_id: z.string().optional().describe("Venue ID if specific venue mentioned"),
      event_date: z.string().optional().describe("Preferred event date"),
      guest_count: z.number().optional().describe("Expected guest count"),
      message: z.string().optional().describe("Additional requirements or notes"),
    }),
    execute: async (leadInfo: Record<string, unknown>) => {
      const supabase = await createServiceClient();

      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...leadInfo,
          source: "ai_chatbot",
          status: "new",
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: "Could not save your details. Please try again or call us directly.",
          lead_id: null,
        };
      }

      return {
        success: true,
        message: "Lead captured successfully",
        lead_id: data.id,
      };
    },
  };

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: {
      searchVenues: searchVenuesTool,
      captureLead: captureLeadTool,
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
