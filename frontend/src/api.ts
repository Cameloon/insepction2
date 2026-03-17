import axios from 'axios';
import { Inspection, InspectionStep, Checklist, ChecklistStep } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Inspections
export const getInspections = () => api.get<Inspection[]>('/api/inspections').then(r => r.data);
export const createInspection = (data: Omit<Inspection, 'id'>) => api.post<Inspection>('/api/inspections', data).then(r => r.data);
export const updateInspection = (id: number, data: Partial<Inspection>) => api.put<Inspection>(`/api/inspections/${id}`, data).then(r => r.data);

// Inspection Steps
export const addInspectionStep = (inspectionId: number, step: Omit<InspectionStep, 'id'>) =>
  api.post<Inspection>(`/api/inspections/${inspectionId}/steps`, step).then(r => r.data);
export const updateInspectionStep = (inspectionId: number, stepId: number, step: Partial<InspectionStep>) =>
  api.put<Inspection>(`/api/inspections/${inspectionId}/steps/${stepId}`, step).then(r => r.data);
export const deleteInspectionStep = (inspectionId: number, stepId: number) =>
  api.delete(`/api/inspections/${inspectionId}/steps/${stepId}`);

// Checklists
export const getChecklists = () => api.get<Checklist[]>('/api/checklists').then(r => r.data);
export const createChecklist = (data: Omit<Checklist, 'id'>) => api.post<Checklist>('/api/checklists', data).then(r => r.data);
export const updateChecklist = (id: number, data: Partial<Checklist>) => api.put<Checklist>(`/api/checklists/${id}`, data).then(r => r.data);

// Checklist Steps
export const addChecklistStep = (checklistId: number, step: Omit<ChecklistStep, 'id'>) =>
  api.post<Checklist>(`/api/checklists/${checklistId}/steps`, step).then(r => r.data);
export const updateChecklistStep = (checklistId: number, stepId: number, step: Partial<ChecklistStep>) =>
  api.put<Checklist>(`/api/checklists/${checklistId}/steps/${stepId}`, step).then(r => r.data);
export const deleteChecklistStep = (checklistId: number, stepId: number) =>
  api.delete(`/api/checklists/${checklistId}/steps/${stepId}`);

// File upload
export const uploadPhoto = (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post<{ url: string }>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => api.defaults.baseURL + r.data.url);
};
