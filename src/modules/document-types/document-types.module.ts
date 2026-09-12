import { Module } from '@nestjs/common';
import { DocumentTypesController } from './document-types.controller.js';
import { DocumentTypesService } from './document-types.service.js';
import { DocumentTypesServiceContract } from './document-types.service.contract.js';
import { DocumentTypesRepositoryContract } from './repositories/document-types.repository.contract.js';
import { PrismaDocumentTypesRepository } from './repositories/prisma-document-types.repository.js';

@Module({
  controllers: [DocumentTypesController],
  providers: [
    {
      provide: DocumentTypesServiceContract,
      useClass: DocumentTypesService,
    },
    {
      provide: DocumentTypesRepositoryContract,
      useClass: PrismaDocumentTypesRepository,
    },
  ],
})
export class DocumentTypesModule {}
