import { Injectable, NotFoundException } from '@nestjs/common';
import type { EmployeeDocumentRequirementModel as Requirement } from '../../generated/prisma/models.js';
import { CreateRequirementsDto } from './dto/create-requirements-type.dto.js';
import { DocumentsQueryDto } from './dto/find-documents-type.dto.js';
import {
  RequirementsServiceContract,
  type PaginatedResult,
} from './requirements.service.contract.js';
import { RequirementsRepositoryContract } from './repositories/requirements.repository.contract.js';

@Injectable()
export class RequirementsService extends RequirementsServiceContract {
  constructor(
    private readonly requirementsRepository: RequirementsRepositoryContract,
  ) {
    super();
  }

  async findOne(id: string): Promise<Requirement> {
    const requirement = await this.requirementsRepository.findById(id);

    if (!requirement) {
      throw new NotFoundException(`Requirement ${id} not found`);
    }

    return requirement;
  }

  createMany(dto: CreateRequirementsDto): Promise<Requirement[]> {
    return this.requirementsRepository.createMany({
      employeeId: dto.employeeId,
      documentTypeIds: dto.documentTypeIds,
    });
  }

  async findDocuments(
    query: DocumentsQueryDto,
  ): Promise<PaginatedResult<Requirement>> {
    const { page, limit, employeeId, documentTypeId, status } = query;
    const skip = (page - 1) * limit;
    const filters = { employeeId, documentTypeId, status };

    const [data, total] = await Promise.all([
      this.requirementsRepository.findDocuments({
        ...filters,
        skip,
        take: limit,
      }),
      this.requirementsRepository.count(filters),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: string): Promise<Requirement> {
    await this.findOne(id);

    return this.requirementsRepository.remove(id);
  }
}
