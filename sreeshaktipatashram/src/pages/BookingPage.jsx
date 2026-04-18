import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, RotateCcw } from "lucide-react";

import bgImage from '/photos/Blue Pastel Abstract Grid Line BG.png';
import { Country, State } from "country-state-city";

const BG_IMG =
  "https://dhunwellness.com/cdn/shop/files/Sound_healing_room.jpg?v=1751348144&width=1920";

const AGE_MIN = 16;
const AGE_MAX = 100;

function Field({ label, children, hint, error, theme, clearAction, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm tracking-wide" style={{ color: theme.textLight }}>
          {label}
        </label>
        {hint && <span className="text-[11px]" style={{ color: theme.textMuted }}>{hint}</span>}
      </div>
      {children}
      {clearAction}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function InputBase({ theme, className = "", error, title, value, ...props }) {
  const resolvedTitle = title ?? (value !== undefined && value !== null ? String(value) : "");
  return (
    <input
      {...props}
      value={value}
      title={resolvedTitle}
      className={`w-full px-4 py-3 outline-none transition-colors ${className}`}
      style={{
        backgroundColor: theme.colors.bg.card,
        border: error 
          ? '1px solid rgba(239, 68, 68, 0.6)' 
          : `1px solid ${theme.border}`,
        color: theme.text,
        boxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.1)' : 'none'
      }}
    />
  );
}

function SelectBase({ className = "", theme, error, style, title, value, ...props }) {
  const resolvedTitle = title ?? (value !== undefined && value !== null ? String(value) : "");
  return (
    <div className="relative">
      <select
        {...props}
        value={value}
        title={resolvedTitle}
        className={`w-full appearance-none px-4 py-3 pr-10 outline-none transition-colors ${className}`}
        style={{
          backgroundColor: theme.colors.bg.card,
          border: error 
            ? '1px solid rgba(239, 68, 68, 0.6)' 
            : `1px solid ${theme.border}`,
          color: theme.text,
          boxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.1)' : 'none',
          ...style
        }}
      />
      <ChevronDown
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: theme.textMuted }}
      />
    </div>
  );
}

