import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { DodoPayments } from "dodopayments-checkout";

const DODO_MODE = (import.meta.env.VITE_DODO_MODE || "test").toLowerCase();

export default function DonatePage() {
  const { isDark, theme } = useOutletContext();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("1000");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [invoice, setInvoice] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const sessionRef = useRef("");
  const nameRef = useRef("");
  const emailRef = useRef("");
  const phoneRef = useRef("");

  useEffect(() => {
    nameRef.current = name;
    emailRef.current = email;
    phoneRef.current = phone;
  }, [name, email, phone]);

  useEffect(() => {
    try {
      DodoPayments.Initialize({
        mode: DODO_MODE === "live" ? "live" : "test",
        displayType: "overlay",
        onEvent: (event) => {
          if (event.event_type === "checkout.opened") {
            setLoading(false);
          }
          if (event.event_type === "checkout.error") {
            setLoading(false);
            setStatusMessage("Payment error. Please try again.");
          }
          if (event.event_type === "checkout.status") {
            const status = event.data?.message?.status;
            if (status === "succeeded" && sessionRef.current) {
              fetchSessionStatus(sessionRef.current);
            }
            if (status === "failed") {
              setStatusMessage("Payment failed. Please try again.");
            }
          }
        },
      });
      setReady(true);
    } catch (e) {
      setReady(false);
    }
  }, []);

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const displayAmount = useMemo(() => {
    if (!Number.isFinite(parsedAmount)) return "0";
    return parsedAmount.toLocaleString();
  }, [parsedAmount]);

  const fetchSessionStatus = async (activeSessionId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/dodo/session/${activeSessionId}`);
      if (!res.ok) throw new Error("Failed to fetch session status");
      const data = await res.json();
      if (data.payment_status === "succeeded") {
        setInvoice({
          sessionId: data.session_id,
          paymentId: data.payment_id,
          amount: data.amount,
          currency: data.currency || currency,
          name: data.customer_name || nameRef.current,
          email: data.customer_email || emailRef.current,
          phone: phoneRef.current,
          invoiceUrl: data.invoice_url,
          issuedAt: new Date().toISOString()
        });
        setStatusMessage("Payment received successfully.");
      }
    } catch (e) {
      setStatusMessage("Payment received. Fetching receipt failed.");
    }
  };

  const startPayment = async () => {
    if (!isAmountValid) return;
    if (!ready) return;

    setLoading(true);
    setInvoice(null);
    setStatusMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/dodo/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount * 100,
          currency,
          name,
          email,
          phone
        })
      });

      if (!res.ok) throw new Error("Checkout creation failed");
      const data = await res.json();
      if (!data.checkout_url) throw new Error("Checkout URL missing");
      setSessionId(data.session_id);
      sessionRef.current = data.session_id;

      await DodoPayments.Checkout.open({
        checkoutUrl: data.checkout_url,
        options: {
          manualRedirect: true,
        },
      });
    } catch (e) {
      console.error(e);
      setStatusMessage("Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen px-6 md:px-24 pt-32 pb-24 relative overflow-hidden"
      style={{ backgroundColor: theme.colors.bg.primary, color: theme.text }}
    >
      <div
        className="fixed top-0 bottom-0 right-0 z-[40]"
        style={{
          left: "var(--sidebar-width, 0px)",
          width: "calc(100% - var(--sidebar-width, 0px))"
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: isDark ? "rgba(20, 20, 20, 0.90)" : "rgba(240, 240, 240, 0.32)",
            backdropFilter: "blur(15px)",
            WebkitMaskImage:
              "linear-gradient(-10deg, #000 0%, #000 47%, transparent 47%, transparent 55%, #000 55%, #000 100%)",
            maskImage:
              "linear-gradient(-10deg, #000 0%, #000 47%, transparent 47%, transparent 55%, #000 55%, #000 100%)",
            WebkitMaskSize: "140% 140%",
            maskSize: "140% 140%",
            WebkitMaskPosition: "15% -15%",
            maskPosition: "15% -15%"
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 -translate-y-6">
            <p
              className="text-[11px] tracking-[0.5em] uppercase"
              style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}
            >
              Coming Soon
            </p>
            <h2
              className="mt-4 text-4xl md:text-6xl font-semibold tracking-[0.08em]"
              style={{ color: isDark ? "#ffffff" : "#111111" }}
            >
              Donations Coming Shortly
            </h2>
            <p className="mt-4 text-sm font-semibold" style={{ color: "#f59e0b" }}>
              For donations, please{' '}
              <a
                href="https://wa.me/919819962635"
                target="_blank"
                rel="noreferrer"
                className="px-1"
                style={{
                  color: "#b91c1c",
                  borderRadius: "0px",
                  transition: "all 200ms ease",
                  textDecoration: "underline",
                  textDecorationColor: "#b91c1c"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#b91c1c";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#b91c1c";
                }}
              >
                Whatsapp Siddhamayoga
              </a>
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 px-8 py-3 border text-sm tracking-wide transition-colors"
              style={{
                borderColor: isDark ? theme.borderStrong : theme.borderStrong,
                color: isDark ? '#ffffff' : '#111111',
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
              <ArrowLeft size={16} />
              Return Home
            </button>
            <div className="mt-6 mx-auto h-[2px] w-28" style={{ backgroundColor: theme.accent }} />
            <div
              className="mt-8 mx-auto h-10 w-10 border"
              style={{ borderColor: theme.accent, transform: "rotate(12deg)" }}
            />
          </div>
        </div>
      </div>
      <div
        className="absolute -left-20 top-24 w-[140%] h-16 rotate-[-10deg] z-0"
        style={{
          background: `linear-gradient(90deg, ${theme.accent}20, ${theme.accent}66, ${theme.accent}20)`
        }}
      />
      <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12">
        <div>
          <p
            className="text-[11px] tracking-[0.4em] uppercase"
            style={{ color: theme.textMuted }}
          >
            Donate
          </p>
          <h1
            className="text-4xl md:text-5xl font-light tracking-tight mt-6"
            style={{ color: theme.text }}
          >
            Support the Lineage
          </h1>
          <p
            className="mt-6 text-base leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            Your contribution supports teachings, retreats, and the preservation of
            the Shaktipat lineage. Every offering helps us reach seekers across the
            world.
          </p>

          <div
            className="mt-10 border p-6"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.colors.bg.card
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: theme.textMuted }}>
                Amount
              </span>
              <span className="text-2xl font-semibold" style={{ color: theme.text }}>
                {currency} {displayAmount}
              </span>
            </div>
            <div className="mt-4">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border outline-none"
                style={{
                  backgroundColor: theme.colors.bg.secondary,
                  borderColor: theme.border,
                  color: theme.text
                }}
                placeholder="Enter amount"
              />
            </div>
          </div>
        </div>

        <div
          className="border p-8"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.colors.bg.card
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center border"
              style={{ borderColor: theme.accent, color: theme.accent }}
            >
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Secure Payment
              </p>
              <p className="text-lg" style={{ color: theme.text }}>
                Dodo Payments Checkout
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border outline-none"
              style={{
                backgroundColor: theme.colors.bg.secondary,
                borderColor: theme.border,
                color: theme.text
              }}
              placeholder="Full name (optional)"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border outline-none"
              style={{
                backgroundColor: theme.colors.bg.secondary,
                borderColor: theme.border,
                color: theme.text
              }}
              placeholder="Email (optional)"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border outline-none"
              style={{
                backgroundColor: theme.colors.bg.secondary,
                borderColor: theme.border,
                color: theme.text
              }}
              placeholder="Phone (optional)"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled
              className="w-full px-4 py-3 border outline-none"
              style={{
                backgroundColor: theme.colors.bg.secondary,
                borderColor: theme.border,
                color: theme.text,
                opacity: 0.7
              }}
            >
              <option value="INR">INR</option>
              {/* <option value="USD">USD</option> */}
            </select>
            <p className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
              For other currencies,{' '}<a
                href="https://wa.me/919819962635"
                target="_blank"
                rel="noreferrer"
                className="px-1"
                style={{
                  color: "#b91c1c",
                  borderRadius: "0px",
                  transition: "all 200ms ease",
                  textDecoration: "underline",
                  textDecorationColor: "#b91c1c"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#b91c1c";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#b91c1c";
                }}
              >WhatsApp Siddhamahayoga</a>{' '}and we will guide you personally.
            </p>
          </div>

          <button
            type="button"
            disabled={!ready || loading || !isAmountValid}
            onClick={startPayment}
            className="mt-8 w-full py-3 border text-sm tracking-wide transition-colors"
            style={{
              borderColor: !ready || loading || !isAmountValid ? "rgba(107, 114, 128, 0.6)" : theme.accent,
              color: !ready || loading || !isAmountValid ? "#9ca3af" : theme.accent,
              backgroundColor: "transparent",
              opacity: !ready || loading || !isAmountValid ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!ready || loading || !isAmountValid) return;
              e.currentTarget.style.backgroundColor = `${theme.accent}1f`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {loading ? "Preparing..." : "Donate"}
          </button>

          {!ready && (
            <p className="mt-4 text-xs" style={{ color: theme.textMuted }}>
              Loading payment gateway…
            </p>
          )}

          {statusMessage && (
            <p className="mt-4 text-xs" style={{ color: theme.textMuted }}>
              {statusMessage}
            </p>
          )}

          {invoice && (
            <div
              className="mt-8 border p-5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.colors.bg.secondary
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.3em] uppercase" style={{ color: theme.textMuted }}>
                    Digital Invoice
                  </p>
                  <p className="text-lg mt-2" style={{ color: theme.text }}>
                    Payment Received
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 border"
                  style={{ color: "#b91c1c", borderColor: "#b91c1c" }}
                >
                  PAID
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm" style={{ color: theme.textSecondary }}>
                <p>Invoice Date: {new Date(invoice.issuedAt).toLocaleString()}</p>
                {invoice.sessionId && <p>Session ID: {invoice.sessionId}</p>}
                {invoice.paymentId && <p>Payment ID: {invoice.paymentId}</p>}
                <p>
                  Amount: {invoice.currency} {(invoice.amount / 100).toLocaleString()}
                </p>
                {invoice.name && <p>Name: {invoice.name}</p>}
                {invoice.email && <p>Email: {invoice.email}</p>}
                {invoice.phone && <p>Phone: {invoice.phone}</p>}
              </div>
              {invoice.invoiceUrl && (
                <a
                  href={invoice.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex mt-4 text-xs underline"
                  style={{ color: theme.accent }}
                >
                  Download invoice PDF
                </a>
              )}
              <p className="mt-4 text-xs" style={{ color: theme.textMuted }}>
                This is a system-generated receipt for your records.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
