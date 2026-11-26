import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import SlfProfileRegistration from "./pages/SlfProfileRegistration.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/slf-profile" replace />} />
        <Route path="/slf-profile" element={<SlfProfileRegistration />} />
        <Route path="/dashboard" element={<ComingSoon title="Dashboard Overview" />} />
        <Route path="/report-submission" element={<ComingSoon title="Report Submission" />} />
        <Route path="/hauler-profile" element={<ComingSoon title="Hauler Profile Registration" />} />
        <Route path="/hauler-vehicle" element={<ComingSoon title="Hauler Vehicle Registration" />} />
        <Route path="/databases" element={<ComingSoon title="Databases & Master Logs" />} />
        <Route path="*" element={<Navigate to="/slf-profile" replace />} />
      </Route>
    </Routes>
  );
}
