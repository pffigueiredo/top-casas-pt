
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, propertyImagesTable } from '../db/schema';
import { type CreatePropertyImageInput } from '../schema';
import { createPropertyImage } from '../handlers/create_property_image';
import { eq } from 'drizzle-orm';

describe('createPropertyImage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testPropertyId: number;

  // Create a test property before each test
  beforeEach(async () => {
    const propertyResult = await db.insert(propertiesTable)
      .values({
        title: 'Test Property',
        description: 'Test description',
        price: '100000.00',
        city: 'lisbon',
        address: 'Test Address',
        latitude: '38.7169',
        longitude: '-9.1395',
        bedrooms: 2,
        bathrooms: 1,
        area_sqm: '75.5',
        property_type: 'apartment',
        is_featured: false
      })
      .returning()
      .execute();
    
    testPropertyId = propertyResult[0].id;
  });

  const testInput: CreatePropertyImageInput = {
    property_id: 0, // Will be set in tests
    image_url: 'https://example.com/image.jpg',
    alt_text: 'Test image',
    is_primary: false,
    sort_order: 1
  };

  it('should create a property image', async () => {
    const input = { ...testInput, property_id: testPropertyId };
    const result = await createPropertyImage(input);

    expect(result.property_id).toEqual(testPropertyId);
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.alt_text).toEqual('Test image');
    expect(result.is_primary).toEqual(false);
    expect(result.sort_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save property image to database', async () => {
    const input = { ...testInput, property_id: testPropertyId };
    const result = await createPropertyImage(input);

    const images = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.id, result.id))
      .execute();

    expect(images).toHaveLength(1);
    expect(images[0].property_id).toEqual(testPropertyId);
    expect(images[0].image_url).toEqual('https://example.com/image.jpg');
    expect(images[0].alt_text).toEqual('Test image');
    expect(images[0].is_primary).toEqual(false);
    expect(images[0].sort_order).toEqual(1);
    expect(images[0].created_at).toBeInstanceOf(Date);
  });

  it('should set other images to non-primary when creating primary image', async () => {
    // Create first image as primary
    const firstInput = { 
      ...testInput, 
      property_id: testPropertyId, 
      is_primary: true,
      image_url: 'https://example.com/first.jpg'
    };
    await createPropertyImage(firstInput);

    // Create second image as primary
    const secondInput = { 
      ...testInput, 
      property_id: testPropertyId, 
      is_primary: true,
      image_url: 'https://example.com/second.jpg'
    };
    const result = await createPropertyImage(secondInput);

    // Check that only the second image is primary
    const allImages = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.property_id, testPropertyId))
      .execute();

    expect(allImages).toHaveLength(2);
    
    const primaryImages = allImages.filter(img => img.is_primary);
    expect(primaryImages).toHaveLength(1);
    expect(primaryImages[0].id).toEqual(result.id);
    expect(primaryImages[0].image_url).toEqual('https://example.com/second.jpg');
  });

  it('should not affect other images when creating non-primary image', async () => {
    // Create first image as primary
    const firstInput = { 
      ...testInput, 
      property_id: testPropertyId, 
      is_primary: true,
      image_url: 'https://example.com/first.jpg'
    };
    const firstResult = await createPropertyImage(firstInput);

    // Create second image as non-primary
    const secondInput = { 
      ...testInput, 
      property_id: testPropertyId, 
      is_primary: false,
      image_url: 'https://example.com/second.jpg'
    };
    await createPropertyImage(secondInput);

    // Check that first image is still primary
    const firstImage = await db.select()
      .from(propertyImagesTable)
      .where(eq(propertyImagesTable.id, firstResult.id))
      .execute();

    expect(firstImage[0].is_primary).toEqual(true);
  });

  it('should throw error for non-existent property', async () => {
    const input = { ...testInput, property_id: 99999 };
    
    expect(createPropertyImage(input)).rejects.toThrow(/property with id 99999 not found/i);
  });
});
