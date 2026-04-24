import { redirect } from "next/navigation";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getAuthenticatedRedirectPath(session));
}
