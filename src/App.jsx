import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Home from "./screens/home";
import Animationpage from "./screens/animationpage";
import Armored from "./screens/armored";
import Favorites from "./screens/favorites";
import Signup from "./screens/signup";
import Signin from "./screens/signin";
import Hotels from "./screens/hotels";
import Armhotels from "./screens/armhotels";
import Profile from "./screens/profile";
import Admin from "./screens/admin";
import Adminneworders from "./screens/adminneworders";
import Adminconfirmed from "./screens/adminconfirmed";
import Adminactive from "./screens/adminactive";
import Admincompleted from "./screens/admincompleted";
import Adminhotels from "./screens/adminhotels";
import Adminsignup from "./screens/adminsignup";
import Adminsignin from "./screens/adminsignin";
import Editprofile from "./screens/editprofile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/hotels/:id" element={<Hotels />} />
        <Route path="/armhotels/:id" element={<Armhotels />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/" element={<Animationpage />} />
        <Route path="/armored" element={<Armored />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/adminneworders" element={<Adminneworders />} />
        <Route path="/adminconfirmed" element={<Adminconfirmed />} />
        <Route path="/adminactive" element={<Adminactive />} />
        <Route path="/admincompleted" element={<Admincompleted />} />
        <Route path="/adminhotels" element={<Adminhotels />} />
        <Route path="/adminsignup" element={<Adminsignup />} />
        <Route path="/adminsignin" element={<Adminsignin />} />
        <Route path="/editprofile" element={<Editprofile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
