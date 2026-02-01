import MainLayout from "../layouts/MainLayout";

const sections = [
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "x", label: "X / Twitter" },
  { id: "facebook", label: "Facebook" }
];

export default function Gallery() {
  return (
    <MainLayout>
      <section className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1a1a] transition-colors">
        <div className="max-w-7xl mx-auto px-6 md:px-24 py-24 space-y-32">

          {/* Page header */}
          <header className="text-center">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight font-petitformal mb-6">
              Gallery
            </h1>
            <p className="text-sm md:text-base text-neutral-500 max-w-xl mx-auto">
              A curated visual archive across platforms
            </p>
          </header>

          {/* Social sections */}
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-3xl font-light tracking-tight mb-8">
                {section.label}
              </h2>

              {/* Media grid placeholder */}
              <div
                className="
                  grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                  gap-0 overflow-hidden rounded-xl
                  border border-neutral-200 dark:border-neutral-800
                "
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="
                      aspect-[9/16]
                      bg-neutral-200 dark:bg-neutral-800
                      animate-pulse
                    "
                  />
                ))}
              </div>
            </section>
          ))}

        </div>
      </section>
    </MainLayout>
  );
}
