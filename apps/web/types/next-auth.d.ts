import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "FARMER" | "ADMIN";
      // true una vez que el usuario aceptó Privacidad + Términos en /welcome.
      // Lo revisa proxy.ts para forzar el paso por /welcome antes de cualquier
      // otra página (requisito de Apple: consentimiento obligatorio).
      consented: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "FARMER" | "ADMIN";
    consented?: boolean;
  }
}
