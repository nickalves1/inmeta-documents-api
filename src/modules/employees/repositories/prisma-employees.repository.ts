import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { EmployeeModel as Employee } from '../../../generated/prisma/models.js';
import {
  EmployeesRepositoryContract,
  type CreateEmployeeData,
  type FindAllActiveParams,
  type UpdateEmployeeData,
} from './employees.repository.contract.js';

@Injectable()
export class PrismaEmployeesRepository extends EmployeesRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(data: CreateEmployeeData): Promise<Employee> {
    return this.prisma.employee.create({ data });
  }

  findAllActive({ skip, take }: FindAllActiveParams): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: { active: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  countActive(): Promise<number> {
    return this.prisma.employee.count({ where: { active: true } });
  }

  findById(id: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateEmployeeData): Promise<Employee> {
    return this.prisma.employee.update({ where: { id }, data });
  }

  deactivate(id: string): Promise<Employee> {
    return this.prisma.employee.update({
      where: { id },
      data: { active: false },
    });
  }
}
