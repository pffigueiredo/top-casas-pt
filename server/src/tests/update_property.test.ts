
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput, type UpdatePropertyInput } from '../schema';
import { updateProperty } from '../handlers/update_property';
import { eq } from 'drizzle-orm';

// Helper to create a test property
const createTestProperty = async (): Promise<number> => {
  const testProperty: CreatePropertyInput = {
    title: 'Original Property',
    description: 'Original description',
    price: 250000,
    city: 'lisbon',
    address: 'Rua Original 123',
    latitude: 38.7223,
    longitude: -9.1393,
    bedrooms: 2,
    bathrooms: 1,
    area_sqm: 80,
    property_type: 'apartment',
    is_featured: false
  };

  const result = await db.insert(propertiesTable)
    .values({
      ...testProperty,
      price: testProperty.price.toString(),
      latitude: testProperty.latitude.toString(),
      longitude: testProperty.longitude.toString(),
      area_sqm: testProperty.area_sqm.toString()
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateProperty', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all property fields', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      title: 'Updated Property',
      description: 'Updated description',
      price: 300000,
      city: 'porto',
      address: 'Rua Updated 456',
      latitude: 41.1579,
      longitude: -8.6291,
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 100,
      property_type: 'house',
      is_featured: true
    };

    const result = await updateProperty(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(propertyId);
    expect(result!.title).toEqual('Updated Property');
    expect(result!.description).toEqual('Updated description');
    expect(result!.price).toEqual(300000);
    expect(result!.city).toEqual('porto');
    expect(result!.address).toEqual('Rua Updated 456');
    expect(result!.latitude).toEqual(41.1579);
    expect(result!.longitude).toEqual(-8.6291);
    expect(result!.bedrooms).toEqual(3);
    expect(result!.bathrooms).toEqual(2);
    expect(result!.area_sqm).toEqual(100);
    expect(result!.property_type).toEqual('house');
    expect(result!.is_featured).toEqual(true);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result!.price).toBe('number');
    expect(typeof result!.latitude).toBe('number');
    expect(typeof result!.longitude).toBe('number');
    expect(typeof result!.area_sqm).toBe('number');
  });

  it('should update partial property fields', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      title: 'Partially Updated',
      price: 275000,
      bedrooms: 3
    };

    const result = await updateProperty(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Partially Updated');
    expect(result!.price).toEqual(275000);
    expect(result!.bedrooms).toEqual(3);
    // Check that other fields remain unchanged
    expect(result!.description).toEqual('Original description');
    expect(result!.city).toEqual('lisbon');
    expect(result!.bathrooms).toEqual(1);
  });

  it('should update the updated_at timestamp', async () => {
    const propertyId = await createTestProperty();

    // Get original timestamp
    const originalProperty = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .execute();

    const originalUpdatedAt = originalProperty[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      title: 'Updated Title'
    };

    const result = await updateProperty(updateInput);

    expect(result).not.toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save updated property to database', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      title: 'Database Test',
      price: 350000
    };

    await updateProperty(updateInput);

    // Verify changes in database
    const properties = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .execute();

    expect(properties).toHaveLength(1);
    expect(properties[0].title).toEqual('Database Test');
    expect(parseFloat(properties[0].price)).toEqual(350000);
  });

  it('should return null for non-existent property', async () => {
    const updateInput: UpdatePropertyInput = {
      id: 99999,
      title: 'Non-existent Property'
    };

    const result = await updateProperty(updateInput);

    expect(result).toBeNull();
  });

  it('should handle numeric field updates correctly', async () => {
    const propertyId = await createTestProperty();

    const updateInput: UpdatePropertyInput = {
      id: propertyId,
      price: 199999.99,
      latitude: 40.123456,
      longitude: -8.987654,
      area_sqm: 125.5
    };

    const result = await updateProperty(updateInput);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(199999.99);
    expect(result!.latitude).toEqual(40.123456);
    expect(result!.longitude).toEqual(-8.987654);
    expect(result!.area_sqm).toEqual(125.5);

    // Verify precision is maintained in database
    const dbProperty = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, propertyId))
      .execute();

    expect(parseFloat(dbProperty[0].price)).toEqual(199999.99);
    expect(parseFloat(dbProperty[0].latitude)).toEqual(40.123456);
    expect(parseFloat(dbProperty[0].longitude)).toEqual(-8.987654);
    expect(parseFloat(dbProperty[0].area_sqm)).toEqual(125.5);
  });
});
