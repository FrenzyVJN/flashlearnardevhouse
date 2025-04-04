
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'electric';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  withRing?: boolean;
  withGlow?: boolean;
  className?: string;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = 'default', size = 'default', withRing = false, withGlow = false, children, ...props }, ref) => {
    const buttonStyles = cn(
      'group relative overflow-hidden transition-all duration-300 ease-out',
      withRing && 'ring-2 ring-electric-500/50 hover:ring-electric-500/80',
      withGlow && 'hover:shadow-glow',
      variant === 'electric' && 'bg-electric-600 text-white hover:bg-electric-700',
      className
    );

    return (
      <Button
        ref={ref}
        variant={variant === 'electric' ? 'default' : variant}
        size={size}
        className={buttonStyles}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute inset-0 translate-y-[100%] bg-gradient-to-br from-electric-500 to-electric-700 transition-transform duration-300 ease-out group-hover:translate-y-0" />
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton };
