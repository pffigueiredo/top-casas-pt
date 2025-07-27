
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteProperty = async (id: number): Promise<boolean> => {
  try {
    // Delete the property by ID
    const result = await db.delete(propertiesTable)
      .where(eq(propertiesTable.id, id))
      .returning()
      .execute();

    // Return true if a property was deleted, false if not found
    return result.length > 0;
  } catch (error) {
    console.error('Property deletion failed:', error);
    throw error;
  }
};
