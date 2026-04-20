import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronDown, ChevronLeft, QrCode } from "lucide-react";
import { Country } from "country-state-city";
import { QRCodeSVG } from "qrcode.react";

import { createDonationDeclarationAudit, createDonationDeclarationIntent } from "@/api/donateApi";

const STATUS_OPTIONS = [
  { value: "indian_resident", label: "Indian Resident" },
  { value: "nri", label: "Non-Resident Indian (NRI)" },
  { value: "foreign_national", label: "Foreign National" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AMOUNT_REGEX = /^\d+(\.\d{0,2})?$/;

const INITIAL_FORM = {
  donorName: "",
  amount: "",
  residentialStatus: "",
  country: "",
  email: "",
  details: "",
  confirmLegalIncome: false,
  confirmVoluntary: false,
  confirmCharitableUse: false,
  acknowledgeFcra: false,
};

function formatLocalDate() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function normalizeAmountString(value) {
  const text = String(value || "").trim();
  if (!text || !AMOUNT_REGEX.test(text)) return text;
  const numeric = Number(text);
  if (!Number.isFinite(numeric) || numeric < 1) return text;
  return numeric.toFixed(2);
}

function statusLabel(value) {
  return STATUS_OPTIONS.find((item) => item.value === value)?.label || "--";
}

function MandatoryLabel({ children, theme }) {
  return (
    <span className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
      <span className="mr-1" style={{ color: "#b91c1c" }} aria-hidden>
        *
      </span>
      {children}
    </span>
  );
}

export default function DonatePage() {
  const { theme } = useOutletContext();

  const [step, setStep] = useState("form");
  const [form, setForm] = useState(INITIAL_FORM);
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [intentData, setIntentData] = useState(null);
  const [declarationDate] = useState(() => formatLocalDate());
  const [qrAuditDeclarationId, setQrAuditDeclarationId] = useState("");
  const [qrAuditError, setQrAuditError] = useState("");

  const countryContainerRef = useRef(null);

  const clientTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      return null;
    }
  }, []);

  const countries = useMemo(
    () => Country.getAllCountries().map((country) => country.name).sort((a, b) => a.localeCompare(b)),
    []
  );

  const countriesByLowercase = useMemo(() => {
    const map = new Map();
    countries.forEach((country) => map.set(country.toLowerCase(), country));
    return map;
  }, [countries]);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countries.slice(0, 120);
    return countries.filter((country) => country.toLowerCase().includes(query)).slice(0, 120);
  }, [countries, countryQuery]);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("app-scroll");
    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 2) {
      scrollContainer.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [step]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!countryContainerRef.current?.contains(event.target)) {
        setCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    if (step !== "qr") return;
    if (!intentData?.declaration_id) return;
    if (qrAuditDeclarationId === intentData.declaration_id) return;

    let cancelled = false;

    const sendAudit = async () => {
      try {
        setQrAuditError("");
        await createDonationDeclarationAudit({
          declaration_id: intentData.declaration_id,
          event: "qr_displayed",
          amount: intentData.amount,
          declaration_date_local: declarationDate,
          client_timezone: clientTimezone,
          notes: "QR page rendered for donor session",
        });
        if (!cancelled) {
          setQrAuditDeclarationId(intentData.declaration_id);
        }
      } catch (error) {
        if (!cancelled) {
          setQrAuditError(error.message || "QR audit log could not be recorded.");
        }
      }
    };

    sendAudit();

    return () => {
      cancelled = true;
    };
  }, [clientTimezone, declarationDate, intentData, qrAuditDeclarationId, step]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const selectCountry = (country) => {
    setCountryQuery(country);
    updateField("country", country);
    setCountryOpen(false);
  };

  const handleAmountBlur = () => {
    const normalized = normalizeAmountString(form.amount);
    if (normalized && normalized !== form.amount) {
      updateField("amount", normalized);
    }
  };

  const declarationAmountPreview = normalizeAmountString(form.amount) || "[Amount]";

  const validateForm = () => {
    const errors = {};
    const amount = String(form.amount || "").trim();
    const parsedAmount = Number(amount);
    const normalizedCountry = countriesByLowercase.get(String(form.country || "").trim().toLowerCase());

    if (!form.donorName.trim()) {
      errors.donorName = "Donor name is required.";
    }

    if (!amount) {
      errors.amount = "Donation amount is required.";
    } else if (!AMOUNT_REGEX.test(amount)) {
      errors.amount = "Enter a valid INR amount with up to 2 decimals.";
    } else if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      errors.amount = "Amount must be at least INR 1.";
    }

    if (!form.residentialStatus) {
      errors.residentialStatus = "Select one residential status.";
    }

    if (!form.country.trim()) {
      errors.country = "Country is required.";
    } else if (!normalizedCountry) {
      errors.country = "Select a valid country from the dropdown list.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.confirmLegalIncome) {
      errors.confirmLegalIncome = "This declaration is mandatory.";
    }
    if (!form.confirmVoluntary) {
      errors.confirmVoluntary = "This declaration is mandatory.";
    }
    if (!form.confirmCharitableUse) {
      errors.confirmCharitableUse = "This declaration is mandatory.";
    }
    if (!form.acknowledgeFcra) {
      errors.acknowledgeFcra = "This declaration is mandatory.";
    }

    return {
      errors,
      normalizedCountry: normalizedCountry || form.country.trim(),
    };
  };

  const handleDeclarationSubmit = async (event) => {
    event.preventDefault();
    const { errors, normalizedCountry } = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    const normalizedAmount = Number(form.amount).toFixed(2);
    const payload = {
      donor_name: form.donorName.trim(),
      amount: normalizedAmount,
      residential_status: form.residentialStatus,
      country: normalizedCountry,
      email: form.email.trim().toLowerCase(),
      details: form.details.trim(),
      declaration_date_local: declarationDate,
      client_timezone: clientTimezone,
      confirm_legal_income: form.confirmLegalIncome,
      confirm_voluntary: form.confirmVoluntary,
      confirm_charitable_use: form.confirmCharitableUse,
      acknowledge_fcra: form.acknowledgeFcra,
    };

    setSubmitting(true);
    setSubmitError("");
    setQrAuditError("");

    try {
      const response = await createDonationDeclarationIntent(payload);
      setQrAuditDeclarationId("");
      setIntentData({
        ...response,
        donor_name: payload.donor_name,
        email: payload.email,
        country: payload.country,
        residential_status: payload.residential_status,
        details: payload.details,
        declaration_date: declarationDate,
        client_timezone: clientTimezone,
      });
      setStep("qr");
    } catch (error) {
      setSubmitError(error.message || "Could not process declaration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDeclaration = async () => {
    if (intentData?.declaration_id) {
      try {
        await createDonationDeclarationAudit({
          declaration_id: intentData.declaration_id,
          event: "qr_refresh_requested",
          amount: intentData.amount,
          declaration_date_local: declarationDate,
          client_timezone: clientTimezone,
          notes: "User switched from QR page back to declaration form",
        });
      } catch {
        // non-blocking
      }
    }
    setStep("form");
  };

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

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase" style={{ color: theme.textMuted }}>
            Donate
          </p>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mt-6"
            style={{ color: theme.text }}
          >
            Support the Lineage
          </h1>

          <p className="mt-6 text-sm sm:text-base leading-relaxed" style={{ color: theme.textSecondary }}>
            Please complete the declaration first. Once submitted, your personalized Google Pay QR will be
            generated for the declared amount.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap justify-center items-center gap-3">
          <div
            className="inline-flex items-center gap-2 border px-3 py-2"
            style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card, color: theme.textMuted }}
          >
            <span className="text-[10px] tracking-[0.25em] uppercase">Date</span>
            <span className="text-sm" style={{ color: theme.text }}>
              {declarationDate}
            </span>
          </div>
          <div
            className="inline-flex items-center gap-2 border px-3 py-2"
            style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card, color: theme.textMuted }}
          >
            <img src="/photos/logo_gpay.png" alt="Google Pay" className="w-4 h-4 object-contain" />
            <span className="text-[11px]">Google Pay Secured Flow</span>
          </div>
        </div>

        {step === "form" ? (
          <div className="mt-10 grid xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.15fr)] gap-6 items-start">
            <aside
              className="border p-5 sm:p-6 xl:sticky xl:top-28"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.colors.bg.card,
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
              }}
            >
              <p className="text-xs tracking-[0.22em] uppercase" style={{ color: theme.textMuted }}>
                Donation Declaration
              </p>
              <p className="mt-1 text-[11px]" style={{ color: theme.textMuted }}>
                Optional live preview
              </p>

              <div
                className="mt-4 border p-4 text-sm leading-relaxed"
                style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.secondary, color: theme.textSecondary }}
              >
                I, <strong style={{ color: theme.text }}>{form.donorName.trim() || "[Donor Name]"}</strong>, hereby
                declare that I am voluntarily contributing an amount of INR{" "}
                <strong style={{ color: theme.text }}>{declarationAmountPreview}</strong> to{" "}
                <strong style={{ color: theme.text }}>SIDDHA MAHAYOGA FOUNDATION</strong>, a registered non-profit
                organization in India.
              </div>

              <div className="mt-4 space-y-2 text-xs" style={{ color: theme.textMuted }}>
                <p>
                  <span style={{ color: "#b91c1c" }} aria-hidden>
                    *
                  </span>{" "}
                  Mandatory fields and declarations required.
                </p>
                <p>Country selection must be from dropdown list.</p>
              </div>
            </aside>

            <form
              onSubmit={handleDeclarationSubmit}
              className="relative border p-5 sm:p-8"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.colors.bg.card,
                boxShadow: "0 22px 60px rgba(0, 0, 0, 0.14)",
              }}
            >
              <div className="hidden lg:block absolute -top-3 -left-3 border px-2 py-1" style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.secondary }}>
                <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                  <img src="/photos/logo_gpay.png" alt="Google Pay" className="w-3.5 h-3.5 object-contain" />
                  Google Pay
                </span>
              </div>
              <div className="hidden lg:block absolute -top-3 -right-3 border px-2 py-1" style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.secondary }}>
                <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: theme.textMuted }}>
                  <img src="/photos/logo_gpay.png" alt="Google Pay" className="w-3.5 h-3.5 object-contain" />
                  Trusted
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <MandatoryLabel theme={theme}>Donor Name</MandatoryLabel>
                  <input
                    type="text"
                    value={form.donorName}
                    onChange={(e) => updateField("donorName", e.target.value)}
                    className="w-full border px-4 py-3 text-sm bg-transparent outline-none"
                    style={{ borderColor: theme.border, color: theme.text }}
                    placeholder="Enter full name"
                  />
                  {fieldErrors.donorName && (
                    <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.donorName}
                    </p>
                  )}
                </div>

                <div>
                  <MandatoryLabel theme={theme}>Amount (INR)</MandatoryLabel>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    onBlur={handleAmountBlur}
                    className="show-number-spin w-full border px-4 py-3 text-sm bg-transparent outline-none"
                    style={{ borderColor: theme.border, color: theme.text }}
                    placeholder="100.00"
                  />
                  {fieldErrors.amount && (
                    <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.amount}
                    </p>
                  )}
                </div>

                <div>
                  <MandatoryLabel theme={theme}>Residential Status</MandatoryLabel>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.map((option) => {
                      const checked = form.residentialStatus === option.value;
                      return (
                        <label
                          key={option.value}
                          className="w-full border px-4 py-3 flex items-center gap-3"
                          style={{
                            borderColor: checked ? theme.accent : theme.border,
                            backgroundColor: checked ? `${theme.accent}12` : "transparent",
                            color: theme.text,
                          }}
                        >
                          <input
                            type="radio"
                            name="residentialStatus"
                            value={option.value}
                            checked={checked}
                            onChange={(e) => updateField("residentialStatus", e.target.value)}
                            className="accent-red-700"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.residentialStatus && (
                    <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.residentialStatus}
                    </p>
                  )}
                </div>

                <div ref={countryContainerRef}>
                  <MandatoryLabel theme={theme}>Country of Residence</MandatoryLabel>
                  <div className="relative">
                    <input
                      type="text"
                      value={countryQuery}
                      onFocus={() => setCountryOpen(true)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCountryQuery(value);
                        updateField("country", value);
                        setCountryOpen(true);
                      }}
                      className="w-full border px-4 py-3 pr-10 text-sm bg-transparent outline-none"
                      style={{ borderColor: theme.border, color: theme.text }}
                      placeholder="Search and select country"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setCountryOpen((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: theme.textMuted }}
                      aria-label="Toggle country options"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {countryOpen && (
                      <div
                        className="absolute z-40 mt-1 w-full max-h-56 overflow-y-auto border"
                        style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}
                      >
                        {filteredCountries.length ? (
                          filteredCountries.map((country) => (
                            <button
                              key={country}
                              type="button"
                              onClick={() => selectCountry(country)}
                              className="w-full px-4 py-2 text-left text-sm"
                              style={{ color: theme.text }}
                            >
                              {country}
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-3 text-sm" style={{ color: theme.textMuted }}>
                            No country found for this search.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {fieldErrors.country && (
                    <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.country}
                    </p>
                  )}
                </div>

                <div>
                  <MandatoryLabel theme={theme}>Email (for correspondence)</MandatoryLabel>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full border px-4 py-3 text-sm bg-transparent outline-none"
                    style={{ borderColor: theme.border, color: theme.text }}
                    placeholder="name@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <span className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                    Details (Optional)
                  </span>
                  <textarea
                    value={form.details}
                    onChange={(e) => updateField("details", e.target.value)}
                    className="w-full border px-4 py-3 text-sm bg-transparent outline-none min-h-[100px]"
                    style={{ borderColor: theme.border, color: theme.text }}
                    placeholder="Mention any additional declaration details"
                  />
                </div>

                <div
                  className="border p-4 space-y-3"
                  style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.secondary }}
                >
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: theme.textMuted }}>
                    Mandatory Declarations
                  </p>

                  <label className="flex items-start gap-3 text-sm" style={{ color: theme.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={form.confirmLegalIncome}
                      onChange={(e) => updateField("confirmLegalIncome", e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <span className="mr-1" style={{ color: "#b91c1c" }} aria-hidden>
                        *
                      </span>
                      The funds being donated are from my personal/legal income.
                    </span>
                  </label>
                  {fieldErrors.confirmLegalIncome && (
                    <p className="text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.confirmLegalIncome}
                    </p>
                  )}

                  <label className="flex items-start gap-3 text-sm" style={{ color: theme.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={form.confirmVoluntary}
                      onChange={(e) => updateField("confirmVoluntary", e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <span className="mr-1" style={{ color: "#b91c1c" }} aria-hidden>
                        *
                      </span>
                      The donation is made voluntarily without coercion or personal benefit expectation.
                    </span>
                  </label>
                  {fieldErrors.confirmVoluntary && (
                    <p className="text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.confirmVoluntary}
                    </p>
                  )}

                  <label className="flex items-start gap-3 text-sm" style={{ color: theme.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={form.confirmCharitableUse}
                      onChange={(e) => updateField("confirmCharitableUse", e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <span className="mr-1" style={{ color: "#b91c1c" }} aria-hidden>
                        *
                      </span>
                      I understand this donation will be used solely for charitable purposes.
                    </span>
                  </label>
                  {fieldErrors.confirmCharitableUse && (
                    <p className="text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.confirmCharitableUse}
                    </p>
                  )}

                  <label className="flex items-start gap-3 text-sm" style={{ color: theme.textSecondary }}>
                    <input
                      type="checkbox"
                      checked={form.acknowledgeFcra}
                      onChange={(e) => updateField("acknowledgeFcra", e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <span className="mr-1" style={{ color: "#b91c1c" }} aria-hidden>
                        *
                      </span>
                      I acknowledge compliance with applicable laws, including FCRA where applicable.
                    </span>
                  </label>
                  {fieldErrors.acknowledgeFcra && (
                    <p className="text-xs" style={{ color: "#b91c1c" }}>
                      {fieldErrors.acknowledgeFcra}
                    </p>
                  )}
                </div>
              </div>

              {submitError && (
                <p className="mt-5 text-sm" style={{ color: "#b91c1c" }}>
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full border px-6 py-3 text-sm tracking-[0.2em] uppercase transition-colors"
                style={{
                  borderColor: theme.accent,
                  color: theme.text,
                  backgroundColor: submitting ? `${theme.accent}22` : `${theme.accent}14`,
                }}
              >
                {submitting ? "Generating QR..." : "Submit Declaration & Continue"}
              </button>
            </form>
          </div>
        ) : (
          <div
            className="mt-10 sm:mt-12 max-w-2xl mx-auto border p-5 sm:p-8"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.colors.bg.card,
              boxShadow: "0 22px 60px rgba(0, 0, 0, 0.14)",
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center border"
                  style={{ borderColor: theme.accent, color: theme.accent }}
                >
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs tracking-[0.25em] uppercase" style={{ color: theme.textMuted }}>
                    <span className="inline-flex items-center gap-1">
                      <img src="/photos/logo_gpay.png" alt="Google Pay" className="w-3.5 h-3.5 object-contain" />
                      Google Pay QR
                    </span>
                  </p>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    Declaration submitted successfully
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEditDeclaration}
                className="border px-3 py-2 text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2"
                style={{ borderColor: theme.border, color: theme.textMuted }}
              >
                <ChevronLeft className="w-4 h-4" />
                Edit
              </button>
            </div>

            <div
              className="border p-4 sm:p-6"
              style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.secondary }}
            >
              <div className="mx-auto w-full max-w-[340px]">
                <div className="bg-white p-4">
                  <QRCodeSVG
                    value={intentData?.upi_url || ""}
                    size={300}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: "/photos/logo_gpay.png",
                      height: 56,
                      width: 56,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <p className="mt-4 text-center text-xs" style={{ color: theme.textMuted }}>
                Scan in Google Pay and pay INR {intentData?.amount}
              </p>
            </div>

            <div className="mt-5 text-sm space-y-1" style={{ color: theme.textSecondary }}>
              <p>
                <strong style={{ color: theme.text }}>Donor:</strong> {intentData?.donor_name}
              </p>
              <p>
                <strong style={{ color: theme.text }}>Status:</strong> {statusLabel(intentData?.residential_status)}
              </p>
              <p>
                <strong style={{ color: theme.text }}>Country:</strong> {intentData?.country}
              </p>
              <p>
                <strong style={{ color: theme.text }}>Email:</strong> {intentData?.email}
              </p>
              <p>
                <strong style={{ color: theme.text }}>Date:</strong> {intentData?.declaration_date}
              </p>
              <p>
                <strong style={{ color: theme.text }}>Timezone:</strong> {intentData?.client_timezone || "Not available"}
              </p>
            </div>

            {qrAuditError && (
              <p className="mt-4 text-xs" style={{ color: "#b91c1c" }}>
                Audit log retry pending: {qrAuditError}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
