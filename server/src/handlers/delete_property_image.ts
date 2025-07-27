
import { db } from '../db';
import { propertyImagesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deletePropertyImage = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(propertyImagesTable)
      .where(eq(propertyImagesTable.id, id))
      .returning()
      .execute();

    return result.length > 0;
  } catch (error) {
    console.error('Property image deletion failed:', error);
    throw error;
  }
};
