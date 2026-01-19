import { useParams } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/useProfile';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { Snowfall } from '@/components/effects/Snowfall';
import { GlowEffect } from '@/components/effects/GlowEffect';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Link as LinkIcon, 
  ExternalLink,
  CheckCircle,
  Star,
  Crown,
  Code,
  Handshake,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Music,
  Globe,
  Mail,
  MessageCircle,
  Loader2
} from 'lucide-react';
import NotFound from './NotFound';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'link': LinkIcon,
  'twitter': Twitter,
  'instagram': Instagram,
  'youtube': Youtube,
  'github': Github,
  'music': Music,
  'globe': Globe,
  'mail': Mail,
  'discord': MessageCircle,
  'check-circle': CheckCircle,
  'star': Star,
  'crown': Crown,
  'code': Code,
  'handshake': Handshake,
};

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { profile, visualSettings, links, userBadges, loading, notFound } = usePublicProfile(username || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      {visualSettings?.effect_particles && <ParticleBackground enabled />}
      {visualSettings?.effect_snowfall && <Snowfall enabled />}
      {visualSettings?.effect_glow && <GlowEffect enabled />}
      
      {/* Background Image/Video/Gradient */}
      {visualSettings?.background_type === 'image' && visualSettings.background_value && (
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${visualSettings.background_value})` }}
        />
      )}
      {visualSettings?.background_type === 'video' && visualSettings.background_value && (
        <video 
          className="fixed inset-0 w-full h-full object-cover opacity-30"
          src={visualSettings.background_value}
          autoPlay
          loop
          muted
        />
      )}

      {/* Cyber grid overlay */}
      <div className="fixed inset-0 bg-cyber-grid bg-cyber-grid opacity-20 pointer-events-none" />

      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none opacity-30" />

      {/* Background Audio */}
      {visualSettings?.background_audio_url && (
        <audio 
          src={visualSettings.background_audio_url}
          autoPlay={visualSettings.audio_autoplay}
          loop={visualSettings.audio_loop}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center px-6 py-16">
        <div className="w-full max-w-md stagger-children">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className={`relative ${visualSettings?.effect_glitch ? 'glitch' : ''}`}>
              <Avatar className="w-28 h-28 border-4 border-primary/30 shadow-[0_0_30px_hsla(173,80%,50%,0.3)]">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || profile.username} />
                <AvatarFallback className="bg-secondary text-3xl font-bold">
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse" />
            </div>
          </div>

          {/* Name & Badges */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className={`text-2xl font-bold ${visualSettings?.effect_glow ? 'neon-text' : ''}`}>
                {profile.display_name || profile.username}
              </h1>
              
              {/* Badges */}
              {displayedBadges.length > 0 && (
                <div className="flex items-center gap-1">
                  {displayedBadges.map((ub) => {
                    const IconComponent = iconMap[ub.badge?.icon || 'star'] || Star;
                    return (
                      <Tooltip key={ub.id}>
                        <TooltipTrigger>
                          <div className={`${ub.badge?.is_premium ? 'badge-premium' : ''}`}>
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ub.badge?.tooltip || ub.badge?.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              )}
            </div>
            
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-center text-muted-foreground mb-8 max-w-sm mx-auto">
              {profile.bio}
            </p>
          )}

          {/* Links */}
          <div className="space-y-3">
            {links?.map((link) => {
              const IconComponent = iconMap[link.icon] || LinkIcon;
              
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card flex items-center gap-4 p-4 rounded-xl group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-grow font-medium">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>

          {/* Empty state */}
          {(!links || links.length === 0) && (
            <div className="glass p-8 rounded-xl text-center">
              <LinkIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No links yet</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-4 h-4 bg-primary/50 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary-foreground">V</span>
              </div>
              VOID.LINK
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
