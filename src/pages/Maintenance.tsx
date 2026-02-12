import { motion } from 'framer-motion';
import { Hammer, Wrench, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface MaintenanceProps {
  endTime?: string | null;
}

const Maintenance = ({ endTime }: MaintenanceProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        // Refresh page when time is up to trigger backend check
        window.location.reload();
        return 'Checking...';
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-3xl"
      >
        <div className="relative flex justify-center mb-12">
          {/* Animated Icons Container */}
          <div className="relative w-48 h-48">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 border-4 border-dashed border-secondary/30 rounded-full"
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-card p-6 rounded-2xl shadow-2xl border border-border/50"
              >
                <Hammer className="w-16 h-16 text-primary" />
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-secondary/20 p-3 rounded-full backdrop-blur-sm"
            >
              <Wrench className="w-6 h-6 text-secondary" />
            </motion.div>
            
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-primary/20 p-3 rounded-full backdrop-blur-sm"
            >
              <Clock className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
        </div>

        <div className="text-center space-y-6 backdrop-blur-sm bg-background/50 p-8 rounded-3xl border border-border/50 shadow-xl">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-gradient-x">
            Under Maintenance
          </h1>
          
          <div className="max-w-xl mx-auto space-y-4">
            <p className="text-xl md:text-2xl font-medium text-foreground/80">
              Kami sedang merenovasi dapur digital kami! 🍳
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Website ini sedang menjalani perawatan rutin untuk performa yang lebih baik.
              Jangan khawatir, kami akan kembali sebelum kopi Anda dingin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span>
                {timeLeft ? `Kembali dalam: ${timeLeft}` : "Est. Time: Segera kembali"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
