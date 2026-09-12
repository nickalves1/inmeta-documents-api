import { Injectable, NotFoundException } from '@nestjs/common';
import type { EmployeeModel as Employee } from '../../generated/prisma/models.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { FindEmployeesQueryDto } from './dto/find-employees-query.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import {
  EmployeesServiceContract,
  type PaginatedResult,
} from './employees.service.contract.js';
import { EmployeesRepositoryContract } from './repositories/employees.repository.contract.js';
import { Cpf } from './value-objects/cpf.value-object.js';

@Injectable()
export class EmployeesService extends EmployeesServiceContract {
  constructor(
    private readonly employeesRepository: EmployeesRepositoryContract,
  ) {
    super();
  }

  create(dto: CreateEmployeeDto): Promise<Employee> {
    const document = new Cpf(dto.document);

    return this.employeesRepository.create({
      name: dto.name,
      email: dto.email,
      document: document.toString(),
      hiredAt: new Date(dto.hiredAt),
    });
  }

  async findAll(
    query: FindEmployeesQueryDto,
  ): Promise<PaginatedResult<Employee>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.employeesRepository.findAllActive({ skip, take: limit }),
      this.employeesRepository.countActive(),
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

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findById(id);

    if (!employee) {
      throw new NotFoundException(`Employee ${id} not found`);
    }

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    await this.findOne(id);

    const document = dto.document ? new Cpf(dto.document) : undefined;

    return this.employeesRepository.update(id, {
      name: dto.name,
      email: dto.email,
      document: document?.toString(),
      hiredAt: dto.hiredAt ? new Date(dto.hiredAt) : undefined,
    });
  }

  async remove(id: string): Promise<Employee> {
    await this.findOne(id);
    return this.employeesRepository.deactivate(id);
  }
}
