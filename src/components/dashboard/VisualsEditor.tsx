import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  Image, 
  Video, 
  Music,
  Snowflake,
  Sparkles,
  Zap,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export const VisualsEditor = () => {
  const { visualSettings, updateVisualSettings } = useProfile();
  const [backgroundType, setBackgroundType] = useState<'gradient' | 'image' | 'video'>('gradient');
  const [backgroundValue, setBackgroundValue] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioAutoplay, setAudioAutoplay] = useState(false);
  const [audioLoop, setAudioLoop] = useState(true);
  const [effectSnowfall, setEffectSnowfall] = useState(false);
  const [effectParticles, setEffectParticles] = useState(false);
  const [effectGlow, setEffectGlow] = useState(true);
  const [effectGlitch, setEffectGlitch] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visualSettings) {
      setBackgroundType(visualSettings.background_type as 'gradient' | 'image' | 'video');
      setBackgroundValue(visualSettings.background_value || '');
      setAudioUrl(visualSettings.background_audio_url || '');
      setAudioAutoplay(visualSettings.audio_autoplay);
      setAudioLoop(visualSettings.audio_loop);
      setEffectSnowfall(visualSettings.effect_snowfall);
      setEffectParticles(visualSettings.effect_particles);
      setEffectGlow(visualSettings.effect_glow);
      setEffectGlitch(visualSettings.effect_glitch);
    }
  }, [visualSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVisualSettings.mutateAsync({
        background_type: backgroundType,
        background_value: backgroundValue || null,
        background_audio_url: audioUrl || null,
        audio_autoplay: audioAutoplay,
        audio_loop: audioLoop,
        effect_snowfall: effectSnowfall,
        effect_particles: effectParticles,
        effect_glow: effectGlow,
        effect_glitch: effectGlitch,
      });
      toast.success('Visual settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Background Settings */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Background</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Background Type</Label>
            <Select value={backgroundType} onValueChange={(v: 'gradient' | 'image' | 'video') => setBackgroundType(v)}>
              <SelectTrigger className="input-cyber w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="gradient">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Default Gradient
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Custom Image
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video Background
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {backgroundType !== 'gradient' && (
            <div className="space-y-2">
              <Label>{backgroundType === 'image' ? 'Image URL' : 'Video URL'}</Label>
              <Input
                placeholder={`https://example.com/background.${backgroundType === 'image' ? 'jpg' : 'mp4'}`}
                value={backgroundValue}
                onChange={(e) => setBackgroundValue(e.target.value)}
                className="input-cyber"
              />
              <p className="text-xs text-muted-foreground">
                {backgroundType === 'image' 
                  ? 'Use a high-quality image (recommended: 1920x1080 or higher)'
                  : 'Use a looping video for best results (MP4 recommended)'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Audio Settings */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Background Audio</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Audio URL</Label>
            <Input
              placeholder="https://example.com/music.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="input-cyber"
            />
            <p className="text-xs text-muted-foreground">
              Add ambient music or sound to your profile
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <Switch
                id="autoplay"
                checked={audioAutoplay}
                onCheckedChange={setAudioAutoplay}
              />
              <Label htmlFor="autoplay" className="cursor-pointer">Autoplay</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="loop"
                checked={audioLoop}
                onCheckedChange={setAudioLoop}
              />
              <Label htmlFor="loop" className="cursor-pointer">Loop</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Effects */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Visual Effects</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-3">
              <Snowflake className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Snowfall</p>
                <p className="text-xs text-muted-foreground">Falling snow particles</p>
              </div>
            </div>
            <Switch
              checked={effectSnowfall}
              onCheckedChange={setEffectSnowfall}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Particles</p>
                <p className="text-xs text-muted-foreground">Connected particle network</p>
              </div>
            </div>
            <Switch
              checked={effectParticles}
              onCheckedChange={setEffectParticles}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Glow</p>
                <p className="text-xs text-muted-foreground">Ambient neon glow</p>
              </div>
            </div>
            <Switch
              checked={effectGlow}
              onCheckedChange={setEffectGlow}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-primary font-mono text-xs">GL</div>
              <div>
                <p className="font-medium">Glitch</p>
                <p className="text-xs text-muted-foreground">Glitch effect on avatar</p>
              </div>
            </div>
            <Switch
              checked={effectGlitch}
              onCheckedChange={setEffectGlitch}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} variant="cyber">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Visual Settings
          </>
        )}
      </Button>
    </div>
  );
};
