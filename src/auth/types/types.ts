import { Request } from 'express';

export interface RefreshRequest extends Request {
  user: { sub: number };
}
