import { Injectable, NotFoundException } from '@nestjs/common';
import type { DocumentTypeModel as DocumentType } from '../../generated/prisma/models.js';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto.js';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto.js';
import { DocumentTypesServiceContract } from './document-types.service.contract.js';
import { DocumentTypesRepositoryContract } from './repositories/document-types.repository.contract.js';

@Injectable()
export class DocumentTypesService extends DocumentTypesServiceContract {
  constructor(
    private readonly documentTypesRepository: DocumentTypesRepositoryContract,
  ) {
    super();
  }

  create(dto: CreateDocumentTypeDto): Promise<DocumentType> {
    return this.documentTypesRepository.create(dto);
  }

  findAll(): Promise<DocumentType[]> {
    return this.documentTypesRepository.findAllActive();
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType = await this.documentTypesRepository.findById(id);

    if (!documentType) {
      throw new NotFoundException(`DocumentType ${id} not found`);
    }

    return documentType;
  }

  async update(id: string, dto: UpdateDocumentTypeDto): Promise<DocumentType> {
    await this.findOne(id);
    return this.documentTypesRepository.update(id, dto);
  }

  async remove(id: string): Promise<DocumentType> {
    await this.findOne(id);
    return this.documentTypesRepository.deactivate(id);
  }
}
