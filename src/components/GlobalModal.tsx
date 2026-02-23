import { EducationGalleryModal } from './ui/EducationGalleryModal';
import { EducationDocumentModal } from './ui/EducationDocumentModal';
import { EducationDetailModal } from './ui/EducationDetailModal';
import { CertificateModal } from './ui/CertificateModal';
import { ExperienceGalleryModal } from './ui/ExperienceGalleryModal';
import { useModalStore } from '@/store/modalStore';

export const GlobalModal = () => {
  const { modalType } = useModalStore();

  return (
    <>
      {modalType === 'education-gallery' && <EducationGalleryModal />}
      {modalType === 'education-document' && <EducationDocumentModal />}
      {modalType === 'education-detail' && <EducationDetailModal />}
      {modalType === 'certificate' && <CertificateModal />}
      {modalType === 'experience-gallery' && <ExperienceGalleryModal />}
    </>
  );
};
