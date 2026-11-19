import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Shell({ title, subtitle, name, detail, links, children }: {
  title: string;
  subtitle: string;
  name: string;
  detail: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-teal-600 font-bold px-2 py-1 rounded">MP</span>
            <div>
              <p className="font-bold leading-none">M-Park</p>
              <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800">
              {l.label}
            </Link>
          ))}
          <Link href="/" className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800">Home</Link>
          <LogoutButton />
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm">
          <p className="text-slate-400 text-xs">Logged in as</p>
          <p className="font-semibold">{name}</p>
          <p className="text-slate-400 text-xs">{detail}</p>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="mt-5">{children}</div>
      </main>
    </div>
  );
}
