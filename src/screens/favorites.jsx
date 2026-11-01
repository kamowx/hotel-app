import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Favorites() {
  const navigate = useNavigate();

  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem("theme") === "dark",
  );

  const [favorites, setFavorites] = useState([]);

  // Получаем пользователя по Firebase uid
  const getFavorites = async () => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/signin");
      return;
    }

    try {
      const response = await axios.get(USERS_URL);

      const currentUser = response.data.find(
        (item) => String(item.uid) === String(uid).replaceAll('"', ""),
      );

      if (!currentUser) {
        console.error("Пользователь с таким uid не найден в MockAPI");
        setFavorites([]);
        return;
      }

      console.log("CURRENT USER:", currentUser);

      setFavorites(
        Array.isArray(currentUser.favorites) ? currentUser.favorites : [],
      );
    } catch (error) {
      console.error("GET FAVORITES ERROR:", error);
    }
  };

  useEffect(() => {
    getFavorites();
  }, []);

  // Удаляем отель из избранного
  const removeFavorite = async (hotel) => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/signin");
      return;
    }

    try {
      // Находим пользователя по uid
      const usersResponse = await axios.get(USERS_URL);

      const currentUser = usersResponse.data.find(
        (item) => String(item.uid) === String(uid).replaceAll('"', ""),
      );

      if (!currentUser) {
        console.error("Пользователь с таким uid не найден в MockAPI");
        alert("Пользователь не найден");
        return;
      }

      // Удаляем отель по его id
      const newFavorites = (
        Array.isArray(currentUser.favorites) ? currentUser.favorites : []
      ).filter((item) => String(item.id) !== String(hotel.id));

      // Обновляем запись пользователя по настоящему MockAPI id
      const response = await axios.put(`${USERS_URL}/${currentUser.id}`, {
        ...currentUser,
        favorites: newFavorites,
      });

      console.log("PUT REMOVE FAVORITE:", response.data);

      if (response.status === 200) {
        setFavorites(newFavorites);
      }
    } catch (error) {
      console.error("REMOVE FAVORITE ERROR:", error);
      alert("Ошибка при удалении из избранного");
    }
  };

  return (
    <div className={`app ${darkTheme ? "dark-theme" : ""}`}>
      <div className="hotel-page">
        <div className="mobile-app">
          <div className="page-content">
            <div className="mb-4">
              <h2 className="mb-1">Мои избранные</h2>

              <p className="text-secondary mb-0">Сохраненные отели</p>
            </div>

            {favorites.length === 0 ? (
              <p className="text-secondary">В избранном пока ничего нет</p>
            ) : (
              favorites.map((item, index) => (
                <div className="hotel-card mb-3" key={item.id || index}>
                  <div className="hotel-photo">
                    {item.avatarhotels ? (
                      <img
                        className="home-hotel-image"
                        src={item.avatarhotels}
                        alt={item.namehotels}
                      />
                    ) : (
                      <span>Фото отеля</span>
                    )}
                  </div>

                  <div className="p-3">
                    <h5 className="mb-1">{item.namehotels}</h5>

                    <p className="text-secondary mb-2">{item.location}</p>

                    <p className="mb-1">
                      <small>{item.people} местная</small>
                    </p>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <b>{item.price} сом</b>

                        <small className="text-secondary"> / ночь</small>
                      </div>

                      <div>
                        <button
                          className="btn btn-danger me-2"
                          onClick={() => removeFavorite(item)}
                        >
                          ♥
                        </button>

                        <Link
                          className="btn btn-primary"
                          to={`/hotels/${item.id}`}
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Bottomnav />
        </div>
      </div>
    </div>
  );
}

export default Favorites;
