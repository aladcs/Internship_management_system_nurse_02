"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={joinClasses("border-b border-gray-100 last:border-b-0", className)}
      {...props}
    />
  );
});

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    accentClassName?: string;
    chevronClassName?: string;
  }
>(function AccordionTrigger(
  { className, children, accentClassName, chevronClassName, ...props },
  ref,
) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={joinClasses(
          "group flex flex-1 items-center justify-between gap-4 py-5 text-left transition focus-visible:outline-none focus-visible:ring-2",
          accentClassName ?? "hover:text-student focus-visible:ring-student/30",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className={joinClasses(
          "h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180",
          chevronClassName ?? "text-student",
        )} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={joinClasses(
        "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className,
      )}
      {...props}
    >
      <div className="pb-5">{children}</div>
    </AccordionPrimitive.Content>
  );
});

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };