import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, User, AtSign, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileEditor = () => {
  const { profile, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username);
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username === profile?.username) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      setUsernameAvailable(!data);
      setCheckingUsername(false);
    };

    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [username, profile?.username]);

  const handleSave = async () => {
    if (username !== profile?.username && usernameAvailable === false) {
      toast.error('Username is already taken');
      return;
    }

    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        username: username.toLowerCase(),
        bio,
        avatar_url: avatarUrl,
      });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="glass p-6 rounded-xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>

      {/* Avatar Preview */}
      <div className="flex items-center gap-6">
        <Avatar className="w-20 h-20 border-2 border-primary/30">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-secondary text-2xl">
            {(displayName || username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-grow space-y-2">
          <Label htmlFor="avatar" className="flex items-center gap-2">
            <Image className="w-3.5 h-3.5 text-primary" />
            Avatar URL
          </Label>
          <Input
            id="avatar"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="input-cyber"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-cyber"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            <AtSign className="w-3.5 h-3.5 text-primary" />
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="input-cyber"
            />
            {checkingUsername && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {username !== profile?.username && usernameAvailable !== null && (
            <p className={`text-xs ${usernameAvailable ? 'text-green-500' : 'text-destructive'}`}>
              {usernameAvailable ? 'Username available!' : 'Username already taken'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-primary" />
          Bio
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell the world about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input-cyber min-h-[100px]"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
      </div>

      <Button onClick={handleSave} disabled={saving} variant="cyber" className="w-full md:w-auto">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
};
