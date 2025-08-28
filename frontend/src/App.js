import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignIn from "./pages/Signin";
import SignUp from "./pages/signUp";
import Contact from "./pages/contact";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/Contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}
