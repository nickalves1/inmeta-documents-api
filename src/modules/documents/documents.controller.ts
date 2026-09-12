import { Body, Controller, Param, Post } from '@nestjs/common';
import { SubmitDocumentDto } from './dto/submit-document.dto.js';
import { DocumentsServiceContract } from './documents.service.contract.js';

@Controller('requirements/:requirementId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsServiceContract) {}

  @Post()
  submit(
    @Param('requirementId') requirementId: string,
    @Body() dto: SubmitDocumentDto,
  ) {
    return this.documentsService.submit(requirementId, dto);
  }
}
