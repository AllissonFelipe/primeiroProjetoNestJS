export interface AuthRequest {
  headers: any;
  user: {
    sub: string;
    name: string;
  };
}
