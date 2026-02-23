
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { Award, ExternalLink } from 'lucide-react';
import { normalizeMediaUrl } from '@/lib/utils';

export const CertificateModal = () => {
  const { isOpen, modalType, certificateData, closeModal } = useModalStore();

  const isModalOpen = isOpen && modalType === 'certificate';

  if (!certificateData) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl w-full p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/50">
        <div className="p-6 md:p-8">
            {/* Certificate Image */}
            {certificateData.image && (
                <div className="relative mb-6 rounded-xl overflow-hidden bg-muted aspect-video">
                <img 
                    src={normalizeMediaUrl(certificateData.image)} 
                    alt={certificateData.title} 
                    className="w-full h-full object-contain"
                />
                </div>
            )}

            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">{certificateData.title}</h2>
                <p className="text-muted-foreground">{certificateData.issuer}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="px-4 py-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Issue Date: </span>
                <span className="font-medium">{new Date(certificateData.issueDate).toLocaleDateString()}</span>
                </div>
                {certificateData.credentialId && (
                <div className="px-4 py-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Credential ID: </span>
                    <span className="font-medium">{certificateData.credentialId}</span>
                </div>
                )}
            </div>

            {certificateData.credentialUrl && (
                <a
                href={certificateData.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                <ExternalLink className="w-4 h-4" />
                Verify Certificate
                </a>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
