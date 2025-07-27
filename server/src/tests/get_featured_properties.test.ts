
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput } from '../schema';
import { getFeaturedProperties } from '../handlers/get_featured_properties';

const testProperty1: CreatePropertyInput = {
  title: 'Featured Villa in Porto',
  description: 'Beautiful villa with ocean view',
  price: 850000,
  city: 'porto',
  address: '123 Ocean Drive, Porto',
  latitude: 41.1579,
  longitude: -8.6291,
  bedrooms: 4,
  bathrooms: 3,
  area_sqm: 250.5,
  property_type: 'villa',
  is_featured: true
};

const testProperty2: CreatePropertyInput = {
  title: 'Modern Apartment in Lisbon',
  description: 'Stylish apartment in city center',
  price: 450000,
  city: 'lisbon',
  address: '456 Main St, Lisbon',
  latitude: 38.7223,
  longitude: -9.1393,
  bedrooms: 2,
  bathrooms: 1,
  area_sqm: 95.0,
  property_type: 'apartment',
  is_featured: false
};

const testProperty3: CreatePropertyInput = {
  title: 'Featured House in Algarve',
  description: 'Charming house near the beach',
  price: 620000,
  city: 'algarve',
  address: '789 Beach Road, Algarve',
  latitude: 37.0179,
  longitude: -7.9304,
  bedrooms: 3,
  bathrooms: 2,
  area_sqm: 180.75,
  property_type: 'house',
  is_featured: true
};

describe('getFeaturedProperties', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured properties', async () => {
    // Create test properties - 2 featured, 1 not featured
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

    const result = await getFeaturedProperties();

    expect(result).toHaveLength(2);
    
    // All returned properties should be featured
    result.forEach(property => {
      expect(property.is_featured).toBe(true);
    });

    // Check specific properties are included
    const titles = result.map(p => p.title);
    expect(titles).toContain('Featured Villa in Porto');
    expect(titles).toContain('Featured House in Algarve');
    expect(titles).not.toContain('Modern Apartment in Lisbon');
  });

  it('should return properties ordered by created_at DESC', async () => {
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
      ...testProperty3,
      price: testProperty3.price.toString(),
      latitude: testProperty3.latitude.toString(),
      longitude: testProperty3.longitude.toString(),
      area_sqm: testProperty3.area_sqm.toString()
    }).execute();

    const result = await getFeaturedProperties();

    expect(result).toHaveLength(2);
    
    // Should be ordered by created_at DESC (newest first)
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[0].title).toBe('Featured House in Algarve');
    expect(result[1].title).toBe('Featured Villa in Porto');
  });

  it('should convert numeric fields correctly', async () => {
    await db.insert(propertiesTable).values({
      ...testProperty1,
      price: testProperty1.price.toString(),
      latitude: testProperty1.latitude.toString(),
      longitude: testProperty1.longitude.toString(),
      area_sqm: testProperty1.area_sqm.toString()
    }).execute();

    const result = await getFeaturedProperties();

    expect(result).toHaveLength(1);
    
    const property = result[0];
    expect(typeof property.price).toBe('number');
    expect(typeof property.latitude).toBe('number');
    expect(typeof property.longitude).toBe('number');
    expect(typeof property.area_sqm).toBe('number');
    
    expect(property.price).toBe(850000);
    expect(property.latitude).toBe(41.1579);
    expect(property.longitude).toBe(-8.6291);
    expect(property.area_sqm).toBe(250.5);
  });

  it('should return empty array when no featured properties exist', async () => {
    // Create only non-featured property
    await db.insert(propertiesTable).values({
      ...testProperty2,
      price: testProperty2.price.toString(),
      latitude: testProperty2.latitude.toString(),
      longitude: testProperty2.longitude.toString(),
      area_sqm: testProperty2.area_sqm.toString()
    }).execute();

    const result = await getFeaturedProperties();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should include all required property fields', async () => {
    await db.insert(propertiesTable).values({
      ...testProperty1,
      price: testProperty1.price.toString(),
      latitude: testProperty1.latitude.toString(),
      longitude: testProperty1.longitude.toString(),
      area_sqm: testProperty1.area_sqm.toString()
    }).execute();

    const result = await getFeaturedProperties();

    expect(result).toHaveLength(1);
    
    const property = result[0];
    expect(property.id).toBeDefined();
    expect(property.title).toBe('Featured Villa in Porto');
    expect(property.description).toBe('Beautiful villa with ocean view');
    expect(property.city).toBe('porto');
    expect(property.address).toBe('123 Ocean Drive, Porto');
    expect(property.bedrooms).toBe(4);
    expect(property.bathrooms).toBe(3);
    expect(property.property_type).toBe('villa');
    expect(property.is_featured).toBe(true);
    expect(property.created_at).toBeInstanceOf(Date);
    expect(property.updated_at).toBeInstanceOf(Date);
  });
});
