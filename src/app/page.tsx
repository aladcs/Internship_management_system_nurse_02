import { redirect } from "next/navigation";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getRoleRedirectPath(session.role));
}
