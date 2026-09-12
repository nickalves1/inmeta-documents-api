import type { DocumentVersionModel as DocumentVersion } from '../../generated/prisma/models.js';
import { SubmitDocumentDto } from './dto/submit-document.dto.js';

export abstract class DocumentsServiceContract {
  abstract submit(
    requirementId: string,
    dto: SubmitDocumentDto,
  ): Promise<DocumentVersion>;
}
