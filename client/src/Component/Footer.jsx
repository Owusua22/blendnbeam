// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-8">
      {/* Top */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
          {/* Brand */}
          <div className="max-w-sm space-y-2 md:space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-md">
                <span className="text-[11px] md:text-xs font-bold text-white">
                  B&B
                </span>
              </div>
              <div>
                <p className="text-base md:text-lg font-semibold tracking-wide">
                  Blend &amp; Beam
                </p>
                <p className="text-[11px] md:text-xs text-slate-400">
                  Curated furniture &amp; salon essentials for modern spaces.
                </p>
              </div>
            </div>
            {/* Hide longer copy on very small screens */}
            <p className="hidden sm:block text-[11px] md:text-xs text-slate-400 leading-relaxed">
              Discover premium saloon chairs, combs, and accessories – all in one
              place. Designed to blend style with everyday function.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6 text-xs md:text-sm">
            <div>
              <h4 className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2 md:mb-3">
                Explore
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/new-arrivals"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shops"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Shops
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2 md:mb-3">
                Support
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/returns"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Returns &amp; Refunds
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
            <h4 className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Contact
            </h4>
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone size={13} className="md:w-4 md:h-4" />
                <span>+233 55 467 1026</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="md:w-4 md:h-4" />
                <span>info@blendandbeam.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="md:w-4 md:h-4" />
                <span>Accra, Ghana</span>
              </div>
            </div>

            <div className="pt-1 md:pt-2">
              <p className="text-[10px] md:text-xs text-slate-400 mb-1">
                Follow Blend &amp; Beam
              </p>
              <div className="flex items-center gap-1.5 md:gap-2">
                <a
                  href="#"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  aria-label="Blend & Beam on Facebook"
                >
                  <Facebook size={13} className="md:w-[15px] md:h-[15px] text-slate-200" />
                </a>
                <a
                  href="#"
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  aria-label="Blend & Beam on Instagram"
                >
                  <Instagram size={13} className="md:w-[15px] md:h-[15px] text-slate-200" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-2 md:py-3 flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-2 text-[10px] md:text-[11px] text-slate-500">
        <span className="text-center md:text-left">
          © {new Date().getFullYear()} Blend &amp; Beam. All rights reserved.
        </span>
        
      </div>
    </footer>
  );
};

export default Footer;