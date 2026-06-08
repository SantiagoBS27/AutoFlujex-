import { Routes, Route } from "react-router-dom";
import Login from "./Windows/login";
import Signup from "./Windows/signup";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App
