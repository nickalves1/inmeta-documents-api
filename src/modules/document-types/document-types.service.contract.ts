import type { DocumentTypeModel as DocumentType } from '../../generated/prisma/models.js';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto.js';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto.js';

export abstract class DocumentTypesServiceContract {
  abstract create(dto: CreateDocumentTypeDto): Promise<DocumentType>;
  abstract findAll(): Promise<DocumentType[]>;
  abstract findOne(id: string): Promise<DocumentType>;
  abstract update(
    id: string,
    dto: UpdateDocumentTypeDto,
  ): Promise<DocumentType>;
  abstract remove(id: string): Promise<DocumentType>;
}
