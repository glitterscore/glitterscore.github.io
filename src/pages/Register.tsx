import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { GlowEffect } from '@/components/effects/GlowEffect';
import { Zap, ArrowLeft, Loader2, Lock, AtSign } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, inviteCode, username);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Welcome to the void.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      <ParticleBackground enabled count={20} />
      <GlowEffect enabled />
      
      <div className="fixed inset-0 bg-cyber-grid bg-cyber-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="glass p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Join the void</h1>
              <p className="text-sm text-muted-foreground">Create your exclusive profile</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="invite" className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Invite Code
              </Label>
              <Input
                id="invite"
                type="text"
                placeholder="Enter your invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="input-cyber font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <AtSign className="w-3.5 h-3.5 text-primary" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="input-cyber"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your profile will be at niggas.bio/{username || 'username'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-cyber"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-cyber"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" variant="cyber" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Don't have an invite code?{' '}
              <a href="https://discord.gg/HEyx6tKbET" className="text-accent hover:underline">
                Join our Discord
              </a>{' '}
              to request one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
