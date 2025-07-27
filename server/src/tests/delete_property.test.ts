
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, propertyImagesTable, favoritesTable } from '../db/schema';
import { type CreatePropertyInput, type CreatePropertyImageInput, type AddFavoriteInput } from '../schema';
import { deleteProperty } from '../handlers/delete_property';
import { eq } from 'drizzle-orm';

// Test data
const testProperty: CreatePropertyInput = {
  title: 'Test Property',
  description: 'A property for testing deletion',
  price: 250000,
  city: 'lisbon',
  address: 'Test Street 123',
  latitude: 38.7223,
  longitude: -9.1393,
  bedrooms: 2,
  bathrooms: 1,
  area_sqm: 80.5,
  property_type: 'apartment',
  is_featured: false
};

describe('deleteProperty', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing property', async () => {
    // Create a test property
    const insertResult = await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .returning()
      .execute();

    const propertyId = insertResult[0].id;

    // Delete the property
    const result = await deleteProperty(propertyId);

    expect(result).toBe(true);

    // Verify the property no longer exists
    const properties = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .execute();

    expect(properties).toHaveLength(0);
  });

  it('should return false for non-existent property', async () => {
    const result = await deleteProperty(99999);

    expect(result).toBe(false);
  });

  it('should cascade delete related images', async () => {
    // Create a test property
    const insertResult = await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .returning()
      .execute();

    const propertyId = insertResult[0].id;

    // Create related images
    const testImage: CreatePropertyImageInput = {
      property_id: propertyId,
      image_url: 'https://example.com/image.jpg',
      alt_text: 'Test image',
      is_primary: true,
      sort_order: 1
    };

    await db.insert(propertyImagesTable)
      .values(testImage)
      .execute();

    // Verify image exists before deletion
    const imagesBefore = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.property_id, propertyId))
      .execute();

    expect(imagesBefore).toHaveLength(1);

    // Delete the property
    const result = await deleteProperty(propertyId);

    expect(result).toBe(true);

    // Verify images are cascade deleted
    const imagesAfter = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.property_id, propertyId))
      .execute();

    expect(imagesAfter).toHaveLength(0);
  });

  it('should cascade delete related favorites', async () => {
    // Create a test property
    const insertResult = await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .returning()
      .execute();

    const propertyId = insertResult[0].id;

    // Create related favorite
    const testFavorite: AddFavoriteInput = {
      session_id: 'test-session-123',
      property_id: propertyId
    };

    await db.insert(favoritesTable)
      .values(testFavorite)
      .execute();

    // Verify favorite exists before deletion
    const favoritesBefore = await db.select()
      .from(favoritesTable)
      .where(eq(favoritesTable.property_id, propertyId))
      .execute();

    expect(favoritesBefore).toHaveLength(1);

    // Delete the property
    const result = await deleteProperty(propertyId);

    expect(result).toBe(true);

    // Verify favorites are cascade deleted
    const favoritesAfter = await db.select()
      .from(favoritesTable)
      .where(eq(favoritesTable.property_id, propertyId))
      .execute();

    expect(favoritesAfter).toHaveLength(0);
  });
});
