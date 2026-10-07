import { NavLink } from "react-router-dom";

function Bottomnav() {
  return (
    <div>
      <div className="home-bottom-nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? "home-nav-item active" : "home-nav-item"
          }
        >
          <i className="fa-solid fa-house"></i>
          <span>Главная</span>
        </NavLink>

        <NavLink
          to="/armored"
          className={({ isActive }) =>
            isActive ? "home-nav-item active" : "home-nav-item"
          }
        >
          <i className="fa-regular fa-calendar-check"></i>
          <span>Бронь</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            isActive ? "home-nav-item active" : "home-nav-item"
          }
        >
          <i className="fa-regular fa-heart"></i>
          <span>Избранное</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "home-nav-item active" : "home-nav-item"
          }
        >
          <i className="fa-regular fa-user"></i>
          <span>Профиль</span>
        </NavLink>
      </div>
    </div>
  );
}

export default Bottomnav;
