import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useQuery } from '@tanstack/react-query';
import { waTemplatesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MessageCircle, Send, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WATemplate {
  id: number;
  template_name: string;
  template_content: string;
  category: string;
  is_active: boolean;
}

export const FloatingWhatsApp = ({ forceOpen = false, onClose }: { forceOpen?: boolean; onClose?: () => void }) => {
  const { t } = useTranslation();
  const { socialLinks = [] } = useSocialLinks();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [openCombobox, setOpenCombobox] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Find WhatsApp link
  const whatsappLink = Array.isArray(socialLinks) ? socialLinks.find((link: any) => 
    (link?.platform || '').toLowerCase() === 'whatsapp' || 
    (link?.url && (link.url.includes('wa.me') || link.url.includes('whatsapp.com')))
  ) : null;

  const { data: templates = [] } = useQuery({
    queryKey: ['waTemplates', 'public'],
    queryFn: async () => {
      try {
        const res = await waTemplatesAPI.getAll();
        return (res || []).filter((t: WATemplate) => t.is_active);
      } catch (error) {
        console.error('Failed to fetch WA templates', error);
        return [];
      }
    },
    enabled: isOpen, // Only fetch when modal is open
  });

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const template = templates.find((t: WATemplate) => t.id.toString() === value);
    if (template) {
      setMessage(template.template_content);
    }
  };

  const handleSend = () => {
    // Fallback URL if no specific WhatsApp link is configured
    // This allows the feature to work (generic wa.me) or prompts user
    let url = whatsappLink?.url || 'https://wa.me/';
    
    if (!whatsappLink && !url.includes('wa.me/') && !url.includes('whatsapp.com')) {
       alert(t('whatsapp.no_number_configured'));
       return;
    }
    
    if (message) {
      const separator = (url || '').includes('?') ? '&' : '?';
      url = `${url}${separator}text=${encodeURIComponent(message)}`;
    }
    
    window.open(url, '_blank');
    handleClose();
    setMessage('');
    setSelectedTemplate('');
  };

  // Always show the button, even if no link is configured (for visibility)
  // if (!whatsappLink) return null; 

  return (
    <>
      {!forceOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Chat on WhatsApp"
        >
          {/* Pulse Animation Ring */}
          <motion.span
            className="absolute inset-0 rounded-full bg-[#25D366]"
            animate={{
              scale: [1, 1.4, 1.4],
              opacity: [0.7, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.span
            className="absolute inset-0 rounded-full bg-[#25D366]"
            animate={{
              scale: [1, 1.4, 1.4],
              opacity: [0.7, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5,
            }}
          />
          
          {/* WhatsApp Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="white"
            className="w-7 h-7 relative z-10"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.button>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open ? handleClose() : setIsOpen(open)}>
        <DialogContent className="sm:max-w-[425px] w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              {t('whatsapp.title')}
            </DialogTitle>
            <DialogDescription>
              {t('whatsapp.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label>{t('whatsapp.select_template')}</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                    >
                      {selectedTemplate
                        ? templates.find((t: WATemplate) => t.id.toString() === selectedTemplate)?.template_name
                        : t('whatsapp.select_topic')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder={t('whatsapp.search_template')} />
                      <CommandList>
                        <CommandEmpty>{t('whatsapp.template_not_found')}</CommandEmpty>
                        <CommandGroup>
                          {templates.map((template: WATemplate) => (
                            <CommandItem
                              key={template.id}
                              value={template.template_name}
                              onSelect={() => {
                                handleTemplateChange(template.id.toString());
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTemplate === template.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {template.template_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>{t('whatsapp.message_label')}</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('whatsapp.message_placeholder')}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSend} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
              <Send className="w-4 h-4 mr-2" />
              {t('whatsapp.send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
