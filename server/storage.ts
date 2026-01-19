import { db } from "./db";
import { 
  profiles, swipes, matches, messages, users,
  type Profile, type InsertProfile, type InsertSwipe, type Match, type Message, type User 
} from "@shared/schema";
import { eq, and, ne, notInArray, desc, sql } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth";

export interface IStorage {
  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile & { userId: string }): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;
  getRecommendations(userId: string): Promise<(Profile & { username: string })[]>;

  // Swipes & Matches
  createSwipe(swipe: InsertSwipe & { swiperId: string }): Promise<{ matched: boolean, matchId?: number }>;
  getMatches(userId: string): Promise<(Match & { partner: User & { profile: Profile } })[]>;

  // Messages
  getMessages(matchId: number): Promise<Message[]>;
  createMessage(senderId: string, matchId: number, content: string): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile & { userId: string }): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  async getRecommendations(userId: string): Promise<(Profile & { username: string })[]> {
    // Get IDs of users already swiped by this user
    const existingSwipes = await db
      .select({ targetId: swipes.targetId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));
    
    const swipedIds = existingSwipes.map(s => s.targetId);
    swipedIds.push(userId); // Exclude self

    const recs = await db
      .select({
        ...profiles,
        username: users.email // Use email as username since auth module doesn't enforce unique usernames yet
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(notInArray(profiles.userId, swipedIds))
      .limit(10);
      
    // @ts-ignore
    return recs;
  }

  async createSwipe(swipe: InsertSwipe & { swiperId: string }): Promise<{ matched: boolean, matchId?: number }> {
    // 1. Create swipe
    await db.insert(swipes).values(swipe);

    if (swipe.direction === "PASS") {
      return { matched: false };
    }

    // 2. Check for reciprocal like
    const [reciprocal] = await db
      .select()
      .from(swipes)
      .where(and(
        eq(swipes.swiperId, swipe.targetId),
        eq(swipes.targetId, swipe.swiperId),
        eq(swipes.direction, "LIKE")
      ));

    if (reciprocal) {
      // 3. Create match
      const [match] = await db
        .insert(matches)
        .values({
          user1Id: swipe.swiperId,
          user2Id: swipe.targetId,
        })
        .returning();
      return { matched: true, matchId: match.id };
    }

    return { matched: false };
  }

  async getMatches(userId: string): Promise<(Match & { partner: User & { profile: Profile } })[]> {
    const userMatches = await db
      .select()
      .from(matches)
      .where(sql`${matches.user1Id} = ${userId} OR ${matches.user2Id} = ${userId}`);

    const result = [];
    for (const match of userMatches) {
      const partnerId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const partnerUser = await authStorage.getUser(partnerId);
      const partnerProfile = await this.getProfile(partnerId);

      if (partnerUser && partnerProfile) {
        result.push({
          ...match,
          partner: {
            ...partnerUser,
            profile: partnerProfile
          }
        });
      }
    }
    return result;
  }

  async getMessages(matchId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async createMessage(senderId: string, matchId: number, content: string): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        matchId,
        senderId,
        content
      })
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
