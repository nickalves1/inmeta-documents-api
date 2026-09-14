import type { EmployeeDocumentRequirementModel as Requirement } from '../../../generated/prisma/models.js';
import type { RequirementStatus } from '../../../generated/prisma/enums.js';

export type CreateRequirementData = {
  employeeId: string;
  documentTypeIds: string[];
};

export type RequirementFilters = {
  employeeId?: string;
  documentTypeId?: string;
  status?: RequirementStatus;
};

export type FindParams = RequirementFilters & {
  skip: number;
  take: number;
};

export abstract class RequirementsRepositoryContract {
  abstract createMany(data: CreateRequirementData): Promise<Requirement[]>;
  abstract findDocuments(params: FindParams): Promise<Requirement[]>;
  abstract count(filters: RequirementFilters): Promise<number>;
  abstract findById(id: string): Promise<Requirement | null>;
  abstract remove(id: string): Promise<Requirement>;
}
