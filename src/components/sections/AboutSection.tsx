import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useExperience } from '@/hooks/useExperience';
import { useProjects } from '@/hooks/useProjects';
import { useCertificates } from '@/hooks/useCertificates';
import { useSkills } from '@/hooks/useSkills';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Mail, Globe, Link as LinkIcon } from 'lucide-react';
import { normalizeMediaUrl } from '@/lib/utils';

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

export const AboutSection = () => {
  const { t, i18n } = useTranslation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { profile } = useProfile();
  const { experiences = [], isLoading } = useExperience();
  const { projects = [] } = useProjects();
  const { certificates = [] } = useCertificates();
  const { skills = [] } = useSkills();
  
  // Use backend counts if available (injected by ProfileViewSet), otherwise fallback to array length
  // Use a safer fallback that checks if arrays are loaded
  const safeCertCount = certificates ? certificates.length : 0;
  const safeSkillCount = skills ? skills.length : 0;

  const certificateCount = (profile as any)?.total_certificates !== undefined 
    ? (profile as any).total_certificates 
    : safeCertCount;
    
  const skillCount = (profile as any)?.total_skills !== undefined 
    ? (profile as any).total_skills 
    : safeSkillCount;
  const { socialLinks = [] } = useSocialLinks();

  // Determine localized content
  const currentLang = i18n.language === 'en' ? 'en' : 'id';
  
  // Use bio for detailed about section, greeting is used in hero
  const shortDesc = ""; // Removed to avoid duplication or use a specific "about me" title if needed
    
  const longDesc = profile?.bio;

  // About Image logic
  const rawAboutImage = profile?.aboutImageFile || profile?.aboutImage;
  const aboutImage = normalizeMediaUrl(rawAboutImage);

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

  // Use manual stats if available, otherwise fallback to calculated
  const manualYearsExp = parseStat(profile?.stats_exp_years);
  const calculatedYearsExp = new Date().getFullYear() - startYear;
  const yearsExperience = manualYearsExp > 0 ? manualYearsExp : calculatedYearsExp;

  const manualProjectCount = parseStat(profile?.stats_project_count);
  const projectCount = manualProjectCount > 0 ? manualProjectCount : projects.length;

  const stats = [
    { id: 1, label: t('hero.years_experience'), value: yearsExperience, suffix: "+" },
    { id: 2, label: t('hero.projects_completed'), value: projectCount, suffix: "+" },
    { id: 3, label: t('nav.certificates'), value: certificates.length, suffix: "" },
    { id: 4, label: t('nav.skills'), value: skills.length, suffix: "+" },
  ];

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about" className="py-6 md:py-8 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-square max-w-sm mx-auto">
              {/* Main Image Container */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden glass">
                {/* Filter removed as requested */}
                {aboutImage ? (
                   <img 
                    src={aboutImage} 
                    alt="About Profile" 
                    className="w-full h-full object-cover"
                   />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary">
                          {profile?.fullName?.substring(0, 2).toUpperCase() || "ME"}
                        </span>
                      </div>
                      <p className="text-sm">Profile Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Stats - Certifications (Replaces Experience) */}
              <motion.div 
                className="absolute -left-4 top-10 p-4 rounded-xl glass border border-white/10 shadow-lg z-20"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  opacity: { delay: 0.3, duration: 0.5 },
                  x: { delay: 0.3, duration: 0.5 },
                  y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {inView ? <CountUp end={certificateCount} duration={2.5} /> : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('nav.certificates') || "Sertifikasi"}</p>
                </div>
              </motion.div>

              {/* Floating Stats - Skills (Replaces Projects) */}
              <motion.div 
                className="absolute -right-4 bottom-10 p-4 rounded-xl glass border border-white/10 shadow-lg z-20"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                animate={{ y: [0, 10, 0] }}
                transition={{ 
                  opacity: { delay: 0.5, duration: 0.5 },
                  x: { delay: 0.5, duration: 0.5 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {inView ? <CountUp end={skillCount} duration={2.5} /> : 0}+
                  </p>
                  <p className="text-xs text-muted-foreground">{t('nav.skills') || "Keahlian"}</p>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-primary/30 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-2xl blur-2xl -z-10" />
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
                {t('nav.about')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
                {t('sections.about.title')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('sections.about.subtitle')}
              </p>
            </div>
            
            {/* Removed shortDesc rendering to rely solely on bio for rich text content in About section */}
            <div 
              className="text-muted-foreground text-base mb-6 leading-relaxed prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: longDesc || '' }}
            />

            {/* Social Icons */}
            <div className="flex gap-4 mb-8">
              {socialLinks.map((link: any) => {
                const platform = link?.platform ? link.platform.toLowerCase() : 'other';
                const Icon = socialIcons[platform] || LinkIcon;
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>

            {/* Stats */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
