interface GlowEffectProps {
  enabled?: boolean;
}

export const GlowEffect = ({ enabled = true }: GlowEffectProps) => {
  if (!enabled) return null;

  return (
    <>
      {/* Top left glow */}
      <div 
        className="fixed -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, hsla(173, 80%, 50%, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Bottom right glow */}
      <div 
        className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, hsla(320, 80%, 55%, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Center subtle glow */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, hsla(280, 80%, 55%, 0.05) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />
    </>
  );
};
