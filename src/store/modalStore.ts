import { create } from 'zustand';
import type { Project, Education, Certificate } from '@/types';

export type ModalType = 'project' | 'education-gallery' | 'education-document' | 'certificate' | 'experience-gallery' | null;

interface ModalState {
  isOpen: boolean;
  modalType: ModalType;
  projectData: Project | null;
  educationData: Education | null;
  experienceData: any | null;
  documentUrl: string | null;
  documentTitle: string | null;
  certificateData: Certificate | null;
  
  openProjectModal: (project: Project) => void;
  openEducationGalleryModal: (education: Education) => void;
  openEducationDocumentModal: (url: string, title: string) => void;
  openCertificateModal: (certificate: Certificate) => void;
  openExperienceGalleryModal: (experience: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  projectData: null,
  educationData: null,
  experienceData: null,
  documentUrl: null,
  documentTitle: null,
  certificateData: null,

  openProjectModal: (project) => set({
    isOpen: true,
    modalType: 'project',
    projectData: project,
  }),

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
    projectData: null,
    educationData: null,
    experienceData: null,
    documentUrl: null,
    documentTitle: null,
    certificateData: null,
  }),
}));
