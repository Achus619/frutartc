import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Anfitrion from "./Anfitrion";
import Invitade from "./Invitade";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/:salaID/anfitrion" element={<Anfitrion />}></Route>
          <Route path="/:salaID" element={<Invitade />}></Route>
          <Route path="/" element={<Home />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
