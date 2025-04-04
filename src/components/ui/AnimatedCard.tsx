
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  withGlow?: boolean;
  withHover?: boolean;
  withBorder?: boolean;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  withGlow = false,
  withHover = false,
  withBorder = false,
  delay = 0,
}) => {
  const baseClasses = cn(
    'rounded-xl p-6 transition-all duration-300',
    'bg-gradient-to-br from-midnight-900 to-midnight-950',
    'animate-fade-in',
    withGlow && 'hover:shadow-glow',
    withHover && 'hover:scale-[1.02] hover:-translate-y-1',
    withBorder && 'border border-white/10',
    className
  );

  const style = {
    animationDelay: `${delay}ms`,
  };

  return (
    <div className={baseClasses} style={style}>
      {children}
    </div>
  );
};

export { AnimatedCard };
