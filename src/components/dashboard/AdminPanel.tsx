import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Key, 
  Plus, 
  Trash2,
  Copy,
  Users,
  Award,
  Loader2,
  CreditCard,
  UserX,
  RefreshCw,
  Search,
  BadgePlus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteCode {
  id: string;
  code: string;
  uses_left: number;
  max_uses: number;
  created_at: string;
  used_at: string | null;
}

interface PaymentLog {
  id: string;
  user_id: string;
  discord_username: string | null;
  amount: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean | null;
  created_at: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  tooltip: string | null;
  is_premium: boolean | null;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newCodeUses, setNewCodeUses] = useState('1');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [assigningBadge, setAssigningBadge] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Fetch all profiles for admin management
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin_profiles', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch all badges
  const { data: badges } = useQuery({
    queryKey: ['admin_badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Fetch user badges for selected user
  const { data: userBadges } = useQuery({
    queryKey: ['admin_user_badges', selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', selectedUser.user_id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser,
  });

  // Fetch invite codes
  const { data: inviteCodes, isLoading: codesLoading } = useQuery({
    queryKey: ['admin_invite_codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InviteCode[];
    },
  });

  // Fetch payment logs
  const { data: paymentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin_payment_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as PaymentLog[];
    },
  });

  // Generate new invite code
  const generateCode = async () => {
    setGeneratingCode(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      const { error } = await supabase.from('invite_codes').insert({
        code,
        uses_left: parseInt(newCodeUses),
        max_uses: parseInt(newCodeUses),
        created_by: user?.id,
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin_invite_codes'] });
      toast.success('Invite code generated!');
      navigator.clipboard.writeText(code);
      toast.info('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to generate code');
    }
    setGeneratingCode(false);
  };

  // Delete invite code
  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase.from('invite_codes').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin_invite_codes'] });
      toast.success('Code deleted');
    } catch (error) {
      toast.error('Failed to delete code');
    }
  };

  // Delete profile
  const deleteProfile = async (profile: Profile) => {
    if (!confirm(`Are you sure you want to delete ${profile.username}? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingProfile(true);
    try {
      // Delete from profiles table (cascade will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin_profiles'] });
      toast.success(`Profile ${profile.username} deleted`);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(`Failed to delete profile: ${error.message}`);
    }
    setDeletingProfile(false);
  };

  // Assign badge to user
  const assignBadge = async () => {
    if (!selectedUser || !selectedBadge) return;
    
    setAssigningBadge(true);
    try {
      // Check if user already has this badge
      const existing = userBadges?.find(ub => ub.badge_id === selectedBadge);
      if (existing) {
        toast.error('User already has this badge');
        setAssigningBadge(false);
        return;
      }

      const { error } = await supabase.from('user_badges').insert({
        user_id: selectedUser.user_id,
        badge_id: selectedBadge,
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin_user_badges', selectedUser.user_id] });
      toast.success('Badge assigned!');
      setSelectedBadge('');
    } catch (error: any) {
      toast.error(`Failed to assign badge: ${error.message}`);
    }
    setAssigningBadge(false);
  };

  // Revoke badge from user
  const revokeBadge = async (userBadgeId: string) => {
    try {
      const { error } = await supabase
        .from('user_badges')
        .delete()
        .eq('id', userBadgeId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['admin_user_badges', selectedUser?.user_id] });
      toast.success('Badge revoked');
    } catch (error: any) {
      toast.error(`Failed to revoke badge: ${error.message}`);
    }
  };

  // Reset user password (requires service role - use edge function)
  const resetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setResettingPassword(true);
    try {
      // For now, we'll use a workaround - send password reset email
      // A proper implementation would use an edge function with service role
      toast.info('Password reset requires backend implementation. For now, the user should use "Forgot Password" flow.');
    } catch (error: any) {
      toast.error(`Failed to reset password: ${error.message}`);
    }
    setResettingPassword(false);
    setNewPassword('');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <div className="space-y-6">
      {/* User Management */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">User Management</h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by username or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-cyber pl-10"
          />
        </div>

        {/* Users List */}
        {profilesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profiles?.map((profile) => (
              <div
                key={profile.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedUser?.id === profile.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-secondary/30 border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedUser(profile)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-primary/30">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm">{(profile.display_name || profile.username).charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{profile.display_name || profile.username}</p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.is_admin && (
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">Admin</span>
                  )}
                </div>
              </div>
            ))}
            {profiles?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            )}
          </div>
        )}

        {/* Selected User Actions */}
        {selectedUser && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary">
                Managing: @{selectedUser.username}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>

            {/* Badge Management */}
            <div className="glass-hover p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-medium">Badges</span>
              </div>
              
              {/* Current Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {userBadges?.map((ub: any) => (
                  <div key={ub.id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-sm border border-primary/30">
                    <span>{ub.badge?.name}</span>
                    <button 
                      onClick={() => revokeBadge(ub.id)}
                      className="ml-1 text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!userBadges || userBadges.length === 0) && (
                  <span className="text-xs text-muted-foreground">No badges assigned</span>
                )}
              </div>

              {/* Add Badge */}
              <div className="flex gap-2">
                <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                  <SelectTrigger className="input-cyber flex-grow">
                    <SelectValue placeholder="Select badge to assign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {badges?.map((badge) => (
                      <SelectItem key={badge.id} value={badge.id}>
                        {badge.name} {badge.is_premium && '⭐'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={assignBadge} 
                  disabled={!selectedBadge || assigningBadge}
                  variant="neon"
                  size="icon"
                >
                  {assigningBadge ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgePlus className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Password Reset */}
            <div className="glass-hover p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-primary" />
                <span className="font-medium">Reset Password</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="New password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-cyber flex-grow"
                />
                <Button 
                  onClick={resetPassword} 
                  disabled={!newPassword || resettingPassword}
                  variant="secondary"
                >
                  {resettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: This requires an edge function with service role access
              </p>
            </div>

            {/* Delete Profile */}
            <div className="glass-hover p-4 rounded-lg border border-destructive/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-destructive" />
                  <span className="font-medium text-destructive">Danger Zone</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProfile(selectedUser)}
                  disabled={deletingProfile}
                >
                  {deletingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                  Delete Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Codes */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Invite Codes</h2>
        </div>

        {/* Generate New Code */}
        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <Label>Number of Uses</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={newCodeUses}
              onChange={(e) => setNewCodeUses(e.target.value)}
              className="input-cyber w-32"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={generateCode} disabled={generatingCode} variant="neon-pink">
              {generatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Code
            </Button>
          </div>
        </div>

        {/* Codes List */}
        {codesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {inviteCodes?.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <code className="font-mono text-primary bg-primary/10 px-3 py-1 rounded">
                    {code.code}
                  </code>
                  <span className={`text-sm ${code.uses_left > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {code.uses_left}/{code.max_uses} uses left
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyCode(code.code)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCode(code.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {inviteCodes?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No invite codes yet</p>
            )}
          </div>
        )}
      </div>

      {/* Payment Logs */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Payment Logs</h2>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : paymentLogs?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No payment logs yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {paymentLogs?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{log.discord_username || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.amount ? `$${log.amount}` : 'Amount not set'} • {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.status === 'confirmed' 
                      ? 'bg-green-500/20 text-green-500' 
                      : log.status === 'rejected'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass p-6 rounded-xl text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{profiles?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <Key className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">{inviteCodes?.filter(c => c.uses_left > 0).length || 0}</p>
          <p className="text-sm text-muted-foreground">Active Codes</p>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <Award className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{paymentLogs?.filter(l => l.status === 'confirmed').length || 0}</p>
          <p className="text-sm text-muted-foreground">Confirmed Payments</p>
        </div>
      </div>
    </div>
  );
};