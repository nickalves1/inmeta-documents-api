import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { DocumentVersionModel as DocumentVersion } from '../../../generated/prisma/models.js';
import { Prisma } from '../../../generated/prisma/client.js';
import {
  DocumentVersionStatus,
  RequirementStatus,
} from '../../../generated/prisma/enums.js';
import { DocumentsRepositoryContract } from './documents.repository.contract.js';

type DocumentWithCurrentVersion = {
  id: string;
  currentVersionId: string | null;
  currentVersion: { version: number } | null;
};

@Injectable()
export class PrismaDocumentsRepository extends DocumentsRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  submit(
    requirementId: string,
    payload: Record<string, unknown>,
  ): Promise<DocumentVersion> {
    return this.prisma.$transaction(async (tx) => {
      const requirement = await tx.employeeDocumentRequirement.findUnique({
        where: { id: requirementId },
        include: { document: { include: { currentVersion: true } } },
      });

      if (!requirement) {
        throw new NotFoundException(`Requirement ${requirementId} not found`);
      }

      const version = requirement.document
        ? await this.supersedeAndCreateNextVersion(
            tx,
            requirement.document,
            payload,
          )
        : await this.createFirstVersion(tx, requirementId, payload);

      await tx.employeeDocumentRequirement.update({
        where: { id: requirement.id },
        data: { status: RequirementStatus.SUBMITTED },
      });

      return version;
    });
  }

  private async createFirstVersion(
    tx: Prisma.TransactionClient,
    requirementId: string,
    payload: Record<string, unknown>,
  ): Promise<DocumentVersion> {
    const document = await tx.document.create({ data: { requirementId } });

    const version = await tx.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        status: DocumentVersionStatus.ACTIVE,
        payload: payload as Prisma.InputJsonValue,
      },
    });

    await tx.document.update({
      where: { id: document.id },
      data: { currentVersionId: version.id },
    });

    return version;
  }

  private async supersedeAndCreateNextVersion(
    tx: Prisma.TransactionClient,
    document: DocumentWithCurrentVersion,
    payload: Record<string, unknown>,
  ): Promise<DocumentVersion> {
    if (!document.currentVersionId || !document.currentVersion) {
      throw new Error(
        `Document ${document.id} has no current version to supersede`,
      );
    }

    await tx.documentVersion.update({
      where: { id: document.currentVersionId },
      data: { status: DocumentVersionStatus.SUPERSEDED },
    });

    const version = await tx.documentVersion.create({
      data: {
        documentId: document.id,
        version: document.currentVersion.version + 1,
        status: DocumentVersionStatus.ACTIVE,
        payload: payload as Prisma.InputJsonValue,
      },
    });

    await tx.document.update({
      where: { id: document.id },
      data: { currentVersionId: version.id },
    });

    return version;
  }
}
