import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { DocumentTypeModel as DocumentType } from '../../../generated/prisma/models.js';
import {
  DocumentTypesRepositoryContract,
  type CreateDocumentTypeData,
  type UpdateDocumentTypeData,
} from './document-types.repository.contract.js';

@Injectable()
export class PrismaDocumentTypesRepository extends DocumentTypesRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(data: CreateDocumentTypeData): Promise<DocumentType> {
    return this.prisma.documentType.create({ data });
  }

  findAllActive(): Promise<DocumentType[]> {
    return this.prisma.documentType.findMany({ where: { active: true } });
  }

  findById(id: string): Promise<DocumentType | null> {
    return this.prisma.documentType.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateDocumentTypeData): Promise<DocumentType> {
    return this.prisma.documentType.update({ where: { id }, data });
  }

  deactivate(id: string): Promise<DocumentType> {
    return this.prisma.documentType.update({
      where: { id },
      data: { active: false },
    });
  }
}
