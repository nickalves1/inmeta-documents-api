import type { DocumentVersionModel as DocumentVersion } from '../../../generated/prisma/models.js';

export abstract class DocumentsRepositoryContract {
  abstract submit(
    requirementId: string,
    payload: Record<string, unknown>,
  ): Promise<DocumentVersion>;
}
