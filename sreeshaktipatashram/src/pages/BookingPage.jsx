import { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

const BG_IMG =
  "https://dhunwellness.com/cdn/shop/files/Sound_healing_room.jpg?v=1751348144&width=1920";

const COUNTRY_META = {
  India: { code: "+91", states: ["Maharashtra", "Delhi", "Karnataka"] },
  USA: { code: "+1", states: ["California", "New York", "Texas"] },
  UK: { code: "+44", states: ["England", "Scotland", "Wales"] },
};

function Field({ label, children, hint }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <label className="text-sm tracking-wide text-white/80">{label}</label>
        {hint ? <span className="text-[11px] text-white/40">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function InputBase({ inputBorder, className="", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-white/5 border ${inputBorder} px-4 py-3 text-white outline-none focus:border-white/35 transition-colors ${className}`}
    />
  );
}

function SelectBase({ className = "", isDark, ...props }) {
  const inputBorder = isDark ? "border-white/15" : "border-black/25";

  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none bg-white/5 border ${inputBorder} px-4 py-3 pr-10 text-white outline-none
          focus:border-white/35 transition-colors ${className}`}
      />
      <ChevronDown
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
      />
    </div>
  );
}


function TextAreaBase({ inputBorder, className="", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[140px] bg-white/5 border ${inputBorder} px-4 py-3 text-white outline-none focus:border-white/35 transition-colors resize-y ${className}`}
    />
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { isDark } = useOutletContext(); // ✅ from AppShell
  const [step, setStep] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { ok: false, msg: "Email format is invalid (example: name@domain.com)." };
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

  const modalBorder = isDark ? "border-white/15" : "border-black/30";
  const thinBorder  = isDark ? "border-white/10" : "border-black/15";
  const inputBorder = isDark ? "border-white/15" : "border-black/25";

  const set = (key) => (e) => {
    const value =
      e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) {
        return (
            form.fullName.trim() &&
            String(form.age).trim() &&
            form.gender &&
            form.city.trim() &&
            emailInfo.ok &&
            form.phone.trim()
        );
    }
    if (step === 1) return form.education.trim() && form.religion.trim();
    if (step === 2) return true;
    if (step === 3) {
      return form.initiatedBefore !== "";
    }
    return true;
  };

  const next = () => {
    if (!canNext()) {
        setAttemptedNext(true);
        setTimeout(() => setAttemptedNext(false), 650);
        return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
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
        alert("Could not submit. Is the backend running?");
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background image (modal inspiration only) */}
      <div className="absolute inset-0">
        <img
          src={BG_IMG}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Centered modal */}
      <div className="relative z-10 px-6 pb-16 pt-10 flex items-center justify-center">
        <div className={`w-full max-w-4xl border ${modalBorder} bg-black/30 backdrop-blur-xl shadow-2xl flex flex-col min-h-[720px]`}>
          {/* Header */}
          <div className={`px-10 py-8 border-b ${thinBorder}`}>
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-[10px] tracking-[0.35em] text-white/60">
                  BOOKING
                </p>
                <h1 className="text-3xl md:text-4xl font-light tracking-tight mt-3">
                  Begin Your Journey
                </h1>
                <p className="text-sm text-white/60 mt-3 max-w-2xl leading-relaxed">
                  Please fill in the details below. This helps us understand your
                  intent and guide you with care.
                </p>
              </div>

              <div className="hidden md:block text-right">
                <p className="text-xs text-white/50 tracking-[0.25em]">
                  STEP {step + 1} / {steps.length}
                </p>
                <p className="text-sm text-white/70 mt-2">{steps[step]?.title}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 relative">
            <div className="h-[2px] bg-white/10">
                <div
                className="h-full bg-teal-400/70 transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>

            {/* marker */}
            <div
                className="absolute top-0"
                style={{ left: `calc(${((step + 1) / steps.length) * 100}% - 10px)` }}
            >
                <div className="w-5 h-5 rounded-full bg-teal-400 -translate-y-1/2" />
                <div className="text-[11px] text-white/70 mt-3 text-center w-5">
                {step + 1}
                </div>
            </div>
            </div>

          </div>

          {/* Body */}
          <div className="px-10 py-10">
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-8">
                <Field label="Full Name">
                  <InputBase
                    inputBorder={inputBorder}
                    type="text"
                    value={form.fullName}
                    onChange={set("fullName")}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Age">
                  <InputBase
                    inputBorder={inputBorder}
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={set("age")}
                    placeholder="Your age"
                  />
                </Field>

                <Field label="Gender">
                  <SelectBase isDark={isDark} value={form.gender} onChange={set("gender")}>
                    <option value="" className="bg-black">Select…</option>
                    <option value="male" className="bg-black">Male</option>
                    <option value="female" className="bg-black">Female</option>
                    <option value="other" className="bg-black">Other</option>
                    <option value="celibate" className="bg-black">Celibate</option>
                  </SelectBase>
                </Field>

                <Field label="Location">
                <div className="grid sm:grid-cols-3 gap-4">
                    <SelectBase isDark={isDark} value={location.country} onChange={(e)=>setLocation(p=>({ ...p, country: e.target.value }))}>
                    {Object.keys(COUNTRY_META).map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                    </SelectBase>

                    <SelectBase isDark={isDark} value={location.state} onChange={(e)=>setLocation(p=>({ ...p, state: e.target.value }))}>
                    <option value="" className="bg-black">State…</option>
                    {COUNTRY_META[location.country].states.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                    </SelectBase>

                    <InputBase
                        inputBorder={inputBorder}
                        type="text"
                        value={location.city}
                        onChange={(e)=>setLocation(p=>({ ...p, city: e.target.value }))}
                        placeholder="City"
                    />
                </div>
                </Field>


                <Field label="Email">
                    <InputBase
                        inputBorder={inputBorder}
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={attemptedNext && !emailInfo.ok ? "ring-2 ring-red-500/60" : ""}
                    />
                    <p className={`text-xs ${emailInfo.ok ? "text-green-400" : "text-red-400"}`}>
                        {emailInfo.msg}
                    </p>
                </Field>

                <Field label="Phone Number">
                <div className="grid grid-cols-[120px_1fr] gap-4">
                    <SelectBase isDark={isDark} value={phoneCode} onChange={(e)=>setPhoneCode(e.target.value)}>
                    {Object.values(COUNTRY_META).map(m => (
                        <option key={m.code} value={m.code} className="bg-black">{m.code}</option>
                    ))}
                    </SelectBase>

                    <InputBase
                    inputBorder={inputBorder}
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="Phone number"
                    autoComplete="tel"
                    />
                </div>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Why you wish to join (in detail if possible)">
                    <TextAreaBase
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
                <Field label="Education">
                  <InputBase
                    inputBorder={inputBorder}
                    type="text"
                    value={form.education}
                    onChange={set("education")}
                    placeholder="Your education"
                  />
                </Field>

                <Field label="Religion">
                  <InputBase
                    inputBorder={inputBorder}
                    type="text"
                    value={form.religion}
                    onChange={set("religion")}
                    placeholder="Your religion"
                  />
                </Field>

                <Field label="Marital Status">
                  <SelectBase
                    isDark={isDark}
                    value={form.maritalStatus}
                    onChange={set("maritalStatus")}
                  >
                    <option value="" className="bg-black">Select…</option>
                    <option value="single" className="bg-black">Single</option>
                    <option value="married" className="bg-black">Married</option>
                    <option value="divorced" className="bg-black">Divorced</option>
                    <option value="widowed" className="bg-black">Widowed</option>
                  </SelectBase>
                </Field>

                <Field label="No. of Children">
                  <InputBase
                    inputBorder={inputBorder}
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
                <Field label="Taking any meds?" hint="Optional">
                  <InputBase
                    inputBorder={inputBorder}
                    type="text"
                    value={form.meds}
                    onChange={set("meds")}
                    placeholder="If yes, please mention"
                  />
                </Field>

                <Field label="Any medical / health issues?">
                  <TextAreaBase
                    value={form.healthIssues}
                    onChange={set("healthIssues")}
                    placeholder="If yes, please describe (optional)."
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-8">
                <Field label="Have you been initiated prior to this?">
                  <SelectBase
                    isDark={isDark}
                    value={form.initiatedBefore}
                    onChange={set("initiatedBefore")}
                  >
                    <option value="no" className="bg-black">No</option>
                    <option value="yes" className="bg-black">Yes</option>
                  </SelectBase>
                </Field>

                {form.initiatedBefore === "yes" && (
                  <Field label="If yes, please share details of the lineage">
                    <TextAreaBase
                      value={form.lineageDetails}
                      onChange={set("lineageDetails")}
                      placeholder="Lineage / Guru / tradition details…"
                    />
                  </Field>
                )}

                <Field label="Get members-only club access + benefits">
                  <label className="flex items-center gap-3 select-none">
                    <input
                      type="checkbox"
                      checked={form.subscribe}
                      onChange={set("subscribe")}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-white/70">
                      Yes, keep me updated
                    </span>
                  </label>
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto mb-6 opacity-80" size={40} />
                <h2 className="text-3xl font-light">Submitted</h2>
                <p className="text-sm text-white/60 mt-3 max-w-xl mx-auto leading-relaxed">
                  Thank you. We will review your details and guide you on the next steps.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-8 px-8 py-3 border border-white/20 text-sm tracking-wide text-white/80 hover:text-white hover:border-white/35 transition-colors"
                >
                  Return Home
                </button>
              </div>
            )}
          </div>

          {/* Footer controls */}
          {step !== 4 && (
            <div className={`px-10 py-8 border-t ${thinBorder} flex items-center justify-between`}>
              <button
                onClick={prev}
                disabled={step === 0}
                className={`px-6 py-3 border text-sm tracking-wide transition-colors ${
                  step === 0
                    ? "border-white/10 text-white/30 cursor-not-allowed"
                    : "border-white/20 text-white/70 hover:text-white hover:border-white/35"
                }`}
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                {step < steps.length - 2 ? (
                  <button
                    onClick={next}
                    disabled={!canNext()}
                    className={`px-8 py-3 text-sm tracking-wide border transition-colors inline-flex items-center gap-2 ${
                      canNext()
                        ? "border-white/20 text-white/80 hover:text-white hover:border-white/35"
                        : "border-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    className="px-10 py-3 text-sm tracking-wide bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      
        {/* ✅ fixed spot below modal */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-10 py-3 border border-white/20 text-sm tracking-wide text-white/80 hover:text-white hover:border-white/35 transition-colors"
        >
          Back to Home
        </button>


        {/* <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm tracking-wide text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button> */}

    </div>
  );
}
