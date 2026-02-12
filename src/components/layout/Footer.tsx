import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const { profile } = useProfile();
  const { settings } = useSettings();

  const logoText = settings?.siteName || profile?.fullName?.split(' ')[0] || 'Portfolio';
  const logoFirstLetter = logoText.charAt(0);
  const logoRest = logoText.slice(1);

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <motion.a
            href="#home"
            className="text-xl font-heading font-bold"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-primary">{logoFirstLetter}</span>{logoRest}
            <span className="text-primary">.</span>
          </motion.a>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} {profile?.fullName}. {t('footer.made_with')}{' '}
            <Heart className="w-4 h-4 inline text-destructive mx-1" fill="currentColor" />
            {t('footer.in_indonesia')}
          </p>
        </div>
      </div>
    </footer>
  );
};
