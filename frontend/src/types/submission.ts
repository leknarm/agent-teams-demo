export interface Submission {
  id: string;
  formId: string;
  formVersion: number;
  data: Record<string, unknown>;
  submittedAt: string;
  createdAt: string;
}

export interface SubmissionSummary {
  id: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

export interface FormAnalytics {
  formId: string;
  totalSubmissions: number;
  submissionsOverTime: DailyCount[];
  fieldAnalytics: Record<string, FieldAnalytics>;
}

export interface DailyCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface FieldAnalytics {
  fieldName: string;
  fieldType: string;
  valueCounts: Record<string, number>;
  average: number | null;
  responseCount: number;
}
