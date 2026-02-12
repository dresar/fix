import { motion } from 'framer-motion';
import { Download, ArrowRight, Link as LinkIcon, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Mail, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ParticlesBackground } from '@/components/effects/ParticlesBackground';
import { TypewriterText } from '@/components/effects/TypewriterText';
import { ShinyButton, BorderBeamButton } from '@/components/effects/Buttons';
import { useProfile } from '@/hooks/useProfile';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { normalizeMediaUrl } from '@/lib/utils';
import { useExperience } from '@/hooks/useExperience';
import { CheckCircle, Briefcase } from 'lucide-react';

const socialIcons: Record<string, any> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
  website: Globe,
  other: LinkIcon,
};

export const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const { profile, isLoading: profileLoading } = useProfile();
  const { socialLinks = [], isLoading: linksLoading } = useSocialLinks();
  const { projects = [] } = useProjects();
  const { experiences = [] } = useExperience();

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (profileLoading || linksLoading) {
    // Show a skeleton or loading state that isn't black screen
    return (
        <section id="home" className="relative min-h-[80vh] flex items-center overflow-hidden pt-16">
            <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                <p className="text-muted-foreground mt-4 text-sm animate-pulse">Memuat Profil...</p>
            </div>
        </section>
    );
  }

  // Determine localized content
  const currentLang = i18n.language === 'en' ? 'en' : 'id';
  
  // Use HomeContent if available, otherwise fallback to Profile or defaults
  const greeting = profile?.greeting;
  const shortBio = profile?.shortBio || t('hero.description_default');

  // Parse roles
  let roles: string[] = ['Developer', 'Designer'];
  const rolesSource = profile?.role;

  try {
    if (rolesSource) {
      if (Array.isArray(rolesSource)) {
        roles = rolesSource;
      } else if (typeof rolesSource === 'string' && rolesSource.startsWith('[')) {
        roles = JSON.parse(rolesSource);
      } else {
        roles = [rolesSource as string];
      }
    }
  } catch (e) {
    console.error('Failed to parse roles', e);
    roles = ['Developer'];
  }
  
  // Hero Image logic
  const heroImageRaw = profile?.heroImageFile || profile?.heroImage;
  const heroImage = normalizeMediaUrl(heroImageRaw);

  // Calculate years of experience
  const startYear = experiences.length > 0 
    ? Math.min(...experiences.map((exp: any) => new Date(exp.startDate).getFullYear()))
    : new Date().getFullYear();
    
  // Helper to safely parse stats
  const parseStat = (val: string | null | undefined) => {
    if (!val) return 0;
    // Extract first number found
    const match = String(val).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const manualYearsExp = parseStat(profile?.stats_exp_years);
  const calculatedYearsExp = new Date().getFullYear() - startYear;
  const yearsExperience = manualYearsExp > 0 ? manualYearsExp : calculatedYearsExp;

  const manualProjectCount = parseStat(profile?.stats_project_count);
  const projectCount = manualProjectCount > 0 ? manualProjectCount : projects.length;

  return (
    <section id="home" className="relative min-h-[80vh] flex items-center overflow-hidden pt-16">
      <ParticlesBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            className="order-2 lg:order-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Greeting */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-4 flex items-center justify-center lg:justify-start gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {greeting || t('hero.greeting')} <span className="text-2xl">👋</span>
            </motion.p>

            {/* Name with Gradient */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_100%]">
                {profile?.fullName || "Eka Syarif Maulana"}
              </span>
            </motion.h1>

            {/* Role with Typewriter Effect */}
            <motion.div
              className="text-xl md:text-2xl lg:text-3xl font-heading font-medium text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TypewriterText 
                texts={roles.length > 0 ? roles : [t('hero.role_default')]} 
              />
            </motion.div>

            {/* Description */}
            <motion.div
              className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 prose prose-invert"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              dangerouslySetInnerHTML={{ __html: shortBio }}
            />

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {(profile?.resumeFile || profile?.resumeUrl) && (
                <a href={profile.resumeFile || profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <ShinyButton variant="primary">
                    <Download className="w-4 h-4 mr-2 inline" />
                    {t('hero.download_resume')}
                  </ShinyButton>
                </a>
              )}
              <BorderBeamButton onClick={scrollToProjects}>
                {t('hero.view_work')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </BorderBeamButton>
            </motion.div>

            {/* Social Icons */}
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {socialLinks.map((social: any, index: number) => {
                const Icon = socialIcons[social.icon] || LinkIcon;
                return (
                  <motion.a
                    key={social.id}
                    href={social.icon === 'email' ? `mailto:${social.url}` : social.url}
                    target={social.icon === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    aria-label={social.platform}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Side - Image with Floating Badges */}
          <motion.div
            className="order-1 lg:order-2 relative flex items-center justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glow Effect Behind Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Border Beam Animation */}
            <motion.div
              className="absolute w-72 h-72 md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] rounded-3xl"
              style={{
                background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent 30%)',
                padding: '3px',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-3xl bg-background" />
            </motion.div>

            {/* Main Image */}
            <motion.div
              className="relative w-64 h-80 md:w-80 md:h-[400px] lg:w-96 lg:h-[480px] rounded-3xl overflow-hidden border-2 border-border/50 z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={profile?.fullName || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-card text-muted-foreground">
                  <div className="text-center">
                    <span className="text-6xl font-bold opacity-20">
                      {profile?.fullName?.substring(0, 2).toUpperCase() || "??"}
                    </span>
                  </div>
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </motion.div>

            {/* Floating Badge - Top Right */}
            <motion.div
              className="absolute -top-4 -right-4 md:top-4 md:right-0 lg:-right-8 glass-strong px-4 py-3 rounded-2xl z-20"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {projectCount}+
                  </p>
                  <p className="text-xs text-muted-foreground">{t('hero.projects_completed')}</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Badge - Bottom Left */}
            <motion.div
              className="absolute -bottom-4 -left-4 md:bottom-8 md:left-0 lg:-left-8 glass-strong px-4 py-3 rounded-2xl z-20"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {yearsExperience}+
                  </p>
                  <p className="text-xs text-muted-foreground">{t('hero.years_experience')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
