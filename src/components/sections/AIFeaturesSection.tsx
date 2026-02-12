import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Edit, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AIFeaturesSection = () => {
  const features = [
    {
      icon: <Edit className="w-8 h-8 text-primary" />,
      title: "AI Writing Assistant",
      description: "Membantu menulis, menyunting, dan menghasilkan ide konten blog berkualitas tinggi secara otomatis."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      title: "Smart Inbox",
      description: "Analisis pesan masuk cerdas dengan ringkasan otomatis, deteksi sentimen, dan kategorisasi."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Global AI Copilot",
      description: "Asisten cerdas terintegrasi untuk membantu manajemen admin dan menjawab pertanyaan teknis."
    },
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: "SEO Optimizer",
      description: "Optimasi konten otomatis untuk meningkatkan peringkat pencarian dan visibilitas blog."
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-background/50 relative overflow-hidden" id="ai-features">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dilengkapi dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Kecerdasan Buatan</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Platform ini tidak hanya sekedar blog, tetapi didukung oleh teknologi AI mutakhir untuk meningkatkan produktivitas, kualitas konten, dan pengalaman pengguna.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 group bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
