import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BarChart3, CloudUpload, Compass, Trophy, Wallet } from "lucide-react";
import { Providers, WalletConnect } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnlyStans — Pay Per Second",
  description: "Pay-per-second decentralised creator monetisation on Arc Testnet. No ads, no subscriptions.",
  manifest: "/manifest.json",
};

const navLinks = [
  { href: "/",                  label: "Feed",        icon: Compass   },
  { href: "/leaderboard",       label: "Charts",      icon: Trophy    },
  { href: "/upload",            label: "Upload",      icon: CloudUpload },
  { href: "/wallet",            label: "Wallet",      icon: Wallet    },
  { href: "/creator/dashboard", label: "Dashboard",   icon: BarChart3 },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        {/* Ambient background — lives outside Providers so it's always rendered */}
        <div className="bg-ambient" aria-hidden />

        <Providers>
          {/* ── Nav ── */}
          <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#060609]/75 backdrop-blur-2xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">

              {/* Logo */}
              <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                <div className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg transition group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700" />
                  <span className="relative font-black tracking-tighter text-zinc-950" style={{ fontSize: 11 }}>OS</span>
                </div>
                <span className="text-sm font-bold tracking-tight text-white">OnlyStans</span>
              </Link>

              {/* Desktop pill nav */}
              <div className="hidden items-center gap-0.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1 text-sm text-zinc-500 md:flex">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition hover:bg-white/[0.07] hover:text-zinc-200"
                  >
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

          {/* ── Page content ── */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-10">
            {children}
          </main>

          {/* ── Footer ── */}
          <footer className="mx-auto max-w-7xl border-t border-white/[0.05] px-4 py-6">
            <p className="text-center font-mono text-xs text-zinc-700">
              OnlyStans · Arc Testnet · USDC per second · sponsored gas via Paymaster
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
