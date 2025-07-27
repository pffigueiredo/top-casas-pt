
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, favoritesTable } from '../db/schema';
import { type AddFavoriteInput, type CreatePropertyInput } from '../schema';
import { addFavorite } from '../handlers/add_favorite';
import { eq, and } from 'drizzle-orm';

// Test property data
const testProperty: CreatePropertyInput = {
  title: 'Test Property',
  description: 'A property for testing',
  price: 250000,
  city: 'lisbon',
  address: 'Test Address 123',
  latitude: 38.7169,
  longitude: -9.1395,
  bedrooms: 2,
  bathrooms: 1,
  area_sqm: 80,
  property_type: 'apartment',
  is_featured: false
};

// Test input
const testInput: AddFavoriteInput = {
  session_id: 'test-session-123',
  property_id: 1
};

describe('addFavorite', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add a favorite', async () => {
    // Create test property first
    await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .execute();

    const result = await addFavorite(testInput);

    expect(result.session_id).toEqual('test-session-123');
    expect(result.property_id).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save favorite to database', async () => {
    // Create test property first
    await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .execute();

    const result = await addFavorite(testInput);

    const favorites = await db.select()
      .from(favoritesTable)
      .where(eq(favoritesTable.id, result.id))
      .execute();

    expect(favorites).toHaveLength(1);
    expect(favorites[0].session_id).toEqual('test-session-123');
    expect(favorites[0].property_id).toEqual(1);
    expect(favorites[0].created_at).toBeInstanceOf(Date);
  });

  it('should return existing favorite if already exists', async () => {
    // Create test property first
    await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .execute();

    // Add favorite first time
    const firstResult = await addFavorite(testInput);

    // Add same favorite again
    const secondResult = await addFavorite(testInput);

    expect(firstResult.id).toEqual(secondResult.id);
    expect(firstResult.session_id).toEqual(secondResult.session_id);
    expect(firstResult.property_id).toEqual(secondResult.property_id);
    expect(firstResult.created_at).toEqual(secondResult.created_at);

    // Verify only one favorite exists in database
    const favorites = await db.select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, testInput.session_id),
          eq(favoritesTable.property_id, testInput.property_id)
        )
      )
      .execute();

    expect(favorites).toHaveLength(1);
  });

  it('should throw error if property does not exist', async () => {
    expect(addFavorite(testInput)).rejects.toThrow(/property with id 1 not found/i);
  });

  it('should handle different session_id for same property', async () => {
    // Create test property first
    await db.insert(propertiesTable)
      .values({
        ...testProperty,
        price: testProperty.price.toString(),
        latitude: testProperty.latitude.toString(),
        longitude: testProperty.longitude.toString(),
        area_sqm: testProperty.area_sqm.toString()
      })
      .execute();

    const input1 = { ...testInput, session_id: 'session-1' };
    const input2 = { ...testInput, session_id: 'session-2' };

    const result1 = await addFavorite(input1);
    const result2 = await addFavorite(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.session_id).toEqual('session-1');
    expect(result2.session_id).toEqual('session-2');
    expect(result1.property_id).toEqual(result2.property_id);

    // Verify both favorites exist in database
    const favorites = await db.select()
      .from(favoritesTable)
      .where(eq(favoritesTable.property_id, testInput.property_id))
      .execute();

    expect(favorites).toHaveLength(2);
  });
});
