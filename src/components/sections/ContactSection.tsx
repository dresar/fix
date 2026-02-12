import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter, Instagram, Loader2, Facebook, Youtube, Globe, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useMutation } from '@tanstack/react-query';
import { messagesAPI } from '@/services/api';
import { ShinyButton } from '@/components/effects/Buttons';
import { type SocialLink } from '@/types';
import { toast } from 'sonner';

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

export const ContactSection = () => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { socialLinks } = useSocialLinks();
  const normalizedSocialLinks = (socialLinks ?? []) as SocialLink[];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: messagesAPI.create,
    onSuccess: () => {
      toast.success(t('contact.toast.success'));
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error(t('contact.toast.error'));
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({
      senderName: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });
  };

  // Default Medan Map URL if not provided in backend
  const defaultMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254832.505334234!2d98.50467742924397!3d3.642614143767466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303131cc1c3eb2fd%3A0x23d431c8a6908262!2sMedan%2C%20Kota%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sid!2sid!4v1769453045591!5m2!1sid!2sid";
  
  // Extract src from iframe string if user pasted full iframe tag in backend
  const getMapSrc = (input: string | null | undefined) => {
    // If input is undefined or null, fallback to default map
    if (!input) return defaultMapUrl;
    
    // Check if input is a full iframe string
    if (input.includes('<iframe')) {
      const srcMatch = input.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : defaultMapUrl;
    }
    
    // If it's just a URL, use it directly
    return input;
  };

  const mapUrl = getMapSrc((profile as any)?.map_embed_url);
  const isValidMapUrl = mapUrl && (mapUrl.startsWith('http') || mapUrl.startsWith('https'));

  return (
    <section id="contact" className="py-6 md:py-8 relative bg-card/30 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
            {t('nav.contact')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.contact.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="neon-card p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-sm"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Send className="w-6 h-6 text-primary" />
              {t('contact.form.title')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder={t('contact.form.name_placeholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder={t('contact.form.email_placeholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-muted-foreground">
                  {t('contact.form.subject')}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder={t('contact.form.subject_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={t('contact.form.message_placeholder')}
                  required
                />
              </div>

              <ShinyButton variant="primary" className="w-full py-4 rounded-xl text-base font-semibold" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2 inline" />
                )}
                {isSending ? t('contact.form.sending') : t('contact.form.send')}
              </ShinyButton>
            </form>
          </motion.div>

          {/* Right Column: Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Contact Information Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="neon-card p-5 rounded-xl flex items-center gap-4 hover:bg-primary/5 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('contact.info.email')}</p>
                  <a href={`mailto:${profile?.email || ''}`} className="font-medium truncate block hover:text-primary transition-colors" title={profile?.email || ''}>
                    {profile?.email || 'email@example.com'}
                  </a>
                </div>
              </div>

              <div className="neon-card p-5 rounded-xl flex items-center gap-4 hover:bg-primary/5 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('contact.info.phone')}</p>
                  <a href={`tel:${profile?.phone || ''}`} className="font-medium hover:text-primary transition-colors">
                    {profile?.phone || '+62 812 3456 7890'}
                  </a>
                </div>
              </div>
            </div>
            
             <div className="neon-card p-5 rounded-xl flex items-center gap-4 hover:bg-primary/5 transition-colors">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('contact.info.location')}</p>
                  <p className="font-medium">
                    {profile?.location || 'Medan, Indonesia'}
                  </p>
                </div>
              </div>

            {/* Google Maps Embed */}
            <div className="neon-card rounded-2xl overflow-hidden h-[300px] md:h-[320px] relative">
               {isValidMapUrl ? (
                 <iframe 
                  key={mapUrl}
                  src={mapUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    Map unavailable
                 </div>
               )}
            </div>

            {/* Social Links */}
            <div className="neon-card p-6 rounded-2xl">
              <h4 className="text-lg font-bold mb-4">{t('contact.follow_me')}</h4>
              <div className="flex flex-wrap gap-3">
                {normalizedSocialLinks.map((link) => {
                  const platform = link?.platform ? link.platform.toLowerCase() : 'other';
                  const Icon = socialIcons[platform] || socialIcons.other;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-background border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
                      aria-label={link.platform || 'Social Link'}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
