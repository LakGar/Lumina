"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";
import { useLandingModals } from "./LandingModalsContext";
// Typed wrapper for untyped GlassSurface .jsx
import GlassSurfaceUntyped from "../GlassSurface";
const GlassSurface = GlassSurfaceUntyped as React.ComponentType<{
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  brightness?: number;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}>;
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home", section: null },
  { href: "/#features", label: "Features", section: "features" },
  { href: "/#how-it-works", label: "How it works", section: "how-it-works" },
  { href: "/#pricing", label: "Pricing", section: "pricing" },
  { href: "/blog", label: "Blog", section: null },
  { href: "/#contact", label: "Contact", section: "contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const modals = useLandingModals();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOverFeature, setIsOverFeature] = useState(false);
  const isHome = pathname === "/";
  const isBlogPage = pathname === "/blog" || pathname.startsWith("/blog/");
  const [isPastBlogHero, setIsPastBlogHero] = useState(false);
  const [isInLandingHero, setIsInLandingHero] = useState(true);

  const useDarkNav =
    isOverFeature ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    (isBlogPage && isPastBlogHero);
  const useLightNav =
    (isBlogPage && !isPastBlogHero) || (isHome && isInLandingHero);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
  }, [isHome, pathname]);

  useEffect(() => {
    const el = document.getElementById("features");
    if (!el) return;
    const check = () => {
      const top = el.getBoundingClientRect().top;
      setIsOverFeature(top <= 100);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    if (!isBlogPage) return;
    const check = () => {
      const heroHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      setIsPastBlogHero(window.scrollY >= heroHeight - 1);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [isBlogPage]);

  useEffect(() => {
    if (!isHome) return;
    const check = () => {
      const heroHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      setIsInLandingHero(window.scrollY < heroHeight - 1);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [isHome]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 80;

      if (currentScrollY < 20) {
        setVisible(true);
      } else if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > scrollThreshold
      ) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-5 left-0 right-0 z-50 transition-transform duration-300 ease-out",
          visible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8">
          <GlassSurface
            width="100%"
            height={56}
            borderRadius={28}
            brightness={82}
            opacity={0.82}
            className="flex min-h-14 items-center justify-between w-full pl-3 sm:px-5 md:px-6"
          >
            {/* Logo */}
            <Link
              href="/"
              className={cn(
                "font-heading flex-1 px-3 text-left text-lg font-medium tracking-tight transition-colors duration-300 ease-out sm:text-xl md:px-0",
                useLightNav && "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
                useDarkNav && !useLightNav && "text-black",
                !useLightNav && !useDarkNav && "text-foreground",
              )}
            >
              Lumina
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden flex-1 items-center justify-center gap-1 md:flex md:gap-2">
              {NAV_LINKS.map(({ href, label, section }) => {
                const isContact = label === "Contact";
                const handleSectionClick = (e: React.MouseEvent) => {
                  if (isContact && modals) {
                    e.preventDefault();
                    modals.openContactModal();
                    return;
                  }
                  if (section && isHome) {
                    e.preventDefault();
                    const el = document.getElementById(section);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                      window.history.replaceState(null, "", `#${section}`);
                    }
                  }
                };
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleSectionClick}
                    className={cn(
                      "font-body rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 ease-out hover:bg-white/10 hover:opacity-90",
                      useLightNav && "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
                      useDarkNav && !useLightNav && "text-black",
                      !useLightNav && !useDarkNav && "text-foreground hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA + Mobile menu */}
            <div className="flex items-center gap-2">
              <div className="sm:block">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => modals?.openWaitlistModal("nav")}
                  className={cn(
                    "font-body cursor-pointer rounded-full p-5 transition-all duration-300 ease-out hover:scale-105",
                    useLightNav &&
                      "border border-white/80 bg-white/10 text-white hover:bg-white/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
                    useDarkNav &&
                      !useLightNav &&
                      "bg-black text-white hover:bg-black/90",
                    !useLightNav &&
                      !useDarkNav &&
                      "bg-white text-black hover:bg-white",
                  )}
                >
                  Get The App
                </Button>
              </div>

              {/* <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden size-9 rounded-full"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-[min(320px,85vw)] flex-col gap-6 border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl"
                >
                  <SheetHeader>
                    <SheetTitle className="text-left text-lg font-semibold">
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-foreground/5"
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto pt-4">
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => setMobileOpen(false)}
                      asChild
                    >
                      <Link href="/">Get The App</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet> */}
            </div>
          </GlassSurface>
        </div>
      </header>
    </>
  );
};

export default Navbar;
