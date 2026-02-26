import { Routes, Route } from "react-router-dom";
import Opening from "./components/Opening";
import StudentLogin from "./components/STUDENT/StudentLogin";
import StudentRegister from "./components/STUDENT/StudentRegister";
import StudentDashboard from "./components/STUDENT/StudentDashboard";
import HrDashboard from "./components/HR/HrDashboard";
import PanelDashboard from "./components/PANEL/PanelDashboard";
import PanelRegister from "./components/PANEL/PanelRegister";
import PanelLogin from "./components/PANEL/PanelLogin";

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