
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'house', 'villa']);
export const cityEnum = pgEnum('city', ['lisbon', 'porto', 'algarve', 'braga', 'coimbra', 'aveiro', 'funchal', 'faro']);

// Properties table
export const propertiesTable = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  city: cityEnum('city').notNull(),
  address: text('address').notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  area_sqm: numeric('area_sqm', { precision: 8, scale: 2 }).notNull(),
  property_type: propertyTypeEnum('property_type').notNull(),
  is_featured: boolean('is_featured').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Property images table
export const propertyImagesTable = pgTable('property_images', {
  id: serial('id').primaryKey(),
  property_id: integer('property_id').notNull().references(() => propertiesTable.id, { onDelete: 'cascade' }),
  image_url: text('image_url').notNull(),
  alt_text: text('alt_text').notNull(),
  is_primary: boolean('is_primary').default(false).notNull(),
  sort_order: integer('sort_order').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Favorites table (session-based since no user authentication)
export const favoritesTable = pgTable('favorites', {
  id: serial('id').primaryKey(),
  session_id: text('session_id').notNull(),
  property_id: integer('property_id').notNull().references(() => propertiesTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const propertiesRelations = relations(propertiesTable, ({ many }) => ({
  images: many(propertyImagesTable),
  favorites: many(favoritesTable)
}));

export const propertyImagesRelations = relations(propertyImagesTable, ({ one }) => ({
  property: one(propertiesTable, {
    fields: [propertyImagesTable.property_id],
    references: [propertiesTable.id]
  })
}));

export const favoritesRelations = relations(favoritesTable, ({ one }) => ({
  property: one(propertiesTable, {
    fields: [favoritesTable.property_id],
    references: [propertiesTable.id]
  })
}));

// TypeScript types for the table schemas
export type Property = typeof propertiesTable.$inferSelect;
export type NewProperty = typeof propertiesTable.$inferInsert;
export type PropertyImage = typeof propertyImagesTable.$inferSelect;
export type NewPropertyImage = typeof propertyImagesTable.$inferInsert;
export type Favorite = typeof favoritesTable.$inferSelect;
export type NewFavorite = typeof favoritesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  properties: propertiesTable,
  propertyImages: propertyImagesTable,
  favorites: favoritesTable
};
