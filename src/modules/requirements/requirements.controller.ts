import { CreateRequirementsDto } from './dto/create-requirements.dto.js';
import { RequirementsServiceContract } from './requirements.service.contract.js';
import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';

@Controller('requirements')
export class RequirementsController {
  constructor(
    private readonly requirementsService: RequirementsServiceContract,
  ) {}

  @Post()
  create(@Body() dto: CreateRequirementsDto) {
    return this.requirementsService.createMany(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requirementsService.remove(id);
  }
}
