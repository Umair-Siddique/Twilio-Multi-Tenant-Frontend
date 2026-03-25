import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { authSession } from "@/shared/session/authSession";
import { useState } from "react";

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconSliders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconBotLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10h-1.2a7 7 0 0 1-11.6 0H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" />
    <path d="M12 18v4M8 22h8" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const NAV_GROUPS = [
  {
    label: "Overview",
    links: [
      { to: "/dashboard", end: true as const, label: "Dashboard", icon: <IconGrid /> }
    ]
  },
  {
    label: "Configuration",
    links: [
      { to: "/dashboard/profile",       end: false as const, label: "Tenant Profile",  icon: <IconBuilding /> },
      { to: "/dashboard/agent-config",  end: false as const, label: "Agent Config",    icon: <IconSliders /> },
      { to: "/dashboard/phone-numbers", end: false as const, label: "Phone Numbers",   icon: <IconPhone /> }
    ]
  }
];

function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <nav className="dashboard-nav">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="nav-section">
          <span className="nav-section-label">{group.label}</span>
          {group.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `dashboard-nav-link${isActive ? " active" : ""}`}
              onClick={onLinkClick}
            >
              <span className="nav-link-icon">{link.icon}</span>
              <span className="nav-link-text">{link.label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = () => {
    authSession.clear();
    navigate("/auth/login");
  };

  return (
    <div className="dashboard-shell">
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-logo-wrapper">
            <div className="dashboard-logo-icon">
              <IconBotLogo />
            </div>
            <h1 className="dashboard-logo">Aidan Pro</h1>
          </div>
        </div>

        <SidebarNav />

        <div className="dashboard-sidebar-footer">
          <button onClick={handleSignOut} className="dashboard-signout-button">
            <IconLogOut />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* Mobile header */}
        <header className="dashboard-header">
          <button
            className="dashboard-menu-toggle"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <span className="dashboard-header-logo">Aidan Pro</span>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="dashboard-mobile-menu" role="dialog" aria-modal="true">
          <div className="dashboard-mobile-menu-header">
            <div className="dashboard-logo-wrapper">
              <div className="dashboard-logo-icon">
                <IconBotLogo />
              </div>
              <span className="dashboard-logo">Aidan Pro</span>
            </div>
            <button
              className="dashboard-menu-close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <IconX />
            </button>
          </div>
          <div className="dashboard-mobile-nav">
            <SidebarNav onLinkClick={() => setIsMobileOpen(false)} />
          </div>
          <div style={{ padding: "12px 0 0" }}>
            <button onClick={handleSignOut} className="dashboard-signout-button">
              <IconLogOut />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
