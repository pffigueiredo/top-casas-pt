
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type UpdatePropertyInput, type Property } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProperty = async (input: UpdatePropertyInput): Promise<Property | null> => {
  try {
    // Extract ID from input and prepare update data
    const { id, ...updateData } = input;

    // Convert numeric fields to strings for database storage
    const dbUpdateData: any = { ...updateData };
    if (updateData.price !== undefined) {
      dbUpdateData.price = updateData.price.toString();
    }
    if (updateData.latitude !== undefined) {
      dbUpdateData.latitude = updateData.latitude.toString();
    }
    if (updateData.longitude !== undefined) {
      dbUpdateData.longitude = updateData.longitude.toString();
    }
    if (updateData.area_sqm !== undefined) {
      dbUpdateData.area_sqm = updateData.area_sqm.toString();
    }

    // Set updated_at timestamp
    dbUpdateData.updated_at = new Date();

    // Update the property
    const result = await db.update(propertiesTable)
      .set(dbUpdateData)
      .where(eq(propertiesTable.id, id))
      .returning()
      .execute();

    // Return null if no property was found
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const property = result[0];
    return {
      ...property,
      price: parseFloat(property.price),
      latitude: parseFloat(property.latitude),
      longitude: parseFloat(property.longitude),
      area_sqm: parseFloat(property.area_sqm)
    };
  } catch (error) {
    console.error('Property update failed:', error);
    throw error;
  }
};
