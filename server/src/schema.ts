
import { z } from 'zod';

// Property type enum
export const propertyTypeSchema = z.enum(['apartment', 'house', 'villa']);
export type PropertyType = z.infer<typeof propertyTypeSchema>;

// City enum for Portugal
export const citySchema = z.enum(['lisbon', 'porto', 'algarve', 'braga', 'coimbra', 'aveiro', 'funchal', 'faro']);
export type City = z.infer<typeof citySchema>;

// Property schema
export const propertySchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  city: citySchema,
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  area_sqm: z.number(),
  property_type: propertyTypeSchema,
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Property = z.infer<typeof propertySchema>;

// Property image schema
export const propertyImageSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  image_url: z.string().url(),
  alt_text: z.string(),
  is_primary: z.boolean(),
  sort_order: z.number().int(),
  created_at: z.coerce.date()
});

export type PropertyImage = z.infer<typeof propertyImageSchema>;

// Property with images schema for detailed views
export const propertyWithImagesSchema = propertySchema.extend({
  images: z.array(propertyImageSchema)
});

export type PropertyWithImages = z.infer<typeof propertyWithImagesSchema>;

// Favorite schema
export const favoriteSchema = z.object({
  id: z.number(),
  session_id: z.string(), // Since no user authentication, use session-based favorites
  property_id: z.number(),
  created_at: z.coerce.date()
});

export type Favorite = z.infer<typeof favoriteSchema>;

// Filter schema for property search
export const propertyFiltersSchema = z.object({
  city: citySchema.optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  bedrooms: z.number().int().optional(),
  property_type: propertyTypeSchema.optional(),
  is_featured: z.boolean().optional()
});

export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;

// Input schemas for creating/updating properties
export const createPropertyInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  city: citySchema,
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  area_sqm: z.number().positive(),
  property_type: propertyTypeSchema,
  is_featured: z.boolean().default(false)
});

export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;

export const updatePropertyInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  city: citySchema.optional(),
  address: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  area_sqm: z.number().positive().optional(),
  property_type: propertyTypeSchema.optional(),
  is_featured: z.boolean().optional()
});

export type UpdatePropertyInput = z.infer<typeof updatePropertyInputSchema>;

// Input schemas for property images
export const createPropertyImageInputSchema = z.object({
  property_id: z.number(),
  image_url: z.string().url(),
  alt_text: z.string(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().default(0)
});

export type CreatePropertyImageInput = z.infer<typeof createPropertyImageInputSchema>;

// Input schemas for favorites
export const addFavoriteInputSchema = z.object({
  session_id: z.string(),
  property_id: z.number()
});

export type AddFavoriteInput = z.infer<typeof addFavoriteInputSchema>;

export const removeFavoriteInputSchema = z.object({
  session_id: z.string(),
  property_id: z.number()
});

export type RemoveFavoriteInput = z.infer<typeof removeFavoriteInputSchema>;

export const getFavoritesInputSchema = z.object({
  session_id: z.string()
});

export type GetFavoritesInput = z.infer<typeof getFavoritesInputSchema>;
