import { useProfile, Badge } from '@/hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Award, 
  CheckCircle,
  Star,
  Crown,
  Code,
  Handshake,
  Lock,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'check-circle': CheckCircle,
  'star': Star,
  'crown': Crown,
  'code': Code,
  'handshake': Handshake,
};

export const BadgesPanel = () => {
  const { userBadges, updateBadgeDisplay } = useProfile();

  // Fetch all available badges
  const { data: allBadges } = useQuery({
    queryKey: ['all_badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('is_premium', { ascending: false });
      if (error) throw error;
      return data as Badge[];
    },
  });

  const ownedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

  const handleToggleDisplay = async (badgeId: string, isDisplayed: boolean) => {
    try {
      await updateBadgeDisplay.mutateAsync({ badgeId, isDisplayed: !isDisplayed });
      toast.success('Badge visibility updated!');
    } catch (error) {
      toast.error('Failed to update badge');
    }
  };

  return (
    <div className="space-y-6">
      {/* Owned Badges */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Badges</h2>
        </div>

        {userBadges?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have any badges yet.</p>
            <p className="text-sm mt-2">Check out the premium badges below!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {userBadges?.map((ub) => {
              const IconComponent = iconMap[ub.badge?.icon || 'star'] || Star;
              
              return (
                <div
                  key={ub.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ub.badge?.is_premium ? 'bg-primary/20 badge-premium' : 'bg-secondary'
                    }`}>
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{ub.badge?.name}</p>
                      <p className="text-xs text-muted-foreground">{ub.badge?.tooltip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Show</span>
                    <Switch
                      checked={ub.is_displayed}
                      onCheckedChange={() => handleToggleDisplay(ub.badge_id, ub.is_displayed)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Premium Badges */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-semibold">Premium Badges</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Premium badges are sold exclusively through Discord. After purchase, an admin will assign the badge to your account.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {allBadges?.filter(b => b.is_premium).map((badge) => {
            const IconComponent = iconMap[badge.icon] || Star;
            const isOwned = ownedBadgeIds.has(badge.id);
            
            return (
              <div
                key={badge.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isOwned 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-secondary/20 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center badge-premium">
                    <IconComponent className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.tooltip}</p>
                  </div>
                </div>
                
                {isOwned ? (
                  <span className="text-xs text-primary font-medium px-3 py-1 rounded-full bg-primary/20">
                    Owned
                  </span>
                ) : (
                  <a href={badge.discord_buy_link || '#'} target="_blank" rel="noopener noreferrer">
                    <Button variant="neon-pink" size="sm">
                      <Lock className="w-3 h-3" />
                      Buy via Discord
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
