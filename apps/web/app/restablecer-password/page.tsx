import { getSiteTexts } from "@/lib/site-text";
import { ResetPasswordClient } from "./reset-password-client";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["restablecer.heading"]} — ${t["brand.name"]}` };
}

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getSiteTexts();
  return <ResetPasswordClient token={token ?? ""} texts={t} />;
}
