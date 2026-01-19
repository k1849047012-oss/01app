import { z } from 'zod';
import { insertProfileSchema, insertSwipeSchema, insertMessageSchema, profiles, matches, messages, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    me: {
      method: 'GET' as const,
      path: '/api/profiles/me',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertProfileSchema,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    recommendations: { // Potential matches
      method: 'GET' as const,
      path: '/api/recommendations',
      responses: {
        200: z.array(z.custom<typeof profiles.$inferSelect & { username: string; age: number; gender: string }>()),
      },
    }
  },
  swipes: {
    create: {
      method: 'POST' as const,
      path: '/api/swipes',
      input: insertSwipeSchema,
      responses: {
        200: z.object({ matched: z.boolean(), matchId: z.number().optional() }),
        400: errorSchemas.validation,
      },
    },
  },
  matches: {
    list: {
      method: 'GET' as const,
      path: '/api/matches',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          partner: z.custom<typeof users.$inferSelect & { profile: typeof profiles.$inferSelect }>(),
          lastMessage: z.string().optional(),
        })),
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/matches/:id/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/matches/:id/messages',
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
