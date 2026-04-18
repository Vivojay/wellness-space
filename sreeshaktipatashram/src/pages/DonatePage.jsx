import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Heart, QrCode } from "lucide-react";
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

function sanitizeAmountInput(value) {
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  if (!rest.length) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

function normalizeAmountString(value) {
  const amount = String(value || "").trim();
  if (!amount || !AMOUNT_REGEX.test(amount)) return amount;
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return amount;
  return numeric.toFixed(2);
}

export default function DonatePage() {
  const { theme } = useOutletContext();

  const [step, setStep] = useState("form");
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [intentData, setIntentData] = useState(null);
  const [declarationDate] = useState(() => formatLocalDate());
  const [qrAuditDeclarationId, setQrAuditDeclarationId] = useState("");
  const [qrAuditError, setQrAuditError] = useState("");

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
    const search = form.country.trim().toLowerCase();
    if (!search) return countries.slice(0, 120);
    return countries.filter((country) => country.toLowerCase().includes(search)).slice(0, 120);
  }, [countries, form.country]);

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

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const handleAmountBlur = () => {
    const normalized = normalizeAmountString(form.amount);
    if (normalized && normalized !== form.amount) {
      updateField("amount", normalized);
    }
  };

  const declarationAmountPreview = normalizeAmountString(form.amount) || "[Amount]";

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

  const normalizeCountry = (value) => {
    const normalized = countriesByLowercase.get(value.trim().toLowerCase());
    return normalized || value.trim();
  };

  const validateForm = () => {
    const errors = {};
    const amount = form.amount.trim();
    const parsedAmount = Number(amount);
    const country = form.country.trim();
    const normalizedCountry = countriesByLowercase.get(country.toLowerCase());

    if (!form.donorName.trim()) {
      errors.donorName = "Donor name is required.";
    }

    if (!amount) {
      errors.amount = "Donation amount is required.";
    } else if (!AMOUNT_REGEX.test(amount)) {
      errors.amount = "Enter a valid INR amount with up to 2 decimals.";
    } else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Amount must be greater than zero.";
    }

    if (!form.residentialStatus) {
      errors.residentialStatus = "Select one residential status.";
    }

    if (!country) {
      errors.country = "Country is required.";
    } else if (!normalizedCountry) {
      errors.country = "Choose a country from the searchable list.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.details.trim()) {
      errors.details = "Details field is required.";
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
      normalizedCountry: normalizedCountry || normalizeCountry(country),
    };
  };

  const handleDeclarationSubmit = async (event) => {
    event.preventDefault();
    const { errors, normalizedCountry } = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      return;
    }

    const normalizedAmount = Number(form.amount.trim()).toFixed(2);
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

      <div className="relative z-10 max-w-4xl mx-auto">
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
            Please complete the donation declaration first. Once submitted, your personalized Google Pay QR
            will be generated for the declared amount.
          </p>
        </div>

        {step === "form" ? (
          <form
            onSubmit={handleDeclarationSubmit}
            className="mt-10 sm:mt-12 max-w-3xl mx-auto border p-5 sm:p-8"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.colors.bg.card,
              boxShadow: "0 22px 60px rgba(0, 0, 0, 0.14)",
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-7">
              <div
                className="w-10 h-10 flex items-center justify-center border"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                <Heart className="w-5 h-5" />
              </div>
              <p className="text-xs tracking-[0.25em] uppercase" style={{ color: theme.textMuted }}>
                Donation Declaration
              </p>
            </div>

            <div
              className="border p-4 mb-6 text-sm leading-relaxed"
              style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.secondary, color: theme.textSecondary }}
            >
              I, <strong style={{ color: theme.text }}>{form.donorName.trim() || "[Donor Name]"}</strong>, hereby
              declare that I am voluntarily contributing an amount of INR{" "}
              <strong style={{ color: theme.text }}>{declarationAmountPreview}</strong> to{" "}
              <strong style={{ color: theme.text }}>SIDDHA MAHAYOGA FOUNDATION</strong>, a registered non-profit
              organization in India.
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Donor Name
                </label>
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
                <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Amount (INR)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => updateField("amount", sanitizeAmountInput(e.target.value))}
                  onBlur={handleAmountBlur}
                  className="w-full border px-4 py-3 text-sm bg-transparent outline-none"
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
                <p className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Residential Status
                </p>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((option) => {
                    const selected = form.residentialStatus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("residentialStatus", option.value)}
                        className="w-full border px-4 py-3 flex items-center justify-between text-left"
                        style={{
                          borderColor: selected ? theme.accent : theme.border,
                          backgroundColor: selected ? `${theme.accent}12` : "transparent",
                          color: theme.text,
                        }}
                      >
                        <span className="text-sm">{option.label}</span>
                        <span
                          className="w-4 h-4 border flex items-center justify-center"
                          style={{
                            borderColor: selected ? theme.accent : theme.border,
                            color: selected ? theme.accent : "transparent",
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.residentialStatus && (
                  <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                    {fieldErrors.residentialStatus}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Country of Residence
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    list="donation-country-options"
                    className="w-full border px-4 py-3 pr-10 text-sm bg-transparent outline-none"
                    style={{ borderColor: theme.border, color: theme.text }}
                    placeholder="Search country"
                    autoComplete="off"
                  />
                  <ChevronLeft
                    className="absolute right-3 top-1/2 -translate-y-1/2 rotate-[-90deg] w-4 h-4"
                    style={{ color: theme.textMuted }}
                  />
                </div>
                <datalist id="donation-country-options">
                  {filteredCountries.map((country) => (
                    <option key={country} value={country} />
                  ))}
                </datalist>
                {fieldErrors.country && (
                  <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                    {fieldErrors.country}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Donor Email
                </label>
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
                <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Date
                </label>
                <input
                  type="text"
                  value={declarationDate}
                  readOnly
                  className="w-full border px-4 py-3 text-sm bg-transparent outline-none"
                  style={{ borderColor: theme.border, color: theme.textMuted }}
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: theme.textMuted }}>
                  Details
                </label>
                <textarea
                  value={form.details}
                  onChange={(e) => updateField("details", e.target.value)}
                  className="w-full border px-4 py-3 text-sm bg-transparent outline-none min-h-[100px]"
                  style={{ borderColor: theme.border, color: theme.text }}
                  placeholder="Mention any additional declaration details"
                />
                {fieldErrors.details && (
                  <p className="mt-1 text-xs" style={{ color: "#b91c1c" }}>
                    {fieldErrors.details}
                  </p>
                )}
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
                    The funds being donated are from my personal/legal income.
                    <span className="ml-1" style={{ color: "#b91c1c" }} aria-hidden>
                      *
                    </span>
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
                    The donation is made voluntarily without coercion or personal benefit expectation.
                    <span className="ml-1" style={{ color: "#b91c1c" }} aria-hidden>
                      *
                    </span>
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
                    I understand this donation will be used solely for charitable purposes.
                    <span className="ml-1" style={{ color: "#b91c1c" }} aria-hidden>
                      *
                    </span>
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
                    I acknowledge compliance with applicable laws, including FCRA where applicable.
                    <span className="ml-1" style={{ color: "#b91c1c" }} aria-hidden>
                      *
                    </span>
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
                    Google Pay QR
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
                <strong style={{ color: theme.text }}>Status:</strong>{" "}
                {STATUS_OPTIONS.find((item) => item.value === intentData?.residential_status)?.label}
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
                <strong style={{ color: theme.text }}>Timezone:</strong>{" "}
                {intentData?.client_timezone || "Not available"}
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
