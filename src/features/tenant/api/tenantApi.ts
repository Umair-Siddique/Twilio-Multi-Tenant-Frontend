import { request } from "@/shared/api/httpClient";

export type TenantProfilePayload = {
  name?: string;
  timezone?: string;
  industry?: string;
  default_email_recipients?: string[];
};

export type AgentConfigPayload = {
  tone?: string;
  greeting?: string;
  business_hours?: Record<string, unknown>;
  escalation_rules?: Record<string, unknown>;
  allowed_actions?: string[];
  custom_prompts?: Record<string, string>;
  store_transcripts?: boolean;
  store_recordings?: boolean;
  retention_days?: number;
};

export type InviteUserPayload = {
  user_id: string;
  role: string;
};

export const tenantApi = {
  getProfile() {
    return request<Record<string, unknown>>("/tenant/profile", { auth: true });
  },
  updateProfile(payload: TenantProfilePayload) {
    return request<Record<string, unknown>>("/tenant/profile", {
      method: "PUT",
      auth: true,
      body: payload
    });
  },
  getAgentConfig() {
    return request<Record<string, unknown>>("/tenant/agent-config", {
      auth: true
    });
  },
  updateAgentConfig(payload: AgentConfigPayload) {
    return request<Record<string, unknown>>("/tenant/agent-config", {
      method: "PUT",
      auth: true,
      body: payload
    });
  },
  getPhoneNumbers() {
    return request<Record<string, unknown>>("/tenant/phone-numbers", {
      auth: true
    });
  },
  getUsers() {
    return request<Record<string, unknown>>("/tenant/users", { auth: true });
  },
  inviteUser(payload: InviteUserPayload) {
    return request<Record<string, unknown>>("/tenant/users", {
      method: "POST",
      auth: true,
      body: payload
    });
  },
  health() {
    return request<Record<string, unknown>>("/tenant/health");
  }
};