function TextAreaBase({ theme, className = "", title, value, ...props }) {
  const resolvedTitle = title ?? (value !== undefined && value !== null ? String(value) : "");
  return (
    <textarea
      {...props}
      value={value}
      title={resolvedTitle}
      className={`w-full min-h-[140px] px-4 py-3 outline-none transition-colors resize-y ${className}`}
      style={{
        backgroundColor: theme.colors.bg.card,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        '::placeholder': {
          color: theme.textMuted
        }
      }}
    />
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { isDark, theme, setCursorVariant } = useOutletContext();
  const [step, setStep] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [errors, setErrors] = useState({});
  const countries = useMemo(() => Country.getAllCountries(), []);
  const defaultCountry = useMemo(
    () => countries.find((c) => c.name === "India") || countries[0],
    [countries]
  );
  const [location, setLocation] = useState(() => ({
    country: defaultCountry?.name ?? "",
    countryCode: defaultCountry?.isoCode ?? "",
    state: "",
    city: ""
  }));
  const [phoneCode, setPhoneCode] = useState(() =>
    defaultCountry?.phonecode ? `+${defaultCountry.phonecode}` : ""
  );

  useEffect(() => {
    const scrollContainer = document.getElementById("app-scroll");
    if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 2) {
      scrollContainer.scrollTo({ top: 0, left: 0 });
      return;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    city: "",
    email: "",
    education: "",
    religion: "",
    maritalStatus: "",
    childrenCount: "",
    phone: "",
    whyJoin: "",
    medsTaking: "",
    meds: "",
    healthIssues: "",
    initiatedBefore: "",
    lineageDetails: "",
    subscribe: false,
  });

  const emailInfo = useMemo(() => {
    const v = form.email.trim();
    if (!v) return { ok: false, msg: "Email is required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return { ok: false, msg: "Invalid email format (e.g., name@domain.com)" };
    }
    return { ok: true, msg: "Valid email." };
  }, [form.email]);

  const phoneCodes = useMemo(() => {
    const unique = new Set(
      countries
        .map((c) => String(c.phonecode || "").replace(/^\+/, ""))
        .filter(Boolean)
    );
    return Array.from(unique)
      .sort((a, b) => Number(a) - Number(b))
      .map((code) => `+${code}`);
  }, [countries]);

  const getCountryByCode = (code) =>
    countries.find((country) => country.isoCode === code);

  const applyCountry = (country) => {
    if (!country) return;
    setLocation((p) => ({
      ...p,
      country: country.name,
      countryCode: country.isoCode,
      state: "",
      city: ""
    }));
    const normalized = String(country.phonecode || "").replace(/^\+/, "");
    setPhoneCode(normalized ? `+${normalized}` : "");
  };

  const setPhoneCodeAndCountry = (code) => {
    if (!code) {
      setPhoneCode("");
      return;
    }
    const normalized = String(code).replace(/^\+/, "");
    const matches = countries.filter(
      (c) => String(c.phonecode || "").replace(/^\+/, "") === normalized
    );
    if (!matches.length) {
      setPhoneCode(code);
      return;
    }
    const currentMatch = matches.find((c) => c.isoCode === location.countryCode);
    const nextCountry = currentMatch || matches[0];
    applyCountry(nextCountry);
  };

  const steps = useMemo(
    () => [
      { title: "Basics" },
      { title: "Background" },
      { title: "Health" },
      { title: "Initiation" },
      { title: "Finish" },
    ],
    []
  );

  const statesForCountry = useMemo(() => {
    if (!location.countryCode) return [];
    return State.getStatesOfCountry(location.countryCode) || [];
  }, [location.countryCode]);

  const clearError = (key) => {
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const set = (key) => (e) => {
    const value =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    clearError(key);
  };

  const setMedsTaking = (e) => {
    const value = e?.target?.value ?? "";
    setForm((p) => ({
      ...p,
      medsTaking: value,
      meds: value === "yes" ? p.meds : ""
    }));
  };

  const cursorTextHandlers = {
    onMouseEnter: () => setCursorVariant?.('text'),
    onMouseLeave: () => setCursorVariant?.('default')
  };

  const renderClear = (onClick, disabled) => (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="text-[11px] tracking-wide inline-flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          color: disabled ? theme.textMuted : theme.accent,
          backgroundColor: 'transparent',
          opacity: disabled ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.color = theme.accentHover;
            e.currentTarget.style.textDecoration = 'underline';
            e.currentTarget.style.backgroundColor = theme.accent + '18';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.color = theme.accent;
            e.currentTarget.style.textDecoration = 'none';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <RotateCcw size={12} />
        Reset
      </button>
    </div>
  );

  const setAge = (e) => {
    const raw = e?.target?.value ?? "";
    if (raw === "") {
      setForm((p) => ({ ...p, age: "" }));
      clearError("age");
      return;
    }
    if (!/^[0-9]+$/.test(raw)) return;
    setForm((p) => ({ ...p, age: raw }));
    clearError("age");
  };

  const clampAge = () => {
    const raw = String(form.age ?? "").trim();
    if (!raw) return;
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    const nextValue = String(Math.min(Math.max(parsed, AGE_MIN), AGE_MAX));
    if (nextValue !== raw) {
      setForm((p) => ({ ...p, age: nextValue }));
    }
  };

  const bumpAge = (delta) => {
    setForm((p) => {
      const raw = String(p.age ?? "").trim();
      const base = raw ? Number(raw) : AGE_MIN;
      const safeBase = Number.isNaN(base) ? AGE_MIN : base;
      const nextValue = Math.min(Math.max(safeBase + delta, AGE_MIN), AGE_MAX);
      return { ...p, age: String(nextValue) };
    });
    clearError("age");
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (stepIndex === 0) {
      if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!String(form.age).trim()) {
        newErrors.age = "Age is required";
      } else {
        const ageValue = Number(form.age);
        if (Number.isNaN(ageValue) || ageValue < AGE_MIN || ageValue > AGE_MAX) {
          newErrors.age = `Age must be between ${AGE_MIN} and ${AGE_MAX}`;
        }
      }
      if (!form.gender) newErrors.gender = "Gender is required";
      if (!location.countryCode) newErrors.country = "Country is required";
      if (statesForCountry.length > 0 && !location.state) {
        newErrors.state = "State is required";
      }
      if (!location.city.trim()) newErrors.city = "City is required";
      if (!emailInfo.ok) newErrors.email = emailInfo.msg;
      if (!phoneCode) newErrors.phoneCode = "Country code is required";
      if (!phoneDigits) {
        newErrors.phone = "Phone number is required";
      } else if (phoneDigits.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }

    if (stepIndex === 1) {
      if (!form.education.trim()) newErrors.education = "Education is required";
      if (!form.religion.trim()) newErrors.religion = "Religion is required";
      if (!form.maritalStatus) newErrors.maritalStatus = "Marital status is required";
    }

    if (stepIndex === 2) {
      if (!form.medsTaking) newErrors.medsTaking = "Please select an option";
      if (!form.healthIssues.trim()) {
        newErrors.healthIssues = "Health issues detail is required";
      }
    }

    if (stepIndex === 3) {
      if (form.initiatedBefore === "") {
        newErrors.initiatedBefore = "Please select an option";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canNext = () => {
    if (step === 0) {
      const ageValue = Number(form.age);
      const phoneDigits = form.phone.replace(/\D/g, "");
      return (
        form.fullName.trim() &&
        String(form.age).trim() &&
        !Number.isNaN(ageValue) &&
        ageValue >= AGE_MIN &&
        ageValue <= AGE_MAX &&
        form.gender &&
        location.countryCode &&
        (statesForCountry.length === 0 || location.state) &&
        location.city.trim() &&
        emailInfo.ok &&
        phoneCode &&
        phoneDigits.length === 10
      );
    }
    if (step === 1) {
      return form.education.trim() && form.religion.trim() && form.maritalStatus;
    }
    if (step === 2) return form.medsTaking && form.healthIssues.trim();
    if (step === 3) return form.initiatedBefore !== "";
    return true;
  };

  const next = () => {
    if (!validateStep(step)) {
      setAttemptedNext(true);
      setTimeout(() => setAttemptedNext(false), 650);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    setAttemptedNext(false);
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const { medsTaking, ...rest } = form;
    const payload = {
      ...rest,
      city: `${location.city}${location.state ? `, ${location.state}` : ""}, ${location.country}`,
      phone: `${phoneCode} ${form.phone}`.trim(),
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit booking");
      await res.json();
      setStep(steps.length - 1);
    } catch (e) {
      console.error(e);
      alert("Could not submit. Please check your connection and try again.");
    }
  };

  const ageNumber = String(form.age).trim() ? Number(form.age) : null;
  const ageAtMin = ageNumber === null || Number.isNaN(ageNumber) || ageNumber <= AGE_MIN;
  const ageAtMax = ageNumber !== null && !Number.isNaN(ageNumber) && ageNumber >= AGE_MAX;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: 'transparent',
        color: theme.text
      }}
    >
      <div className="relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={BG_IMG}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }}
          />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        {/* Centered modal */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16 flex items-start md:items-center justify-center min-h-screen">
            <div
              className="w-full max-w-4xl border shadow-2xl flex flex-col"
              style={{
                backgroundImage: `linear-gradient(${isDark ? 'rgba(6, 12, 16, 0.85)' : 'rgba(255, 255, 255, 0.1)'}, ${isDark ? 'rgba(10, 22, 30, 0.85)' : 'rgba(108, 229, 250, 0.3)'}), url(${bgImage})`,
                backgroundSize: '200%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '-700px 0px',
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.border,
              }}
            >
            {/* Header */}
            <div 
              className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 border-b"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center justify-between gap-6 mb-6">
                <div>
                  <p 
                    className="text-[10px] tracking-[0.35em]"
                    style={{ color: theme.textMuted }}
                  >
                    BOOKING
                  </p>
                  <h1 
                    className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mt-3"
                    style={{ color: theme.text }}
                  >
                    Begin Your Journey
                  </h1>
                  <p 
                    className="text-sm mt-3 max-w-2xl leading-relaxed"
                    style={{ color: theme.textMuted }}
                  >
                    Please fill in the details below. This helps us understand your
                    intent and guide you with care.
                  </p>
                </div>

                <div className="hidden md:block text-right">
                  <p 
                    className="text-xs tracking-[0.25em]"
                    style={{ color: theme.textMuted }}
                  >
                    STEP {step + 1} / {steps.length}
                  </p>
                  <p 
                    className="text-sm mt-2"
                    style={{ color: theme.textLight }}
                  >
                    {steps[step]?.title}
                  </p>
                </div>
              </div>

              <div className="md:hidden mb-4">
                <p
                  className="text-[10px] tracking-[0.25em]"
                  style={{ color: theme.textMuted }}
                >
                  STEP {step + 1} / {steps.length} · {steps[step]?.title}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="relative">
                <div 
                  className="h-1 overflow-hidden"
                  style={{ backgroundColor: theme.borderLight }}
                >
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${((step + 1) / steps.length) * 100}%`,
                      backgroundColor: theme.accentTertiary
                    }}
                  />
                </div>
                
                <div className="flex justify-between mt-3 gap-2 overflow-x-auto">
                  {steps.slice(0, -1).map((s, i) => (
                    <div
                      key={i}
                      className="text-[9px] sm:text-[10px] tracking-wider transition-colors whitespace-nowrap"
                      style={{ 
                        color: i <= step ? theme.accentTertiary : theme.textMuted 
                      }}
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                  <Field
                    label="Full Name"
                    error={errors.fullName}
                    theme={theme}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, fullName: "" }));
                        clearError("fullName");
                      },
                      !form.fullName
                    )}
                    className="md:col-span-2"
                  >
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Your full name"
                      autoComplete="name"
                      error={errors.fullName}
                      {...cursorTextHandlers}
                    />
                  </Field>

                  <div className="grid gap-8">
                    <Field
                      label="Gender"
                      error={errors.gender}
                      theme={theme}
                      clearAction={renderClear(
                        () => {
                          setForm((p) => ({ ...p, gender: "" }));
                          clearError("gender");
                        },
                        !form.gender
                      )}
                    >
                      <SelectBase
                        theme={theme}
                        value={form.gender}
                        onChange={set("gender")}
                        error={errors.gender}
                        {...cursorTextHandlers}
                      >
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </SelectBase>
                    </Field>

                    <Field
                      label="Age"
                      error={errors.age}
                      theme={theme}
                      clearAction={renderClear(
                        () => {
                          setForm((p) => ({ ...p, age: "" }));
                          clearError("age");
                        },
                        !String(form.age).trim()
                      )}
                    >
                      <div className="grid grid-cols-[44px_1fr_44px] gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => bumpAge(-1)}
                          disabled={ageAtMin}
                          className="h-11 w-11 border text-lg font-semibold transition-colors"
                          style={{
                          borderColor: ageAtMin
                            ? theme.borderLight
                            : isDark
                              ? theme.borderStrong
                              : theme.border,
                          color: ageAtMin
                            ? theme.textMuted
                            : theme.text,
                          backgroundColor: ageAtMin
                            ? theme.colors.bg.secondary
                            : isDark
                              ? theme.colors.bg.secondary
                              : theme.colors.bg.card,
                            cursor: ageAtMin ? 'not-allowed' : 'pointer'
                          }}
                          aria-label="Decrease age"
                        >
                          -
                        </button>

                        <InputBase
                          theme={theme}
                          type="number"
                          min={AGE_MIN}
                          max={AGE_MAX}
                          value={form.age}
                          onChange={setAge}
                          onBlur={clampAge}
                          placeholder="Your age"
                          error={errors.age}
                          className="text-center"
                          inputMode="numeric"
                          {...cursorTextHandlers}
                        />

                        <button
                          type="button"
                          onClick={() => bumpAge(1)}
                          disabled={ageAtMax}
                          className="h-11 w-11 border text-lg font-semibold transition-colors"
                          style={{
                          borderColor: ageAtMax
                            ? theme.borderLight
                            : isDark
                              ? theme.borderStrong
                              : theme.border,
                          color: ageAtMax
                            ? theme.textMuted
                            : theme.text,
                          backgroundColor: ageAtMax
                            ? theme.colors.bg.secondary
                            : isDark
                              ? theme.colors.bg.secondary
                              : theme.colors.bg.card,
                            cursor: ageAtMax ? 'not-allowed' : 'pointer'
                          }}
                          aria-label="Increase age"
                        >
                          +
                        </button>
                      </div>
                    </Field>
                  </div>

                  <div
                    className="grid gap-5 sm:gap-6 md:gap-8 border p-4 md:p-5"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.colors.bg.secondary,
                      fontSize: '0.75rem'
                    }}
                  >
                    <Field label="Country" theme={theme} error={errors.country}>
                      <SelectBase
                        theme={theme}
                        value={location.countryCode}
                        title={location.country}
                        onChange={(e) => {
                          if (!e.target.value) {
                            setLocation((p) => ({
                              ...p,
                              country: "",
                              countryCode: "",
                              state: "",
                              city: ""
                            }));
                            setPhoneCode("");
                            return;
                          }
                          applyCountry(getCountryByCode(e.target.value));
                        }}
                        {...cursorTextHandlers}
                      >
                        <option value="">Select…</option>
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </SelectBase>
                      {renderClear(
                        () => {
                          setLocation((p) => ({
                            ...p,
                            country: "",
                            countryCode: "",
                            state: "",
                            city: ""
                          }));
                          setPhoneCode("");
                        },
                        !location.countryCode
                      )}
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="State" theme={theme} error={errors.state}>
                        <SelectBase
                          theme={theme}
                          value={location.state}
                          title={location.state}
                          onChange={(e) =>
                            setLocation((p) => ({ ...p, state: e.target.value }))
                          }
                          {...cursorTextHandlers}
                        >
                          <option value="">State…</option>
                          {statesForCountry.map((state) => (
                            <option
                              key={`${state.isoCode}-${state.name}`}
                              value={state.name}
                            >
                              {state.name}
                            </option>
                          ))}
                        </SelectBase>
                        {renderClear(
                          () => setLocation((p) => ({ ...p, state: "" })),
                          !location.state
                        )}
                      </Field>

                      <Field label="City" error={errors.city} theme={theme}>
                        <InputBase
                          theme={theme}
                          type="text"
                          value={location.city}
                          onChange={(e) =>
                            setLocation((p) => ({ ...p, city: e.target.value }))
                          }
                          placeholder="City"
                          error={errors.city}
                          {...cursorTextHandlers}
                        />
                        {renderClear(
                          () => {
                            setLocation((p) => ({ ...p, city: "" }));
                            clearError("city");
                          },
                          !location.city
                        )}
                      </Field>
                    </div>

                    <Field label="Country Code" theme={theme} error={errors.phoneCode}>
                      <SelectBase
                        theme={theme}
                        value={phoneCode}
                        title={phoneCode}
                        onChange={(e) => setPhoneCodeAndCountry(e.target.value)}
                        style={{
                          fontSize: phoneCode && phoneCode.length > 4 ? '0.75rem' : '0.875rem'
                        }}
                        {...cursorTextHandlers}
                      >
                        <option value="">Code…</option>
                        {phoneCodes.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </SelectBase>
                      {renderClear(
                        () => setPhoneCode(""),
                        !phoneCode
                      )}
                    </Field>
                  </div>

                  <Field
                    label="Email"
                    error={errors.email}
                    theme={theme}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, email: "" }));
                        clearError("email");
                      },
                      !form.email
                    )}
                  >
                    <InputBase
                      theme={theme}
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      autoComplete="email"
                      error={errors.email}
                      {...cursorTextHandlers}
                    />
                  </Field>

                  <Field label="Phone Number" error={errors.phone} theme={theme}>
                    <InputBase
                      theme={theme}
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="Phone number"
                      autoComplete="tel"
                      error={errors.phone}
                      {...cursorTextHandlers}
                    />
                    {renderClear(
                      () => {
                        setForm((p) => ({ ...p, phone: "" }));
                        clearError("phone");
                      },
                      !form.phone
                    )}
                  </Field>

                  <div className="md:col-span-2">
                    <Field
                      label="Why you wish to join (in detail if possible)"
                      theme={theme}
                      clearAction={renderClear(
                        () => setForm((p) => ({ ...p, whyJoin: "" })),
                        !form.whyJoin
                      )}
                    >
                      <TextAreaBase
                        theme={theme}
                        value={form.whyJoin}
                        onChange={set("whyJoin")}
                        placeholder="Share your intention and what you are seeking…"
                        {...cursorTextHandlers}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                  <Field
                    label="Education"
                    error={errors.education}
                    theme={theme}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, education: "" }));
                        clearError("education");
                      },
                      !form.education
                    )}
                  >
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.education}
                      onChange={set("education")}
                      placeholder="Your education"
                      error={errors.education}
                      {...cursorTextHandlers}
                    />
                  </Field>

                  <Field
                    label="Religion"
                    error={errors.religion}
                    theme={theme}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, religion: "" }));
                        clearError("religion");
                      },
                      !form.religion
                    )}
                  >
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.religion}
                      onChange={set("religion")}
                      placeholder="Your religion"
                      error={errors.religion}
                      {...cursorTextHandlers}
                    />
                  </Field>

                  <Field
                    label="Marital Status"
                    theme={theme}
                    error={errors.maritalStatus}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, maritalStatus: "" }));
                        clearError("maritalStatus");
                      },
                      !form.maritalStatus
                    )}
                  >
                    <SelectBase
                      theme={theme}
                      value={form.maritalStatus}
                      onChange={set("maritalStatus")}
                      {...cursorTextHandlers}
                    >
                      <option value="">Select…</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                      <option value="celibate">Celibate</option>
                    </SelectBase>
                  </Field>

                  <Field
                    label="No. of Children"
                    theme={theme}
                    clearAction={renderClear(
                      () => setForm((p) => ({ ...p, childrenCount: "" })),
                      !String(form.childrenCount).trim()
                    )}
                  >
                    <InputBase
                      theme={theme}
                      type="number"
                      min="0"
                      value={form.childrenCount}
                      onChange={set("childrenCount")}
                      placeholder="0"
                      {...cursorTextHandlers}
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5 sm:gap-6 md:gap-8">
                  <Field label="Taking any meds?" theme={theme} error={errors.medsTaking}>
                    <div className="grid sm:grid-cols-[180px_1fr] gap-4">
                      <div className="space-y-2">
                        <SelectBase
                          theme={theme}
                          value={form.medsTaking}
                          title={form.medsTaking}
                          onChange={setMedsTaking}
                          {...cursorTextHandlers}
                        >
                          <option value="">Select…</option>
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </SelectBase>
                        {renderClear(
                          () => setForm((p) => ({ ...p, medsTaking: "", meds: "" })),
                          !form.medsTaking
                        )}
                      </div>

                      <div className="space-y-2">
                        <InputBase
                          theme={theme}
                          type="text"
                          value={form.meds}
                          onChange={set("meds")}
                          placeholder="If yes, please mention"
                          disabled={form.medsTaking !== "yes"}
                          {...cursorTextHandlers}
                        />
                        {renderClear(
                          () => setForm((p) => ({ ...p, meds: "" })),
                          !form.meds
                        )}
                      </div>
                    </div>
                  </Field>

                  <Field
                    label="Any medical / health issues?"
                    error={errors.healthIssues}
                    theme={theme}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, healthIssues: "" }));
                        clearError("healthIssues");
                      },
                      !form.healthIssues
                    )}
                  >
                    <TextAreaBase
                      theme={theme}
                      value={form.healthIssues}
                      onChange={set("healthIssues")}
                      placeholder="Please describe any medical / health issues"
                      {...cursorTextHandlers}
                    />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5 sm:gap-6 md:gap-8">
                  <Field
                    label="Have you been initiated prior to this?"
                    error={errors.initiatedBefore}
                    theme={theme}
                    clearAction={renderClear(
                      () => {
                        setForm((p) => ({ ...p, initiatedBefore: "" }));
                        clearError("initiatedBefore");
                      },
                      !form.initiatedBefore
                    )}
                  >
                    <SelectBase
                      theme={theme}
                      value={form.initiatedBefore}
                      onChange={set("initiatedBefore")}
                      error={errors.initiatedBefore}
                      {...cursorTextHandlers}
                    >
                      <option value="">Select…</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </SelectBase>
                  </Field>

                    {form.initiatedBefore === "yes" && (
                      <Field
                        label="If yes, please share details of the lineage"
                        theme={theme}
                        clearAction={renderClear(
                          () => setForm((p) => ({ ...p, lineageDetails: "" })),
                          !form.lineageDetails
                        )}
                      >
                        <TextAreaBase
                          theme={theme}
                          value={form.lineageDetails}
                          onChange={set("lineageDetails")}
                          placeholder="Lineage / Guru / tradition details…"
                          {...cursorTextHandlers}
                        />
                      </Field>
                    )}

                  <Field
                    label="Get members-only club access + benefits"
                    theme={theme}
                    clearAction={renderClear(
                      () => setForm((p) => ({ ...p, subscribe: false })),
                      !form.subscribe
                    )}
                  >
                    <label className="flex items-center gap-3 select-none">
                      <input
                        type="checkbox"
                        checked={form.subscribe}
                        onChange={set("subscribe")}
                        className="w-4 h-4"
                        style={{ accentColor: theme.accent }}
                      />
                      <span 
                        className="text-sm"
                        style={{ color: theme.textLight }}
                      >
                        Yes, keep me updated
                      </span>
                    </label>
                  </Field>
                </div>
              )}

              {step === 4 && (
                <div className="py-10 text-center">
                  <CheckCircle2 
                    className="mx-auto mb-6 opacity-80" 
                    size={40}
                    style={{ color: theme.accent }}
                  />
                  <h2 
                    className="text-3xl font-light"
                    style={{ color: theme.text }}
                  >
                    Submitted
                  </h2>
                  <p 
                    className="text-sm mt-3 max-w-xl mx-auto leading-relaxed"
                    style={{ color: theme.textMuted }}
                  >
                    Thank you. We will review your details and guide you on the next
                    steps.
                  </p>
                    <button
                      onClick={() => navigate("/")}
                      className="mt-8 px-8 py-3 border text-sm tracking-wide transition-colors"
                      style={{
                        borderColor: isDark ? theme.borderStrong : theme.borderStrong,
                        color: theme.text,
                        backgroundColor: isDark ? theme.colors.bg.secondary : '#ffffff',
                        boxShadow: isDark
                          ? '0 0 0 1px rgba(255,255,255,0.06)'
                          : '0 8px 20px rgba(0,0,0,0.08)'
                      }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? theme.colors.bg.card
                        : theme.colors.bg.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? theme.colors.bg.secondary
                        : '#ffffff';
                    }}
                  >
                    Return Home
                  </button>
                </div>
              )}
            </div>

            {/* Footer controls */}
            {step !== 4 && (
              <div
                className="px-4 sm:px-6 md:px-10 py-5 sm:py-6 md:py-8 border-t flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: theme.border }}
              >
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className="w-full sm:w-auto px-6 py-3 border text-sm tracking-wide transition-colors"
                  style={{
                    borderColor: step === 0 ? theme.borderLight : theme.border,
                    color: step === 0 ? theme.textMuted : theme.textLight,
                    cursor: step === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: step === 0
                      ? theme.colors.bg.secondary
                      : (isDark ? theme.colors.bg.secondary : '#ffffff'),
                    boxShadow: step === 0
                      ? 'none'
                      : (isDark
                        ? '0 0 0 1px rgba(255,255,255,0.06)'
                        : '0 8px 20px rgba(0,0,0,0.08)')
                  }}
                  onMouseEnter={(e) => {
                    if (step !== 0) {
                      e.currentTarget.style.backgroundColor = isDark
                        ? theme.colors.bg.card
                        : theme.colors.bg.secondary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (step !== 0) {
                      e.currentTarget.style.backgroundColor = isDark
                        ? theme.colors.bg.secondary
                        : '#ffffff';
                    }
                  }}
                >
                  Back
                </button>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  {step < steps.length - 2 ? (
                    <button
                      onClick={next}
                      disabled={!canNext()}
                      className="w-full sm:w-auto px-8 py-3 text-sm tracking-wide border transition-all inline-flex items-center justify-center gap-2"
                      style={{
                        borderColor: canNext()
                          ? (isDark ? theme.borderStrong : theme.borderStrong)
                          : theme.borderLight,
                        color: canNext()
                          ? theme.text
                          : theme.textMuted,
                        cursor: canNext() ? 'pointer' : 'not-allowed',
                        backgroundColor: canNext()
                          ? (isDark ? theme.colors.bg.secondary : '#ffffff')
                          : theme.colors.bg.secondary,
                        opacity: canNext() ? 1 : 0.6,
                        boxShadow: canNext()
                          ? (isDark
                            ? '0 0 0 1px rgba(255,255,255,0.06)'
                            : '0 8px 20px rgba(0,0,0,0.08)')
                          : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (canNext()) {
                          e.currentTarget.style.backgroundColor = isDark
                            ? theme.colors.bg.card
                            : '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canNext()) {
                          e.currentTarget.style.backgroundColor = isDark
                            ? theme.colors.bg.secondary
                            : '#ffffff';
                        }
                      }}
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      className="w-full sm:w-auto px-10 py-3 text-sm tracking-wide border transition-all"
                      style={{
                        backgroundColor: isDark ? theme.colors.bg.secondary : theme.accent,
                        borderColor: isDark ? theme.borderStrong : theme.accent,
                        color: isDark ? theme.text : '#ffffff',
                        boxShadow: isDark
                          ? '0 0 0 1px rgba(255,255,255,0.06)'
                          : '0 8px 20px rgba(0,0,0,0.12)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? theme.colors.bg.card
                          : theme.accentHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? theme.colors.bg.secondary
                          : theme.accent;
                      }}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home button */}
        <div className="relative z-10 text-center pb-8 sm:pb-10">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 border text-sm tracking-wide transition-colors"
            style={{
              borderColor: theme.borderStrong,
              color: theme.text,
              backgroundColor: isDark ? theme.colors.bg.secondary : '#ffffff',
              boxShadow: isDark
                ? '0 0 0 1px rgba(255,255,255,0.06)'
                : '0 8px 24px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? theme.colors.bg.card
                : theme.colors.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? theme.colors.bg.secondary
                : '#ffffff';
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>

      <style>{`
        textarea::placeholder {
          color: ${theme.textMuted};
          opacity: 0.7;
        }
        
        input::placeholder {
          color: ${theme.textMuted};
          opacity: 0.7;
        }

        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type=number] {
          -moz-appearance: textfield;
        }
        
        select {
          color: ${theme.text};
        }
        
        select option {
          background-color: ${theme.colors.bg.card};
          color: ${theme.text};
        }
      `}</style>
    </div>
  );
}
