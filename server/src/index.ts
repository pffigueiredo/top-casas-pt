
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  propertyFiltersSchema,
  createPropertyInputSchema,
  updatePropertyInputSchema,
  createPropertyImageInputSchema,
  addFavoriteInputSchema,
  removeFavoriteInputSchema,
  getFavoritesInputSchema
} from './schema';

// Import handlers
import { createProperty } from './handlers/create_property';
import { getProperties } from './handlers/get_properties';
import { getPropertyById } from './handlers/get_property_by_id';
import { getFeaturedProperties } from './handlers/get_featured_properties';
import { updateProperty } from './handlers/update_property';
import { deleteProperty } from './handlers/delete_property';
import { createPropertyImage } from './handlers/create_property_image';
import { deletePropertyImage } from './handlers/delete_property_image';
import { addFavorite } from './handlers/add_favorite';
import { removeFavorite } from './handlers/remove_favorite';
import { getFavorites } from './handlers/get_favorites';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Property routes
  createProperty: publicProcedure
    .input(createPropertyInputSchema)
    .mutation(({ input }) => createProperty(input)),

  getProperties: publicProcedure
    .input(propertyFiltersSchema.optional())
    .query(({ input }) => getProperties(input)),

  getPropertyById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPropertyById(input.id)),

  getFeaturedProperties: publicProcedure
    .query(() => getFeaturedProperties()),

  updateProperty: publicProcedure
    .input(updatePropertyInputSchema)
    .mutation(({ input }) => updateProperty(input)),

  deleteProperty: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProperty(input.id)),

  // Property image routes
  createPropertyImage: publicProcedure
    .input(createPropertyImageInputSchema)
    .mutation(({ input }) => createPropertyImage(input)),

  deletePropertyImage: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePropertyImage(input.id)),

  // Favorites routes
  addFavorite: publicProcedure
    .input(addFavoriteInputSchema)
    .mutation(({ input }) => addFavorite(input)),

  removeFavorite: publicProcedure
    .input(removeFavoriteInputSchema)
    .mutation(({ input }) => removeFavorite(input)),

  getFavorites: publicProcedure
    .input(getFavoritesInputSchema)
    .query(({ input }) => getFavorites(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
