
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput } from '../schema';
import { getProperties } from '../handlers/get_properties';

// Test property data
const testProperty1: CreatePropertyInput = {
  title: 'Modern Apartment in Lisbon',
  description: 'Beautiful modern apartment with great city views',
  price: 250000,
  city: 'lisbon',
  address: 'Rua Augusta 123, Lisbon',
  latitude: 38.7223,
  longitude: -9.1393,
  bedrooms: 2,
  bathrooms: 2,
  area_sqm: 85.5,
  property_type: 'apartment',
  is_featured: true
};

const testProperty2: CreatePropertyInput = {
  title: 'Villa in Porto',
  description: 'Luxury villa with garden and pool',
  price: 450000,
  city: 'porto',
  address: 'Rua das Flores 456, Porto',
  latitude: 41.1579,
  longitude: -8.6291,
  bedrooms: 4,
  bathrooms: 3,
  area_sqm: 180.0,
  property_type: 'villa',
  is_featured: false
};

const testProperty3: CreatePropertyInput = {
  title: 'Beach House in Algarve',
  description: 'Cozy house near the beach',
  price: 180000,
  city: 'algarve',
  address: 'Praia da Rocha 789, Algarve',
  latitude: 37.1168,
  longitude: -8.5319,
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 120.0,
  property_type: 'house',
  is_featured: true
};

describe('getProperties', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all properties when no filters applied', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(typeof result[0].price).toBe('number');
    expect(typeof result[0].latitude).toBe('number');
    expect(typeof result[0].longitude).toBe('number');
    expect(typeof result[0].area_sqm).toBe('number');
  });

  it('should filter properties by city', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({ city: 'lisbon' });

    expect(result).toHaveLength(1);
    expect(result[0].city).toBe('lisbon');
    expect(result[0].title).toBe('Modern Apartment in Lisbon');
  });

  it('should filter properties by price range', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      },
      {
        ...testProperty3,
        price: testProperty3.price.toString(),
        latitude: testProperty3.latitude.toString(),
        longitude: testProperty3.longitude.toString(),
        area_sqm: testProperty3.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({ min_price: 200000, max_price: 300000 });

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(250000);
    expect(result[0].title).toBe('Modern Apartment in Lisbon');
  });

  it('should filter properties by bedrooms', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({ bedrooms: 4 });

    expect(result).toHaveLength(1);
    expect(result[0].bedrooms).toBe(4);
    expect(result[0].title).toBe('Villa in Porto');
  });

  it('should filter properties by property type', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({ property_type: 'villa' });

    expect(result).toHaveLength(1);
    expect(result[0].property_type).toBe('villa');
    expect(result[0].title).toBe('Villa in Porto');
  });

  it('should filter properties by featured status', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({ is_featured: true });

    expect(result).toHaveLength(1);
    expect(result[0].is_featured).toBe(true);
    expect(result[0].title).toBe('Modern Apartment in Lisbon');
  });

  it('should apply multiple filters correctly', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      },
      {
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      },
      {
        ...testProperty3,
        price: testProperty3.price.toString(),
        latitude: testProperty3.latitude.toString(),
        longitude: testProperty3.longitude.toString(),
        area_sqm: testProperty3.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({
      property_type: 'house',
      is_featured: true,
      max_price: 200000
    });

    expect(result).toHaveLength(1);
    expect(result[0].property_type).toBe('house');
    expect(result[0].is_featured).toBe(true);
    expect(result[0].price).toBe(180000);
    expect(result[0].title).toBe('Beach House in Algarve');
  });

  it('should return empty array when no properties match filters', async () => {
    // Create test properties
    await db.insert(propertiesTable).values([
      {
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      }
    ]).execute();

    const result = await getProperties({ city: 'braga' });

    expect(result).toHaveLength(0);
  });

  it('should order properties by created_at descending', async () => {
    // Create properties with slight delay to ensure different timestamps
    await db.insert(propertiesTable).values({
      ...testProperty1,
      price: testProperty1.price.toString(),
      latitude: testProperty1.latitude.toString(),
      longitude: testProperty1.longitude.toString(),
      area_sqm: testProperty1.area_sqm.toString()
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(propertiesTable).values({
      ...testProperty2,
      price: testProperty2.price.toString(),
      latitude: testProperty2.latitude.toString(),
      longitude: testProperty2.longitude.toString(),
      area_sqm: testProperty2.area_sqm.toString()
    }).execute();

    const result = await getProperties();

    expect(result).toHaveLength(2);
    // Most recent should come first
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });
});
