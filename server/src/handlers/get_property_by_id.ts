
import { db } from '../db';
import { propertiesTable, propertyImagesTable } from '../db/schema';
import { type PropertyWithImages } from '../schema';
import { eq } from 'drizzle-orm';

export const getPropertyById = async (id: number): Promise<PropertyWithImages | null> => {
  try {
    // Query property with its images using a join
    const results = await db.select()
      .from(propertiesTable)
      .leftJoin(propertyImagesTable, eq(propertyImagesTable.property_id, propertiesTable.id))
      .where(eq(propertiesTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Group images by property (though we only have one property)
    const propertyData = results[0].properties;
    const images = results
      .filter(result => result.property_images !== null)
      .map(result => ({
        ...result.property_images!,
        // Convert numeric fields to numbers
        sort_order: result.property_images!.sort_order
      }))
      .sort((a, b) => a.sort_order - b.sort_order); // Sort by sort_order

    // Convert numeric fields back to numbers before returning
    return {
      ...propertyData,
      price: parseFloat(propertyData.price),
      latitude: parseFloat(propertyData.latitude),
      longitude: parseFloat(propertyData.longitude),
      area_sqm: parseFloat(propertyData.area_sqm),
      images
    };
  } catch (error) {
    console.error('Property fetch failed:', error);
    throw error;
  }
};
