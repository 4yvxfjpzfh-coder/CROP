import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";
import { getSiteTexts } from "@/lib/site-text";
import { linkifyText } from "@/components/linkify-text";
import { confirmConsent } from "./actions";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [user, t] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { consentedAt: true, name: true },
    }),
    getSiteTexts(),
  ]);

  if (user?.consentedAt) redirect("/");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">
        {t["welcome.heading"]}{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="text-sm leading-relaxed text-neutral-700">
        {linkifyText(t["welcome.body"], [
          { label: t["footer.privacidad"], href: "/privacy" },
          { label: t["footer.terminos"], href: "/terms" },
        ])}
      </p>

      <form action={confirmConsent}>
        <button
          type="submit"
          className="h-11 w-full rounded-md bg-neutral-900 px-4 text-[15px] font-medium text-white hover:opacity-90"
        >
          {t["welcome.accept"]}
        </button>
      </form>

      <Link
        href="/api/auth/signout"
        className="text-center text-xs text-neutral-500 underline underline-offset-2"
      >
        {t["welcome.decline"]}
      </Link>
    </main>
  );
}
