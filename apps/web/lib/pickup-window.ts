// Constante pura, sin importar Prisma ni nada con efectos de módulo — a
// propósito, para que se pueda importar desde un componente cliente (ej. el
// <input max=...> de /admin/settings) sin arrastrar @crop/prisma (que crea
// un PrismaClient al cargar el módulo) al bundle del navegador.
export const MAX_PICKUP_WINDOW_HOURS = 2;
