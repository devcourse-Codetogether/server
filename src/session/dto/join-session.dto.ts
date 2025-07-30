import { IsString } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  joinCode: string;
}
