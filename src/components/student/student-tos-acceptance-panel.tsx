"use client";

import { useEffect, useRef, useState } from "react";

type StudentTosAcceptancePanelProps = {
  errorMessage: string | null;
  acceptAction: (formData: FormData) => void | Promise<void>;
  logoutAction: () => void | Promise<void>;
};

const SCROLL_THRESHOLD_PX = 8;

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
      <path d="m4.75 10.25 3.25 3.25 7.25-7.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StudentTosAcceptancePanel({
  errorMessage,
  acceptAction,
  logoutAction,
}: StudentTosAcceptancePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    const element = scrollContainerRef.current;

    if (!element) {
      return;
    }

    const syncScrollState = () => {
      const nextHasScrolled = element.scrollTop > SCROLL_THRESHOLD_PX;
      const nextHasReachedEnd =
        element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_THRESHOLD_PX;

      setHasScrolled((current) => (current === nextHasScrolled ? current : nextHasScrolled));
      setHasReachedEnd((current) => (current || !nextHasReachedEnd ? current : true));
    };

    syncScrollState();
    element.addEventListener("scroll", syncScrollState, { passive: true });

    return () => {
      element.removeEventListener("scroll", syncScrollState);
    };
  }, []);

  return (
    <div className="space-y-4 rounded-[30px] border border-slate-200 bg-linear-to-b from-white via-white to-orange-50/30 p-6 shadow-xl shadow-slate-900/5 sm:p-7">
      <form action={acceptAction} className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#fffaf6] shadow-inner shadow-orange-100/40 ring-1 ring-orange-100/70">
          <div
            ref={scrollContainerRef}
            className="max-h-100 overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="space-y-4 text-sm leading-7 text-slate-700">
              <div>
                <h3 className="font-semibold text-slate-900">ข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัว</h3>
                <p className="mt-2 text-xs text-slate-500">(Terms of Service & PDPA)</p>
              </div>

              <div className="space-y-3 border-t border-orange-100 pt-4">
                <div>
                  <h4 className="font-semibold text-slate-900">1. วัตถุประสงค์การเก็บรวบรวมข้อมูล</h4>
                  <p className="mt-2">
                    ระบบจะเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเพื่อใช้ในการบริหารจัดการข้อมูลนักศึกษาฝึกงาน การติดตามความคืบหน้า การประเมินผล และการประสานงานระหว่างมหาวิทยาลัยกับหน่วยงานภายนอกที่เกี่ยวข้องเท่านั้น
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">2. การใช้อีเมล (Email Usage)</h4>
                  <p className="mt-2">ระบบจะใช้ข้อมูลอีเมลของคุณ (@cmu.ac.th หรืออีเมลที่ลงทะเบียน) เพื่อวัตถุประสงค์ดังนี้:</p>
                  <ul className="mt-2 space-y-1 pl-4">
                    <li>• การยืนยันตัวตนเข้าสู่ระบบ (Authentication)</li>
                    <li>• การส่งการแจ้งเตือนสถานะการฝึกงาน (Status Notifications)</li>
                    <li>• การติดต่อสื่อสารและแจ้งข้อมูลสำคัญจากผู้ดูแลระบบ (Admin Contact)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">3. ระยะเวลาการจัดเก็บข้อมูล (10-Year Data Retention)</h4>
                  <p className="mt-2">
                    เพื่อให้เป็นไปตามมาตรฐานการตรวจสอบย้อนหลังและประวัติการศึกษา ระบบจะจัดเก็บข้อมูลส่วนบุคคล ข้อมูลการฝึกงาน และเอกสารแนบของคุณไว้อย่างปลอดภัยเป็นเวลา 10 ปี นับจากวันที่เสร็จสิ้นกระบวนการฝึกงาน หลังจากพ้นระยะเวลาดังกล่าว ระบบจะทำการทำลายข้อมูลหรือทำให้ข้อมูลไม่สามารถระบุตัวตนได้ (Anonymization)
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900">4. การยอมรับเงื่อนไข</h4>
                  <ul className="mt-2 space-y-2 pl-4">
                    <li>• คุณยืนยันว่าข้อมูลที่กรอกเป็นความจริงและเป็นปัจจุบัน</li>
                    <li>• สิทธิ์ในการแก้ไขข้อมูลจะถูกจำกัดตามสถานะการฝึกงาน (หากสถานะ 'เสร็จสิ้น' ระบบจะเป็นแบบอ่านอย่างเดียว)</li>
                    <li>• การเลื่อนอ่านจนจบและกดยอมรับ ถือว่าคุณยินยอมให้ระบบจัดการข้อมูลตามนโยบาย PDPA ที่ระบุไว้ข้างต้น</li>
                  </ul>
                </div>

                <div className="border-t border-orange-100 pt-4">
                  <p className="text-xs text-slate-500">
                    เมื่อคุณเลื่อนอ่านข้อความจนจบและดำเนินการต่อ จะถือว่าคุณได้อ่าน ทำความเข้าใจ และยอมรับเงื่อนไขการใช้งานสำหรับนักศึกษาเรียบร้อยแล้ว
                  </p>
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="space-y-5 rounded-[28px] bg-white/85 p-4 shadow-sm shadow-orange-100/40 ring-1 ring-orange-100/70 sm:p-5">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950">ยืนยันการใช้งาน</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      เลื่อนอ่านมาถึงส่วนนี้แล้ว ระบบจะทำเครื่องหมายยอมรับและเปิดปุ่มดำเนินการต่อให้อัตโนมัติเมื่อคุณถึงตอนท้ายของข้อความ
                    </p>
                  </div>

                  {hasReachedEnd ? <input type="hidden" name="accepted" value="yes" /> : null}

                  <div
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm transition duration-300 ${
                      hasReachedEnd
                        ? "border-orange-200 bg-orange-50 text-slate-800 shadow-sm shadow-orange-600/10"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                    aria-live="polite"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition duration-300 ${
                        hasReachedEnd
                          ? "scale-105 border-student bg-student text-white shadow-md shadow-orange-600/25"
                          : "border-slate-300 bg-white text-transparent"
                      }`}
                    >
                      <CheckIcon />
                    </span>
                    <span>
                      ฉันได้อ่านและยอมรับข้อตกลงการใช้งานสำหรับนักศึกษา และจะใช้งานระบบตามบทบาทและสถานะที่ระบบกำหนด
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={!hasReachedEnd}
                    className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-student px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition duration-300 hover:brightness-95 disabled:cursor-not-allowed disabled:bg-orange-200 disabled:text-white/80 disabled:shadow-none"
                  >
                    ยอมรับและดำเนินการต่อ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!hasScrolled && !hasReachedEnd ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-linear-to-t from-[#fffaf6] via-[#fffaf6]/95 to-transparent px-4 pb-4 pt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-student shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-student" />
                เลื่อนลงเพื่ออ่านเพิ่มเติม
              </div>
            </div>
          ) : null}
        </div>

      </form>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ออกจากระบบ
        </button>
      </form>
    </div>
  );
}