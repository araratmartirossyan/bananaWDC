import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getCookieName,
  parseCookieToken,
  verifySessionToken,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(getCookieName())?.value;
  const token = parseCookieToken(raw ?? undefined);
  if (!token || !verifySessionToken(token)) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
