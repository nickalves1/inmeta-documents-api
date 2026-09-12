import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = 'admin@inmeta.com';
  const password = 'admin1234';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  console.log(`Usuário pronto: ${user.email}`);

  const documentTypes = [
    { name: 'CPF', description: 'Cadastro de Pessoa Física' },
    { name: 'Certidão', description: 'Certidão de nascimento ou casamento' },
    { name: 'ASO', description: 'Atestado de Saúde Ocupacional' },
  ];

  for (const documentType of documentTypes) {
    await prisma.documentType.upsert({
      where: { name: documentType.name },
      update: {},
      create: documentType,
    });
  }

  console.log(
    `Tipos de documento prontos: ${documentTypes.map((d) => d.name).join(', ')}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });