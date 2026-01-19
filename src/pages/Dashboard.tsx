import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { GlowEffect } from '@/components/effects/GlowEffect';
import { ProfileEditor } from '@/components/dashboard/ProfileEditor';
import { LinksEditor } from '@/components/dashboard/LinksEditor';
import { VisualsEditor } from '@/components/dashboard/VisualsEditor';
import { BadgesPanel } from '@/components/dashboard/BadgesPanel';
import { AdminPanel } from '@/components/dashboard/AdminPanel';
import { 
  Zap, 
  User, 
  Link as LinkIcon, 
  Palette, 
  Award,
  Shield,
  ExternalLink,
  LogOut,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground enabled count={20} />
      <GlowEffect enabled />
      
      <div className="fixed inset-0 bg-cyber-grid bg-cyber-grid opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold">Dashboard</span>
              <span className="text-muted-foreground text-sm ml-2">@{profile.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/${profile.username}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
                View Profile
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LinkIcon className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="visuals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="w-4 h-4" />
              Visuals
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Award className="w-4 h-4" />
              Badges
            </TabsTrigger>
            {profile.is_admin && (
              <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <ProfileEditor />
          </TabsContent>

          <TabsContent value="links">
            <LinksEditor />
          </TabsContent>

          <TabsContent value="visuals">
            <VisualsEditor />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesPanel />
          </TabsContent>

          {profile.is_admin && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
