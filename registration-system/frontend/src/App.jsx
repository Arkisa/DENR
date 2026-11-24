import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Verify from "./pages/Verify.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Layout>
  );
}
