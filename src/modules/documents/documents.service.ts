import { Injectable } from '@nestjs/common';
import type { DocumentVersionModel as DocumentVersion } from '../../generated/prisma/models.js';
import { DocumentsServiceContract } from './documents.service.contract.js';
import { SubmitDocumentDto } from './dto/submit-document.dto.js';
import { DocumentsRepositoryContract } from './repositories/documents.repository.contract.js';

@Injectable()
export class DocumentsService extends DocumentsServiceContract {
  constructor(
    private readonly documentsRepository: DocumentsRepositoryContract,
  ) {
    super();
  }

  submit(
    requirementId: string,
    dto: SubmitDocumentDto,
  ): Promise<DocumentVersion> {
    return this.documentsRepository.submit(requirementId, dto.payload);
  }
}
