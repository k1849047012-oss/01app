export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export interface Match {
  id: string;
  profileId: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  MATCHES: "spark_demo_matches",
  MESSAGES_PREFIX: "spark_demo_msgs_",
  REPORTS: "spark_demo_reports",
};

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  city: string;
  bio: string;
  photos: string[];
  exposureScore: number;
  dislikeCount: number;
  blockCount: number;
  chatFailCount: number;
  createdAt: number;
  isDeleted: boolean;
  blockedUsers: string[];
  isUnderage: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Your Name",
  age: 25,
  gender: "Non-binary",
  city: "San Francisco",
  bio: "Hello! This is your demo profile. You can edit your information here.",
  photos: [
    "https://picsum.photos/seed/user1/600/800",
    "https://picsum.photos/seed/user2/600/800",
    "https://picsum.photos/seed/user3/600/800",
    "",
    "",
    ""
  ],
  exposureScore: 100,
  dislikeCount: 0,
  blockCount: 0,
  chatFailCount: 0,
  createdAt: Date.now(),
  isDeleted: false,
  blockedUsers: [],
  isUnderage: false,
};

export const demoStore = {
  getMatches: (): Match[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    const matches: Match[] = data ? JSON.parse(data) : [];
    const profile = demoProfileStore.getProfile();
    // Filter out matches with blocked users
    return matches.filter(m => !profile.blockedUsers.includes(m.profileId));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    MOCK_PROFILES_IDS.forEach(id => {
      localStorage.removeItem(STORAGE_KEYS.MESSAGES_PREFIX + id);
    });
  },

  addMatch: (profileId: string): Match => {
    const matches = demoStore.getMatches();
    const newMatch = {
      id: profileId,
      profileId,
      timestamp: Date.now(),
    };
    if (!matches.find((m) => m.profileId === profileId)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([...matches, newMatch]));
    }
    return newMatch;
  },

  getMessages: (matchId: string): Message[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES_PREFIX + matchId);
    return data ? JSON.parse(data) : [];
  },

  addMessage: (matchId: string, senderId: string, content: string): Message => {
    const msgs = demoStore.getMessages(matchId);
    const newMsg = {
      id: Math.random().toString(36).substr(2, 9),
      senderId,
      content,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      STORAGE_KEYS.MESSAGES_PREFIX + matchId,
      JSON.stringify([...msgs, newMsg])
    );
    return newMsg;
  },

  reportUser: (targetId: string, reason: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = data ? JSON.parse(data) : [];
    reports.push({ targetId, reason, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    // Automatically block reported user
    demoProfileStore.blockUser(targetId);
  }
};

export const demoProfileStore = {
  getProfile: (): UserProfile => {
    const data = localStorage.getItem("spark_demo_profile");
    if (!data) return DEFAULT_PROFILE;
    const profile = JSON.parse(data);
    // Ensure all fields exist
    return { ...DEFAULT_PROFILE, ...profile };
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem("spark_demo_profile", JSON.stringify(profile));
  },
  // Silent penalty logic
  applyPenalty: (type: 'dislike' | 'block' | 'chat_fail') => {
    const profile = demoProfileStore.getProfile();
    let score = profile.exposureScore;
    
    if (type === 'dislike') {
      profile.dislikeCount++;
      score -= 30;
    } else if (type === 'block') {
      profile.blockCount++;
      score -= 20;
    } else if (type === 'chat_fail') {
      profile.chatFailCount++;
      score -= 10;
    }
    
    profile.exposureScore = Math.max(0, score);
    demoProfileStore.saveProfile(profile);
  },
  blockUser: (targetId: string) => {
    const profile = demoProfileStore.getProfile();
    if (!profile.blockedUsers.includes(targetId)) {
      profile.blockedUsers.push(targetId);
      demoProfileStore.saveProfile(profile);
    }
  },
  deleteAccount: () => {
    const profile = demoProfileStore.getProfile();
    profile.isDeleted = true;
    demoProfileStore.saveProfile(profile);
    // Clear matches and messages for this user in local storage
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
  }
};

const MOCK_PROFILES_IDS = ["1", "3", "5"];
