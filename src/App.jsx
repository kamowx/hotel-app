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
import Adminuplususer from "./screens/adminuplususer";
import Adminuser from "./screens/adminuser";
import Support from "./screens/support";
import Adminsupport from "./screens/adminsupport";
import Adminhostels from "./screens/adminhostels";
import Adminstaff from "./screens/adminstaff";
import Padmin from "./screens/padmin";
import Cleaning from "./screens/cleaning";
import Admincleaning from "./screens/admincleaning";
import Staffsignin from "./screens/staffsignin";
import Menu from "./screens/menu";
import Check from "./screens/check";
import Cook from "./screens/cook";
import Cookpreparing from "./screens/cookpreparing";
import Cookready from "./screens/cookready";
import Adminfood from "./screens/adminfood";
import Adminorders from "./screens/adminorders";
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
        <Route path="/adminuplususer" element={<Adminuplususer />} />
        <Route path="/adminuser" element={<Adminuser />} />
        <Route path="/support" element={<Support />} />
        <Route path="/adminsupport" element={<Adminsupport />} />
        <Route path="/adminhostels" element={<Adminhostels />} />
        <Route path="/adminstaff" element={<Adminstaff />} />
        <Route path="/padmin" element={<Padmin />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/admincleaning" element={<Admincleaning />} />
        <Route path="/staffsignin" element={<Staffsignin />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/check" element={<Check />} />
        <Route path="/cook" element={<Cook />} />
        <Route path="/cookpreparing" element={<Cookpreparing />} />
        <Route path="/cookready" element={<Cookready />} />
        <Route path="/adminfood" element={<Adminfood />} />
        <Route path="/adminorders" element={<Adminorders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
