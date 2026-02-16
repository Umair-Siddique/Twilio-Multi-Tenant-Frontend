import { request } from "@/shared/api/httpClient";

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = {
  email: string;
  password: string;
  company_name: string;
  timezone: string;
  industry: string;
  default_email_recipients: string[];
};

export type AuthResponse = {
  access_token: string;
  refresh_token?: string;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type TenantProfileResponse = {
  tenant: {
    id: string;
    name: string;
    timezone: string;
    industry: string;
    status: string;
    default_email_recipients: string[];
    created_at: string;
    updated_at: string;
  };
  user_role: string;
};

export const authApi = {
  signIn(payload: SignInRequest) {
    return request<AuthResponse>("/auth/signin", {
      method: "POST",
      body: payload
    });
  },
  signUp(payload: SignUpRequest) {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: payload
    });
  },
  me() {
    return request<TenantProfileResponse>("/auth/me", { auth: true });
  },
  refresh(payload: RefreshRequest) {
    return request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: payload
    });
  },
  signOut() {
    return request<{ message?: string }>("/auth/signout", {
      method: "POST",
      auth: true
    });
  },
  health() {
    return request<{ status?: string; message?: string }>("/auth/health");
  }
};


