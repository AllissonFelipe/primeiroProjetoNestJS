interface Role {
  id: string;
  name: string;
}
interface UserData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}
