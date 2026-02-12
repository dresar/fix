import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecryptedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

export const DecryptedText = ({ text, className = '', delay = 0 }: DecryptedTextProps) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => getRandomChar()));
  const [isDecrypted, setIsDecrypted] = useState(false);

  function getRandomChar() {
    return characters[Math.floor(Math.random() * characters.length)];
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      let iterations = 0;
      const interval = setInterval(() => {
        setDisplayText(
          text.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterations) return char;
            return getRandomChar();
          })
        );

        if (iterations >= text.length) {
          clearInterval(interval);
          setIsDecrypted(true);
        }
        iterations += 1;
      }, 50);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <motion.span
      className={`inline-block font-mono ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      {displayText.map((char, index) => (
        <motion.span
          key={index}
          className={isDecrypted ? 'text-primary' : 'text-muted-foreground'}
          animate={{
            color: isDecrypted ? 'hsl(174 100% 41%)' : 'hsl(0 0% 40%)',
          }}
          transition={{ duration: 0.3 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

interface SplitTextProps {
  texts: string[];
  className?: string;
  interval?: number;
}

export const SplitText = ({ texts, className = '', interval = 3000 }: SplitTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  return (
    <div className={`relative h-12 md:h-16 overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          className="absolute inset-0 flex items-center text-primary"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {texts[currentIndex].split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
