import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisualSettings {
  id: string;
  user_id: string;
  background_type: 'gradient' | 'image' | 'video';
  background_value: string | null;
  background_audio_url: string | null;
  audio_autoplay: boolean;
  audio_loop: boolean;
  effect_snowfall: boolean;
  effect_particles: boolean;
  effect_glow: boolean;
  effect_glitch: boolean;
}

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  tooltip: string | null;
  is_premium: boolean;
  discord_buy_link: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  is_displayed: boolean;
  acquired_at: string;
  badge?: Badge;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const { data: visualSettings, isLoading: visualLoading } = useQuery({
    queryKey: ['visual_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('visual_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data as VisualSettings;
    },
    enabled: !!user,
  });

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Link[];
    },
    enabled: !!user,
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['user_badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(ub => ({
        ...ub,
        badge: ub.badge as Badge
      })) as UserBadge[];
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const updateVisualSettings = useMutation({
    mutationFn: async (updates: Partial<VisualSettings>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('visual_settings')
        .update(updates)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visual_settings', user?.id] });
    },
  });

  const addLink = useMutation({
    mutationFn: async (link: Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('links')
        .insert({ ...link, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Link> }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.id] });
    },
  });

  const updateBadgeDisplay = useMutation({
    mutationFn: async ({ badgeId, isDisplayed }: { badgeId: string; isDisplayed: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_badges')
        .update({ is_displayed: isDisplayed })
        .eq('user_id', user.id)
        .eq('badge_id', badgeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_badges', user?.id] });
    },
  });

  return {
    profile,
    visualSettings,
    links,
    userBadges,
    loading: profileLoading || visualLoading || linksLoading || badgesLoading,
    updateProfile,
    updateVisualSettings,
    addLink,
    updateLink,
    deleteLink,
    updateBadgeDisplay,
  };
};

// Hook for public profile viewing
export const usePublicProfile = (username: string) => {
  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['public_profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: visualSettings } = useQuery({
    queryKey: ['public_visual_settings', profile?.user_id],
    queryFn: async () => {
      if (!profile) return null;
      const { data, error } = await supabase
        .from('visual_settings')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();
      if (error) throw error;
      return data as VisualSettings;
    },
    enabled: !!profile,
  });

  const { data: links } = useQuery({
    queryKey: ['public_links', profile?.user_id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Link[];
    },
    enabled: !!profile,
  });

  const { data: userBadges } = useQuery({
    queryKey: ['public_user_badges', profile?.user_id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', profile.user_id)
        .eq('is_displayed', true);
      if (error) throw error;
      return data.map(ub => ({
        ...ub,
        badge: ub.badge as Badge
      })) as UserBadge[];
    },
    enabled: !!profile,
  });

  return {
    profile,
    visualSettings,
    links,
    userBadges,
    loading: profileLoading,
    notFound: !!error,
  };
};
