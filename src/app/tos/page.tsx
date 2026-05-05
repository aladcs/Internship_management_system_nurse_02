import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { acceptStudentTosAction, logoutAction } from "@/app/tos/actions";
import { StudentTosAcceptancePanel } from "@/components/student/student-tos-acceptance-panel";
import { withAppBasePath } from "@/lib/app-paths";
import { readSession } from "@/lib/auth/session";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "ข้อตกลงการใช้งานนักศึกษา | ระบบจัดการฝึกงาน",
  description: "นักศึกษาต้องยอมรับข้อตกลงการใช้งานก่อนเข้าใช้งานครั้งแรก",
};

const ERROR_MESSAGES: Record<string, string> = {
  accept_required: "กรุณาอ่านและยอมรับข้อตกลงก่อนเข้าสู่ระบบนักศึกษา",
};

type TosPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return typeof value === "string" ? value : null;
}

function getStudentDisplayName(student: {
  firstName: string | null;
  lastName: string | null;
  user: {
    name: string | null;
    email: string;
  };
}) {
  const profileName = [student.firstName, student.lastName].filter(Boolean).join(" ").trim();

  return student.user.name?.trim() || profileName || student.user.email;
}

function buildSessionSyncHref(nextPath: string) {
  const syncUrl = new URL(withAppBasePath("/auth/session/sync"), "http://localhost");
  syncUrl.searchParams.set("next", nextPath);

  return `${syncUrl.pathname}${syncUrl.search}`;
}

export default async function InternStudentTosPage({ searchParams }: TosPageProps) {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    redirect(getAuthenticatedRedirectPath(session));
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const errorCode = readSearchParam(resolvedSearchParams, "error");
  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      tosAcceptedAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!student) {
    redirect(buildSessionSyncHref("/login?cmu=student_profile_missing"));
  }

  if (student.tosAcceptedAt) {
    redirect(buildSessionSyncHref("/overview"));
  }

  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] ?? null : null;

  return (
    <main className="min-h-screen bg-[#fff7f1] px-4 py-8 text-slate-950 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[36px] border border-orange-100 bg-white shadow-xl shadow-orange-950/8">
          <div className="border-b border-orange-100 bg-linear-to-br from-[#fff1e5] via-[#fff8f3] to-[#ffe9db] px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-student)">
                  เข้าใช้งานครั้งแรก
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  ยอมรับข้อตกลงก่อนเข้าใช้งานในฐานะนักศึกษา
                </h1>
               
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-orange-950/8">
                <p className="text-sm font-semibold text-slate-900">{getStudentDisplayName(student)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{student.user.email}</p>
              </div>
            </div>
          </div>

          <StudentTosAcceptancePanel
            errorMessage={errorMessage}
            acceptAction={acceptStudentTosAction}
            logoutAction={logoutAction}
          />
        </div>
      </div>
    </main>
  );
}
