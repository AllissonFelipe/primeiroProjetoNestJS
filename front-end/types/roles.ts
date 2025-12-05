/**
 * Define as strings literais válidas para as Roles no sistema.
 * Deve corresponder exatamente ao que está no seu RoleEnum do backend.
 */
export const ROLES = {
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  VIP: "VIP",
  USER: "USER",
} as const; //👈 O 'as const' transforma as propriedades em tipos literais

// Cria o Tipo união a partir dos valores de ROLES
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
// RoleType agora é 'ADMIN' | 'USER' | 'MODERATOR' | 'VIP'
