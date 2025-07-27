
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type Property } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedProperties = async (): Promise<Property[]> => {
  try {
    const results = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.is_featured, true))
      .orderBy(desc(propertiesTable.created_at))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(property => ({
      ...property,
      price: parseFloat(property.price),
      latitude: parseFloat(property.latitude),
      longitude: parseFloat(property.longitude),
      area_sqm: parseFloat(property.area_sqm)
    }));
  } catch (error) {
    console.error('Failed to fetch featured properties:', error);
    throw error;
  }
};
