import { useParams } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/useProfile';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { Snowfall } from '@/components/effects/Snowfall';
import { GlowEffect } from '@/components/effects/GlowEffect';
import { ProfileLinks } from '@/components/profile/ProfileLinks';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Link as LinkIcon, 
  CheckCircle,
  Star,
  Crown,
  Code,
  Handshake,
  Loader2,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import NotFound from './NotFound';
import { useEffect, useRef, useState } from 'react';
import '@/moving-border.css';

const badgeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'check-circle': CheckCircle,
  'star': Star,
  'crown': Crown,
  'code': Code,
  'handshake': Handshake,
};

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, visualSettings, links, userBadges, loading, notFound } = usePublicProfile(username || '');
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return <NotFound />;
  }

  const displayedBadges = userBadges?.filter(ub => ub.is_displayed) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      {visualSettings?.effect_particles && <ParticleBackground enabled count={40} />}
      {visualSettings?.effect_snowfall && <Snowfall enabled />}
      
      {/* Background Image/Video/Gradient */}
      {visualSettings?.background_type === 'image' && visualSettings.background_value && (
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${visualSettings.background_value})` }}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        </div>
      )}
      {visualSettings?.background_type === 'video' && visualSettings.background_value && (
        <>
          <video 
            className="fixed inset-0 w-full h-full object-cover"
            src={visualSettings.background_value}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm" />
        </>
      )}

      {/* Cyber grid overlay */}
      <div className="fixed inset-0 bg-cyber-grid bg-cyber-grid opacity-10 pointer-events-none" />

      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none opacity-20" />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Background Audio */}
      {visualSettings?.background_audio_url && (
        <>
          <audio 
            ref={audioRef}
            src={visualSettings.background_audio_url}
            autoPlay={visualSettings.audio_autoplay}
            loop={visualSettings.audio_loop}
            muted
            playsInline
          />
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="fixed bottom-4 right-4 z-20 p-2 rounded-full glass text-white"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </>
      )}

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Profile Card */}
          <div className={`relative ${visualSettings?.effect_glitch ? 'glitch' : ''}`}>
            {/* Outer glow ring */}
            
            {/* Card Container */}
            <div className="relative moving-border">
              <div className="card-content relative glass rounded-3xl overflow-hidden border border-primary/20">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                {/* Hex pattern overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300ffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px'
                  }}
                />

                <div className="relative p-8 pt-10">
                  {/* Avatar Section */}
                  <div className="flex justify-center mb-8">
                    <div className="relative group">
                      {/* Avatar ring effects */}
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-50 blur-md transition-opacity" />
                      <div className="absolute -inset-2 rounded-full border-2 border-primary/30 animate-spin-slow" style={{ animationDuration: '10s' }} />
                      <div className="absolute -inset-3 rounded-full border border-accent/20 animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                      
                      {/* Main avatar */}
                      <Avatar className="relative w-32 h-32 border-4 border-background shadow-2xl shadow-primary/30">
                        <AvatarImage 
                          src={profile.avatar_url || ''} 
                          alt={profile.display_name || profile.username} 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-4xl font-bold">
                          {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Status indicator */}
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-primary rounded-full border-4 border-background shadow-lg shadow-primary/50" />
                    </div>
                  </div>

                  {/* Name & Username */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <h1 className={`text-3xl font-bold tracking-tight`}>
                        {profile.display_name || profile.username}
                      </h1>
                      
                      {/* Badges inline */}
                      {displayedBadges.length > 0 && (
                        <div className="flex items-center gap-1">
                          {displayedBadges.slice(0, 3).map((ub) => {
                            const IconComponent = badgeIconMap[ub.badge?.icon || 'star'] || Star;
                            return (
                              <Tooltip key={ub.id}>
                                <TooltipTrigger>
                                  <div className={`p-1.5 rounded-lg ${
                                    ub.badge?.is_premium 
                                      ? 'bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 badge-premium' 
                                      : 'bg-primary/10 border border-primary/30'
                                  }`}>
                                    <IconComponent className={`w-4 h-4 ${ub.badge?.is_premium ? 'text-accent' : 'text-primary'}`} />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="glass border-primary/30">
                                  <p className="font-medium">{ub.badge?.tooltip || ub.badge?.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                          {displayedBadges.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">+{displayedBadges.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground font-mono text-sm tracking-wider">
                      <span className="text-primary/70">@</span>{profile.username}
                    </p>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-xl" />
                      <p className="relative text-center text-muted-foreground px-4 py-3 leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative h-px mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background rounded-full flex items-center justify-center border border-primary/30">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Links - Icon Only Grid */}
                  {links && links.length > 0 ? (
                    <ProfileLinks links={links} glowEffect={visualSettings?.effect_glow} />
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl" />
                      <div className="relative p-8 rounded-xl border border-dashed border-primary/20 text-center">
                        <LinkIcon className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">No links yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom accent */}
                <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
                <Zap className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-mono tracking-wider">niggas.bio</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;