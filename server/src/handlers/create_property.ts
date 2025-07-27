
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type CreatePropertyInput, type Property } from '../schema';

export const createProperty = async (input: CreatePropertyInput): Promise<Property> => {
  try {
    // Insert property record
    const result = await db.insert(propertiesTable)
      .values({
        title: input.title,
        description: input.description,
        price: input.price.toString(), // Convert number to string for numeric column
        city: input.city,
        address: input.address,
        latitude: input.latitude.toString(), // Convert number to string for numeric column
        longitude: input.longitude.toString(), // Convert number to string for numeric column
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        area_sqm: input.area_sqm.toString(), // Convert number to string for numeric column
        property_type: input.property_type,
        is_featured: input.is_featured
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const property = result[0];
    return {
      ...property,
      price: parseFloat(property.price), // Convert string back to number
      latitude: parseFloat(property.latitude), // Convert string back to number
      longitude: parseFloat(property.longitude), // Convert string back to number
      area_sqm: parseFloat(property.area_sqm) // Convert string back to number
    };
  } catch (error) {
    console.error('Property creation failed:', error);
    throw error;
  }
};
