
import { db } from '../db';
import { favoritesTable } from '../db/schema';
import { type RemoveFavoriteInput } from '../schema';
import { and, eq } from 'drizzle-orm';

export const removeFavorite = async (input: RemoveFavoriteInput): Promise<boolean> => {
  try {
    // Delete the favorite record matching both session_id and property_id
    const result = await db.delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, input.session_id),
          eq(favoritesTable.property_id, input.property_id)
        )
      )
      .returning()
      .execute();

    // Return true if a record was deleted, false if no matching favorite was found
    return result.length > 0;
  } catch (error) {
    console.error('Remove favorite failed:', error);
    throw error;
  }
};
