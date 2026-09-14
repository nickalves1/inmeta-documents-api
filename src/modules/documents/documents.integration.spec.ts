import { randomUUID } from 'node:crypto';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DocumentTypesModule } from '../document-types/document-types.module.js';
import { DocumentTypesServiceContract } from '../document-types/document-types.service.contract.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { EmployeesServiceContract } from '../employees/employees.service.contract.js';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { PrismaService } from '../../shared/database/prisma.service.js';
import { RequirementsModule } from '../requirements/requirements.module.js';
import { RequirementsServiceContract } from '../requirements/requirements.service.contract.js';
import { DocumentsModule } from './documents.module.js';
import { DocumentsServiceContract } from './documents.service.contract.js';

function randomCpf(): string {
  return String(Math.floor(Math.random() * 90000000000) + 10000000000);
}

describe('Documents — envio e versionamento (regra de negócio)', () => {
  let prisma: PrismaService;
  let documentsService: DocumentsServiceContract;

  let employeeId: string;
  let documentTypeId: string;
  let requirementId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        EmployeesModule,
        DocumentTypesModule,
        RequirementsModule,
        DocumentsModule,
      ],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    const employeesService = moduleRef.get(EmployeesServiceContract);
    const documentTypesService = moduleRef.get(DocumentTypesServiceContract);
    const requirementsService = moduleRef.get(RequirementsServiceContract);
    documentsService = moduleRef.get(DocumentsServiceContract);

    const suffix = randomUUID();
    const employee = await employeesService.create({
      name: 'Teste Automatizado - Versionamento',
      email: `versionamento.${suffix}@example.com`,
      document: randomCpf(),
      hiredAt: '2024-01-01',
    });
    employeeId = employee.id;

    const documentType = await documentTypesService.create({
      name: `Tipo Versionamento ${suffix}`,
    });
    documentTypeId = documentType.id;

    const [requirement] = await requirementsService.createMany({
      employeeId,
      documentTypeIds: [documentTypeId],
    });
    requirementId = requirement.id;
  });

  afterAll(async () => {
    await prisma.documentVersion.deleteMany({
      where: { document: { requirementId } },
    });
    await prisma.document.deleteMany({ where: { requirementId } });
    await prisma.employeeDocumentRequirement.delete({
      where: { id: requirementId },
    });
    await prisma.employee.delete({ where: { id: employeeId } });
    await prisma.documentType.delete({ where: { id: documentTypeId } });
    await prisma.$disconnect();
  });

  it('primeiro envio cria a versão 1 ativa e marca o requirement como SUBMITTED', async () => {
    const version = await documentsService.submit(requirementId, {
      payload: { numero: '123' },
    });

    expect(version.version).toBe(1);
    expect(version.status).toBe('ACTIVE');

    const requirement = await prisma.employeeDocumentRequirement.findUniqueOrThrow({
      where: { id: requirementId },
    });
    expect(requirement.status).toBe('SUBMITTED');
  });

  it('reenvio supera a versão anterior e cria a próxima, mantendo só uma ativa', async () => {
    const secondVersion = await documentsService.submit(requirementId, {
      payload: { numero: '456' },
    });

    expect(secondVersion.version).toBe(2);
    expect(secondVersion.status).toBe('ACTIVE');

    const document = await prisma.document.findUniqueOrThrow({
      where: { requirementId },
      include: { versions: true },
    });

    expect(document.currentVersionId).toBe(secondVersion.id);

    const firstVersion = document.versions.find((v) => v.version === 1);
    expect(firstVersion?.status).toBe('SUPERSEDED');
  });
});
