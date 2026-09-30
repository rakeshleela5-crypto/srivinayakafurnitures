// ==============================================================================
// 🌐 CORS — Hono middleware for cross-origin requests
// Replaces manual origin whitelist checks in the old monolithic handler
// ==============================================================================
import { cors } from 'hono/cors';

export const ALLOWED_ORIGINS = [
  'https://srivinayakafurnitures.pages.dev',
  'https://srivinayakafurnitures.rakeshleela5.workers.dev',
  'https://srivinayakafurnitures.web.app',
  'https://srivinayakafurnitures.firebaseapp.com',
];

/**
 * Dynamic CORS middleware — allows localhost in dev, strict origins in prod.
 */
export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return '*'; // server-to-server / curl
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return origin;
    return ALLOWED_ORIGINS.find(o => origin.startsWith(o)) ?? null;
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Director-Auth'],
  maxAge: 86400,
});
