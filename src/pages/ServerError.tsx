import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

const ServerError = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 text-center max-w-lg mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative"
        >
          <div className="text-[10rem] font-black leading-none text-destructive/10 select-none">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl"
            >
              😵
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold tracking-tight">Internal Server Error</h1>
          <p className="text-muted-foreground">
            Waduh! Ada sesuatu yang salah di server kami. 
            Tim teknis kami (mungkin seekor kucing) sedang mencoba memperbaikinya.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Coba Refresh
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Ke Beranda
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServerError;
