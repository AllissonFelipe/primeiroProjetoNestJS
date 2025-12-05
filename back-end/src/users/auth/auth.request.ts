import { Request } from 'express';
import { RoleName } from '../roles/role.enum';

export interface AuthRequest extends Request {
  // headers: any;
  user: JwtPayLoad;
}
export interface JwtPayLoad {
  sub: string;
  name: string;
  email: string;
  roles: RoleName[];
}
