import { NavLink, Outlet } from "react-router-dom";
import { BuildingIcon, DashboardIcon, DatabaseIcon, ReportIcon, TruckIcon, VanIcon } from "./Icons.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard Overview", icon: <DashboardIcon /> },
  { to: "/report-submission", label: "Report Submission", icon: <ReportIcon /> },
  { to: "/slf-profile", label: "SLF Profile Registration", icon: <BuildingIcon /> },
  { to: "/hauler-profile", label: "Hauler Profile Registration", icon: <TruckIcon /> },
  { to: "/hauler-vehicle", label: "Hauler Vehicle Registration", icon: <VanIcon /> },
  { to: "/databases", label: "Databases & Master Logs", icon: <DatabaseIcon /> },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="seal" aria-hidden="true">DENR</div>
        <div>
          <p className="topbar-country">Republic of the Philippines</p>
          <p className="topbar-title">DENR-EMB Sanitary Landfill Monitoring System</p>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          <p className="side-label">Core Navigation</p>
          <nav className="nav" aria-label="Core navigation">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Static sample values, same as the dashboard design */}
          <p className="side-label meta-label">System Metadata</p>
          <dl className="meta">
            <div><dt>Current Operator:</dt><dd>Metro SLF Cell-1</dd></div>
            <div><dt>Active Cells:</dt><dd>4 Operational</dd></div>
            <div><dt>DENR Region:</dt><dd>Region VII</dd></div>
          </dl>
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
