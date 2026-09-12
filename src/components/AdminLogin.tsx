"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";

import { signIn, type LoginState } from "@/app/admin/actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="max-w-sm">
      <label htmlFor="admin-password" className="block text-sm font-medium text-fg">
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "admin-password-error" : undefined}
        className={`mt-2 w-full min-w-0 border bg-bg px-4 py-3 text-base text-fg ${
          state.error ? "border-destructive" : "border-field hover:border-fg"
        }`}
      />
      {state.error && (
        <p
          id="admin-password-error"
          role="alert"
          className="mt-2 flex items-start gap-2 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex cursor-pointer items-center gap-2 bg-fg px-7 py-3.5 text-base text-bg transition-colors duration-200 hover:bg-secondary disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
