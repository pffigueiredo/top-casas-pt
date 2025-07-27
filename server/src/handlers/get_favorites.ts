
import { db } from '../db';
import { propertiesTable, favoritesTable } from '../db/schema';
import { type GetFavoritesInput, type Property } from '../schema';
import { eq } from 'drizzle-orm';

export const getFavorites = async (input: GetFavoritesInput): Promise<Property[]> => {
  try {
    // Join favorites with properties to get full property data
    const results = await db.select({
      id: propertiesTable.id,
      title: propertiesTable.title,
      description: propertiesTable.description,
      price: propertiesTable.price,
      city: propertiesTable.city,
      address: propertiesTable.address,
      latitude: propertiesTable.latitude,
      longitude: propertiesTable.longitude,
      bedrooms: propertiesTable.bedrooms,
      bathrooms: propertiesTable.bathrooms,
      area_sqm: propertiesTable.area_sqm,
      property_type: propertiesTable.property_type,
      is_featured: propertiesTable.is_featured,
      created_at: propertiesTable.created_at,
      updated_at: propertiesTable.updated_at
    })
      .from(favoritesTable)
      .innerJoin(propertiesTable, eq(favoritesTable.property_id, propertiesTable.id))
      .where(eq(favoritesTable.session_id, input.session_id))
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
    console.error('Get favorites failed:', error);
    throw error;
  }
};
