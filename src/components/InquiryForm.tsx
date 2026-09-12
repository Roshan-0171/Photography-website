"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import { submitInquiry } from "@/app/contact/actions";
import { BUDGETS, FIELD_LABELS, SHOOT_TYPES, emptyInquiry } from "@/data/inquiry";
import { site } from "@/data/site";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function InquiryForm({ defaultShootType = "" }: { defaultShootType?: string }) {
  const [state, formAction, pending] = useActionState(submitInquiry, emptyInquiry);
  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    email: "",
    shootType: defaultShootType,
    date: "",
    flexible: "",
    budget: "",
    message: "",
  });
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);

  // Keep our state in step with whatever the server echoed back.
  const [lastResult, setLastResult] = useState(state);
  if (state !== lastResult) {
    setLastResult(state);
    setValues((v) => ({ ...v, ...state.values }));
  }

  const flexible = values.flexible === "on";

  const id = (n: string) => `${uid}-${n}`;
  const errorId = (n: string) => `${uid}-${n}-error`;
  const hintId = (n: string) => `${uid}-${n}-hint`;
  const errs = state.errors;
  const errorList = Object.entries(errs);

  // React 19 resets a form's DOM after its action completes. A <select> loses its
  // visible choice that way and never gets it back, because React will not write
  // an unchanged value prop back to the node. Re-applying the values here — after
  // the commit, against the live DOM — puts the shoot type and budget back, so a
  // failed submit never silently throws away what the visitor already chose.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    for (const [name, value] of Object.entries(values)) {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement && el.type === "checkbox") {
        const checked = value === "on";
        if (el.checked !== checked) el.checked = checked;
      } else if (
        el instanceof HTMLSelectElement ||
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement
      ) {
        if (el.value !== value) el.value = value;
      }
    }
  }, [state, values]);

  // Move focus to whichever outcome the submit produced, so a keyboard or
  // screen-reader user is never left guessing whether anything happened.
  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "failed") failedRef.current?.focus();
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="border border-fg p-8"
      >
        <CircleCheck className="size-6 text-fg" aria-hidden="true" />
        <h2 className="mt-6 text-2xl">Thank you — that&rsquo;s with me.</h2>
        <p className="mt-2 max-w-prose text-muted-fg">
          I read every enquiry myself and reply within two working days, usually
          sooner. If the date you named is already booked I&rsquo;ll say so
          straight away and suggest the nearest one I have.
        </p>
      </div>
    );
  }

  const field = (name: string) => ({
    id: id(name),
    name,
    value: values[name] ?? "",
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => setValues((v) => ({ ...v, [name]: e.target.value })),
    "aria-invalid": errs[name] ? (true as const) : undefined,
    "aria-describedby":
      [errs[name] ? errorId(name) : null, hintId(name)].filter(Boolean).join(" ") ||
      undefined,
    className: `mt-2 w-full min-w-0 border bg-bg px-4 py-3 text-base text-fg transition-colors duration-200 ${
      errs[name] ? "border-destructive" : "border-field hover:border-fg"
    }`,
  });

  return (
    <form ref={formRef} action={formAction} noValidate className="max-w-2xl">
      {state.status === "failed" && (
        <div
          ref={failedRef}
          role="alert"
          tabIndex={-1}
          className="mb-12 border border-destructive p-6"
        >
          <h2 className="flex items-center gap-2 text-base font-medium text-destructive">
            <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
            This enquiry did not go through
          </h2>
          <p className="mt-2 max-w-prose text-sm">{state.message}</p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent("Shoot enquiry")}`}
              className="font-medium underline underline-offset-4"
            >
              {site.email}
            </a>
          </p>
          <p className="mt-2 max-w-prose text-sm text-muted-fg">
            What you typed is still in the form below — copy it across, or try
            sending again.
          </p>
        </div>
      )}

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="mb-12 border border-destructive p-6"
        >
          <h2 className="flex items-center gap-2 text-base font-medium text-destructive">
            <CircleAlert className="size-5 shrink-0" aria-hidden="true" />
            {errorList.length === 1
              ? "One field needs attention"
              : `${errorList.length} fields need attention`}
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {errorList.map(([name, msg]) => (
              <li key={name}>
                <a href={`#${id(name)}`} className="underline underline-offset-4">
                  {FIELD_LABELS[name] ?? name}
                </a>
                : {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="min-w-0">
          <FieldLabel htmlFor={id("name")}>Your name</FieldLabel>
          <input
            {...field("name")}
            type="text"
            autoComplete="name"
            required
          />
          <span id={hintId("name")} className="sr-only">
            Required.
          </span>
          <FieldError id={errorId("name")} message={errs.name} />
        </div>

        <div className="min-w-0">
          <FieldLabel htmlFor={id("email")}>Email</FieldLabel>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            required
          />
          <p id={hintId("email")} className="mt-2 text-sm text-muted-fg">
            This is the only way I&rsquo;ll reply.
          </p>
          <FieldError id={errorId("email")} message={errs.email} />
        </div>

        <div className="min-w-0">
          <FieldLabel htmlFor={id("shootType")}>Kind of shoot</FieldLabel>
          <select
            {...field("shootType")}
            required
          >
            <option value="">Choose one…</option>
            {SHOOT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span id={hintId("shootType")} className="sr-only">
            Required. Pick the closest match.
          </span>
          <FieldError id={errorId("shootType")} message={errs.shootType} />
        </div>

        <div className="min-w-0">
          <FieldLabel htmlFor={id("date")}>Preferred date</FieldLabel>
          <input {...field("date")} type="date" disabled={flexible} />
          <p id={hintId("date")} className="mt-2 text-sm text-muted-fg">
            Optional. If you only know roughly when, pick any day in that month.
          </p>
          {/* The genuinely-optional path: a positive way to say "no date yet",
              rather than leaving the field blank and hoping it reads as such.
              A plain checkbox with no JavaScript dependency — the server decides
              what the value means either way. */}
          <label
            htmlFor={id("flexible")}
            className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-muted-fg"
          >
            <input
              id={id("flexible")}
              name="flexible"
              type="checkbox"
              checked={flexible}
              onChange={(e) =>
                setValues((v) => ({ ...v, flexible: e.target.checked ? "on" : "" }))
              }
              className="size-4 shrink-0 accent-fg"
            />
            I&rsquo;m flexible — no date in mind yet
          </label>
          <FieldError id={errorId("date")} message={errs.date} />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <FieldLabel htmlFor={id("budget")}>Budget range</FieldLabel>
          <select {...field("budget")} required>
            <option value="">Choose one…</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <p id={hintId("budget")} className="mt-2 text-sm text-muted-fg">
            Prices are listed in full on the services page — this just tells me
            which conversation we&rsquo;re having.
          </p>
          <FieldError id={errorId("budget")} message={errs.budget} />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <FieldLabel htmlFor={id("message")}>About the shoot</FieldLabel>
          <textarea
            {...field("message")}
            rows={6}
            required
          />
          <p id={hintId("message")} className="mt-2 text-sm text-muted-fg">
            Who it&rsquo;s for, where you imagine it, and what you want it to
            feel like. Two sentences is plenty.
          </p>
          <FieldError id={errorId("message")} message={errs.message} />
        </div>
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={id("company")}>Company (leave blank)</label>
        <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-12 inline-flex cursor-pointer items-center gap-2 bg-fg px-7 py-3.5 text-base text-bg transition-colors duration-200 hover:bg-secondary active:bg-secondary disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
