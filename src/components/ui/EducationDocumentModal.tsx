
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { FileText } from 'lucide-react';

export const EducationDocumentModal = () => {
  const { isOpen, modalType, documentUrl, documentTitle, closeModal } = useModalStore();

  const isModalOpen = isOpen && modalType === 'education-document';

  if (!documentUrl) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl w-full p-6 md:p-8 bg-card/95 backdrop-blur-md border-border/50">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            {documentTitle || 'Document'}
        </h2>
        <div className="rounded-xl overflow-hidden bg-muted aspect-[3/4] max-h-[70vh] flex items-center justify-center">
            {/* 
               In a real app, this might be an iframe to a PDF viewer or a specific document renderer.
               For now, we just show a preview or iframe if it's a displayable URL.
            */}
            {documentUrl.match(/\.(pdf|jpg|jpeg|png|gif)$/i) ? (
                <iframe src={documentUrl} className="w-full h-full" title="Document Preview" />
            ) : (
                <div className="text-center p-4">
                    <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
                    <a 
                        href={documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        Download / Open File
                    </a>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
