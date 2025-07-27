
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, propertyImagesTable } from '../db/schema';
import { deletePropertyImage } from '../handlers/delete_property_image';
import { eq } from 'drizzle-orm';

describe('deletePropertyImage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a property image and return true', async () => {
    // Create a property first
    const property = await db.insert(propertiesTable)
      .values({
        title: 'Test Property',
        description: 'A property for testing',
        price: '299999.99',
        city: 'lisbon',
        address: 'Rua de Test, 123',
        latitude: '38.7223',
        longitude: '-9.1393',
        bedrooms: 2,
        bathrooms: 1,
        area_sqm: '85.5',
        property_type: 'apartment',
        is_featured: false
      })
      .returning()
      .execute();

    // Create a property image
    const propertyImage = await db.insert(propertyImagesTable)
      .values({
        property_id: property[0].id,
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'Test image',
        is_primary: true,
        sort_order: 1
      })
      .returning()
      .execute();

    const result = await deletePropertyImage(propertyImage[0].id);

    expect(result).toBe(true);

    // Verify image is deleted from database
    const images = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.id, propertyImage[0].id))
      .execute();

    expect(images).toHaveLength(0);
  });

  it('should return false when property image does not exist', async () => {
    const result = await deletePropertyImage(999);

    expect(result).toBe(false);
  });

  it('should not affect other property images when deleting one', async () => {
    // Create a property first
    const property = await db.insert(propertiesTable)
      .values({
        title: 'Test Property',
        description: 'A property for testing',
        price: '299999.99',
        city: 'porto',
        address: 'Rua de Test, 456',
        latitude: '41.1579',
        longitude: '-8.6291',
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: '120.0',
        property_type: 'house',
        is_featured: true
      })
      .returning()
      .execute();

    // Create multiple property images
    const image1 = await db.insert(propertyImagesTable)
      .values({
        property_id: property[0].id,
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'First image',
        is_primary: true,
        sort_order: 1
      })
      .returning()
      .execute();

    const image2 = await db.insert(propertyImagesTable)
      .values({
        property_id: property[0].id,
        image_url: 'https://example.com/image2.jpg',
        alt_text: 'Second image',
        is_primary: false,
        sort_order: 2
      })
      .returning()
      .execute();

    // Delete first image
    const result = await deletePropertyImage(image1[0].id);

    expect(result).toBe(true);

    // Verify only first image is deleted
    const remainingImages = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.property_id, property[0].id))
      .execute();

    expect(remainingImages).toHaveLength(1);
    expect(remainingImages[0].id).toBe(image2[0].id);
    expect(remainingImages[0].image_url).toBe('https://example.com/image2.jpg');
  });
});
