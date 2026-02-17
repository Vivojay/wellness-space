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
                    ${name === "Instagram" ? "hover:bg-[#4f5bd5]/30" : "hover:bg-[#c9a77c]/25"}
                    ${name === "Instagram" ? "group relative" : ""}
                  `}
                  style={{
                    marginLeft: idx === 0 ? 0 : "-1px",
                  }}
                >
                  {name === "Instagram" ? (
                    <span className="relative w-5 h-5">
                      <Icon className="w-5 h-5 opacity-70 transition-opacity duration-300 group-hover:opacity-0" />
                      <span
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          backgroundImage:
                            "linear-gradient(135deg, #feda75 0%, #fa7e1e 30%, #d62976 55%, #962fbf 75%, #4f5bd5 100%)",
                          WebkitMaskImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='white' d='M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z'/></svg>\")",
                          maskImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='white' d='M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9 114.9-51.3 114.9-114.9S287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.9 0-184.9zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z'/></svg>\")",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskPosition: "center",
                          maskPosition: "center"
                        }}
                      />
                    </span>
                  ) : (
                    <Icon className="w-5 h-5 opacity-70" />
                  )}
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
