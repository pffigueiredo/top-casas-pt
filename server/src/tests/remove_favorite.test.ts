
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { propertiesTable, favoritesTable } from '../db/schema';
import { type RemoveFavoriteInput } from '../schema';
import { removeFavorite } from '../handlers/remove_favorite';
import { eq, and } from 'drizzle-orm';

// Test inputs
const testSessionId = 'test-session-123';
const testProperty = {
  title: 'Test Property',
  description: 'A test property',
  price: '250000.00', // String for numeric column
  city: 'lisbon' as const,
  address: 'Test Address 123',
  latitude: '38.7223', // String for numeric column
  longitude: '-9.1393', // String for numeric column
  bedrooms: 2,
  bathrooms: 1,
  area_sqm: '100.00', // String for numeric column
  property_type: 'apartment' as const,
  is_featured: false
};

const removeFavoriteInput: RemoveFavoriteInput = {
  session_id: testSessionId,
  property_id: 1 // Will be updated with actual property ID in tests
};

describe('removeFavorite', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should remove an existing favorite', async () => {
    // Create a property first
    const propertyResult = await db.insert(propertiesTable)
      .values(testProperty)
      .returning()
      .execute();
    
    const propertyId = propertyResult[0].id;

    // Create a favorite
    await db.insert(favoritesTable)
      .values({
        session_id: testSessionId,
        property_id: propertyId
      })
      .execute();

    // Remove the favorite
    const result = await removeFavorite({
      session_id: testSessionId,
      property_id: propertyId
    });

    expect(result).toBe(true);

    // Verify the favorite was deleted from database
    const favorites = await db.select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, testSessionId),
          eq(favoritesTable.property_id, propertyId)
        )
      )
      .execute();

    expect(favorites).toHaveLength(0);
  });

  it('should return false when favorite does not exist', async () => {
    // Create a property but no favorite
    const propertyResult = await db.insert(propertiesTable)
      .values(testProperty)
      .returning()
      .execute();
    
    const propertyId = propertyResult[0].id;

    // Try to remove non-existent favorite
    const result = await removeFavorite({
      session_id: testSessionId,
      property_id: propertyId
    });

    expect(result).toBe(false);
  });

  it('should return false when property does not exist', async () => {
    // Try to remove favorite for non-existent property
    const result = await removeFavorite({
      session_id: testSessionId,
      property_id: 999999
    });

    expect(result).toBe(false);
  });

  it('should only remove favorite for specific session', async () => {
    // Create a property
    const propertyResult = await db.insert(propertiesTable)
      .values(testProperty)
      .returning()
      .execute();
    
    const propertyId = propertyResult[0].id;

    // Create favorites for two different sessions
    await db.insert(favoritesTable)
      .values([
        {
          session_id: testSessionId,
          property_id: propertyId
        },
        {
          session_id: 'other-session-456',
          property_id: propertyId
        }
      ])
      .execute();

    // Remove favorite only for first session
    const result = await removeFavorite({
      session_id: testSessionId,
      property_id: propertyId
    });

    expect(result).toBe(true);

    // Verify only the correct favorite was removed
    const remainingFavorites = await db.select()
      .from(favoritesTable)
      .where(eq(favoritesTable.property_id, propertyId))
      .execute();

    expect(remainingFavorites).toHaveLength(1);
    expect(remainingFavorites[0].session_id).toBe('other-session-456');
  });
});
