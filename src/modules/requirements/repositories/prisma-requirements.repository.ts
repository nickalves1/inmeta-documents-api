import {
  type CreateRequirementData,
  RequirementsRepositoryContract,
} from './requirements.repository.contract.js';
import { Injectable } from '@nestjs/common';
import type { EmployeeDocumentRequirementModel as Requirement } from '../../../generated/prisma/models.js';
import { PrismaService } from '../../../shared/database/prisma.service.js';

@Injectable()
export class RequirementsRepository extends RequirementsRepositoryContract {
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

  findById(id: string): Promise<Requirement | null> {
    return this.prisma.employeeDocumentRequirement.findUnique({
      where: { id },
    });
  }

  remove(id: string): Promise<Requirement> {
    return this.prisma.employeeDocumentRequirement.delete({ where: { id } });
  }
}
