import { randomUUID } from 'node:crypto';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DocumentTypesModule } from '../document-types/document-types.module.js';
import { DocumentTypesServiceContract } from '../document-types/document-types.service.contract.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { EmployeesServiceContract } from '../employees/employees.service.contract.js';
import { PrismaModule } from '../../shared/database/prisma.module.js';
import { PrismaService } from '../../shared/database/prisma.service.js';
import { RequirementsModule } from './requirements.module.js';
import { RequirementsServiceContract } from './requirements.service.contract.js';

function randomCpf(): string {
  return String(Math.floor(Math.random() * 90000000000) + 10000000000);
}

describe('Requirements — vínculo/desvínculo (regra de negócio)', () => {
  let prisma: PrismaService;
  let employeesService: EmployeesServiceContract;
  let documentTypesService: DocumentTypesServiceContract;
  let requirementsService: RequirementsServiceContract;

  let employeeId: string;
  let documentTypeAId: string;
  let documentTypeBId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        EmployeesModule,
        DocumentTypesModule,
        RequirementsModule,
      ],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    employeesService = moduleRef.get(EmployeesServiceContract);
    documentTypesService = moduleRef.get(DocumentTypesServiceContract);
    requirementsService = moduleRef.get(RequirementsServiceContract);

    const suffix = randomUUID();
    const employee = await employeesService.create({
      name: 'Teste Automatizado - Vínculo',
      email: `vinculo.${suffix}@example.com`,
      document: randomCpf(),
      hiredAt: '2024-01-01',
    });
    employeeId = employee.id;

    const typeA = await documentTypesService.create({
      name: `Tipo A ${suffix}`,
    });
    const typeB = await documentTypesService.create({
      name: `Tipo B ${suffix}`,
    });
    documentTypeAId = typeA.id;
    documentTypeBId = typeB.id;
  });

  afterAll(async () => {
    await prisma.employeeDocumentRequirement.deleteMany({
      where: { employeeId },
    });
    await prisma.employee.delete({ where: { id: employeeId } });
    await prisma.documentType.deleteMany({
      where: { id: { in: [documentTypeAId, documentTypeBId] } },
    });
    await prisma.$disconnect();
  });

  it('vincula múltiplos tipos de documento de uma vez, como pendências', async () => {
    const created = await requirementsService.createMany({
      employeeId,
      documentTypeIds: [documentTypeAId, documentTypeBId],
    });

    expect(created).toHaveLength(2);
    expect(created.every((requirement) => requirement.status === 'PENDING')).toBe(true);
  });

  it('é atômico: se um vínculo do lote já existe, nenhum novo é criado', async () => {
    const typeC = await documentTypesService.create({
      name: `Tipo C ${randomUUID()}`,
    });

    await expect(
      requirementsService.createMany({
        employeeId,
        // documentTypeAId já está vinculado (teste anterior) — o lote inteiro deve falhar
        documentTypeIds: [typeC.id, documentTypeAId],
      }),
    ).rejects.toThrow();

    const leftover = await prisma.employeeDocumentRequirement.findFirst({
      where: { employeeId, documentTypeId: typeC.id },
    });
    expect(leftover).toBeNull();

    await prisma.documentType.delete({ where: { id: typeC.id } });
  });

  it('desvincula (remove) um requirement existente', async () => {
    const requirement = await prisma.employeeDocumentRequirement.findFirstOrThrow({
      where: { employeeId, documentTypeId: documentTypeBId },
    });

    await requirementsService.remove(requirement.id);

    const found = await prisma.employeeDocumentRequirement.findUnique({
      where: { id: requirement.id },
    });
    expect(found).toBeNull();
  });
});
