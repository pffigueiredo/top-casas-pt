
import { db } from '../db';
import { propertyImagesTable, propertiesTable } from '../db/schema';
import { type CreatePropertyImageInput, type PropertyImage } from '../schema';
import { eq } from 'drizzle-orm';

export const createPropertyImage = async (input: CreatePropertyImageInput): Promise<PropertyImage> => {
  try {
    // Verify the property exists
    const existingProperty = await db.select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, input.property_id))
      .execute();

    if (existingProperty.length === 0) {
      throw new Error(`Property with id ${input.property_id} not found`);
    }

    // If this image is marked as primary, set all other images for this property to not primary
    if (input.is_primary) {
      await db.update(propertyImagesTable)
        .set({ is_primary: false })
        .where(eq(propertyImagesTable.property_id, input.property_id))
        .execute();
    }

    // Insert the new property image
    const result = await db.insert(propertyImagesTable)
      .values({
        property_id: input.property_id,
        image_url: input.image_url,
        alt_text: input.alt_text,
        is_primary: input.is_primary,
        sort_order: input.sort_order
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Property image creation failed:', error);
    throw error;
  }
};
