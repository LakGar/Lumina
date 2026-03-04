"use client";

import { useLandingModals } from "@/components/landing/LandingModalsContext";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  const modals = useLandingModals();

  return (
    <footer
      className="py-16 md:py-20 lg:py-24"
      style={{ backgroundColor: "#F5F3EF" }}
    >
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <div>
            <a
              href="/"
              className="flex items-center gap-3"
              aria-label={brandName}
            >
              {logo}
              <span
                className="font-heading text-xl font-medium"
                style={{ color: "#1E1E1E" }}
              >
                {brandName}
              </span>
            </a>
            <p
              className="mt-4 max-w-xs text-sm leading-relaxed"
              style={{ color: "#6B6B6B" }}
            >
              A quiet space for your loudest thoughts.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav>
              <p
                className="mb-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "#6B6B6B" }}
              >
                Explore
              </p>
              <ul className="flex flex-col gap-2">
                {mainLinks.map((link) => (
                  <li key={link.label}>
                    {link.label === "Contact" && modals ? (
                      <button
                        type="button"
                        onClick={() => modals.openContactModal()}
                        className="text-left text-sm transition hover:opacity-80"
                        style={{ color: "#1E1E1E" }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm transition hover:opacity-80"
                        style={{ color: "#1E1E1E" }}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <nav>
              <p
                className="mb-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "#6B6B6B" }}
              >
                Legal
              </p>
              <ul className="flex flex-col gap-2">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition hover:opacity-80"
                      style={{ color: "#1E1E1E" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-3">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "#6B6B6B" }}
              >
                Connect
              </p>
              <ul className="flex gap-3">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-9 items-center justify-center rounded-full transition hover:opacity-80"
                      style={{ backgroundColor: "rgba(30, 30, 30, 0.08)" }}
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="mt-12 border-t pt-8"
          style={{ borderColor: "rgba(30, 30, 30, 0.08)" }}
        >
          <p className="text-sm" style={{ color: "#6B6B6B" }}>
            {copyright.text}
          </p>
          {copyright.license && (
            <p className="mt-1 text-sm" style={{ color: "#6B6B6B" }}>
              {copyright.license}
            </p>
          )}
          <p className="mt-3 text-sm" style={{ color: "#6B6B6B" }}>
            Powered by{" "}
            <a
              href="https://TheEmpowerWeb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition hover:opacity-80"
              style={{ color: "#1E1E1E" }}
            >
              Empower
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
