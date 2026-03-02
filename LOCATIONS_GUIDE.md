# VivahSthal – Developer Reference Guide

---

## Part 1 — Adding / Managing Locations (Cities)

All location values live in **one single file**:

```
src/lib/constants.ts
```

Open it and find the `CITIES` array at the top:

```ts
export const CITIES = [
  "Bhabua",     // District HQ
  "Mohania",
  "Chainpur",
  // ...
] as const;
```

### How to add a new location

1. Open `src/lib/constants.ts`.
2. Add a new string entry inside the `CITIES` array.

```ts
export const CITIES = [
  "Bhabua",
  "Mohania",
  "Chainpur",
  "Bhagwanpur",
  "Belaw",
  "Chenari",
  "Adhaura",
  "Ramgarh",
  "Kudra",
  "Nuaon",
  "Durgawati",
  "Robertsganj",   // 👈 NEW — nearby UP town example
] as const;
```

3. **That's it.** The new city automatically appears in:
   - Partner → Add Venue → City dropdown
   - Admin → Leads / Venues → City filter
   - Public venue search filters

> **No database migration needed** — `city` is stored as a plain `TEXT` column.

---

### How to reorganise into districts / groups (future)

If you want to show grouped dropdowns ("Kaimur District", "Rohtas District", etc.),
replace the flat array with a grouped map:

```ts
export const CITY_GROUPS = {
  "Kaimur District": ["Bhabua", "Mohania", "Chainpur", "Bhagwanpur"],
  "Rohtas District": ["Sasaram", "Dehri", "Robertsganj"],
} as const;

// Flat list (used in filters, server-side logic):
export const CITIES = Object.values(CITY_GROUPS).flat() as string[];
```

Then update the `<Select>` component to render `<optgroup>` elements.

---

## Part 2 — Venue Image Upload

### How it works

The `ImageUploader` component (`src/components/venue/image-uploader.tsx`) gives
vendors two ways to add images, **one at a time**, up to **5 images** per venue.

| Method | How it works |
|--------|-------------|
| **Drag & Drop / Browse** | Vendor drags a local image or clicks to select. File is uploaded to **Supabase Storage** (`venue-images` bucket) and the public URL is saved. |
| **URL** | Vendor pastes a direct image URL (Cloudinary, ImgBB, Google Drive direct link, etc.). Stored as-is. |

The **first image** automatically becomes the `cover_image` shown in listing cards.

---

### Required Supabase Storage setup (one-time)

Before file uploads work, create the storage bucket:

1. Go to your **Supabase dashboard → Storage → New Bucket**.
2. Name it exactly: `venue-images`
3. Set visibility to **Public**.
4. Add a Row-Level-Security (RLS) policy:

```sql
-- Allow authenticated vendors to upload
CREATE POLICY "Vendors can upload venue images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'venue-images');

-- Allow anyone to read
CREATE POLICY "Public read venue images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'venue-images');
```

Or run this convenience migration:

```sql
-- Add to a new migration file: supabase/migrations/002_storage.sql

INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Vendors can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'venue-images');

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'venue-images');
```

---

### Changing the maximum image count

Open `src/components/venue/image-uploader.tsx` and edit line 1:

```ts
const MAX_IMAGES = 5;   // change to any number you like
```

---

### Accepted image types / size limits

Also near the top of `image-uploader.tsx`:

```ts
// In the uploadFile function:
if (!file.type.startsWith("image/")) { return; }            // any image type
if (file.size > 5 * 1024 * 1024) { alert(...); return; }   // 5 MB limit
```

Change `5 * 1024 * 1024` to e.g. `10 * 1024 * 1024` for 10 MB.

---

### Image display in the public venue card

`cover_image` is already used by `VenueCard` (`src/components/venue/venue-card.tsx`).
All images (array) are stored in `venues.images TEXT[]` in Postgres and can be
shown in a gallery on the venue detail page (`src/app/(public)/venues/[slug]/page.tsx`).

---

## Part 3 — Quick cheat-sheet

| Task | File to edit |
|------|-------------|
| Add / remove a city | `src/lib/constants.ts` → `CITIES` array |
| Add a venue type | `src/lib/constants.ts` → `VENUE_TYPES` array |
| Add an amenity | `src/lib/constants.ts` → `AMENITIES` array |
| Change max images | `src/components/venue/image-uploader.tsx` → `MAX_IMAGES` |
| Change storage bucket name | `src/components/venue/image-uploader.tsx` → `BUCKET` |
| Change file size limit | `src/components/venue/image-uploader.tsx` → upload guard |
| Add a new district group | `src/lib/constants.ts` → create `CITY_GROUPS` map |
