import { RoleName } from 'src/users/roles/role.enum';

export class FindUsersParam {
  name?: string;
  email?: string;
  cpf?: string;
  roles?: RoleName[];
}
