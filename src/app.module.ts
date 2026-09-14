import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './shared/database/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { EmployeesModule } from './modules/employees/employees.module.js';
import { DocumentTypesModule } from './modules/document-types/document-types.module.js';
import { RequirementsModule } from './modules/requirements/requirements.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { StatsModule } from './modules/stats/stats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    DocumentTypesModule,
    RequirementsModule,
    DocumentsModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
