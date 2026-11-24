export default function Layout({ children }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="seal" aria-hidden="true">DENR</div>
        <div>
          <p className="topbar-country">Republic of the Philippines</p>
          <p className="topbar-title">DENR-EMB Sanitary Landfill Monitoring System</p>
        </div>
      </header>
      <main className="stage">{children}</main>
      <footer className="footer">
        Department of Environment and Natural Resources · Environmental Management Bureau
      </footer>
    </div>
  );
}
