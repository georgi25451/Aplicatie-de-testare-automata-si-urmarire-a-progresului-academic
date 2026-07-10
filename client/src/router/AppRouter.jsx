import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage/RegisterPage.jsx";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard.jsx";
import ElevDashboard from "../pages/ElevDashboard/ElevDashboard.jsx";
import TemplateDetail from "../pages/TemplateDetail/TemplateDetail.jsx";
import TestSession from "../pages/TestSession/TestSession.jsx";
import ProvocareSession from "../pages/ProvocareSession/ProvocareSession.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/template/:pid/:ttid" element={<TemplateDetail />} />
        <Route path="/elev" element={<ElevDashboard />} />
        <Route path="/elev/test/:id" element={<TestSession />} />
        <Route path="/elev/provocare" element={<ProvocareSession />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;