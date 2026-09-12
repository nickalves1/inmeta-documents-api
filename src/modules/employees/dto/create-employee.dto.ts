import { IsDateString, IsEmail, IsString, Length } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(11, 14)
  document: string;

  @IsDateString()
  hiredAt: string;
}
