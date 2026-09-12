import type { EmployeeDocumentRequirementModel as Requirement } from '../../../generated/prisma/models.js';

export type CreateRequirementData = {
  employeeId: string;
  documentTypeIds: string[];
};

export abstract class RequirementsRepositoryContract {
  abstract createMany(data: CreateRequirementData): Promise<Requirement[]>;
  abstract findById(id: string): Promise<Requirement | null>;
  abstract remove(id: string): Promise<Requirement>;
}
