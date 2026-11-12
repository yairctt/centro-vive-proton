"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChartIcon, StoreIcon, QrCodeIcon, HomeIcon } from "./icons";

export function PanelHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Tablero Admin", icon: BarChartIcon },
    { href: "/comercio", label: "Mi Comercio", icon: StoreIcon },
    { href: "/escanear", label: "Lector QR", icon: QrCodeIcon },
    { href: "/", label: "Inicio", icon: HomeIcon },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-xs transition group-hover:scale-105">
            <span className="text-sm font-black tracking-wider">PJ</span>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
              Pulso Jarocho
            </span>
            <span className="ml-2 hidden rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200 sm:inline-block dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800">
              Centro Histórico
            </span>
          </div>
        </Link>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-teal-700 text-white shadow-2xs dark:bg-teal-600"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-500 dark:text-neutral-400"}`} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

