import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { PrismaModule } from './shared/database/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { EmployeesModule } from './modules/employees/employees.module.js';
import { DocumentTypesModule } from './modules/document-types/document-types.module.js';
import { RequirementsModule } from './modules/requirements/requirements.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { StatsModule } from './modules/stats/stats.module.js';
import { HealthModule } from './modules/health/health.module.js';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: isProduction
          ? undefined
          : { target: 'pino-pretty', options: { singleLine: true } },
        genReqId: (req) =>
          req.headers['x-request-id'] ?? randomUUID(),
        customProps: (req) => ({ requestId: req.id }),
      },
    }),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    DocumentTypesModule,
    RequirementsModule,
    DocumentsModule,
    StatsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
