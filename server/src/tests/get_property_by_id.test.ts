
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, propertyImagesTable } from '../db/schema';
import { getPropertyById } from '../handlers/get_property_by_id';

describe('getPropertyById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent property', async () => {
    const result = await getPropertyById(999);
    expect(result).toBeNull();
  });

  it('should return property without images', async () => {
    // Create test property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        title: 'Test Property',
        description: 'A test property',
        price: '150000.00',
        city: 'lisbon',
        address: 'Test Address',
        latitude: '38.7223000',
        longitude: '-9.1393366',
        bedrooms: 2,
        bathrooms: 1,
        area_sqm: '80.50',
        property_type: 'apartment',
        is_featured: false
      })
      .returning()
      .execute();

    const result = await getPropertyById(propertyResult[0].id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(propertyResult[0].id);
    expect(result!.title).toEqual('Test Property');
    expect(result!.price).toEqual(150000);
    expect(typeof result!.price).toBe('number');
    expect(result!.latitude).toEqual(38.7223);
    expect(typeof result!.latitude).toBe('number');
    expect(result!.longitude).toEqual(-9.1393366);
    expect(typeof result!.longitude).toBe('number');
    expect(result!.area_sqm).toEqual(80.5);
    expect(typeof result!.area_sqm).toBe('number');
    expect(result!.city).toEqual('lisbon');
    expect(result!.property_type).toEqual('apartment');
    expect(result!.images).toEqual([]);
  });

  it('should return property with images sorted by sort_order', async () => {
    // Create test property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        title: 'Test Property with Images',
        description: 'A test property with images',
        price: '200000.00',
        city: 'porto',
        address: 'Test Address Porto',
        latitude: '41.1579400',
        longitude: '-8.6291053',
        bedrooms: 3,
        bathrooms: 2,
        area_sqm: '120.75',
        property_type: 'house',
        is_featured: true
      })
      .returning()
      .execute();

    const propertyId = propertyResult[0].id;

    // Create test images with different sort orders
    await db.insert(propertyImagesTable)
      .values([
        {
          property_id: propertyId,
          image_url: 'https://example.com/image3.jpg',
          alt_text: 'Third image',
          is_primary: false,
          sort_order: 2
        },
        {
          property_id: propertyId,
          image_url: 'https://example.com/image1.jpg',
          alt_text: 'Primary image',
          is_primary: true,
          sort_order: 0
        },
        {
          property_id: propertyId,
          image_url: 'https://example.com/image2.jpg',
          alt_text: 'Second image',
          is_primary: false,
          sort_order: 1
        }
      ])
      .execute();

    const result = await getPropertyById(propertyId);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(propertyId);
    expect(result!.title).toEqual('Test Property with Images');
    expect(result!.is_featured).toBe(true);
    expect(result!.images).toHaveLength(3);

    // Check images are sorted by sort_order
    expect(result!.images[0].sort_order).toEqual(0);
    expect(result!.images[0].image_url).toEqual('https://example.com/image1.jpg');
    expect(result!.images[0].is_primary).toBe(true);

    expect(result!.images[1].sort_order).toEqual(1);
    expect(result!.images[1].image_url).toEqual('https://example.com/image2.jpg');

    expect(result!.images[2].sort_order).toEqual(2);
    expect(result!.images[2].image_url).toEqual('https://example.com/image3.jpg');

    // Verify image fields
    result!.images.forEach(image => {
      expect(image.id).toBeDefined();
      expect(image.property_id).toEqual(propertyId);
      expect(image.image_url).toMatch(/^https:\/\/example\.com\/image\d+\.jpg$/);
      expect(image.alt_text).toBeDefined();
      expect(typeof image.is_primary).toBe('boolean');
      expect(typeof image.sort_order).toBe('number');
      expect(image.created_at).toBeInstanceOf(Date);
    });
  });

  it('should handle property with single image', async () => {
    // Create test property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        title: 'Villa with One Image',
        description: 'A luxury villa',
        price: '500000.00',
        city: 'algarve',
        address: 'Luxury Street',
        latitude: '37.0194300',
        longitude: '-7.9304400',
        bedrooms: 4,
        bathrooms: 3,
        area_sqm: '250.00',
        property_type: 'villa',
        is_featured: true
      })
      .returning()
      .execute();

    const propertyId = propertyResult[0].id;

    // Create single image
    await db.insert(propertyImagesTable)
      .values({
        property_id: propertyId,
        image_url: 'https://example.com/villa.jpg',
        alt_text: 'Beautiful villa',
        is_primary: true,
        sort_order: 0
      })
      .execute();

    const result = await getPropertyById(propertyId);

    expect(result).toBeDefined();
    expect(result!.property_type).toEqual('villa');
    expect(result!.bedrooms).toEqual(4);
    expect(result!.bathrooms).toEqual(3);
    expect(result!.images).toHaveLength(1);
    expect(result!.images[0].image_url).toEqual('https://example.com/villa.jpg');
    expect(result!.images[0].is_primary).toBe(true);
  });
});
