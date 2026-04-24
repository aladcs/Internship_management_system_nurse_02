import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { acceptStudentTosAction, logoutAction } from "@/app/intern/tos/actions";
import { clearSession, createSession, readSession } from "@/lib/auth/session";
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
    await clearSession();
    redirect("/login?cmu=student_profile_missing");
  }

  if (student.tosAcceptedAt) {
    if (!session.studentHasAcceptedTos) {
      await createSession({
        userId: session.userId,
        email: session.email,
        role: session.role,
        name: session.name,
        studentHasAcceptedTos: true,
      });
    }

    redirect("/intern/overview");
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
                <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                  กรุณายืนยันว่าคุณเข้าใจขอบเขตการใช้งานระบบจัดการฝึกงานก่อนเข้าสู่หน้า Overview และแบบฟอร์มของตนเอง
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-orange-950/8">
                <p className="text-sm font-semibold text-slate-900">{getStudentDisplayName(student)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{student.user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <section className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-950">ข้อตกลงการใช้งานสำหรับนักศึกษา</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  <p>คุณจะกรอก แก้ไข และอัปโหลดเฉพาะข้อมูลหรือเอกสารที่เกี่ยวข้องกับการฝึกงานของตนเองเท่านั้น</p>
                  <p>ข้อมูลที่บันทึกในระบบต้องถูกต้อง เป็นปัจจุบัน และพร้อมให้แอดมินตรวจสอบตามกระบวนการของคณะ</p>
                  <p>เมื่อสถานะการฝึกงานเป็นรอดำเนินการหรือกำลังดำเนินการ คุณยังแก้ไขข้อมูลได้ แต่เมื่อเป็นเสร็จสิ้น แบบฟอร์มจะเป็นแบบอ่านอย่างเดียว</p>
                  <p>การใช้งานระบบนี้ไม่ได้ให้สิทธิ์เข้าถึงข้อมูลของนักศึกษาคนอื่นหรือข้อมูลฝั่งผู้ดูแลระบบ</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-orange-100 bg-[#fff8f2] p-5 text-sm leading-6 text-slate-700 sm:p-6">
                <p className="font-semibold text-slate-900">สรุปสั้น ๆ</p>
                <p className="mt-2">
                  การกดยอมรับจะถูกบันทึกไว้ในระบบและใช้เป็นเงื่อนไขก่อนเข้าถึงหน้า Overview และแบบฟอร์มของนักศึกษาเป็นครั้งแรก
                </p>
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">ยืนยันการใช้งาน</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                โปรดอ่านข้อตกลงด้านซ้ายให้ครบถ้วนก่อนยืนยันการเข้าใช้งานในฐานะนักศึกษา
              </p>

              {errorMessage ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <form action={acceptStudentTosAction} className="mt-6 space-y-5">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="accepted"
                    value="yes"
                    required
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-(--color-student) focus:ring-(--color-student)"
                  />
                  <span>
                    ฉันได้อ่านและยอมรับข้อตกลงการใช้งานสำหรับนักศึกษา และจะใช้งานระบบตามบทบาทและสถานะที่ระบบกำหนด
                  </span>
                </label>

                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-(--color-student) px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-95"
                >
                  ยอมรับและดำเนินการต่อ
                </button>
              </form>

              <form action={logoutAction} className="mt-3">
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  ออกจากระบบ
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}