import { IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsString()
  mode: string;

  @IsString()
  language: string;
}
