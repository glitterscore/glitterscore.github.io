import { useState } from 'react';
import { useProfile, Link } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SMART_LINKS, getSmartLinkConfig, buildUrl } from '@/lib/smartLinks';
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  GripVertical,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export const LinksEditor = () => {
  const { links, addLink, updateLink, deleteLink } = useProfile();
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [inputValue, setInputValue] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const currentConfig = getSmartLinkConfig(selectedPlatform);

  const handleAddLink = async () => {
    if (!inputValue || !currentConfig) {
      toast.error('Please enter a value');
      return;
    }

    setAdding(true);
    try {
      const url = buildUrl(currentConfig, inputValue);
      const title = customTitle || currentConfig.label;
      
      await addLink.mutateAsync({
        title,
        url,
        icon: selectedPlatform,
        sort_order: (links?.length || 0) + 1,
        is_enabled: true,
      });
      
      setInputValue('');
      setCustomTitle('');
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
    const config = SMART_LINKS.find(sl => sl.value === iconName);
    return config?.icon || LinkIcon;
  };

  return (
    <div className="space-y-6">
      {/* Add New Link */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Plus className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Add Smart Link</h2>
        </div>

        <div className="space-y-4">
          {/* Platform Selector */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={selectedPlatform} onValueChange={(val) => {
              setSelectedPlatform(val);
              setInputValue('');
            }}>
              <SelectTrigger className="input-cyber">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-64">
                {SMART_LINKS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center gap-2">
                      <platform.icon className="w-4 h-4" />
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Smart Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {currentConfig?.inputType === 'username' && 'Username'}
              {currentConfig?.inputType === 'id' && 'User ID'}
              {currentConfig?.inputType === 'url' && 'URL'}
              {currentConfig?.inputType === 'email' && 'Email'}
            </Label>
            <div className="relative">
              {currentConfig?.inputType === 'username' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              )}
              <Input
                placeholder={currentConfig?.placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`input-cyber ${currentConfig?.inputType === 'username' ? 'pl-8' : ''}`}
              />
            </div>
            {currentConfig && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                {currentConfig.description}
                {currentConfig.copyAction && (
                  <span className="text-primary ml-1">(Copies to clipboard on click)</span>
                )}
              </p>
            )}
          </div>

          {/* Custom Title (Optional) */}
          <div className="space-y-2">
            <Label>Custom Title (optional)</Label>
            <Input
              placeholder={currentConfig?.label || 'Link title'}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="input-cyber"
            />
          </div>

          {/* Preview */}
          {inputValue && currentConfig && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm font-mono text-primary truncate">
                {currentConfig.copyAction 
                  ? `Copy: ${inputValue}` 
                  : buildUrl(currentConfig, inputValue)
                }
              </p>
            </div>
          )}

          <Button onClick={handleAddLink} disabled={adding} variant="cyber" className="w-full">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Link
          </Button>
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
              const config = getSmartLinkConfig(link.icon);
              
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
                    <p className="text-sm text-muted-foreground truncate">
                      {config?.copyAction ? `ID: ${link.url}` : link.url}
                    </p>
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
