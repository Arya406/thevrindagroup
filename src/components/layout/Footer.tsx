import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Mail, Phone, MapPin, Award } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="w-full bg-dark-navy text-white/80 border-t border-border-default/10 font-sans">
      {/* Top Value Assurance Banner */}
      <div className="border-b border-white/10 bg-primary-navy/40 py-6">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white">100% Verified Properties</p>
                <p className="text-white/60">Strict diligence on all platform listings</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white">Zero Brokerage Option</p>
                <p className="text-white/60">Connect directly with verified owners</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white">Dedicated Support</p>
                <p className="text-white/60">Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white">No Spam Guarantee</p>
                <p className="text-white/60">Your contact info remains protected</p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-sm">
          {/* Brand & About */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-accent-gold/40 bg-white shadow-soft-xs flex items-center justify-center shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="TheVrindaGroup Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans">
                TheVrindaGroup
              </span>
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              TheVrindaGroup is India’s premier verified real-estate marketplace. Connecting
              home buyers, tenants, and commercial investors with genuine property
              owners and trusted top developers.
            </p>
            <div className="space-y-1.5 text-xs text-white/60 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-accent-gold shrink-0" />
                DLF Cyber City, Tower B, Gurugram / Mumbai MMR / Bangalore
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent-gold shrink-0" />
                contact@thevrindagroup.com
              </p>
            </div>
          </div>

          {/* Buy */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Buy Property</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Flats in Mumbai
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Flats in Bangalore
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Flats in Delhi NCR
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Plots in Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Luxury Villas
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Ready to Move
                </Link>
              </li>
            </ul>
          </div>

          {/* Rent & Commercial */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Rent & Commercial</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Apartments for Rent
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Furnished Homes
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Commercial Offices
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Retail Shops
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Co-working Spaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Popular Cities</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Mumbai MMR
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Bengaluru
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Delhi NCR / Gurugram
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Pune
                </Link>
              </li>
              <li>
                <Link href="/#featured-properties" className="hover:text-accent-gold transition-colors">
                  Chennai
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Company & Trust</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#why-thevrindagroup" className="hover:text-accent-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#why-thevrindagroup" className="hover:text-accent-gold transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/#why-thevrindagroup" className="hover:text-accent-gold transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/#why-thevrindagroup" className="hover:text-accent-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/#why-thevrindagroup" className="hover:text-accent-gold transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/#why-thevrindagroup" className="hover:text-accent-gold transition-colors">
                  RERA Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/50 space-y-3">
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> TheVrindaGroup is an online advertising and property
            discovery marketplace. All property prices, sizes, and possession timelines
            are provided directly by verified property owners and developers. Prospective
            buyers are advised to verify RERA certificates on respective state RERA
            official portals (MahaRERA, RERA Karnataka, HRERA, TSRERA, etc.) prior to
            purchase.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <p>© {new Date().getFullYear()} TheVrindaGroup Real Estate India Pvt. Ltd. All rights reserved.</p>
            <p className="text-white/40">Crafted with precision for Indian Real Estate.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
