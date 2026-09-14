import type {
  LatestSubmission,
  PendingDocumentTypeCount,
} from './repositories/stats.repository.contract.js';

export type EmployeeCompletion = {
  employeeId: string;
  employeeName: string;
  total: number;
  submitted: number;
  percentage: number;
};

export type StatsResponse = {
  completion: {
    overallPercentage: number;
    byEmployee: EmployeeCompletion[];
  };
  mostPendingDocumentTypes: PendingDocumentTypeCount[];
  latestSubmissions: LatestSubmission[];
};

export abstract class StatsServiceContract {
  abstract getStats(): Promise<StatsResponse>;
}
