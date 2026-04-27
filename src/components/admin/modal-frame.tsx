import type { ReactNode } from "react";

export function ModalFrame({
  title,
  description,
  children,
  maxWidth = "lg",
}: {
  title: string;
  description: string;
  children: ReactNode;
  maxWidth?: "lg" | "2xl";
}) {
  const widthClass = maxWidth === "2xl" ? "max-w-2xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className={`w-full ${widthClass} rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/15 sm:p-7`}>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}