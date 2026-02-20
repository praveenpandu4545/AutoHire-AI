import { Routes, Route } from "react-router-dom";
import Opening from "./components/Opening";
import StudentLogin from "./components/StudentLogin";
import StudentRegister from "./components/StudentRegister";
import StudentDashboard from "./components/StudentDashboard";
import HrDashboard from "./components/HrDashboard";
import PanelDashboard from "./components/PanelDashboard";
import PanelRegister from "./components/PanelRegister";
import PanelLogin from "./components/PanelLogin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Opening />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-register" element={<StudentRegister />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/panel-login" element={<PanelLogin />} />
      <Route path="/panel-register" element={<PanelRegister />} />
      <Route path="/panel-dashboard" element={<PanelDashboard />} />
      <Route path="/hr-dashboard" element={<HrDashboard />} />
    </Routes>
  );
}

export default App;