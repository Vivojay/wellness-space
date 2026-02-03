import { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

import bgImage from '/photos/Blue Pastel Abstract Grid Line BG.png';

const BG_IMG =
  "https://dhunwellness.com/cdn/shop/files/Sound_healing_room.jpg?v=1751348144&width=1920";

const COUNTRY_META = {
  India: { code: "+91", states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "West Bengal"] },
  USA: { code: "+1", states: ["California", "New York", "Texas", "Florida", "Illinois"] },
  UK: { code: "+44", states: ["England", "Scotland", "Wales", "Northern Ireland"] },
  Canada: { code: "+1", states: ["Ontario", "Quebec", "British Columbia", "Alberta"] },
  Australia: { code: "+61", states: ["New South Wales", "Victoria", "Queensland", "Western Australia"] },
};

function Field({ label, children, hint, error, theme }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm tracking-wide" style={{ color: theme.textLight }}>
          {label}
        </label>
        {hint && <span className="text-[11px]" style={{ color: theme.textMuted }}>{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function InputBase({ theme, className = "", error, ...props }) {
  return (
    <input
      {...props}
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

function SelectBase({ className = "", theme, error, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none px-4 py-3 pr-10 outline-none transition-colors ${className}`}
        style={{
          backgroundColor: theme.colors.bg.card,
          border: error 
            ? '1px solid rgba(239, 68, 68, 0.6)' 
            : `1px solid ${theme.border}`,
          color: theme.text,
          boxShadow: error ? '0 0 0 2px rgba(239, 68, 68, 0.1)' : 'none'
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

function TextAreaBase({ theme, className = "", ...props }) {
  return (
    <textarea
      {...props}
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
  const { isDark, theme } = useOutletContext();
  const [step, setStep] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState({ country: "India", state: "", city: "" });
  const [phoneCode, setPhoneCode] = useState(COUNTRY_META["India"].code);

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
    meds: "",
    healthIssues: "",
    initiatedBefore: "no",
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

  useEffect(() => {
    const meta = COUNTRY_META[location.country];
    if (meta) setPhoneCode(meta.code);
    setLocation((p) => ({ ...p, state: "", city: "" }));
  }, [location.country]);

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

  const set = (key) => (e) => {
    const value =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!String(form.age).trim()) newErrors.age = "Age is required";
      if (!form.gender) newErrors.gender = "Gender is required";
      if (!location.city.trim()) newErrors.city = "City is required";
      if (!emailInfo.ok) newErrors.email = emailInfo.msg;
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (stepIndex === 1) {
      if (!form.education.trim()) newErrors.education = "Education is required";
      if (!form.religion.trim()) newErrors.religion = "Religion is required";
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
      return (
        form.fullName.trim() &&
        String(form.age).trim() &&
        form.gender &&
        location.city.trim() &&
        emailInfo.ok &&
        form.phone.trim()
      );
    }
    if (step === 1) return form.education.trim() && form.religion.trim();
    if (step === 2) return true;
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
    const payload = {
      ...form,
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

  return (
    <div 
      className="min-h-screen text-white relative"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <div className="absolute inset-0 overflow-y-auto">
        {/* Background image */}
        <div className="fixed inset-0 pointer-events-none">
          <img
            src={BG_IMG}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }}
          />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>

        {/* Centered modal */}
        <div className="relative z-10 px-6 py-16 flex items-center justify-center min-h-screen">
          <div
            className="w-full max-w-4xl border shadow-2xl flex flex-col"
            style={{
              backgroundImage: `linear-gradient(${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)'}, ${isDark ? 'rgba(20, 60, 80, 0.5)' : 'rgba(108, 229, 250, 0.3)'}), url(${bgImage})`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '-700px 0px',
              backgroundColor: theme.colors.bg.card,
            }}
          >
            {/* Header */}
            <div 
              className="px-10 py-8 border-b"
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
                    className="text-3xl md:text-4xl font-light tracking-tight mt-3"
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
                
                <div className="flex justify-between mt-3">
                  {steps.slice(0, -1).map((s, i) => (
                    <div
                      key={i}
                      className="text-[10px] tracking-wider transition-colors"
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
            <div className="px-10 py-10">
              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-8">
                  <Field label="Full Name" error={errors.fullName} theme={theme}>
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.fullName}
                      onChange={set("fullName")}
                      placeholder="Your full name"
                      autoComplete="name"
                      error={errors.fullName}
                    />
                  </Field>

                  <Field label="Age" error={errors.age} theme={theme}>
                    <InputBase
                      theme={theme}
                      type="number"
                      min="0"
                      value={form.age}
                      onChange={set("age")}
                      placeholder="Your age"
                      error={errors.age}
                    />
                  </Field>

                  <Field label="Gender" error={errors.gender} theme={theme}>
                    <SelectBase
                      theme={theme}
                      value={form.gender}
                      onChange={set("gender")}
                      error={errors.gender}
                    >
                      <option value="">Select…</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="celibate">Celibate</option>
                    </SelectBase>
                  </Field>

                  <Field label="Location" error={errors.city} theme={theme}>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <SelectBase
                        theme={theme}
                        value={location.country}
                        onChange={(e) =>
                          setLocation((p) => ({ ...p, country: e.target.value }))
                        }
                      >
                        {Object.keys(COUNTRY_META).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </SelectBase>

                      <SelectBase
                        theme={theme}
                        value={location.state}
                        onChange={(e) =>
                          setLocation((p) => ({ ...p, state: e.target.value }))
                        }
                      >
                        <option value="">State…</option>
                        {COUNTRY_META[location.country].states.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </SelectBase>

                      <InputBase
                        theme={theme}
                        type="text"
                        value={location.city}
                        onChange={(e) =>
                          setLocation((p) => ({ ...p, city: e.target.value }))
                        }
                        placeholder="City"
                        error={errors.city}
                      />
                    </div>
                  </Field>

                  <Field label="Email" error={errors.email} theme={theme}>
                    <InputBase
                      theme={theme}
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      autoComplete="email"
                      error={errors.email}
                    />
                  </Field>

                  <Field label="Phone Number" error={errors.phone} theme={theme}>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <SelectBase
                        theme={theme}
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                      >
                        {Object.entries(COUNTRY_META).map(([country, m]) => (
                          <option key={country} value={m.code}>
                            {m.code}
                          </option>
                        ))}
                      </SelectBase>

                      <InputBase
                        theme={theme}
                        type="tel"
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="Phone number"
                        autoComplete="tel"
                        error={errors.phone}
                      />
                    </div>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Why you wish to join (in detail if possible)" theme={theme}>
                      <TextAreaBase
                        theme={theme}
                        value={form.whyJoin}
                        onChange={set("whyJoin")}
                        placeholder="Share your intention and what you are seeking…"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-8">
                  <Field label="Education" error={errors.education} theme={theme}>
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.education}
                      onChange={set("education")}
                      placeholder="Your education"
                      error={errors.education}
                    />
                  </Field>

                  <Field label="Religion" error={errors.religion} theme={theme}>
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.religion}
                      onChange={set("religion")}
                      placeholder="Your religion"
                      error={errors.religion}
                    />
                  </Field>

                  <Field label="Marital Status" theme={theme}>
                    <SelectBase
                      theme={theme}
                      value={form.maritalStatus}
                      onChange={set("maritalStatus")}
                    >
                      <option value="">Select…</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </SelectBase>
                  </Field>

                  <Field label="No. of Children" theme={theme}>
                    <InputBase
                      theme={theme}
                      type="number"
                      min="0"
                      value={form.childrenCount}
                      onChange={set("childrenCount")}
                      placeholder="0"
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-8">
                  <Field label="Taking any meds?" hint="Optional" theme={theme}>
                    <InputBase
                      theme={theme}
                      type="text"
                      value={form.meds}
                      onChange={set("meds")}
                      placeholder="If yes, please mention"
                    />
                  </Field>

                  <Field label="Any medical / health issues?" theme={theme}>
                    <TextAreaBase
                      theme={theme}
                      value={form.healthIssues}
                      onChange={set("healthIssues")}
                      placeholder="If yes, please describe (optional)."
                    />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-8">
                  <Field
                    label="Have you been initiated prior to this?"
                    error={errors.initiatedBefore}
                    theme={theme}
                  >
                    <SelectBase
                      theme={theme}
                      value={form.initiatedBefore}
                      onChange={set("initiatedBefore")}
                      error={errors.initiatedBefore}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </SelectBase>
                  </Field>

                  {form.initiatedBefore === "yes" && (
                    <Field label="If yes, please share details of the lineage" theme={theme}>
                      <TextAreaBase
                        theme={theme}
                        value={form.lineageDetails}
                        onChange={set("lineageDetails")}
                        placeholder="Lineage / Guru / tradition details…"
                      />
                    </Field>
                  )}

                  <Field label="Get members-only club access + benefits" theme={theme}>
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
                      borderColor: theme.border,
                      color: theme.textLight
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
                className="px-10 py-8 border-t flex items-center justify-between"
                style={{ borderColor: theme.border }}
              >
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className="px-6 py-3 border text-sm tracking-wide transition-colors"
                  style={{
                    borderColor: step === 0 ? theme.borderLight : theme.border,
                    color: step === 0 ? theme.textMuted : theme.textLight,
                    cursor: step === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: step === 0 ? theme.colors.bg.secondary : 'transparent'
                  }}
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {step < steps.length - 2 ? (
                    <button
                      onClick={next}
                      disabled={!canNext()}
                      className="px-8 py-3 text-sm tracking-wide border transition-all inline-flex items-center gap-2"
                      style={{
                        borderColor: canNext() ? theme.border : theme.borderLight,
                        color: canNext() ? theme.textLight : theme.textMuted,
                        cursor: canNext() ? 'pointer' : 'not-allowed',
                        backgroundColor: canNext() ? 'transparent' : theme.colors.bg.secondary,
                        opacity: canNext() ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (canNext()) {
                          e.currentTarget.style.backgroundColor = theme.accent + '20';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canNext()) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      className="px-10 py-3 text-sm tracking-wide border transition-all"
                      style={{
                        backgroundColor: theme.accent,
                        borderColor: theme.accent,
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
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
        <div className="relative z-10 text-center pb-10">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 border text-sm tracking-wide transition-colors"
            style={{
              borderColor: theme.border,
              color: theme.textLight
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