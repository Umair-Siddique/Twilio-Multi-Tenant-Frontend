import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { superAdminApi } from "@/features/super-admin/api/superAdminApi";
import { ApiError, isAbortError } from "@/shared/api/httpClient";
import { withRetry } from "@/shared/utils/withRetry";
import type { TenantSummary, CreateTenantPayload } from "@/features/super-admin/api/superAdminApi";

const STATUSES = ["", "active", "suspended", "inactive"];

function StatusBadge({ status }: { status: string }) {
  const v = status === "active" ? "success" : status === "suspended" ? "warning" : "neutral";
  return <span className={`badge badge-${v}`}><span className="badge-dot" />{status}</span>;
}

function CreateTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateTenantPayload>({
    company_name: "", owner_email: "", owner_password: "",
    timezone: "America/Toronto", industry: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof CreateTenantPayload, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await superAdminApi.createTenant(form);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create tenant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sa-modal-overlay">
      <div className="sa-modal sa-modal-md">
        <div className="sa-modal-header">
          <h2 className="sa-modal-title">Create New Tenant</h2>
          <button className="sa-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="sa-modal-body">
            {error && <div className="form-status error">{error}</div>}

            <label className="field-label">Company Name *
              <input className="field-input" value={form.company_name} onChange={e => set("company_name", e.target.value)} required placeholder="Acme Corp" />
            </label>
            <label className="field-label">Owner Email *
              <input className="field-input" type="email" value={form.owner_email} onChange={e => set("owner_email", e.target.value)} required placeholder="owner@acme.com" />
            </label>
            <label className="field-label">Owner Password *
              <input className="field-input" type="password" value={form.owner_password} onChange={e => set("owner_password", e.target.value)} required placeholder="Minimum 8 characters" />
            </label>
            <div className="sa-form-grid-2">
              <label className="field-label">Industry *
                <input className="field-input" value={form.industry} onChange={e => set("industry", e.target.value)} required placeholder="Healthcare" />
              </label>
              <label className="field-label">Timezone
                <input className="field-input" value={form.timezone} onChange={e => set("timezone", e.target.value)} placeholder="America/Toronto" />
              </label>
            </div>
          </div>
          <div className="sa-modal-footer">
            <button type="button" className="dashboard-button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="dashboard-button" disabled={saving}>{saving ? "Creating…" : "Create Tenant"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TenantsPage() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [draft, setDraft] = useState({ status: "", search: "" });

  const load = async (p = page, f = filters, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await withRetry(() => superAdminApi.listTenants({ page: p, per_page: 100, ...f }, signal), signal);
      const rows = Array.isArray(res.tenants) ? res.tenants : [];
      setTenants(rows);
      const pg = res.pagination;
      setTotalPages(pg?.pages ?? 1);
      setTotal(pg?.total ?? rows.length);
    } catch (err) {
      if (isAbortError(err)) return;
      setError(err instanceof ApiError ? err.message : "Failed to load tenants");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void load(page, filters, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => { setFilters(draft); setPage(1); void load(1, draft); };

  const goPage = (p: number) => { setPage(p); void load(p, filters); };

  return (
    <div className="dashboard-page">
      <div className="page-hero">
        <div>
          <h1>Tenants</h1>
          <p className="page-subtitle">
            {loading ? "Loading…" : `${total} organization${total !== 1 ? "s" : ""} registered`}
          </p>
        </div>
        <button className="dashboard-button" onClick={() => setShowCreate(true)}>+ Create Tenant</button>
      </div>

      {/* Filters */}
      <div className="sa-filter-bar">
        <label className="field-label" style={{ flex: 2, minWidth: 180 }}>Search
          <input className="field-input" placeholder="Name or email…" value={draft.search}
            onChange={e => setDraft(d => ({ ...d, search: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && applyFilters()}
          />
        </label>
        <label className="field-label">Status
          <select className="field-input" value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button className="dashboard-button" onClick={applyFilters}>Apply</button>
        </div>
      </div>

      {loading && (
        <div className="dashboard-table-container">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-block" style={{ height: 52, margin: "8px 16px", borderRadius: 8 }} />
          ))}
        </div>
      )}

      {error && !loading && (
        <>
          <div className="form-status error" style={{ marginBottom: 16 }}>{error}</div>
          <button className="dashboard-button" onClick={() => void load()}>Retry</button>
        </>
      )}

      {!loading && !error && (
        <>
          {tenants.length === 0 ? (
            <div className="empty-state">
              <h3>No tenants found</h3>
              <p>Try adjusting the filters or create a new tenant.</p>
            </div>
          ) : (
            <div className="dashboard-table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Industry</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>{t.industry || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/super-admin/tenants/${t.id}`} className="setup-step-action">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="sa-pagination">
              <button className="sa-pagination-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>← Prev</button>
              <span className="sa-pagination-info">Page {page} of {totalPages}</span>
              <button className="sa-pagination-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateTenantModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); void load(); }}
        />
      )}
    </div>
  );
}
