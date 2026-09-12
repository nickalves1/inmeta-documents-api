import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsServiceContract } from './documents.service.contract.js';
import { DocumentsRepositoryContract } from './repositories/documents.repository.contract.js';
import { PrismaDocumentsRepository } from './repositories/prisma-documents.repository.js';

@Module({
  controllers: [DocumentsController],
  providers: [
    {
      provide: DocumentsServiceContract,
      useClass: DocumentsService,
    },
    {
      provide: DocumentsRepositoryContract,
      useClass: PrismaDocumentsRepository,
    },
  ],
})
export class DocumentsModule {}
