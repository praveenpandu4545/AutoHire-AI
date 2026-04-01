import { Routes, Route } from "react-router-dom";
import Opening from "./components/Opening";
import StudentDashboard from "./components/STUDENT/StudentDashboard";
import HrDashboard from "./components/HR/HrDashboard";
import PanelDashboard from "./components/PANEL/PanelDashboard";
import PanelAuth from "./components/PANEL/PanelAuth";
import StudentAuth from "./components/STUDENT/StudentAuth";
import ExamScreen from "./components/STUDENT/ExamScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Opening />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/panel-dashboard" element={<PanelDashboard />} />
      <Route path="/hr-dashboard" element={<HrDashboard />} />
      <Route path="/Panel-Auth" element={<PanelAuth />} /> 
      <Route path="/Student-Auth" element={<StudentAuth />} /> 
      <Route path="/exam" element={<ExamScreen />} />
    </Routes>
  );
}

export default App;