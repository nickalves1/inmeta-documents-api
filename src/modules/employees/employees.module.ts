import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller.js';
import { EmployeesService } from './employees.service.js';
import { EmployeesServiceContract } from './employees.service.contract.js';
import { EmployeesRepositoryContract } from './repositories/employees.repository.contract.js';
import { PrismaEmployeesRepository } from './repositories/prisma-employees.repository.js';

@Module({
  controllers: [EmployeesController],
  providers: [
    {
      provide: EmployeesServiceContract,
      useClass: EmployeesService,
    },
    {
      provide: EmployeesRepositoryContract,
      useClass: PrismaEmployeesRepository,
    },
  ],
})
export class EmployeesModule {}
