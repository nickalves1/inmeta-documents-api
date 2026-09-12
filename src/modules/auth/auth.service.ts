import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthServiceContract } from './auth.service.contract.js';
import { UsersRepositoryContract } from './repositories/users.repository.contract.js';

@Injectable()
export class AuthService extends AuthServiceContract {
  constructor(
    private readonly usersRepository: UsersRepositoryContract,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
