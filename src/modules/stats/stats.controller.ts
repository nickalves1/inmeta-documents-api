import { Controller, Get } from '@nestjs/common';
import { StatsServiceContract } from './stats.service.contract.js';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsServiceContract) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }
}
