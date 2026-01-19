import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertProfile, type InsertSwipe } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// === PROFILES ===

export function useMyProfile() {
  return useQuery({
    queryKey: [api.profiles.me.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.me.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertProfile) => {
      const res = await fetch(api.profiles.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: [api.profiles.recommendations.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.recommendations.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return api.profiles.recommendations.responses[200].parse(await res.json());
    },
  });
}

// === SWIPES ===

export function useSwipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertSwipe) => {
      const res = await fetch(api.swipes.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Swipe failed");
      return api.swipes.create.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      if (data.matched) {
        queryClient.invalidateQueries({ queryKey: [api.matches.list.path] });
      }
      // Optimistically remove the swiped user is handled in the UI state usually
      // but we can invalidate recommendations if needed
      queryClient.invalidateQueries({ queryKey: [api.profiles.recommendations.path] });
    },
  });
}

// === MATCHES ===

export function useMatches() {
  return useQuery({
    queryKey: [api.matches.list.path],
    queryFn: async () => {
      const res = await fetch(api.matches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return api.matches.list.responses[200].parse(await res.json());
    },
  });
}

// === MESSAGES ===

export function useMessages(matchId: number) {
  const path = buildUrl(api.messages.list.path, { id: matchId });
  return useQuery({
    queryKey: [path],
    queryFn: async () => {
      const res = await fetch(path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    refetchInterval: 3000, // Poll every 3s for MVP
  });
}

export function useSendMessage(matchId: number) {
  const queryClient = useQueryClient();
  const path = buildUrl(api.messages.send.path, { id: matchId });
  
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.send.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [buildUrl(api.messages.list.path, { id: matchId })] });
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path] }); // Update last message preview
    },
  });
}
