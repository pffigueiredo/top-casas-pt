
import { db } from '../db';
import { propertiesTable } from '../db/schema';
import { type Property, type PropertyFilters } from '../schema';
import { eq, gte, lte, and, desc, type SQL } from 'drizzle-orm';

export const getProperties = async (filters?: PropertyFilters): Promise<Property[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    if (filters) {
      if (filters.city) {
        conditions.push(eq(propertiesTable.city, filters.city));
      }

      if (filters.min_price !== undefined) {
        conditions.push(gte(propertiesTable.price, filters.min_price.toString()));
      }

      if (filters.max_price !== undefined) {
        conditions.push(lte(propertiesTable.price, filters.max_price.toString()));
      }

      if (filters.bedrooms !== undefined) {
        conditions.push(eq(propertiesTable.bedrooms, filters.bedrooms));
      }

      if (filters.property_type) {
        conditions.push(eq(propertiesTable.property_type, filters.property_type));
      }

      if (filters.is_featured !== undefined) {
        conditions.push(eq(propertiesTable.is_featured, filters.is_featured));
      }
    }

    // Build and execute query in a single chain based on whether conditions exist
    const results = conditions.length > 0
      ? await db.select()
          .from(propertiesTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(propertiesTable.created_at))
          .execute()
      : await db.select()
          .from(propertiesTable)
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
    console.error('Failed to get properties:', error);
    throw error;
  }
};
