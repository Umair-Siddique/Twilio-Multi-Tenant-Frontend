import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-info-panel">
        <p className="auth-kicker">Secure Access</p>
        <h1>Multi-Tenant AI Agent Admin Portal</h1>
        <p>
          Authentication for authorized admins and team members.
        </p>
      </section>
      <section className="auth-form-panel">
        <Outlet />
      </section>
    </main>
  );
}

