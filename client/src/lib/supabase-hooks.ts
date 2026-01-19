import { supabase } from "./supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useSupabaseAuth() {
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ["supabase-session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5,
  });

  const login = async (email: string) => {
    console.log("🔥 LOGIN FUNCTION CALLED");
    console.log("📧 email =", email);
    console.log("🌍 location =", window.location.origin);

    supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      console.error("❌ OTP ERROR:", error);
      throw error;
    }

    console.log("✅ OTP REQUEST SENT");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(["supabase-session"], null);
    queryClient.invalidateQueries();
  };

  return {
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session?.user,
    login,
    logout,
  };
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      if (!userId) return [];

      // Get swiped IDs to exclude
      const { data: swiped } = await supabase
        .from("swipes")
        .select("target_id")
        .eq("swiper_id", userId);

      const swipedIds = swiped?.map((s) => s.target_id) || [];
      swipedIds.push(userId); // Exclude self

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .not("id", "in", `(${swipedIds.join(",")})`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useSwipes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      swiperId,
      targetId,
      direction,
    }: {
      swiperId: string;
      targetId: string;
      direction: "LIKE" | "PASS";
    }) => {
      const { error: swipeError } = await supabase
        .from("swipes")
        .upsert({ swiper_id: swiperId, target_id: targetId, direction });

      if (swipeError) throw swipeError;

      if (direction === "LIKE") {
        // Check for reciprocal like
        const { data: reciprocal } = await supabase
          .from("swipes")
          .select("*")
          .eq("swiper_id", targetId)
          .eq("target_id", swiperId)
          .eq("direction", "LIKE")
          .maybeSingle();

        if (reciprocal) {
          // Check if match already exists
          const { data: existingMatch } = await supabase
            .from("matches")
            .select("id")
            .or(
              `and(user_1_id.eq.${swiperId},user_2_id.eq.${targetId}),and(user_1_id.eq.${targetId},user_2_id.eq.${swiperId})`,
            )
            .maybeSingle();

          if (!existingMatch) {
            const { data: match, error: matchError } = await supabase
              .from("matches")
              .insert({ user_1_id: swiperId, user_2_id: targetId })
              .select()
              .single();

            if (matchError) throw matchError;
            return { matched: true, match };
          }
          return { matched: true, match: existingMatch };
        }
      }
      return { matched: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useMatches(userId?: string) {
  return useQuery({
    queryKey: ["matches", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          id,
          user_1_id,
          user_2_id,
          created_at
        `,
        )
        .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`);

      if (error) throw error;

      // Fetch partner profiles manually since join might be tricky with RLS/types
      const results = [];
      for (const match of data) {
        const partnerId =
          match.user_1_id === userId ? match.user_2_id : match.user_1_id;
        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", partnerId)
          .single();

        if (partnerProfile) {
          results.push({
            ...match,
            partner: partnerProfile,
          });
        }
      }
      return results;
    },
    enabled: !!userId,
  });
}

export function useMessages(matchId?: string) {
  return useQuery({
    queryKey: ["messages", matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!matchId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      senderId,
      content,
    }: {
      matchId: string;
      senderId: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({ match_id: matchId, sender_id: senderId, content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.matchId],
      });
    },
  });
}
