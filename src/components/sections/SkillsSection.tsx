import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSkills } from '@/hooks/useSkills';
import { skillCategoriesAPI } from '@/services/api';
import { TiltedCard } from '@/components/effects/Cards';
import { Code2, Palette, Users, Globe, Loader2, Database, Cloud } from 'lucide-react';

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
}

const getIconForCategory = (slug: string) => {
  if (!slug) return Code2;
  const s = String(slug).toLowerCase();
  if (s.includes('front') || s.includes('back') || s.includes('dev')) return Code2;
  if (s.includes('design') || s.includes('ui') || s.includes('ux')) return Palette;
  if (s.includes('soft')) return Users;
  if (s.includes('lang')) return Globe;
  if (s.includes('data')) return Database;
  if (s.includes('cloud') || s.includes('ops')) return Cloud;
  return Code2;
};

export const SkillsSection = () => {
  const { t } = useTranslation();
  const { skills = [], isLoading: isSkillsLoading } = useSkills();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: async () => {
      const data = await skillCategoriesAPI.getAll();
      return data;
    }
  });

  const [activeTab, setActiveTab] = useState<number | null>(null);

  // Set initial active tab when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && activeTab === null) {
      setActiveTab(categories[0].id);
    }
  }, [categories, activeTab]);

  const filteredSkills = useMemo(() => {
    if (!activeTab) return [];
    
    // Find the current category object based on activeTab ID
    const currentCategory = categories.find((c: any) => c.id === activeTab);
    if (!currentCategory) return [];

    return skills.filter((skill: any) => {
       // Case 1: skill.category is an object with ID
       if (typeof skill.category === 'object' && skill.category !== null) {
          return skill.category.id === activeTab || skill.category.name === currentCategory.name;
       }
       
       // Case 2: skill.category is a string (name) - This matches what we saw in SkillList.tsx
       if (typeof skill.category === 'string') {
          return (skill.category || '').toLowerCase() === (currentCategory.name || '').toLowerCase();
       }
       
       // Case 3: skill.category is just the ID (number)
       return skill.category === activeTab;
    });
  }, [skills, activeTab, categories]);

  if (isSkillsLoading || isCategoriesLoading) {
    return (
      <section id="skills" className="py-6 md:py-12 relative bg-card/30 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="skills" className="py-6 md:py-8 relative bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
            {t('nav.skills')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.skills.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.skills.subtitle')}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((category) => {
            const Icon = getIconForCategory(category.slug);
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </motion.button>
            );
          })}
        </div>

        {/* Skills Grid */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill, index) => (
              <TiltedCard key={skill.id}>
                <div className="p-4 rounded-xl bg-card border border-border h-full hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center text-center gap-2 mb-3">
                    <h4 className="font-semibold text-base">{skill.name}</h4>
                    <span className="text-primary font-bold text-sm">{skill.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-[hsl(180,80%,50%)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: inView ? `${skill.percentage}%` : 0 }}
                      transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </TiltedCard>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t('skills.no_skills')}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
