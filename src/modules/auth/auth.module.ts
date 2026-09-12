import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthServiceContract } from './auth.service.contract.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { PrismaUsersRepository } from './repositories/prisma-users.repository.js';
import { UsersRepositoryContract } from './repositories/users.repository.contract.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: parseInt(
            configService.getOrThrow<string>('JWT_EXPIRES_IN'),
            10,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthServiceContract,
      useClass: AuthService,
    },
    JwtStrategy,
    {
      provide: UsersRepositoryContract,
      useClass: PrismaUsersRepository,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
