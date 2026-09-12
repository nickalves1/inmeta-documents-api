import type { EmployeeModel as Employee } from '../../generated/prisma/models.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { FindEmployeesQueryDto } from './dto/find-employees-query.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export abstract class EmployeesServiceContract {
  abstract create(dto: CreateEmployeeDto): Promise<Employee>;
  abstract findAll(
    query: FindEmployeesQueryDto,
  ): Promise<PaginatedResult<Employee>>;
  abstract findOne(id: string): Promise<Employee>;
  abstract update(id: string, dto: UpdateEmployeeDto): Promise<Employee>;
  abstract remove(id: string): Promise<Employee>;
}
