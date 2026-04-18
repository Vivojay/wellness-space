import { useEffect, useMemo, useState } from "react";
import { Download, Eye, RefreshCcw, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { exportAdminDonationsCsv, fetchAdminDonations } from "@/api/adminApi";
import AdminHeader from "@/components/AdminHeader";

const INITIAL_FILTERS = {
  search: "",
  status: "",
  residential_status: "",
  country: "",
  min_amount: "",
  max_amount: "",
  start_date: "",
  end_date: "",
};

const formatDateTime = (value) => {
  if (!value) return "--";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export default function AdminDonations() {
  const { theme } = useOutletContext();
  const { token } = useAuth();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    records: 0,
    total_amount_inr: "0.00",
    min_amount_inr: "0.00",
    max_amount_inr: "0.00",
  });
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const query = useMemo(
    () => ({
      ...appliedFilters,
      page,
      limit,
    }),
    [appliedFilters, page, limit]
  );

  useEffect(() => {
    let cancelled = false;
    if (!token) return;

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminDonations(token, query);
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setRows(items);
        setSummary(data?.summary || {
          records: 0,
          total_amount_inr: "0.00",
          min_amount_inr: "0.00",
          max_amount_inr: "0.00",
        });
        setTotalPages(Number(data?.total_pages) || 1);
        setTotal(Number(data?.total) || 0);
        setSelected((prev) => {
          if (!items.length) return null;
          if (!prev) return items[0];
          const matched = items.find((item) => item.declaration_id === prev.declaration_id);
          return matched || items[0];
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load donation declarations");
          setRows([]);
          setSelected(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [query, token]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const refresh = () => {
    setAppliedFilters((prev) => ({ ...prev }));
  };

  const handleExport = async () => {
    if (!token) return;
    try {
      setExporting(true);
      const csv = await exportAdminDonationsCsv(token, appliedFilters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      anchor.href = url;
      anchor.download = `donation-declarations-${stamp}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "CSV export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="min-h-screen px-6 md:px-16 py-16" style={{ backgroundColor: theme.colors.bg.primary }}>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <AdminHeader theme={theme} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-light" style={{ color: theme.text }}>
              Donation Ledger
            </h1>
            <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
              Filter, inspect, and export declaration audits in a single admin view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 px-3 py-2 border text-sm"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-3 py-2 border text-sm"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        <form
          onSubmit={applyFilters}
          className="border p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}
        >
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Search
            </span>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
              <input
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full border pl-9 pr-3 py-2 text-sm bg-transparent outline-none"
                style={{ borderColor: theme.border, color: theme.text }}
                placeholder="ID, donor, email, country"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Status
            </span>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <option value="">All</option>
              <option value="declaration_submitted">Declaration Submitted</option>
              <option value="qr_generated">QR Generated</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Residential
            </span>
            <select
              value={filters.residential_status}
              onChange={(e) => setFilters((prev) => ({ ...prev, residential_status: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <option value="">All</option>
              <option value="indian_resident">Indian Resident</option>
              <option value="nri">NRI</option>
              <option value="foreign_national">Foreign National</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Country
            </span>
            <input
              value={filters.country}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
              placeholder="India"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Min Amount
            </span>
            <input
              value={filters.min_amount}
              onChange={(e) => setFilters((prev) => ({ ...prev, min_amount: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
              placeholder="100"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Max Amount
            </span>
            <input
              value={filters.max_amount}
              onChange={(e) => setFilters((prev) => ({ ...prev, max_amount: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
              placeholder="10000"
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              Start Date
            </span>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>
              End Date
            </span>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
              className="w-full border mt-2 px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: theme.border, color: theme.text }}
            />
          </label>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
              <span>Total Records: {summary.records ?? 0}</span>
              <span>|</span>
              <span>Total INR: {summary.total_amount_inr ?? "0.00"}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 border text-sm"
                style={{ borderColor: theme.border, color: theme.textMuted }}
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 border text-sm"
                style={{ borderColor: theme.accent, color: theme.text, backgroundColor: `${theme.accent}14` }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>

        {error && (
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        <div className="border" style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr style={{ backgroundColor: theme.colors.bg.secondary }}>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Declaration ID</th>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Created</th>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Donor</th>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Email</th>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Status</th>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Country</th>
                  <th className="px-3 py-3 text-left" style={{ color: theme.textMuted }}>Residential</th>
                  <th className="px-3 py-3 text-right" style={{ color: theme.textMuted }}>Amount (INR)</th>
                  <th className="px-3 py-3 text-center" style={{ color: theme.textMuted }}>View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center" style={{ color: theme.textMuted }}>
                      Loading declarations...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center" style={{ color: theme.textMuted }}>
                      No declarations found for selected filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.declaration_id}
                      className="border-t"
                      style={{
                        borderColor: theme.border,
                        backgroundColor:
                          selected?.declaration_id === row.declaration_id ? `${theme.accent}10` : "transparent",
                      }}
                    >
                      <td className="px-3 py-3 font-mono text-xs" style={{ color: theme.text }}>
                        {row.declaration_id}
                      </td>
                      <td className="px-3 py-3" style={{ color: theme.textSecondary }}>
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="px-3 py-3" style={{ color: theme.text }}>{row.donor_name || "--"}</td>
                      <td className="px-3 py-3" style={{ color: theme.textSecondary }}>{row.email || "--"}</td>
                      <td className="px-3 py-3" style={{ color: theme.textSecondary }}>{row.status || "--"}</td>
                      <td className="px-3 py-3" style={{ color: theme.textSecondary }}>{row.country || "--"}</td>
                      <td className="px-3 py-3" style={{ color: theme.textSecondary }}>
                        {row.residential_status || "--"}
                      </td>
                      <td className="px-3 py-3 text-right" style={{ color: theme.text }}>
                        {row.amount || "0.00"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="inline-flex items-center gap-1 border px-2 py-1 text-xs"
                          style={{ borderColor: theme.border, color: theme.text }}
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            className="border-t px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: theme.border }}
          >
            <div className="text-sm" style={{ color: theme.textMuted }}>
              Page {page} of {totalPages} | {total} record(s)
            </div>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border px-2 py-1 text-sm bg-transparent"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border text-sm"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border text-sm"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {selected && (
          <div className="border p-4" style={{ borderColor: theme.border, backgroundColor: theme.colors.bg.card }}>
            <h2 className="text-xl font-light mb-3" style={{ color: theme.text }}>
              Declaration Detail
            </h2>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Declaration ID:</strong> {selected.declaration_id}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Created:</strong> {formatDateTime(selected.created_at)}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Amount:</strong> INR {selected.amount}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Status:</strong> {selected.status}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Donor:</strong> {selected.donor_name}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Email:</strong> {selected.email}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Country:</strong> {selected.country}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Residential:</strong> {selected.residential_status}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Local Date:</strong> {selected.declaration_date_local || "--"}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Timezone:</strong> {selected.client_timezone || "--"}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Last Event:</strong> {selected.audit?.last_event || "--"}
              </p>
              <p style={{ color: theme.textSecondary }}>
                <strong style={{ color: theme.text }}>Last Event At:</strong>{" "}
                {formatDateTime(selected.audit?.last_event_at)}
              </p>
            </div>

            <div className="mt-4 border p-3" style={{ borderColor: theme.border }}>
              <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: theme.textMuted }}>
                Donor Details
              </p>
              <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                {selected.details || "No details provided."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
