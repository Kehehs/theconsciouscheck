import { Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/result/:archetype" element={<Result />} />
    </Routes>
  );
}
