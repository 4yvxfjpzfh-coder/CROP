import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { DeleteAccount } from "./delete-account";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, createdAt: true, role: true },
  });

  if (!user) redirect("/signin");

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Mi perfil</h1>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <dt className="text-neutral-500">Nombre</dt>
          <dd className="text-neutral-900">{user.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <dt className="text-neutral-500">Correo</dt>
          <dd className="text-neutral-900">{user.email ?? "—"}</dd>
        </div>
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <dt className="text-neutral-500">Miembro desde</dt>
          <dd className="text-neutral-900">
            {user.createdAt.toLocaleDateString("es-CR")}
          </dd>
        </div>
      </dl>

      {user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="mt-6 inline-block text-sm text-neutral-700 underline underline-offset-2"
        >
          Ir al panel de administración
        </Link>
      )}

      <div className="mt-10">
        <DeleteAccount />
      </div>
    </main>
  );
}
