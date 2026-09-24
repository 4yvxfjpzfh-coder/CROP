import { getSiteTexts } from "@/lib/site-text";
import { ForgotPasswordClient } from "./forgot-password-client";

export async function generateMetadata() {
  const t = await getSiteTexts();
  return { title: `${t["olvide.heading"]} — ${t["brand.name"]}` };
}

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const t = await getSiteTexts();
  return <ForgotPasswordClient texts={t} />;
}
