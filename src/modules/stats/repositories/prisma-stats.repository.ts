import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import { RequirementStatus } from '../../../generated/prisma/enums.js';
import {
  StatsRepositoryContract,
  type EmployeeRequirementCounts,
  type LatestSubmission,
  type PendingDocumentTypeCount,
  type RequirementStatusCounts,
} from './stats.repository.contract.js';

@Injectable()
export class PrismaStatsRepository extends StatsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async countRequirementsByStatus(): Promise<RequirementStatusCounts> {
    const [total, submitted] = await Promise.all([
      this.prisma.employeeDocumentRequirement.count(),
      this.prisma.employeeDocumentRequirement.count({
        where: { status: RequirementStatus.SUBMITTED },
      }),
    ]);

    return { total, submitted };
  }

  async countRequirementsByEmployee(): Promise<EmployeeRequirementCounts[]> {
    const [totals, submitted] = await Promise.all([
      this.prisma.employeeDocumentRequirement.groupBy({
        by: ['employeeId'],
        _count: { _all: true },
      }),
      this.prisma.employeeDocumentRequirement.groupBy({
        by: ['employeeId'],
        where: { status: RequirementStatus.SUBMITTED },
        _count: { _all: true },
      }),
    ]);

    if (totals.length === 0) {
      return [];
    }

    const submittedByEmployeeId = new Map(
      submitted.map((row) => [row.employeeId, row._count._all]),
    );

    const employees = await this.prisma.employee.findMany({
      where: { id: { in: totals.map((row) => row.employeeId) } },
      select: { id: true, name: true },
    });
    const employeeNameById = new Map(
      employees.map((employee) => [employee.id, employee.name]),
    );

    return totals.map((row) => ({
      employeeId: row.employeeId,
      employeeName: employeeNameById.get(row.employeeId) ?? 'Unknown',
      total: row._count._all,
      submitted: submittedByEmployeeId.get(row.employeeId) ?? 0,
    }));
  }

  async countPendingByDocumentType(): Promise<PendingDocumentTypeCount[]> {
    const grouped = await this.prisma.employeeDocumentRequirement.groupBy({
      by: ['documentTypeId'],
      where: { status: RequirementStatus.PENDING },
      _count: { _all: true },
      orderBy: { _count: { documentTypeId: 'desc' } },
    });

    if (grouped.length === 0) {
      return [];
    }

    const documentTypes = await this.prisma.documentType.findMany({
      where: { id: { in: grouped.map((row) => row.documentTypeId) } },
      select: { id: true, name: true },
    });
    const documentTypeNameById = new Map(
      documentTypes.map((documentType) => [
        documentType.id,
        documentType.name,
      ]),
    );

    return grouped.map((row) => ({
      documentTypeId: row.documentTypeId,
      documentTypeName: documentTypeNameById.get(row.documentTypeId) ?? 'Unknown',
      pendingCount: row._count._all,
    }));
  }

  async findLatestSubmissions(limit: number): Promise<LatestSubmission[]> {
    const versions = await this.prisma.documentVersion.findMany({
      orderBy: { submittedAt: 'desc' },
      take: limit,
      include: {
        document: {
          include: {
            requirement: {
              include: {
                employee: { select: { name: true } },
                documentType: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return versions.map((version) => ({
      documentVersionId: version.id,
      version: version.version,
      submittedAt: version.submittedAt,
      employeeName: version.document.requirement.employee.name,
      documentTypeName: version.document.requirement.documentType.name,
    }));
  }
}
