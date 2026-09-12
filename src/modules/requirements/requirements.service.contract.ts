import { CreateRequirementsDto } from './dto/create-requirements-type.dto.js';
import type { EmployeeDocumentRequirementModel as Requirement } from '../../generated/prisma/models.js';

export abstract class RequirementsServiceContract {
  abstract createMany(dto: CreateRequirementsDto): Promise<Requirement[]>;
  abstract findOne(id: string): Promise<Requirement>;
  abstract remove(id: string): Promise<Requirement>;
}
