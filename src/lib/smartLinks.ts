import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Github, 
  Music, 
  Globe, 
  Mail, 
  MessageCircle,
  Link as LinkIcon,
  Twitch,
  Send,
  AtSign
} from 'lucide-react';

export interface SmartLinkConfig {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  urlTemplate: string | null; // null means use raw URL
  inputType: 'username' | 'url' | 'id' | 'email';
  description: string;
  copyAction?: boolean; // If true, clicking copies instead of opening link
}

export const SMART_LINKS: SmartLinkConfig[] = [
  {
    value: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    placeholder: 'username',
    urlTemplate: 'https://twitter.com/{value}',
    inputType: 'username',
    description: 'Your Twitter/X username without @',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'username',
    urlTemplate: 'https://instagram.com/{value}',
    inputType: 'username',
    description: 'Your Instagram username',
  },
  {
    value: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    placeholder: '@channel or channel URL',
    urlTemplate: 'https://youtube.com/@{value}',
    inputType: 'username',
    description: 'Your YouTube channel handle',
  },
  {
    value: 'github',
    label: 'GitHub',
    icon: Github,
    placeholder: 'username',
    urlTemplate: 'https://github.com/{value}',
    inputType: 'username',
    description: 'Your GitHub username',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: Music,
    placeholder: 'username',
    urlTemplate: 'https://tiktok.com/@{value}',
    inputType: 'username',
    description: 'Your TikTok username without @',
  },
  {
    value: 'twitch',
    label: 'Twitch',
    icon: Twitch,
    placeholder: 'username',
    urlTemplate: 'https://twitch.tv/{value}',
    inputType: 'username',
    description: 'Your Twitch username',
  },
  {
    value: 'discord',
    label: 'Discord',
    icon: MessageCircle,
    placeholder: 'User ID (e.g., 123456789)',
    urlTemplate: null,
    inputType: 'id',
    description: 'Your Discord User ID - will be copied on click',
    copyAction: true,
  },
  {
    value: 'telegram',
    label: 'Telegram',
    icon: Send,
    placeholder: 'username',
    urlTemplate: 'https://t.me/{value}',
    inputType: 'username',
    description: 'Your Telegram username',
  },
  {
    value: 'mail',
    label: 'Email',
    icon: Mail,
    placeholder: 'you@example.com',
    urlTemplate: 'mailto:{value}',
    inputType: 'email',
    description: 'Your email address',
  },
  {
    value: 'threads',
    label: 'Threads',
    icon: AtSign,
    placeholder: 'username',
    urlTemplate: 'https://threads.net/@{value}',
    inputType: 'username',
    description: 'Your Threads username',
  },
  {
    value: 'spotify',
    label: 'Spotify',
    icon: Music,
    placeholder: 'profile URL or ID',
    urlTemplate: 'https://open.spotify.com/user/{value}',
    inputType: 'username',
    description: 'Your Spotify profile ID',
  },
  {
    value: 'globe',
    label: 'Website',
    icon: Globe,
    placeholder: 'https://example.com',
    urlTemplate: null,
    inputType: 'url',
    description: 'Full website URL',
  },
  {
    value: 'link',
    label: 'Custom Link',
    icon: LinkIcon,
    placeholder: 'https://example.com',
    urlTemplate: null,
    inputType: 'url',
    description: 'Any custom URL',
  },
];

export const getSmartLinkConfig = (value: string): SmartLinkConfig | undefined => {
  return SMART_LINKS.find(sl => sl.value === value);
};

export const buildUrl = (config: SmartLinkConfig, inputValue: string): string => {
  if (!config.urlTemplate) {
    // Raw URL - ensure it has protocol
    if (config.inputType === 'url' && !inputValue.startsWith('http')) {
      return `https://${inputValue}`;
    }
    return inputValue;
  }
  
  // Clean the input value
  let cleanValue = inputValue.trim();
  
  // Remove @ prefix if present for usernames
  if (config.inputType === 'username' && cleanValue.startsWith('@')) {
    cleanValue = cleanValue.slice(1);
  }
  
  return config.urlTemplate.replace('{value}', cleanValue);
};

export const extractValueFromUrl = (url: string, icon: string): string => {
  const config = getSmartLinkConfig(icon);
  if (!config || !config.urlTemplate) return url;
  
  // Try to extract the username/id from the URL
  const patterns: Record<string, RegExp> = {
    twitter: /(?:twitter\.com|x\.com)\/([^/?]+)/i,
    instagram: /instagram\.com\/([^/?]+)/i,
    youtube: /youtube\.com\/@?([^/?]+)/i,
    github: /github\.com\/([^/?]+)/i,
    tiktok: /tiktok\.com\/@?([^/?]+)/i,
    twitch: /twitch\.tv\/([^/?]+)/i,
    telegram: /t\.me\/([^/?]+)/i,
    threads: /threads\.net\/@?([^/?]+)/i,
    spotify: /open\.spotify\.com\/user\/([^/?]+)/i,
  };
  
  const pattern = patterns[icon];
  if (pattern) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return url;
};
