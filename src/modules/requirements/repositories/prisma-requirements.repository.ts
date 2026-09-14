import { Injectable } from '@nestjs/common';
import type { EmployeeDocumentRequirementModel as Requirement } from '../../../generated/prisma/models.js';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import {
  type CreateRequirementData,
  type FindParams,
  type RequirementFilters,
  RequirementsRepositoryContract,
} from './requirements.repository.contract.js';

@Injectable()
export class PrismaRequirementsRepository extends RequirementsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  createMany(data: CreateRequirementData): Promise<Requirement[]> {
    return this.prisma.$transaction(
      data.documentTypeIds.map((item) =>
        this.prisma.employeeDocumentRequirement.create({
          data: { employeeId: data.employeeId, documentTypeId: item },
        }),
      ),
    );
  }

  findDocuments({
    skip,
    take,
    employeeId,
    documentTypeId,
    status,
  }: FindParams): Promise<Requirement[]> {
    return this.prisma.employeeDocumentRequirement.findMany({
      where: { employeeId, documentTypeId, status },
      include: {
        employee: { select: { id: true, name: true, email: true } },
        documentType: { select: { id: true, name: true } },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count({ employeeId, documentTypeId, status }: RequirementFilters): Promise<number> {
    return this.prisma.employeeDocumentRequirement.count({
      where: { employeeId, documentTypeId, status },
    });
  }

  findById(id: string): Promise<Requirement | null> {
    return this.prisma.employeeDocumentRequirement.findUnique({
      where: { id },
    });
  }

  remove(id: string): Promise<Requirement> {
    return this.prisma.employeeDocumentRequirement.delete({ where: { id } });
  }
}
