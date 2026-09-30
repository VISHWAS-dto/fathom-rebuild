import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          Recap
        </Link>
        <span className="hidden text-xs text-stone-500 sm:block">AI meeting notes · demo with public Kubernetes SIG Release recordings</span>
      </div>
    </header>
  );
}
