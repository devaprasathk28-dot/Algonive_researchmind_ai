"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-zinc-550 font-bold tracking-tight">
      <Link href="/dashboard" className="hover:text-zinc-350 transition">
        Console
      </Link>
      {paths.map((path, idx) => {
        const route = `/${paths.slice(0, idx + 1).join("/")}`;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
        const isLast = idx === paths.length - 1;

        return (
          <div key={route} className="flex items-center space-x-1.5">
            <span className="text-zinc-700">/</span>
            {isLast ? (
              <span className="text-zinc-200 truncate max-w-[200px]" aria-current="page">
                {label}
              </span>
            ) : (
              <Link href={route} className="hover:text-zinc-350 transition truncate max-w-[200px]">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
