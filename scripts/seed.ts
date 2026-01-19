import { db } from "../server/db";
import { users, profiles } from "../shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // clear existing
  await db.delete(profiles).execute();
  await db.delete(users).execute();

  const demoUsers = [
    {
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Wonder",
      age: 24,
      gender: "Female",
      city: "New York",
      bio: "Love hiking and coffee.",
      photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"]
    },
    {
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Builder",
      age: 28,
      gender: "Male",
      city: "Brooklyn",
      bio: "Building things is my passion.",
      photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"]
    },
    {
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Day",
      age: 26,
      gender: "Non-binary",
      city: "Queens",
      bio: "Artist and dreamer.",
      photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"]
    }
  ];

  for (const u of demoUsers) {
    const [user] = await db.insert(users).values({
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      profileImageUrl: u.photos[0]
    }).returning();

    await db.insert(profiles).values({
      userId: user.id,
      age: u.age,
      gender: u.gender,
      city: u.city,
      bio: u.bio,
      photos: u.photos
    });
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
