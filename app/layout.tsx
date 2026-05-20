import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { BarChart3, CloudUpload, Compass, Trophy, Wallet } from "lucide-react";
import { Providers, WalletConnect } from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnlyStans — Creator Economy, Reinvented",
  description: "Pay per second. No ads, no flat fees. USDC nanopayments on Arc Testnet.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#07070E",
};

const navLinks = [
  { href: "/",                  label: "Explore",    icon: Compass    },
  { href: "/leaderboard",       label: "Charts",     icon: Trophy     },
  { href: "/upload",            label: "Upload",     icon: CloudUpload },
  { href: "/wallet",            label: "Wallet",     icon: Wallet     },
  { href: "/creator/dashboard", label: "Studio",     icon: BarChart3  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} dark h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <div className="bg-ambient" aria-hidden />

        <Providers>
          {/* ── Nav ── */}
          <header className="sticky top-0 z-40 border-b border-white/[0.05]" style={{ background: "rgba(7,7,14,0.85)", backdropFilter: "blur(28px) saturate(1.8)" }}>
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">

              {/* Logo */}
              <Link href="/" className="group flex shrink-0 items-center gap-3">
                <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl transition group-hover:scale-105">
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #FF6B00, #FF3E9A)" }} />
                  <span className="relative font-black tracking-tighter text-white" style={{ fontSize: 12, fontFamily: "var(--font-syne)" }}>OS</span>
                </div>
                <div className="hidden sm:block">
                  <span className="block text-sm font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-syne)" }}>OnlyStans</span>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-orange-500/70">Creator Economy</span>
                </div>
              </Link>

              {/* Desktop nav */}
              <div className="hidden items-center gap-0.5 md:flex">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="nav-link">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Wallet */}
              <div className="shrink-0">
                <WalletConnect />
              </div>
            </nav>
          </header>

          {/* ── Page ── */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:py-10">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="mx-auto max-w-7xl border-t border-white/[0.04] px-5 py-6">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
                OnlyStans · Arc Testnet · USDC Nanopayments
              </p>
              <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-700">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500/60" />
                Powered by Circle · Pinata · Arc
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
