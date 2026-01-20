import { useState } from 'react';
import { Link } from '@/hooks/useProfile';
import { getSmartLinkConfig, SMART_LINKS } from '@/lib/smartLinks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link as LinkIcon, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileLinksProps {
  links: Link[];
  glowEffect?: boolean;
}

export const ProfileLinks = ({ links, glowEffect }: ProfileLinksProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleClick = async (link: Link, e: React.MouseEvent) => {
    const config = getSmartLinkConfig(link.icon);
    
    if (config?.copyAction) {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(link.url);
        setCopiedId(link.id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        toast.error('Failed to copy');
      }
      return;
    }
  };

  const getIconComponent = (iconName: string) => {
    const config = SMART_LINKS.find(sl => sl.value === iconName);
    return config?.icon || LinkIcon;
  };

  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {links.map((link) => {
        const IconComponent = getIconComponent(link.icon);
        const config = getSmartLinkConfig(link.icon);
        const isCopied = copiedId === link.id;
        
        return (
          <Tooltip key={link.id}>
            <TooltipTrigger asChild>
              <a
                href={config?.copyAction ? '#' : link.url}
                target={config?.copyAction ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={(e) => handleClick(link, e)}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-xl opacity-0 group-hover:opacity-50 blur-md transition-all duration-300 ${glowEffect ? 'group-hover:opacity-70' : ''}`} />
                
                {/* Icon container */}
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all duration-300 cursor-pointer">
                  {isCopied ? (
                    <Check className="w-6 h-6 text-primary" />
                  ) : config?.copyAction ? (
                    <div className="relative">
                      <IconComponent className="w-6 h-6 text-primary group-hover:opacity-0 transition-opacity" />
                      <Copy className="w-6 h-6 text-primary absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <IconComponent className="w-6 h-6 text-primary" />
                  )}
                  
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="glass border-primary/30">
              <p className="font-medium">{link.title}</p>
              {config?.copyAction && (
                <p className="text-xs text-muted-foreground">Click to copy</p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
