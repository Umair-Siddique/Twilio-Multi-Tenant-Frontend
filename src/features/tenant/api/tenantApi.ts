import { request } from "@/shared/api/httpClient";

// Tenant Profile Types
export type Tenant = {
  id: string;
  name: string;
  timezone: string;
  industry: string;
  default_email_recipients: string[];
  status: string;
  created_at: string;
};

export type TenantProfileResponse = {
  tenant: Tenant;
  user_role: string;
};

export type TenantProfilePayload = {
  name?: string;
  timezone?: string;
  industry?: string;
  default_email_recipients?: string[];
};

export type TenantProfileUpdateResponse = {
  message: string;
  tenant: Tenant;
};

// Agent Config Types
export type BusinessHours = {
  [key: string]: {
    start: string;
    end: string;
  };
};

export type AgentConfig = {
  id: string;
  tenant_id: string;
  greeting?: string;
  system_prompt?: string;
  tone?: string;
  business_hours?: BusinessHours;
  escalation_rules?: Record<string, unknown>;
  allowed_actions?: string[];
  custom_prompts?: string;
  store_transcripts?: boolean;
  store_recordings?: boolean;
  retention_days?: number;
  created_at?: string;
  updated_at?: string;
};

export type AgentConfigPayload = {
  greeting?: string;
  system_prompt?: string;
  tone?: string;
  business_hours?: BusinessHours;
  escalation_rules?: Record<string, unknown>;
  allowed_actions?: string[];
  custom_prompts?: string;
  store_transcripts?: boolean;
  store_recordings?: boolean;
  retention_days?: number;
};

export type AgentConfigUpdateResponse = {
  message: string;
  config: AgentConfig;
};

// Phone Numbers Types (API may return twilio_number_sid from DB; we normalize to twilio_sid)
export type PhoneNumber = {
  id: string;
  tenant_id: string;
  phone_number: string;
  twilio_sid: string;
  status: string;
  created_at: string;
};

type PhoneNumberApiRow = Omit<PhoneNumber, "twilio_sid"> & {
  twilio_sid?: string;
  twilio_number_sid?: string;
};

function normalizePhoneNumber(row: PhoneNumberApiRow): PhoneNumber {
  const twilio_sid = row.twilio_sid ?? row.twilio_number_sid ?? "";
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    phone_number: row.phone_number,
    twilio_sid,
    status: row.status,
    created_at: row.created_at
  };
}

export type PhoneNumbersResponse = {
  phone_numbers: PhoneNumber[];
};

// Health Check
export type HealthResponse = {
  status: string;
  service: string;
};

export const tenantApi = {
  getProfile() {
    return request<TenantProfileResponse>("/tenant/profile", { auth: true });
  },
  updateProfile(payload: TenantProfilePayload) {
    return request<TenantProfileUpdateResponse>("/tenant/profile", {
      method: "PUT",
      auth: true,
      body: payload
    });
  },
  getAgentConfig() {
    return request<AgentConfig>("/tenant/agent-config", { auth: true });
  },
  updateAgentConfig(payload: AgentConfigPayload) {
    return request<AgentConfigUpdateResponse>("/tenant/agent-config", {
      method: "PUT",
      auth: true,
      body: payload
    });
  },
  async getPhoneNumbers(): Promise<PhoneNumbersResponse> {
    const data = await request<{ phone_numbers?: PhoneNumberApiRow[] }>(
      "/tenant/phone-numbers",
      { auth: true }
    );
    return {
      phone_numbers: (data.phone_numbers ?? []).map(normalizePhoneNumber)
    };
  },
  health() {
    return request<HealthResponse>("/tenant/health");
  }
};
