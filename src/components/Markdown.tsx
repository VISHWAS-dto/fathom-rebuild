"use client";

import ReactMarkdown from "react-markdown";

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h2: (p) => <h2 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-stone-500 first:mt-0" {...p} />,
        p: (p) => <p className="my-2 text-[15px] leading-relaxed text-stone-800" {...p} />,
        ul: (p) => <ul className="my-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-stone-800" {...p} />,
        strong: (p) => <strong className="font-semibold text-stone-900" {...p} />,
        code: (p) => <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[13px]" {...p} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
