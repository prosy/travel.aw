// Export all types
export * from './types';

// Export schemas as JSON (for runtime validation)
export { default as tripSchema } from './schemas/trip.schema.json';
export { default as tripItemSchema } from './schemas/trip-item.schema.json';
export { default as offerSchema } from './schemas/offer.schema.json';
export { default as mediaSchema } from './schemas/media.schema.json';
export { default as contextBundleSchema } from './schemas/context-bundle.schema.json';
export { default as citationSchema } from './schemas/citation.schema.json';
