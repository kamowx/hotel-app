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

  const getHotels = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "https://6ac221b73f4ae78f6944db9c.mockapi.io/hotels",
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
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
      return;
    }

    const userId = String(id).replaceAll('"', "");

    const isFav = Array.isArray(favorites)
      ? favorites.some((item) => String(item.id) === String(hotel.id))
      : false;

    let updated;

    if (isFav) {
      updated = favorites.filter(
        (item) => String(item.id) !== String(hotel.id),
      );
    } else {
      updated = [...favorites, hotel];
    }

    try {
      const userResponse = await axios({
        method: "GET",
        url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      });

      if (userResponse.status === 200) {
        const currentUser = userResponse.data;

        const response = await axios({
          method: "PUT",
          url: `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
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

    const matchesCategory = category === "Все" || hotelLocation === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
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
                const isFav = Array.isArray(favorites)
                  ? favorites.some(
                      (item) => String(item.id) === String(hotel.id),
                    )
                  : false;

                return (
                  <div className="home-hotel-card" key={hotel.id}>
                    <div className="home-hotel-image">
                      {hotel.avatarhotels ? (
                        <img src={hotel.avatarhotels} alt={hotel.namehotels} />
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
                          {hotel.price} сом
                          <span>/ ночь</span>
                        </div>

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
/*hotel*/
