import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{SITE_NAME}</h1>
      <p className="mt-3 max-w-prose text-lg text-foreground/70">
        {SITE_DESCRIPTION}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/clasico"
          className="rounded-full bg-foreground px-5 py-3 font-medium text-background"
        >
          Jugar al modo Clásico
        </Link>
        <Link
          href="/como-jugar"
          className="rounded-full border border-foreground/20 px-5 py-3 font-medium"
        >
          Cómo jugar
        </Link>
      </div>
    </div>
  );
}
