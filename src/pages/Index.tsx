import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { CertificatesSection } from '@/components/sections/CertificatesSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { GlobalModal } from '@/components/GlobalModal';
import { BlobCursor } from '@/components/effects/BlobCursor';
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';
import { Preloader } from '@/components/ui/Preloader';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const { isLoading } = useProfile();

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Custom Cursor - Hidden on mobile */}
      <div className="hidden lg:block">
        <BlobCursor />
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <CertificatesSection />
        <BlogSection />
        <ContactSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Global Modal System */}
      <GlobalModal />
      
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
};

export default Index;
