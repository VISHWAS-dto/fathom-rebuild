"use client";

import Link from "next/link";

export type ToastData = { text: string; href?: string } | null;

export default function Toast({ toast }: { toast: ToastData }) {
  if (!toast) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white shadow-lg">
      <span>{toast.text}</span>
      {toast.href && (
        <Link href={toast.href} target="_blank" className="font-medium text-violet-300 underline-offset-2 hover:underline">
          Open
        </Link>
      )}
    </div>
  );
}
