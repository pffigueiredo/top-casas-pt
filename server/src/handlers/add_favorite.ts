
import { db } from '../db';
import { favoritesTable, propertiesTable } from '../db/schema';
import { type AddFavoriteInput, type Favorite } from '../schema';
import { eq, and } from 'drizzle-orm';

export const addFavorite = async (input: AddFavoriteInput): Promise<Favorite> => {
  try {
    // Check if property exists
    const property = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, input.property_id))
      .execute();

    if (property.length === 0) {
      throw new Error(`Property with id ${input.property_id} not found`);
    }

    // Check if favorite already exists
    const existingFavorite = await db.select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, input.session_id),
          eq(favoritesTable.property_id, input.property_id)
        )
      )
      .execute();

    if (existingFavorite.length > 0) {
      // Return existing favorite if it already exists
      return existingFavorite[0];
    }

    // Insert new favorite
    const result = await db.insert(favoritesTable)
      .values({
        session_id: input.session_id,
        property_id: input.property_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Add favorite failed:', error);
    throw error;
  }
};
