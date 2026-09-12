import { Injectable, NotFoundException } from '@nestjs/common';
import { RequirementsServiceContract } from './requirements.service.contract.js';
import { RequirementsRepositoryContract } from './repositories/requirements.repository.contract.js';
import { CreateRequirementsDto } from './dto/create-requirements.dto.js';
import type { EmployeeDocumentRequirementModel as Requirement } from '../../generated/prisma/models.js';

@Injectable()
export class RequirementsService extends RequirementsServiceContract {
  constructor(
    private readonly requirementsRepository: RequirementsRepositoryContract,
  ) {
    super();
  }

  createMany(dto: CreateRequirementsDto): Promise<Requirement[]> {
    return this.requirementsRepository.createMany({
      employeeId: dto.employeeId,
      documentTypeIds: dto.documentTypeIds,
    });
  }

  async findOne(id: string): Promise<Requirement> {
    const requirement = await this.requirementsRepository.findById(id);

    if (!requirement) {
      throw new NotFoundException(`Requirement ${id} not found`);
    }

    return requirement;
  }

  async remove(id: string): Promise<Requirement> {
    await this.findOne(id);

    return this.requirementsRepository.remove(id);
  }
}
