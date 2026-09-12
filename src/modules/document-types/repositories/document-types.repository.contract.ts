import type { DocumentTypeModel as DocumentType } from '../../../generated/prisma/models.js';

export type CreateDocumentTypeData = {
  name: string;
  description?: string;
};

export type UpdateDocumentTypeData = Partial<CreateDocumentTypeData>;

export abstract class DocumentTypesRepositoryContract {
  abstract create(data: CreateDocumentTypeData): Promise<DocumentType>;
  abstract findAllActive(): Promise<DocumentType[]>;
  abstract findById(id: string): Promise<DocumentType | null>;
  abstract update(
    id: string,
    data: UpdateDocumentTypeData,
  ): Promise<DocumentType>;
  abstract deactivate(id: string): Promise<DocumentType>;
}
