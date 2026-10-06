import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import LiveDashboard from "./pages/LiveDashboard";
import { captureEventFlag } from "./lib/liveReport";

captureEventFlag();

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/check/r/:token" element={<Result />} />
      <Route path="/live-awc-oct9" element={<LiveDashboard />} />
    </Routes>
  );
}
