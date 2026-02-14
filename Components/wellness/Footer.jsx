import React, { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

export default function Footer({ theme }) {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const key = "serenity_device_visits";
    const v = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(v));
    setVisits(v);
  }, []);

  const digits = String(visits).padStart(6, "0").split("");

  return (
    <footer className={`border-t ${theme.border} py-20 px-8 md:px-24 transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto">
        {/* Main content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-light tracking-tight mb-2">Sreeshaktipat Ashram</h3>
            <p className={`text-[10px] tracking-[0.3em] ${theme.textMuted}`}>Where Consciousness Expands</p>
          </div>
          
          {/* Right side content */}
          <div className="flex flex-col items-center md:items-end gap-6">
            {/* Copyright */}
            <p className={`text-xs ${theme.textMuted}`}>© 2024 All Rights Reserved</p>
            
            {/* Social buttons - CENTERED below copyright */}
            <div className="flex gap-0">
              {[
                { name: "Instagram", href: "#", Icon: FaInstagram },
                { name: "Facebook", href: "#", Icon: FaFacebook },
                { name: "YouTube", href: "#", Icon: FaYoutube },
              ].map(({ name, href, Icon }, idx) => (
                <a
                  key={idx}
                  href={href}
                  aria-label={name}
                  className={`
                    w-12 h-12
                    border ${theme.border}
                    flex items-center justify-center
                    transition-all duration-300
                    hover:bg-[#c9a77c]/25
                  `}
                  style={{
                    marginLeft: idx === 0 ? 0 : "-1px",
                  }}
                >
                  <Icon className="w-5 h-5 opacity-70" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Visitor Counter - CENTERED AT BOTTOM */}
        <div className="flex flex-col items-center gap-3 pt-8 border-t border-stone-700/30">
          <p className="text-[10px] tracking-[0.35em] uppercase text-stone-500">
            Device Visits
          </p>

          <div className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-stone-700 bg-stone-950/60">
            {digits.map((d, i) => (
              <div
                key={i}
                className="w-8 h-10 rounded-lg border border-stone-700 bg-stone-900 flex items-center justify-center"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              >
                <span className="text-stone-200 text-lg">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
