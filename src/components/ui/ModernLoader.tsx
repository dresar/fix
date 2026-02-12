import { motion } from 'framer-motion';

interface ModernLoaderProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ModernLoader = ({ text = "Loading", className = "", size = "md" }: ModernLoaderProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-4 border-primary/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Spinning Segment */}
        <motion.span
          className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner Pulsing Dot */}
        <motion.div
          className="absolute inset-0 m-auto w-4 h-4 bg-primary rounded-full"
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        className="text-sm font-medium text-muted-foreground tracking-widest uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
};
