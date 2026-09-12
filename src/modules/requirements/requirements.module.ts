import { Module } from '@nestjs/common';
import { RequirementsServiceContract } from './requirements.service.contract.js';
import { RequirementsService } from './requirements.service.js';
import { RequirementsRepository } from './repositories/prisma-requirements.repository.js';
import { RequirementsRepositoryContract } from './repositories/requirements.repository.contract.js';
import { RequirementsController } from './requirements.controller.js';

@Module({
  controllers: [RequirementsController],
  providers: [
    {
      provide: RequirementsServiceContract,
      useClass: RequirementsService,
    },
    {
      provide: RequirementsRepositoryContract,
      useClass: RequirementsRepository,
    },
  ],
})
export class RequirementsModule {}
