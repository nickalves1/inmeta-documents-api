import { CreateRequirementsDto } from './dto/create-requirements-type.dto.js';
import { DocumentsQueryDto } from './dto/find-documents-type.dto.js';
import type { EmployeeDocumentRequirementModel as Requirement } from '../../generated/prisma/models.js';

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export abstract class RequirementsServiceContract {
  abstract createMany(dto: CreateRequirementsDto): Promise<Requirement[]>;
  abstract findDocuments(query: DocumentsQueryDto): Promise<PaginatedResult<Requirement>>;
  abstract findOne(id: string): Promise<Requirement>;
  abstract remove(id: string): Promise<Requirement>;
}
