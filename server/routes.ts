import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile Routes
  app.get(api.profiles.me.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.post(api.profiles.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const existing = await storage.getProfile(userId);
    
    try {
      if (existing) {
        const input = api.profiles.update.input.partial().parse(req.body);
        const updated = await storage.updateProfile(userId, input);
        res.json(updated);
      } else {
        const input = api.profiles.update.input.parse(req.body);
        const created = await storage.createProfile({ ...input, userId });
        res.json(created);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.profiles.recommendations.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const recs = await storage.getRecommendations(userId);
    res.json(recs);
  });

  // Swipe Routes
  app.post(api.swipes.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.swipes.create.input.parse(req.body);
      // Can't swipe on self
      if (input.targetId === userId) {
        return res.status(400).json({ message: "Cannot swipe on self" });
      }
      
      const result = await storage.createSwipe({ ...input, swiperId: userId });
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: "Invalid swipe" });
    }
  });

  // Matches Routes
  app.get(api.matches.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const matches = await storage.getMatches(userId);
    res.json(matches);
  });

  // Messages Routes
  app.get(api.messages.list.path, isAuthenticated, async (req, res) => {
    const matchId = Number(req.params.id);
    const msgs = await storage.getMessages(matchId);
    res.json(msgs);
  });

  app.post(api.messages.send.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const matchId = Number(req.params.id);
    const { content } = req.body;
    
    const msg = await storage.createMessage(userId, matchId, content);
    res.status(201).json(msg);
  });

  return httpServer;
}
