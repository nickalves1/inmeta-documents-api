import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateRequirementsDto {
  @IsString()
  employeeId: string;

  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  documentTypeIds: string[];
}
