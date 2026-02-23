import { create } from 'zustand';
import type { Project, Education, Certificate } from '@/types';

export type ModalType = 'education-gallery' | 'education-document' | 'education-detail' | 'certificate' | 'experience-gallery' | null;

interface ModalState {
  isOpen: boolean;
  modalType: ModalType;
  educationData: Education | null;
  experienceData: any | null;
  documentUrl: string | null;
  documentTitle: string | null;
  certificateData: Certificate | null;
  
  openEducationGalleryModal: (education: Education) => void;
  openEducationDocumentModal: (url: string, title: string) => void;
  openEducationDetailModal: (education: Education) => void;
  openCertificateModal: (certificate: Certificate) => void;
  openExperienceGalleryModal: (experience: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  educationData: null,
  experienceData: null,
  documentUrl: null,
  documentTitle: null,
  certificateData: null,

  openEducationGalleryModal: (education) => set({
    isOpen: true,
    modalType: 'education-gallery',
    educationData: education,
  }),

  openEducationDocumentModal: (url, title) => set({
    isOpen: true,
    modalType: 'education-document',
    documentUrl: url,
    documentTitle: title,
  }),

  openEducationDetailModal: (education) => set({
    isOpen: true,
    modalType: 'education-detail',
    educationData: education,
  }),

  openCertificateModal: (certificate) => set({
    isOpen: true,
    modalType: 'certificate',
    certificateData: certificate,
  }),

  openExperienceGalleryModal: (experience) => set({
    isOpen: true,
    modalType: 'experience-gallery',
    experienceData: experience,
  }),

  closeModal: () => set({
    isOpen: false,
    modalType: null,
    educationData: null,
    experienceData: null,
    documentUrl: null,
    documentTitle: null,
    certificateData: null,
  }),
}));
