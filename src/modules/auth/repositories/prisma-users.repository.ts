import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { UserModel as User } from '../../../generated/prisma/models.js';
import { UsersRepositoryContract } from './users.repository.contract.js';

@Injectable()
export class PrismaUsersRepository extends UsersRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
