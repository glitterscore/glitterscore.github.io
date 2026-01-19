import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { GlowEffect } from '@/components/effects/GlowEffect';
import { Lock, Sparkles, Users, Zap, ArrowRight, Shield, Palette } from 'lucide-react';

const Landing = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Lock,
      title: 'Invite Only',
      description: 'Exclusive access for creators who earn their spot.',
    },
    {
      icon: Palette,
      title: 'Deep Customization',
      description: 'Backgrounds, effects, audio — make it truly yours.',
    },
    {
      icon: Sparkles,
      title: 'Premium Badges',
      description: 'Stand out with exclusive collectible badges.',
    },
    {
      icon: Shield,
      title: 'Underground Vibe',
      description: 'Built for creators who move different.',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground enabled count={30} />
      <GlowEffect enabled />
      
      {/* Cyber grid overlay */}
      <div className="fixed inset-0 bg-cyber-grid bg-cyber-grid opacity-30 pointer-events-none" />
      
      {/* Scanlines */}
      <div className="fixed inset-0 scanlines pointer-events-none opacity-50" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">VOID.LINK</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="neon" size="sm">
              Get Access
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="fade-in mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            Invite-only access
          </span>
        </div>

        <h1 className="fade-in text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-4xl" style={{ animationDelay: '0.1s' }}>
          Your links.
          <br />
          <span className="text-primary neon-text">Your rules.</span>
        </h1>

        <p className="fade-in text-lg md:text-xl text-muted-foreground max-w-2xl mb-10" style={{ animationDelay: '0.2s' }}>
          The most exclusive link-in-bio platform for creators who refuse to blend in. 
          Custom effects, premium badges, and an underground community.
        </p>

        <div className="fade-in flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.3s' }}>
          <Link to="/register">
            <Button variant="cyber" size="xl" className="group">
              Request Access
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button variant="outline" size="xl">
              View Demo Profile
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="fade-in grid grid-cols-3 gap-8 md:gap-16 mt-20" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary neon-text">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent neon-text-pink">50K+</div>
            <div className="text-sm text-muted-foreground mt-1">Profile Views</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary neon-text">99%</div>
            <div className="text-sm text-muted-foreground mt-1">Uptime</div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Built for the <span className="text-primary">underground</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-hover p-6 rounded-xl cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredFeature === index ? 'translateY(-8px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className={`w-6 h-6 ${hoveredFeature === index ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
            <div className="relative z-10">
              <Users className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to join the elite?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Get your invite code and start building your presence. 
                Premium badges available exclusively through Discord.
              </p>
              <Link to="/register">
                <Button variant="neon" size="xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">© 2024 VOID.LINK</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
