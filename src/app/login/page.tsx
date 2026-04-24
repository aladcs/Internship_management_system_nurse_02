import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { CMU_ENTRA_LOGIN_PATH, isCmuEntraConfigured } from "@/lib/auth/cmu-entra";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { clearSession, createSession, readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const statusChips = [
  {
    label: "การเข้าถึงบัญชี",
    value: "ฝั่งเซิร์ฟเวอร์",
    accent: "text-sky-700",
  },
  {
    label: "เส้นทางตามสิทธิ์",
    value: "อัตโนมัติ",
    accent: "text-[color:var(--color-admin)]",
  },
  {
    label: "ขั้นตอนนักศึกษา",
    value: "ปลอดภัย",
    accent: "text-emerald-700",
  },
] as const;

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ระบบจัดการฝึกงาน",
  description: "เข้าสู่ระบบเพื่อใช้งานระบบจัดการฝึกงาน",
};

const CMU_LOGIN_ERRORS: Record<string, string> = {
  not_configured: "ยังไม่ได้ตั้งค่าการเข้าสู่ระบบ CMU Entra สำหรับสภาพแวดล้อมนี้",
  access_denied: "การเข้าสู่ระบบ CMU ถูกยกเลิกก่อนตรวจสอบบัญชีสำเร็จ",
  invalid_state: "ไม่สามารถยืนยันการเข้าสู่ระบบ CMU ได้ กรุณาลองใหม่อีกครั้ง",
  token_failed: "การเข้าสู่ระบบ CMU ไม่สามารถแลกเปลี่ยนโทเค็นได้สำเร็จ",
  userinfo_failed: "ไม่สามารถอ่านข้อมูลโปรไฟล์บัญชี CMU ของคุณได้",
  email_not_allowed: "บัญชี CMU นี้ไม่มีสิทธิ์เข้าใช้งานระบบฝึกงาน",
  callback_failed: "การเข้าสู่ระบบ CMU ส่งผลลัพธ์กลับมาไม่ถูกต้อง",
  student_profile_missing: "บัญชีนักศึกษานี้มีข้อมูลโปรไฟล์ไม่ครบถ้วน กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return typeof value === "string" ? value : null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await readSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const cmuErrorCode = readSearchParam(resolvedSearchParams, "cmu");
  const nextPath = readSearchParam(resolvedSearchParams, "next");
  let initialError = cmuErrorCode ? CMU_LOGIN_ERRORS[cmuErrorCode] ?? null : null;

  const cmuLoginHref = (() => {
    if (!nextPath) {
      return CMU_ENTRA_LOGIN_PATH;
    }

    const loginUrl = new URL(CMU_ENTRA_LOGIN_PATH, "http://localhost");
    loginUrl.searchParams.set("next", nextPath);

    return `${loginUrl.pathname}${loginUrl.search}`;
  })();

  if (session) {
    if (session.role === "student") {
      const studentProfile = await prisma.student.findUnique({
        where: {
          userId: session.userId,
        },
        select: {
          id: true,
          tosAcceptedAt: true,
        },
      });

      if (!studentProfile) {
        await clearSession();
        initialError ??= CMU_LOGIN_ERRORS.student_profile_missing;
      } else {
        const studentHasAcceptedTos = Boolean(studentProfile.tosAcceptedAt);

        if (studentHasAcceptedTos !== Boolean(session.studentHasAcceptedTos)) {
          await createSession({
            userId: session.userId,
            email: session.email,
            role: session.role,
            name: session.name,
            studentHasAcceptedTos,
          });
        }

        redirect(
          getAuthenticatedRedirectPath({
            role: session.role,
            studentHasAcceptedTos,
          }),
        );
      }
    } else {
      redirect(getAuthenticatedRedirectPath(session));
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <Image
                src="/nurse_logo.svg"
                alt="ระบบจัดการฝึกงาน"
                width={32}
                height={32}
                priority
              />
            </div>
            <div className="text-sm leading-5 text-slate-600">
              <p className="font-semibold uppercase tracking-[0.18em] text-(--color-admin)">
                ระบบ
              </p>
              <p className="font-medium text-slate-700">จัดการฝึกงาน</p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-12">
            <LoginForm
              initialError={initialError}
              cmuLoginEnabled={isCmuEntraConfigured()}
              cmuLoginHref={cmuLoginHref}
              nextPath={nextPath}
            />
          </div>

          <p className="text-center text-sm text-slate-500">
            © 2026 ระบบจัดการฝึกงาน สงวนลิขสิทธิ์
          </p>
        </section>

        <aside className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#a86ca8_0%,#d7927a_58%,#f4c58f_100%)]" />
          <div className="absolute left-[-12%] top-[10%] h-72 w-72 rounded-full bg-white/14 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-8%] h-80 w-80 rounded-full bg-[#fff2df]/30 blur-3xl" />

          <div className="relative z-10 flex flex-1 flex-col justify-between px-14 py-14 text-white">
            <div className="flex justify-end">
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur">
                พยาบาลศาสตร์ CMU
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/14 shadow-lg shadow-black/10 ring-1 ring-white/20 backdrop-blur-sm">
                <Image
                  src="/nurse_logo.svg"
                  alt="โลโก้พยาบาล"
                  width={60}
                  height={60}
                  priority
                />
              </div>

              <div className="max-w-xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white/80">
                  การเข้าถึงตามสิทธิ์อย่างปลอดภัย
                </p>
                <h2 className="text-4xl font-semibold leading-tight tracking-tight text-balance xl:text-5xl">
                  จุดเข้าสู่ระบบเดียวสำหรับ super admin, admin และนักศึกษา
                </h2>
                <p className="max-w-lg text-base leading-7 text-white/82 xl:text-lg">
                  อนุญาตเฉพาะบัญชีที่มีอยู่ในฐานข้อมูล พร้อมเส้นทางการใช้งานที่แยกตามบทบาทสำหรับกระบวนการฝึกงาน
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {statusChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="rounded-3xl border border-white/15 bg-white/14 p-4 backdrop-blur-md"
                  >
                    <p className="text-sm text-white/70">{chip.label}</p>
                    <p className={`mt-2 text-lg font-semibold ${chip.accent}`}>
                      {chip.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm leading-6 text-white/70">
              กระบวนการฝึกงานทั้งหมดถูกจำกัดตามบทบาท และพร้อมสำหรับการป้องกันเส้นทางการใช้งาน
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}