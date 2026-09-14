import { Module } from '@nestjs/common';
import { PrismaStatsRepository } from './repositories/prisma-stats.repository.js';
import { StatsRepositoryContract } from './repositories/stats.repository.contract.js';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';
import { StatsServiceContract } from './stats.service.contract.js';

@Module({
  controllers: [StatsController],
  providers: [
    {
      provide: StatsServiceContract,
      useClass: StatsService,
    },
    {
      provide: StatsRepositoryContract,
      useClass: PrismaStatsRepository,
    },
  ],
})
export class StatsModule {}
