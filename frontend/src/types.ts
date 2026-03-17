export interface InspectionStep {
  id?: number;
  title: string;
  description?: string;
  result: 'FULFILLED' | 'NOT_FULFILLED' | 'NA' | 'PENDING';
  comment?: string;
  photoUrl?: string;
}

export interface Inspection {
  id?: number;
  title?: string;
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
  orderIndex?: number;
}

export interface Checklist {
  id?: number;
  name: string;
  description?: string;
  steps: ChecklistStep[];
}
