import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Heart } from "lucide-react";

export default function DonatePage() {
  const { theme } = useOutletContext();

  useEffect(() => {
    const scrollContainer = document.getElementById("app-scroll");
    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 2) {
      scrollContainer.scrollTo({ top: 0, left: 0 });
      return;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <section
      className="min-h-screen px-4 sm:px-6 md:px-24 pt-24 md:pt-32 pb-16 md:pb-24 relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg.primary, color: theme.text }}
    >
      <div
        className="absolute -left-20 top-24 w-[140%] h-16 rotate-[-10deg] z-0"
        style={{
          background: `linear-gradient(90deg, ${theme.accent}20, ${theme.accent}66, ${theme.accent}20)`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p
          className="text-[11px] tracking-[0.4em] uppercase"
          style={{ color: theme.textMuted }}
        >
          Donate
        </p>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mt-6"
          style={{ color: theme.text }}
        >
          Support the Lineage
        </h1>

        <p
          className="mt-6 text-sm sm:text-base leading-relaxed"
          style={{ color: theme.textSecondary }}
        >
          Your contribution supports teachings, retreats, and the preservation of
          the Shaktipat lineage. Every offering helps us reach seekers across the
          world.
        </p>

        <div
          className="mt-10 sm:mt-12 max-w-xs sm:max-w-md mx-auto border p-5 sm:p-8"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.colors.bg.card,
            boxShadow: "0 22px 60px rgba(0, 0, 0, 0.14)",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div
              className="w-10 h-10 flex items-center justify-center border"
              style={{ borderColor: theme.accent, color: theme.accent }}
            >
              <Heart className="w-5 h-5" />
            </div>
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{ color: theme.textMuted }}
            >
              Google Pay
            </p>
          </div>

          <div
            className="border p-4 sm:p-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.colors.bg.secondary,
            }}
          >
            <img
              src="/photos/gpay-qr-code.png"
              alt="Google Pay QR code for donations"
              className="w-full h-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>

          <p className="mt-4 text-xs" style={{ color: theme.textMuted }}>
            Scan this QR code with Google Pay to donate.
          </p>
        </div>
      </div>
    </section>
  );
}
