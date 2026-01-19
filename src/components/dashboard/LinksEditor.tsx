import { useState } from 'react';
import { useProfile, Link } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  GripVertical,
  Loader2,
  Save,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Music,
  Globe,
  Mail,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ICONS = [
  { value: 'link', label: 'Link', icon: LinkIcon },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'globe', label: 'Website', icon: Globe },
  { value: 'mail', label: 'Email', icon: Mail },
  { value: 'discord', label: 'Discord', icon: MessageCircle },
];

export const LinksEditor = () => {
  const { links, addLink, updateLink, deleteLink } = useProfile();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('link');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddLink = async () => {
    if (!newTitle || !newUrl) {
      toast.error('Please fill in both title and URL');
      return;
    }

    setAdding(true);
    try {
      await addLink.mutateAsync({
        title: newTitle,
        url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
        icon: newIcon,
        sort_order: (links?.length || 0) + 1,
        is_enabled: true,
      });
      setNewTitle('');
      setNewUrl('');
      setNewIcon('link');
      toast.success('Link added!');
    } catch (error) {
      toast.error('Failed to add link');
    }
    setAdding(false);
  };

  const handleToggle = async (link: Link) => {
    try {
      await updateLink.mutateAsync({
        id: link.id,
        updates: { is_enabled: !link.is_enabled },
      });
    } catch (error) {
      toast.error('Failed to update link');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink.mutateAsync(id);
      toast.success('Link deleted');
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = ICONS.find(i => i.value === iconName);
    return iconData?.icon || LinkIcon;
  };

  return (
    <div className="space-y-6">
      {/* Add New Link */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Add New Link</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={newIcon} onValueChange={setNewIcon}>
              <SelectTrigger className="input-cyber">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center gap-2">
                      <icon.icon className="w-4 h-4" />
                      {icon.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="My Website"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-cyber"
            />
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="input-cyber"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAddLink} disabled={adding} variant="cyber" className="w-full">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <LinkIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Links</h2>
          <span className="text-sm text-muted-foreground">({links?.length || 0})</span>
        </div>

        {links?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No links yet. Add your first link above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links?.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              
              return (
                <div
                  key={link.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    link.is_enabled 
                      ? 'bg-secondary/30 border-border' 
                      : 'bg-secondary/10 border-border/50 opacity-60'
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{link.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                  </div>

                  <Switch
                    checked={link.is_enabled}
                    onCheckedChange={() => handleToggle(link)}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(link.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
