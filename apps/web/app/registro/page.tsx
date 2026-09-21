import { getSiteTexts } from "@/lib/site-text";
import { RegisterClient } from "./register-client";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const texts = await getSiteTexts();
  return <RegisterClient texts={texts} />;
}
