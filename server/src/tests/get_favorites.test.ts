
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, favoritesTable } from '../db/schema';
import { type GetFavoritesInput, type CreatePropertyInput, type AddFavoriteInput } from '../schema';
import { getFavorites } from '../handlers/get_favorites';

// Test property data
const testProperty1: CreatePropertyInput = {
  title: 'Beautiful Apartment in Lisbon',
  description: 'Modern apartment with great views',
  price: 250000,
  city: 'lisbon',
  address: 'Rua Augusta 123',
  latitude: 38.7223,
  longitude: -9.1393,
  bedrooms: 2,
  bathrooms: 1,
  area_sqm: 75.5,
  property_type: 'apartment',
  is_featured: false
};

const testProperty2: CreatePropertyInput = {
  title: 'Luxury Villa in Porto',
  description: 'Spacious villa with pool',
  price: 450000,
  city: 'porto',
  address: 'Rua da Liberdade 456',
  latitude: 41.1579,
  longitude: -8.6291,
  bedrooms: 4,
  bathrooms: 3,
  area_sqm: 200.0,
  property_type: 'villa',
  is_featured: true
};

describe('getFavorites', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no favorites exist', async () => {
    const input: GetFavoritesInput = {
      session_id: 'test-session-123'
    };

    const result = await getFavorites(input);

    expect(result).toEqual([]);
  });

  it('should return favorited properties for a session', async () => {
    // Create test properties
    const property1Result = await db.insert(propertiesTable)
      .values({
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      })
      .returning()
      .execute();

    const property2Result = await db.insert(propertiesTable)
      .values({
        ...testProperty2,
        price: testProperty2.price.toString(),
        latitude: testProperty2.latitude.toString(),
        longitude: testProperty2.longitude.toString(),
        area_sqm: testProperty2.area_sqm.toString()
      })
      .returning()
      .execute();

    const property1 = property1Result[0];
    const property2 = property2Result[0];

    // Add both properties to favorites for the session
    await db.insert(favoritesTable)
      .values([
        {
          session_id: 'test-session-123',
          property_id: property1.id
        },
        {
          session_id: 'test-session-123',
          property_id: property2.id
        }
      ])
      .execute();

    const input: GetFavoritesInput = {
      session_id: 'test-session-123'
    };

    const result = await getFavorites(input);

    expect(result).toHaveLength(2);
    
    // Verify property data is correctly returned with numeric conversions
    const foundProperty1 = result.find(p => p.title === 'Beautiful Apartment in Lisbon');
    const foundProperty2 = result.find(p => p.title === 'Luxury Villa in Porto');

    expect(foundProperty1).toBeDefined();
    expect(foundProperty1!.price).toEqual(250000);
    expect(typeof foundProperty1!.price).toBe('number');
    expect(foundProperty1!.latitude).toEqual(38.7223);
    expect(typeof foundProperty1!.latitude).toBe('number');
    expect(foundProperty1!.area_sqm).toEqual(75.5);
    expect(typeof foundProperty1!.area_sqm).toBe('number');

    expect(foundProperty2).toBeDefined();
    expect(foundProperty2!.price).toEqual(450000);
    expect(foundProperty2!.is_featured).toBe(true);
  });

  it('should only return favorites for the specified session', async () => {
    // Create test property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      })
      .returning()
      .execute();

    const property = propertyResult[0];

    // Add favorite for different sessions
    await db.insert(favoritesTable)
      .values([
        {
          session_id: 'session-1',
          property_id: property.id
        },
        {
          session_id: 'session-2',
          property_id: property.id
        }
      ])
      .execute();

    // Query favorites for session-1 only
    const input: GetFavoritesInput = {
      session_id: 'session-1'
    };

    const result = await getFavorites(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Beautiful Apartment in Lisbon');
  });

  it('should return properties with all required fields', async () => {
    // Create test property
    const propertyResult = await db.insert(propertiesTable)
      .values({
        ...testProperty1,
        price: testProperty1.price.toString(),
        latitude: testProperty1.latitude.toString(),
        longitude: testProperty1.longitude.toString(),
        area_sqm: testProperty1.area_sqm.toString()
      })
      .returning()
      .execute();

    const property = propertyResult[0];

    // Add to favorites
    await db.insert(favoritesTable)
      .values({
        session_id: 'test-session',
        property_id: property.id
      })
      .execute();

    const input: GetFavoritesInput = {
      session_id: 'test-session'
    };

    const result = await getFavorites(input);

    expect(result).toHaveLength(1);
    const favoriteProperty = result[0];

    // Verify all required property fields are present
    expect(favoriteProperty.id).toBeDefined();
    expect(favoriteProperty.title).toEqual('Beautiful Apartment in Lisbon');
    expect(favoriteProperty.description).toEqual('Modern apartment with great views');
    expect(favoriteProperty.price).toEqual(250000);
    expect(favoriteProperty.city).toEqual('lisbon');
    expect(favoriteProperty.address).toEqual('Rua Augusta 123');
    expect(favoriteProperty.latitude).toEqual(38.7223);
    expect(favoriteProperty.longitude).toEqual(-9.1393);
    expect(favoriteProperty.bedrooms).toEqual(2);
    expect(favoriteProperty.bathrooms).toEqual(1);
    expect(favoriteProperty.area_sqm).toEqual(75.5);
    expect(favoriteProperty.property_type).toEqual('apartment');
    expect(favoriteProperty.is_featured).toBe(false);
    expect(favoriteProperty.created_at).toBeInstanceOf(Date);
    expect(favoriteProperty.updated_at).toBeInstanceOf(Date);
  });
});
