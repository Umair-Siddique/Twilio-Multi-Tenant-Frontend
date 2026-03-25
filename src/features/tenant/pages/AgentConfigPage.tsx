import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantApi } from "@/features/tenant/api/tenantApi";
import { ApiError } from "@/shared/api/httpClient";
import type { AgentConfig, AgentConfigPayload } from "@/features/tenant/api/tenantApi";
import { agentConfigSchema, type AgentConfigFormValues } from "@/features/tenant/schemas/tenantSchemas";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly",     label: "Friendly" },
  { value: "casual",       label: "Casual" },
  { value: "empathetic",   label: "Empathetic" },
  { value: "formal",       label: "Formal" }
];

const ALLOWED_ACTIONS_META: Record<string, { label: string; desc: string }> = {
  create_booking:    { label: "Create Booking",    desc: "Allow agent to schedule appointments" },
  reschedule_booking:{ label: "Reschedule Booking",desc: "Allow agent to move existing appointments" },
  cancel_booking:    { label: "Cancel Booking",    desc: "Allow agent to cancel appointments" },
  create_lead:       { label: "Create Lead",       desc: "Allow agent to capture and log new leads" },
  create_ticket:     { label: "Create Ticket",     desc: "Allow agent to open support tickets" },
  schedule_meeting:  { label: "Schedule Meeting",  desc: "Allow agent to set up video meetings" },
  handoff_to_human:  { label: "Handoff to Human",  desc: "Allow agent to transfer to a live agent" }
};

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export function AgentConfigPage() {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<AgentConfigFormValues>({ resolver: zodResolver(agentConfigSchema) });

  const watchTranscripts = watch("store_transcripts");
  const watchRecordings  = watch("store_recordings");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const data = await tenantApi.getAgentConfig();
        setConfig(data);
        reset({
          greeting:        typeof data.greeting === "string" ? data.greeting : "",
          system_prompt:   typeof data.system_prompt === "string" ? data.system_prompt : "",
          tone:              typeof data.tone === "string" ? data.tone : "",
          store_transcripts: data.store_transcripts ?? true,
          store_recordings:  data.store_recordings ?? true,
          retention_days:    typeof data.retention_days === "number" && !Number.isNaN(data.retention_days) ? data.retention_days : 90
        });
      } catch (err) {
        setFormError(err instanceof ApiError ? err.message : "Failed to load agent config");
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [reset]);

  const onSubmit = async (values: AgentConfigFormValues) => {
    setFormMessage(null);
    setFormError(null);
    setSaving(true);
    try {
      const payload: AgentConfigPayload = {
        greeting:          values.greeting,
        system_prompt:   values.system_prompt,
        tone:              values.tone,
        store_transcripts: values.store_transcripts,
        store_recordings:  values.store_recordings,
        retention_days:    values.retention_days
      };
      const response = await tenantApi.updateAgentConfig(payload);
      setConfig(response.config);
      setFormMessage("Agent configuration saved successfully");
      setIsEditing(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to update agent config");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!config) return;
    setIsEditing(false);
    setFormMessage(null);
    setFormError(null);
    reset({
      greeting:          typeof config.greeting === "string" ? config.greeting : "",
      system_prompt:     typeof config.system_prompt === "string" ? config.system_prompt : "",
      tone:              typeof config.tone === "string" ? config.tone : "",
      store_transcripts: config.store_transcripts ?? true,
      store_recordings:  config.store_recordings ?? true,
      retention_days:    typeof config.retention_days === "number" && !Number.isNaN(config.retention_days) ? config.retention_days : 90
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-hero">
          <div>
            <div className="skeleton-block" style={{ width: 200, height: 26, marginBottom: 8 }} />
            <div className="skeleton-block" style={{ width: 150, height: 18 }} />
          </div>
        </div>
        <div className="skeleton-block" style={{ height: 180, borderRadius: 14, marginBottom: 16 }} />
        <div className="skeleton-block" style={{ height: 160, borderRadius: 14 }} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="dashboard-page">
        <div className="page-hero"><h1>Agent Configuration</h1></div>
        <div className="form-status error">Failed to load agent configuration. Please refresh.</div>
      </div>
    );
  }

  const toneValue = typeof config.tone === "string" ? config.tone : "";
  const toneMeta = TONES.find((t) => t.value === toneValue);
  const allowedActionsRaw = config.allowed_actions ?? [];
  const allowedActions = Array.isArray(allowedActionsRaw)
    ? allowedActionsRaw.map((a) => (typeof a === "string" ? a : (a && typeof a === "object" && "name" in a ? String((a as { name?: string }).name) : String(a)))).filter(Boolean)
    : [];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-hero">
        <div>
          <h1>Agent Configuration</h1>
          <p className="page-subtitle">Tune your AI agent's voice, behaviour and data settings</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="dashboard-button">
            <IconEdit /> Edit Configuration
          </button>
        )}
      </div>

      {formMessage && <div className="form-status" style={{ marginBottom: 16 }}>{formMessage}</div>}
      {formError   && <div className="form-status error" style={{ marginBottom: 16 }}>{formError}</div>}

      {!isEditing ? (
        /* ── Read-only view ── */
        <>
          <div className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Voice & Personality</h2>
            </div>
            <div className="detail-card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Tone</span>
                  <span className="detail-value">
                    {toneMeta ? toneMeta.label : (toneValue || "—")}
                  </span>
                </div>
              </div>
              {typeof config.greeting === "string" && config.greeting.trim() && (
                <div className="detail-item" style={{ marginTop: 16 }}>
                  <span className="detail-label">Greeting Message</span>
                  <span className="detail-value" style={{ whiteSpace: "pre-wrap" }}>
                    {config.greeting}
                  </span>
                </div>
              )}
              {(!config.greeting || typeof config.greeting !== "string" || !config.greeting.trim()) && (
                <div className="detail-item" style={{ marginTop: 16 }}>
                  <span className="detail-label">Greeting Message</span>
                  <span className="detail-value-muted" style={{ fontStyle: "italic" }}>Not configured</span>
                </div>
              )}
              {typeof config.system_prompt === "string" && config.system_prompt.trim() && (
                <div className="detail-item" style={{ marginTop: 16 }}>
                  <span className="detail-label">System Prompt</span>
                  <span className="detail-value" style={{ whiteSpace: "pre-wrap" }}>
                    {config.system_prompt}
                  </span>
                </div>
              )}
              {(!config.system_prompt || typeof config.system_prompt !== "string" || !config.system_prompt.trim()) && (
                <div className="detail-item" style={{ marginTop: 16 }}>
                  <span className="detail-label">System Prompt</span>
                  <span className="detail-value-muted" style={{ fontStyle: "italic" }}>Not configured</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Privacy & Data Storage</h2>
            </div>
            <div className="detail-card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Store Transcripts</span>
                  <span className="detail-value">
                    <span className={`badge badge-${config.store_transcripts !== false ? "success" : "neutral"}`}>
                      {config.store_transcripts !== false ? "Enabled" : "Disabled"}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Store Recordings</span>
                  <span className="detail-value">
                    <span className={`badge badge-${config.store_recordings !== false ? "success" : "neutral"}`}>
                      {config.store_recordings !== false ? "Enabled" : "Disabled"}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Data Retention</span>
                  <span className="detail-value">
                    {typeof config.retention_days === "number" && !Number.isNaN(config.retention_days)
                      ? config.retention_days
                      : 90}{" "}
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {allowedActions.length > 0 && (
            <div className="detail-card">
              <div className="detail-card-header">
                <h2 className="detail-card-title">Allowed Actions</h2>
              </div>
              <div className="detail-card-body">
                <p style={{ margin: "0 0 14px", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  The AI agent can perform the following actions during calls:
                </p>
                <div className="action-chips">
                  {allowedActions.map((action) => {
                    const meta = ALLOWED_ACTIONS_META[action];
                    return (
                      <span key={action} className="action-chip" title={meta?.desc}>
                        <IconCheck />
                        {meta?.label ?? action}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {typeof config.custom_prompts === "string" && config.custom_prompts.trim() && (
            <div className="detail-card">
              <div className="detail-card-header">
                <h2 className="detail-card-title">Custom Instructions</h2>
              </div>
              <div className="detail-card-body">
                <pre style={{
                  margin: 0,
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {config.custom_prompts}
                </pre>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── Edit form ── */
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-sections">
            {/* Voice & Personality */}
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Voice & Personality</h2>
                <p className="form-section-desc">Define how your AI agent sounds and introduces itself</p>
              </div>
              <div className="form-section-body form-grid-2">
                <div className="form-field">
                  <label htmlFor="tone">Agent Tone</label>
                  <select id="tone" className="form-field-select" {...register("tone")}>
                    <option value="">Select tone…</option>
                    {TONES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errors.tone && <small className="field-error">{errors.tone.message}</small>}
                </div>

                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="greeting">Greeting Message</label>
                  <textarea
                    id="greeting"
                    {...register("greeting")}
                    placeholder="Hello! Thank you for calling. How can I help you today?"
                    rows={3}
                  />
                  {errors.greeting && <small className="field-error">{errors.greeting.message}</small>}
                  <small style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    This is the first thing callers hear when your agent answers
                  </small>
                </div>

                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="system_prompt">System Prompt</label>
                  <textarea
                    id="system_prompt"
                    {...register("system_prompt")}
                    placeholder="You are a professional AI voice assistant for…"
                    rows={6}
                  />
                  {errors.system_prompt && (
                    <small className="field-error">{errors.system_prompt.message}</small>
                  )}
                  <small style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Core instructions for the model (role, boundaries, business context)
                  </small>
                </div>
              </div>
            </div>

            {/* Privacy & Storage */}
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Privacy & Data Storage</h2>
                <p className="form-section-desc">Control what call data is stored and for how long</p>
              </div>
              <div className="form-section-body">
                <div className="toggle-row">
                  <div className="toggle-row-label">
                    <span>Store Transcripts</span>
                    <small>Save the full conversation text after each call</small>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" {...register("store_transcripts")} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="toggle-row" style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div className="toggle-row-label">
                    <span>Store Recordings</span>
                    <small>Keep audio recordings accessible via signed URL</small>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" {...register("store_recordings")} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {(watchTranscripts || watchRecordings) && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <div className="form-field" style={{ maxWidth: 200 }}>
                      <label htmlFor="retention_days">Retention Period (days)</label>
                      <input
                        id="retention_days"
                        type="number"
                        min={1}
                        max={365}
                        {...register("retention_days", { valueAsNumber: true })}
                        placeholder="90"
                      />
                      {errors.retention_days && (
                        <small className="field-error">{errors.retention_days.message}</small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Allowed Actions info */}
            {allowedActions.length > 0 && (
              <div className="info-banner" style={{ marginTop: 0, marginBottom: 0 }}>
                <span className="info-banner-icon"><IconInfo /></span>
                <div className="info-banner-content">
                  <p className="info-banner-title">Allowed Actions are managed by the backend</p>
                  <p className="info-banner-desc">
                    Your agent currently has {allowedActions.length} action{allowedActions.length !== 1 ? "s" : ""} enabled:{" "}
                    {allowedActions.map((a) => ALLOWED_ACTIONS_META[a]?.label ?? a).join(", ")}.
                    Contact your platform administrator to modify allowed actions.
                  </p>
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="dashboard-form-actions" style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              marginTop: 0
            }}>
              <button type="button" onClick={handleCancelEdit} className="dashboard-button-secondary">
                <IconX /> Cancel
              </button>
              <button type="submit" disabled={saving} className="dashboard-button">
                <IconSave /> {saving ? "Saving…" : "Save Configuration"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
