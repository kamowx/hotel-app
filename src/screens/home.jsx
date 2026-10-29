import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Bottomnav from "../components/bottomnav";
import axios from "axios";

function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");

  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Тема сохраняется в localStorage
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem("theme") === "dark",
  );

  // Range
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [maxPeople, setMaxPeople] = useState(10);

  // Переключение темы
  const toggleTheme = () => {
    if (darkTheme) {
      localStorage.removeItem("theme");
      setDarkTheme(false);
    } else {
      localStorage.setItem("theme", "dark");
      setDarkTheme(true);
    }
  };

  const getHotels = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels",
      });

      console.log("GET HOTELS:", response);

      if (response.status === 200) {
        setHotels(response.data);
      }
    } catch (error) {
      console.error("GET HOTELS ERROR:", error);
    }
  };

  const getUser = async () => {
    const id = localStorage.getItem("uid");

    if (!id) {
      navigate("/signin");
      return;
    }

    const userId = String(id).replaceAll('"', "");

    try {
      const response = await axios({
        method: "GET",
        url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${userId}`,
      });

      console.log("GET USER:", response);

      if (response.status === 200) {
        const currentUser = response.data;

        if (currentUser.userstatus == "padmin") {
          navigate("/padmin");
          return;
        }

        if (currentUser.userstatus == "cleaning") {
          navigate("/cleaning");
          return;
        }

        if (currentUser.userstatus == "admin") {
          navigate("/admin");
          return;
        }

        if (currentUser.userstatus == "user") {
          if (Array.isArray(currentUser.favorites)) {
            setFavorites(currentUser.favorites);
          } else {
            setFavorites([]);
          }
        }
      }
    } catch (error) {
      console.error("GET USER ERROR:", error);
    }
  };

  useEffect(() => {
    getHotels();
    getUser();
  }, []);

  const toggleFavorite = async (hotel) => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      navigate("/signin");
      return;
    }

    const userId = String(uid).replaceAll('"', "");

    const isFav = Array.isArray(favorites)
      ? favorites.some((item) => String(item.uid) === String(hotel.id))
      : false;

    let updated;

    if (isFav) {
      updated = favorites.filter(
        (item) => String(item.uid) !== String(hotel.uid),
      );
    } else {
      updated = [...favorites, hotel];
    }

    try {
      const userResponse = await axios({
        method: "GET",
        url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${userId}`,
      });

      if (userResponse.status === 200) {
        const currentUser = userResponse.data;

        const response = await axios({
          method: "PUT",
          url: `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${userId}`,
          data: {
            ...currentUser,
            favorites: updated,
          },
        });

        console.log("PUT FAVORITES:", response);

        if (response.status === 200) {
          setFavorites(updated);
        }
      }
    } catch (error) {
      console.error("PUT FAVORITES ERROR:", error);
      alert("Ошибка при сохранении избранного");
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const hotelName = hotel.namehotels || "";
    const hotelLocation = hotel.location || "";
    const hotelPrice = String(hotel.price || "");

    const matchesSearch =
      hotelName.toLowerCase().includes(search.toLowerCase()) ||
      hotelLocation.toLowerCase().includes(search.toLowerCase()) ||
      hotelPrice.includes(search);

    // Фильтр
    const price = Number(hotel.price) || 0;
    const people = Number(hotel.people) || 0;

    const matchesCategory = category === "Все" || hotelLocation === category;

    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesPeople = people <= maxPeople;

    return matchesSearch && matchesCategory && matchesPrice && matchesPeople;
  });

  return (
    <div className={`app ${darkTheme ? "dark-theme" : ""}`}>
      <div className="onboarding home-onboarding">
        <div className="home-header">
          <div className="home-logo">
            <div className="logo-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="logo-text">FirstHotel</div>
          </div>

          <div className="home-user">
            <div className="home-user-name">Привет!</div>
            <div className="home-user-text">Найдите свой отель</div>
          </div>

          {/* Кнопка переключения темы */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-button"
            aria-label="Переключить тему"
          >
            <i
              className={darkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon"}
            ></i>
          </button>
        </div>

        <div className="home-page">
          <div className="home-search">
            <h1>Найдите отель</h1>
            <p>Найдите идеальное место для вашего отдыха</p>

            <div className="home-search-box">
              <i className="fa-solid fa-magnifying-glass"></i>

              <input
                type="text"
                placeholder="Город или название отеля"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="home-categories">
            <button
              className={category === "Все" ? "selected" : ""}
              onClick={() => setCategory("Все")}
            >
              Все
            </button>

            <button
              className={category === "Бишкек" ? "selected" : ""}
              onClick={() => setCategory("Бишкек")}
            >
              Бишкек
            </button>

            <button
              className={category === "Ош" ? "selected" : ""}
              onClick={() => setCategory("Ош")}
            >
              Ош
            </button>

            <div>
              <label>Мест до: {maxPeople}</label>
              <br />

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={maxPeople}
                className="rangepople"
                onChange={(e) => setMaxPeople(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="home-categories price-filter">
            <div>
              <label>Цена от: {minPrice}</label>
              <br />

              <input
                name="range"
                type="range"
                min="0"
                max="10000"
                step="100"
                value={minPrice}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMinPrice(Math.min(value, maxPrice));
                }}
              />
            </div>

            <div>
              <label>Цена до: {maxPrice} сом</label>
              <br />

              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMaxPrice(Math.max(value, minPrice));
                }}
              />
            </div>
          </div>

          <div className="home-hotels">
            <div className="home-section-title">
              <h2>Популярные отели</h2>
            </div>

            {filteredHotels.length === 0 ? (
              <p className="text-secondary text-center my-4">
                Отели не найдены
              </p>
            ) : (
              filteredHotels.map((hotel) => {
                // Расчёт цены и скидки
                const price = Number(hotel.price) || 0;

                const discount = Math.min(
                  100,
                  Math.max(0, Number(hotel.discount) || 0),
                );

                const finalPrice = price - (price * discount) / 100;

                // Перевод сомов в доллары
                const dollarPrice = price / 87;
                const finalDollarPrice = finalPrice / 87;

                const isFav = Array.isArray(favorites)
                  ? favorites.some(
                      (item) => String(item.id) === String(hotel.id),
                    )
                  : false;

                return (
                  <div className="home-hotel-card" key={hotel.id}>
                    <div className="home-hotel-image">
                      {hotel.avatarhotels ? (
                        <img
                          className="home-hotel-image"
                          src={hotel.avatarhotels}
                          alt={hotel.namehotels}
                        />
                      ) : (
                        <i className="fa-solid fa-hotel"></i>
                      )}

                      <button
                        className="home-favorite"
                        onClick={() => toggleFavorite(hotel)}
                      >
                        <i
                          className={
                            isFav ? "fa-solid fa-heart" : "fa-regular fa-heart"
                          }
                        ></i>
                      </button>
                    </div>

                    <div className="home-hotel-info">
                      <h3>{hotel.namehotels}</h3>

                      <p>
                        <i className="fa-solid fa-location-dot"></i>
                        {hotel.location}
                      </p>

                      <p>
                        <i className="fa-solid fa-users"></i>
                        {hotel.people} мест
                      </p>

                      <div className="home-hotel-bottom">
                        <div className="home-hotel-price">
                          <div>
                            {discount > 0 && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#888",
                                  marginRight: "8px",
                                }}
                              >
                                {price} сом
                              </span>
                            )}

                            <strong>{finalPrice.toFixed(0)} сом</strong>
                          </div>

                          <div>
                            {discount > 0 && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#888",
                                  marginRight: "8px",
                                }}
                              >
                                {dollarPrice.toFixed(2)} $
                              </span>
                            )}

                            <strong>{finalDollarPrice.toFixed(2)} $</strong>
                          </div>

                          <span>/ ночь</span>
                        </div>

                        {discount > 0 && (
                          <div className="home-hotel-price">
                            <span
                              style={{
                                color: "red",
                                fontWeight: "bold",
                              }}
                            >
                              -{discount}%
                            </span>

                            <span>/ Скидка</span>
                          </div>
                        )}

                        <Link
                          className="home-hotel-button"
                          to={`/hotels/${hotel.id}`}
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <br />
        <br />

        <Bottomnav />
      </div>
    </div>
  );
}

export default Home;
