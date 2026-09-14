import { Injectable } from '@nestjs/common';
import { StatsRepositoryContract } from './repositories/stats.repository.contract.js';
import {
  StatsServiceContract,
  type EmployeeCompletion,
  type StatsResponse,
} from './stats.service.contract.js';

const LATEST_SUBMISSIONS_LIMIT = 10;

function toPercentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 10000) / 100;
}

@Injectable()
export class StatsService extends StatsServiceContract {
  constructor(private readonly statsRepository: StatsRepositoryContract) {
    super();
  }

  async getStats(): Promise<StatsResponse> {
    const [overall, byEmployeeCounts, mostPendingDocumentTypes, latestSubmissions] =
      await Promise.all([
        this.statsRepository.countRequirementsByStatus(),
        this.statsRepository.countRequirementsByEmployee(),
        this.statsRepository.countPendingByDocumentType(),
        this.statsRepository.findLatestSubmissions(LATEST_SUBMISSIONS_LIMIT),
      ]);

    const byEmployee: EmployeeCompletion[] = byEmployeeCounts.map((employee) => ({
      ...employee,
      percentage: toPercentage(employee.submitted, employee.total),
    }));

    return {
      completion: {
        overallPercentage: toPercentage(overall.submitted, overall.total),
        byEmployee,
      },
      mostPendingDocumentTypes,
      latestSubmissions,
    };
  }
}
