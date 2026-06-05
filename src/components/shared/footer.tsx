import Link from "next/link";
import { Logo } from "./logo";
import { Heart } from "lucide-react";

const LINKS = {
  Product: [
    { label: "How it works", href: "/how-it-works" },
    { label: "Charities", href: "/charities" },
    { label: "Pricing", href: "/pricing" },
    { label: "Draw results", href: "/draws" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy policy", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Cookie policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-14">
        {/* Top section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A modern subscription where every score you enter helps fund the charity you love —
              and gives you a shot at winning real prizes each month.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>Charity-first, always.</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <p className="text-sm font-semibold">{title}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Fairway. All rights reserved.</p>
          <p>
            Built for good.{" "}
            <span className="text-foreground font-medium">Play with purpose.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
