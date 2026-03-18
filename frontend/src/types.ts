export interface InspectionStep {
  id?: number;
  title: string;
  description?: string;
  result: 'PASSED' | 'FAILED' | 'NOT_APPLICABLE' | 'FULFILLED' | 'NOT_FULFILLED' | 'NA' | 'PENDING';
  comment?: string;
  photoPath?: string;
  photoUrl?: string;
  checklistStepId?: number;
}

export interface Inspection {
  id?: number;
  title?: string;
  plantName?: string;
  inspectionDate?: string;
  generalComment?: string;
  checklistTemplateId?: number;
  facilityName: string;
  date: string;
  responsibleEmployee: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  steps: InspectionStep[];
}

export interface ChecklistStep {
  id?: number;
  title: string;
  description?: string;
  requirement?: string;
  orderIndex?: number;
}

export interface Checklist {
  id?: number;
  name: string;
  plantName?: string;
  recommendations?: string;
  description?: string;
  steps: ChecklistStep[];
}
