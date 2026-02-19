import { Outlet } from "react-router-dom";
import sidebarImage from "@/assets/sidebar_image.png";

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <section
        className="auth-info-panel"
        style={{
          backgroundImage: `linear-gradient(155deg, rgba(2, 6, 23, 0.86), rgba(15, 23, 42, 0.82) 55%, rgba(15, 23, 42, 0.9)), url(${sidebarImage})`
        }}
      >
        <p className="auth-kicker">Secure Access</p>
        <h1>Aidan Pro</h1>
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

