import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);

  // =========================
  // GET — получить избранное
  // =========================

  const getFavorites = async () => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
      return;
    }

    const userId = String(id).replaceAll('"', "");

    try {
      const response = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      });

      console.log("GET USER:", response);

      if (response.status === 200) {
        const currentUser = response.data;

        // Проверяем, что favorites является массивом
        if (Array.isArray(currentUser.favorites)) {
          setFavorites(currentUser.favorites);
        } else {
          setFavorites([]);
        }
      }
    } catch (error) {
      console.error("GET FAVORITES ERROR:", error);
    }
  };

  // =========================
  // GET при открытии страницы
  // =========================

  useEffect(() => {
    getFavorites();
  }, []);

  // =========================
  // Удаление из избранного
  // =========================

  const removeFavorite = async (hotel) => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
      return;
    }

    const userId = String(id).replaceAll('"', "");

    const newFavorites = favorites.filter(
      (item) => String(item.id) !== String(hotel.id),
    );

    try {
      // Сначала получаем текущего пользователя
      const userResponse = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      });

      if (userResponse.status === 200) {
        const currentUser = userResponse.data;

        // PUT — обновляем избранное
        const response = await axios({
          method: "PUT",
          url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
          data: {
            ...currentUser,
            favorites: newFavorites,
          },
        });

        console.log("PUT REMOVE FAVORITE:", response);

        if (response.status === 200) {
          setFavorites(newFavorites);
        }
      }
    } catch (error) {
      console.error("REMOVE FAVORITE ERROR:", error);

      alert("Ошибка при удалении из избранного");
    }
  };

  return (
    <div className="hotel-page">
      <div className="mobile-app">
        <div className="page-content">
          {/* ================= ЗАГОЛОВОК ================= */}

          <div className="mb-4">
            <h2 className="mb-1">Мои избранные</h2>

            <p className="text-secondary mb-0">Сохраненные отели</p>
          </div>

          {/* ================= ИЗБРАННЫЕ ОТЕЛИ ================= */}

          {favorites.length === 0 ? (
            <p className="text-secondary">В избранном пока ничего нет</p>
          ) : (
            favorites.map((item, index) => (
              <div className="hotel-card mb-3" key={item.id || index}>
                {/* ФОТО */}

                <div className="hotel-photo">
                  {item.avatarhotels ? (
                    <img src={item.avatarhotels} alt={item.namehotels} />
                  ) : (
                    <span>Фото отеля</span>
                  )}
                </div>

                {/* ИНФОРМАЦИЯ */}

                <div className="p-3">
                  <h5 className="mb-1">{item.namehotels}</h5>

                  <p className="text-secondary mb-2">{item.location}</p>

                  <p className="mb-1">
                    <small>{item.people} местная</small>
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    {/* ЦЕНА */}

                    <div>
                      <b>{item.price} сом</b>

                      <small className="text-secondary"> / ночь</small>
                    </div>

                    {/* КНОПКИ */}

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

        {/* ================= НАВИГАЦИЯ ================= */}

        <Bottomnav />
      </div>
    </div>
  );
}

export default Favorites;
