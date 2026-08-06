import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.04] bg-[#030305] pt-16 pb-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 group inline-flex"
            >
              <div className="relative w-8 h-8 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-lg flex items-center justify-center ">
                <span className="relative text-black font-black text-sm">
                  C
                </span>
              </div>
              <span className="text-xl font-space font-bold text-white tracking-tight">
                Cric<span className="text-primary">Intel</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              Your smart cricket assistant. We use AI to predict the best Playing XI, show head-to-head records, and give you real-time win predictions.
            </p>
            <div className="flex gap-4">
              <a
                href="https://google.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com/cricintel"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com/company/cricintel"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4 font-space">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/app/prediction"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  AI Predictor
                </Link>
              </li>
              <li>
                <Link
                  to="/app/analytics"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  Analytics Hub
                </Link>
              </li>
              <li>
                <Link
                  to="/app/matchups"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  H2H Matchups
                </Link>
              </li>
              <li>
                <Link
                  to="/app/venues"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  Venue Intel
                </Link>
              </li>
              <li>
                <Link
                  to="/app/fixtures"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  Global Fixtures
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 font-space">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/app/about"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                >
                  API Access <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  Methodology
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} CricIntel. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
