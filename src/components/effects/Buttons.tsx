import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ShinyButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const ShinyButton = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'primary',
  disabled = false
}: ShinyButtonProps) => {
  const baseStyles = "relative overflow-hidden px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:glow-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ['calc(-100%)', 'calc(100%)'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.2), transparent)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

interface BorderBeamButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BorderBeamButton = ({ 
  children, 
  className = '', 
  onClick 
}: BorderBeamButtonProps) => {
  return (
    <motion.button
      className={`relative px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-sm md:text-base bg-card text-foreground overflow-hidden group ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated border */}
      <span className="absolute inset-0 rounded-lg">
        <span 
          className="absolute inset-0 rounded-lg animate-rotate-border"
          style={{
            background: 'conic-gradient(from 0deg, transparent, hsl(174 100% 41%), transparent 30%)',
            padding: '2px',
          }}
        />
      </span>
      <span className="absolute inset-[2px] bg-card rounded-lg" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};
