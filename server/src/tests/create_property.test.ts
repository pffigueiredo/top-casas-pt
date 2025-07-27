
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput } from '../schema';
import { createProperty } from '../handlers/create_property';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreatePropertyInput = {
  title: 'Beautiful Apartment in Lisbon',
  description: 'A stunning apartment with great views',
  price: 450000.50,
  city: 'lisbon',
  address: 'Rua Augusta 123, Lisboa',
  latitude: 38.7223,
  longitude: -9.1393,
  bedrooms: 2,
  bathrooms: 2,
  area_sqm: 85.5,
  property_type: 'apartment',
  is_featured: true
};

describe('createProperty', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a property', async () => {
    const result = await createProperty(testInput);

    // Basic field validation
    expect(result.title).toEqual('Beautiful Apartment in Lisbon');
    expect(result.description).toEqual(testInput.description);
    expect(result.price).toEqual(450000.50);
    expect(result.city).toEqual('lisbon');
    expect(result.address).toEqual(testInput.address);
    expect(result.latitude).toEqual(38.7223);
    expect(result.longitude).toEqual(-9.1393);
    expect(result.bedrooms).toEqual(2);
    expect(result.bathrooms).toEqual(2);
    expect(result.area_sqm).toEqual(85.5);
    expect(result.property_type).toEqual('apartment');
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify numeric field types
    expect(typeof result.price).toBe('number');
    expect(typeof result.latitude).toBe('number');
    expect(typeof result.longitude).toBe('number');
    expect(typeof result.area_sqm).toBe('number');
  });

  it('should save property to database', async () => {
    const result = await createProperty(testInput);

    // Query using proper drizzle syntax
    const properties = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, result.id))
      .execute();

    expect(properties).toHaveLength(1);
    const property = properties[0];
    expect(property.title).toEqual('Beautiful Apartment in Lisbon');
    expect(property.description).toEqual(testInput.description);
    expect(parseFloat(property.price)).toEqual(450000.50);
    expect(property.city).toEqual('lisbon');
    expect(property.address).toEqual(testInput.address);
    expect(parseFloat(property.latitude)).toEqual(38.7223);
    expect(parseFloat(property.longitude)).toEqual(-9.1393);
    expect(property.bedrooms).toEqual(2);
    expect(property.bathrooms).toEqual(2);
    expect(parseFloat(property.area_sqm)).toEqual(85.5);
    expect(property.property_type).toEqual('apartment');
    expect(property.is_featured).toEqual(true);
    expect(property.created_at).toBeInstanceOf(Date);
    expect(property.updated_at).toBeInstanceOf(Date);
  });

  it('should create property with default is_featured false', async () => {
    const inputWithoutFeatured: CreatePropertyInput = {
      title: 'Regular House',
      description: 'A nice house',
      price: 300000,
      city: 'porto',
      address: 'Rua do Porto 456',
      latitude: 41.1579,
      longitude: -8.6291,
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 120,
      property_type: 'house',
      is_featured: false
    };

    const result = await createProperty(inputWithoutFeatured);

    expect(result.title).toEqual('Regular House');
    expect(result.is_featured).toEqual(false);
    expect(result.property_type).toEqual('house');
    expect(result.city).toEqual('porto');
  });

  it('should handle villa property type correctly', async () => {
    const villaInput: CreatePropertyInput = {
      title: 'Luxury Villa in Algarve',
      description: 'Beautiful villa with pool',
      price: 1200000,
      city: 'algarve',
      address: 'Vila Real de Santo António',
      latitude: 37.2431,
      longitude: -7.4128,
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 250.75,
      property_type: 'villa',
      is_featured: true
    };

    const result = await createProperty(villaInput);

    expect(result.property_type).toEqual('villa');
    expect(result.city).toEqual('algarve');
    expect(result.bedrooms).toEqual(5);
    expect(result.bathrooms).toEqual(4);
    expect(result.area_sqm).toEqual(250.75);
    expect(typeof result.area_sqm).toBe('number');
  });
});
