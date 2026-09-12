import type { EmployeeModel as Employee } from '../../../generated/prisma/models.js';

export type CreateEmployeeData = {
  name: string;
  email: string;
  document: string;
  hiredAt: Date;
};

export type UpdateEmployeeData = Partial<CreateEmployeeData>;

export type FindAllActiveParams = {
  skip: number;
  take: number;
};

export abstract class EmployeesRepositoryContract {
  abstract create(data: CreateEmployeeData): Promise<Employee>;
  abstract findAllActive(params: FindAllActiveParams): Promise<Employee[]>;
  abstract countActive(): Promise<number>;
  abstract findById(id: string): Promise<Employee | null>;
  abstract update(id: string, data: UpdateEmployeeData): Promise<Employee>;
  abstract deactivate(id: string): Promise<Employee>;
}
