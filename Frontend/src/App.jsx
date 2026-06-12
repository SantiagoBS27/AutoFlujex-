import { Routes, Route } from "react-router-dom";
import Login from "./Windows/login";
import Signup from "./Windows/signup";
import Home from "./Windows/Home";
import AccountInfo from "./Windows/AccountInfo";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/account/:id" element={<AccountInfo />} />
    </Routes>
  )
}

export default App
