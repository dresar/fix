import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const navItems = [
  { id: 'home', label: 'nav.home', href: '#home' },
  { id: 'about', label: 'nav.about', href: '#about' },
  { id: 'education', label: 'nav.education', href: '#education' },
  { id: 'skills', label: 'nav.skills', href: '#skills' },
  { id: 'projects', label: 'nav.projects', href: '#projects' },
  { id: 'experience', label: 'nav.experience', href: '#experience' },
  { id: 'certificates', label: 'nav.certificates', href: '#certificates' },
  { id: 'blog', label: 'nav.blog', href: '#blog' },
  { id: 'contact', label: 'nav.contact', href: '#contact' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const { profile } = useProfile();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine Logo Text
  const logoText = settings?.siteName || profile?.fullName?.split(' ')[0] || 'Portfolio';
  const logoFirstLetter = logoText.charAt(0);
  const logoRest = logoText.slice(1);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (location.pathname === '/') {
        // Update active section based on scroll position
        const sections = navItems.map(item => item.href.slice(1));
        for (const section of sections.reverse()) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/');
      // Delay to allow navigation to complete
      setTimeout(() => {
        const element = document.getElementById(href.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            onClick={handleLogoClick}
            className="text-xl md:text-2xl font-heading font-bold"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-primary">{logoFirstLetter}</span>{logoRest}
            <span className="text-primary">.</span>
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full border border-border/40 bg-background/50 backdrop-blur-md shadow-sm">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.href)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
                  activeSection === item.href.slice(1)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(item.label)}
                {activeSection === item.href.slice(1) && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-primary/20"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
            
            <div className="w-px h-6 bg-border mx-2" />

            <div className="flex items-center gap-1 pr-1">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && (theme === 'dark' || resolvedTheme === 'dark') ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && (theme === 'dark' || resolvedTheme === 'dark') ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-heading font-bold">
                  <span className="text-primary">{logoFirstLetter}</span>{logoRest}
                  <span className="text-primary">.</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-4 flex-1 justify-center items-center">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.href)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`text-2xl font-heading font-bold transition-colors ${
                      activeSection === item.href.slice(1)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(item.label)}
                  </motion.button>
                ))}
              </nav>

              <div className="text-center text-sm text-muted-foreground mt-8">
                © {new Date().getFullYear()} {profile?.fullName || 'Eka Syarif Maulana'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};