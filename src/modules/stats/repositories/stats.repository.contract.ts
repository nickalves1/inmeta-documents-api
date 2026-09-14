export type RequirementStatusCounts = {
  total: number;
  submitted: number;
};

export type EmployeeRequirementCounts = {
  employeeId: string;
  employeeName: string;
  total: number;
  submitted: number;
};

export type PendingDocumentTypeCount = {
  documentTypeId: string;
  documentTypeName: string;
  pendingCount: number;
};

export type LatestSubmission = {
  documentVersionId: string;
  version: number;
  submittedAt: Date;
  employeeName: string;
  documentTypeName: string;
};

export abstract class StatsRepositoryContract {
  abstract countRequirementsByStatus(): Promise<RequirementStatusCounts>;
  abstract countRequirementsByEmployee(): Promise<EmployeeRequirementCounts[]>;
  abstract countPendingByDocumentType(): Promise<PendingDocumentTypeCount[]>;
  abstract findLatestSubmissions(limit: number): Promise<LatestSubmission[]>;
}
