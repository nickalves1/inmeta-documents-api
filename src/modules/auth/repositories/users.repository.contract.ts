import type { UserModel as User } from '../../../generated/prisma/models.js';

export abstract class UsersRepositoryContract {
  abstract findByEmail(email: string): Promise<User | null>;
}
