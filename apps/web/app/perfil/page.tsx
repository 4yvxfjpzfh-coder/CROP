import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteTexts } from "@/lib/site-text";
import { DeleteAccount } from "./delete-account";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [user, t] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, createdAt: true, role: true },
    }),
    getSiteTexts(),
  ]);

  if (!user) redirect("/signin");

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16">
      <Link
        href="/"
        className="inline-block bg-olive px-4 py-2 text-sm text-cream hover:opacity-90"
      >
        {t["nav.volver_inicio"]}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">{t["perfil.heading"]}</h1>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <dt className="text-neutral-500">{t["perfil.field_nombre"]}</dt>
          <dd className="text-neutral-900">{user.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <dt className="text-neutral-500">{t["perfil.field_correo"]}</dt>
          <dd className="text-neutral-900">{user.email ?? "—"}</dd>
        </div>
        <div className="flex justify-between border-b border-neutral-200 py-2">
          <dt className="text-neutral-500">{t["perfil.field_miembro_desde"]}</dt>
          <dd className="text-neutral-900">
            {user.createdAt.toLocaleDateString("es-CR")}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <Link href="/mis-apartados" className="text-neutral-700 underline underline-offset-2">
          {t["nav.mis_apartados"]}
        </Link>
        <Link href="/catalogo" className="text-neutral-700 underline underline-offset-2">
          {t["nav.ver_catalogo"]}
        </Link>
        {(user.role === "FARMER" || user.role === "ADMIN") && (
          <Link href="/agricultor" className="text-neutral-700 underline underline-offset-2">
            {t["nav.panel_agricultor"]}
          </Link>
        )}
        {user.role === "ADMIN" && (
          <Link href="/admin" className="text-neutral-700 underline underline-offset-2">
            {t["nav.panel_admin"]}
          </Link>
        )}
      </div>

      <form action={signOutAction} className="mt-6">
        <button
          type="submit"
          className="border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          {t["nav.cerrar_sesion"]}
        </button>
      </form>

      <div className="mt-10">
        <DeleteAccount texts={t} />
      </div>
    </main>
  );
}
