import { motion } from 'framer-motion';

interface AdminPreloaderProps {
  progress: number;
}

export const AdminPreloader = ({ progress }: AdminPreloaderProps) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          className="w-32 h-32 rounded-full border-t-4 border-primary border-opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner Ring */}
        <motion.div
          className="absolute top-2 left-2 w-28 h-28 rounded-full border-b-4 border-primary"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-2xl font-bold font-mono text-primary">{progress}%</span>
        </div>
      </div>
      
      {/* Loading Text */}
      <motion.p
        className="mt-8 text-primary font-mono text-sm tracking-widest"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        PREPARING DASHBOARD...
      </motion.p>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-muted mt-4 rounded-full overflow-hidden">
        <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
        />
      </div>
    </div>
  );
};
