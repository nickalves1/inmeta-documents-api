import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRequirementsDto } from './dto/create-requirements-type.dto.js';
import { DocumentsQueryDto } from './dto/find-documents-type.dto.js';
import { RequirementsServiceContract } from './requirements.service.contract.js';

@Controller('requirements')
export class RequirementsController {
  constructor(
    private readonly requirementsService: RequirementsServiceContract,
  ) {}

  @Post()
  create(@Body() dto: CreateRequirementsDto) {
    return this.requirementsService.createMany(dto);
  }

  @Get()
  findDocuments(@Query() query: DocumentsQueryDto) {
    return this.requirementsService.findDocuments(query);
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
