import type { InternshipStatus } from "@prisma/client";
import { formatInternshipStatusLabel } from "@/lib/internship-status";

type InternshipStatusStepperProps = {
  currentStatus: InternshipStatus;
  tone: "admin" | "student";
  className?: string;
};

type StepState = "upcoming" | "current" | "completed";

type StatusStep = {
  id: InternshipStatus;
  label: string;
};

const STATUS_STEPS: StatusStep[] = [
  { id: "draft", label: formatInternshipStatusLabel("draft") },
  { id: "pending", label: formatInternshipStatusLabel("pending") },
  { id: "needs_fix", label: formatInternshipStatusLabel("needs_fix") },
  { id: "in_progress", label: formatInternshipStatusLabel("in_progress") },
  { id: "completed", label: formatInternshipStatusLabel("completed") },
];

function getStepState(stepIndex: number, currentIndex: number): StepState {
  if (stepIndex < currentIndex) {
    return "completed";
  }

  if (stepIndex === currentIndex) {
    return "current";
  }

  return "upcoming";
}

function getToneClasses(tone: InternshipStatusStepperProps["tone"], state: StepState) {
  if (tone === "student") {
    if (state === "completed") {
      return {
        node: "border-orange-200 bg-(--color-student) text-white shadow-lg shadow-orange-600/20",
        line: "bg-(--color-student)",
        label: "text-slate-700",
        eyebrow: "text-orange-700",
      };
    }

    if (state === "current") {
      return {
        node: "border-orange-200 bg-white text-(--color-student) ring-4 ring-orange-100 shadow-lg shadow-orange-950/10",
        line: "bg-orange-200",
        label: "text-slate-950",
        eyebrow: "text-(--color-student)",
      };
    }

    return {
      node: "border-orange-100 bg-white/70 text-slate-400",
      line: "bg-orange-100/80",
      label: "text-slate-500",
      eyebrow: "text-slate-400",
    };
  }

  if (state === "completed") {
    return {
      node: "border-admin/20 bg-(--color-admin) text-white shadow-lg shadow-admin/20",
      line: "bg-(--color-admin)",
      label: "text-slate-700",
      eyebrow: "text-(--color-admin)",
    };
  }

  if (state === "current") {
    return {
      node: "border-admin/20 bg-white text-(--color-admin) ring-4 ring-admin/10 shadow-lg shadow-admin/10",
      line: "bg-admin/20",
      label: "text-slate-950",
      eyebrow: "text-(--color-admin)",
    };
  }

  return {
    node: "border-admin/10 bg-white/70 text-slate-400",
    line: "bg-admin/10",
    label: "text-slate-500",
    eyebrow: "text-slate-400",
  };
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
      <path d="m5.5 10 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InternshipStatusStepper({ currentStatus, tone, className }: InternshipStatusStepperProps) {
  const currentIndex = STATUS_STEPS.findIndex((step) => step.id === currentStatus);

  return (
    <section
      className={`rounded-[30px] border ${tone === "student" ? "border-orange-100/80 bg-white/55" : "border-admin/10 bg-white/60"} p-5 backdrop-blur-sm sm:p-6 ${className ?? ""}`}
      aria-label="ความคืบหน้าสถานะการฝึกงาน"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status timeline</p> */}
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">ติดตามความคืบหน้าการฝึกงาน</h2>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tone === "student" ? "bg-orange-50 text-orange-700 ring-1 ring-orange-100" : "bg-admin/8 text-(--color-admin) ring-1 ring-admin/10"}`}>
          {STATUS_STEPS.length} ขั้นตอน
        </span>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <ol className="flex min-w-max items-start gap-0">
          {STATUS_STEPS.map((step, index) => {
            const state = getStepState(index, currentIndex);
            const toneClasses = getToneClasses(tone, state);

            return (
              <li key={step.id} className="flex min-w-33 flex-1 items-start">
                <div className="flex w-full min-w-33 flex-col items-center text-center">
                  <div className="flex w-full items-center">
                    {index > 0 ? <span className={`h-1 flex-1 rounded-full ${getStepState(index - 1, currentIndex) === "upcoming" ? (tone === "student" ? "bg-orange-100/80" : "bg-admin/10") : toneClasses.line}`} /> : <span className="flex-1" />}
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition ${toneClasses.node}`}>
                      {state === "completed" ? <CheckIcon /> : index + 1}
                    </span>
                    {index < STATUS_STEPS.length - 1 ? <span className={`h-1 flex-1 rounded-full ${state === "upcoming" ? (tone === "student" ? "bg-orange-100/80" : "bg-admin/10") : toneClasses.line}`} /> : <span className="flex-1" />}
                  </div>

                  <div className="mt-4 max-w-35 space-y-1 px-2">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClasses.eyebrow}`}>
                      {state === "completed" ? "เสร็จแล้ว" : state === "current" ? "ปัจจุบัน" : "ถัดไป"}
                    </p>
                    <p className={`text-sm font-semibold leading-5 ${toneClasses.label}`}>{step.label}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}