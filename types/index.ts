export * from './convexTypes'

export interface Classes {
  id: string; // uuid
  schoolId: string; // uuid
  gradeId: number;
  name: string;
  mainTeacherId: string | null; // uuid
  createdAt: Date | null;
  createdBy: string | null; // uuid
  updatedAt: Date | null;
  updatedBy: string | null; // uuid
}
