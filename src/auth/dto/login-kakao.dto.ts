import { IsString } from 'class-validator';

export class LoginKakaoDto {
  @IsString()
  access_token: string;
}
