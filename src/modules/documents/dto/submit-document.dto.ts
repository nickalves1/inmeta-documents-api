import { IsObject, IsNotEmptyObject } from 'class-validator';

export class SubmitDocumentDto {
  @IsObject()
  @IsNotEmptyObject()
  payload: Record<string, unknown>;
}
