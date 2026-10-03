import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { hotels } from "../data/hotels";

function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [guests, setGuests] = useState("1");

  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  // Избранные хранятся в localStorage
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || [],
  );

  // Добавление / удаление из избранного
  const toggleFavorite = (hotel) => {
    const isFav = favorites.some((item) => item.name === hotel.name);
    let updated;

    if (isFav) {
      updated = favorites.filter((item) => item.name !== hotel.name);
    } else {
      updated = [...favorites, hotel];
    }

    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);
  };

  // Расчет дней и суммы
  const forpriceday =
    date1 && date2
      ? Math.max(
          1,
          Math.round(
            (new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const allprice = selectedHotel ? forpriceday * selectedHotel.price : 0;

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Бронирование: отправляем только забронированный отель в MockAPI
  const SaveBooking = async () => {
    if (!date1) {
      alert("Выберите дату заезда");
      return;
    }

    if (!date2) {
      alert("Выберите дату выезда");
      return;
    }

    const newBooking = {
      name: selectedHotel.name,
      city: selectedHotel.city,
      price: selectedHotel.price,
      date1: date1,
      date2: date2,
      forpriceday: forpriceday,
      allprice: allprice,
      guests: guests,
    };

    try {
      await axios.post(
        "https://6aae654c606bd915d110c57c.mockapi.io/data",
        newBooking,
      );
      setShowPayModal(false);
      alert("Отель успешно забронирован!");
    } catch (error) {
      console.error("Ошибка при бронировании:", error);
      alert("Ошибка при сохранении на сервере");
    }
  };

  // Поиск и фильтрация отелей
  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(search.toLowerCase()) ||
      hotel.city.toLowerCase().includes(search.toLowerCase()) ||
      String(hotel.price).includes(search);

    const matchesCategory = category === "Все" || hotel.city === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="hotel-page">
      <div className="mobile-app">
        <div className="page-content">
          {/* Заголовок */}
          <div className="mb-4">
            <h2 className="mb-1">Отели</h2>
            <p className="text-secondary mb-0">Найдите подходящий отель</p>
          </div>

          {/* Поиск */}
          <input
            type="text"
            className="form-control hotel-input"
            placeholder="Поиск отеля"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <br />

          {/* Категории */}
          <div className="d-flex gap-2 mb-4">
            <button
              className={`btn ${
                category === "Все" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCategory("Все")}
            >
              Все
            </button>

            <button
              className={`btn ${
                category === "Бишкек" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCategory("Бишкек")}
            >
              Бишкек
            </button>

            <button
              className={`btn ${
                category === "Ош" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCategory("Ош")}
            >
              Ош
            </button>
          </div>

          {/* Список отелей */}
          {filteredHotels.length === 0 ? (
            <p className="text-secondary text-center my-4">Отели не найдены</p>
          ) : (
            filteredHotels.map((hotel) => {
              const isFav = favorites.some((item) => item.name === hotel.name);

              return (
                <div className="hotel-card mb-3" key={hotel.id}>
                  <div className="hotel-photo">
                    <span>Фото отеля</span>
                  </div>

                  <div className="p-3">
                    <h5 className="mb-1">{hotel.name}</h5>
                    <p className="text-secondary mb-2">{hotel.city}</p>

                    <p className="mb-1">
                      <small>{hotel.people} местная</small>
                    </p>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <b>{hotel.price} сом</b>
                        <small className="text-secondary"> / ночь</small>
                      </div>

                      <div>
                        <button
                          className={`btn ${
                            isFav ? "btn-danger" : "btn-outline-danger"
                          } me-2`}
                          onClick={() => toggleFavorite(hotel)}
                        >
                          {isFav ? "♥" : "♡"}
                        </button>

                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setSelectedHotel(hotel);
                            setShowPayModal(true);
                            setDate1("");
                            setDate2("");
                            setGuests("1");
                          }}
                        >
                          Забронировать
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Модальное окно бронирования */}
        {showPayModal && (
          <>
            <div className="modal-backdrop fade show"></div>

            <div
              className="modal d-block"
              tabIndex="-1"
              onClick={() => setShowPayModal(false)}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Бронирование отеля {selectedHotel?.name}
                    </h5>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowPayModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    {/* Дата заезда */}
                    <div className="mb-3">
                      <label className="form-label">Дата заезда</label>
                      <input
                        type="date"
                        className="form-control"
                        min={getToday()}
                        value={date1}
                        onChange={(e) => {
                          setDate1(e.target.value);
                          setDate2("");
                        }}
                      />
                    </div>

                    {/* Дата выезда */}
                    <div className="mb-3">
                      <label className="form-label">Дата выезда</label>
                      <input
                        type="date"
                        className="form-control"
                        min={date1 || getToday()}
                        value={date2}
                        disabled={!date1}
                        onChange={(e) => setDate2(e.target.value)}
                      />
                    </div>

                    {/* Количество гостей */}
                    <div className="mb-3">
                      <label className="form-label">Количество гостей</label>
                      <select
                        className="form-select"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      >
                        <option value="1">1 гость</option>
                        <option value="2">2 гостя</option>
                        <option value="3">3 гостя</option>
                        <option value="4">4 гостя</option>
                      </select>
                    </div>

                    {/* Сумма */}
                    {forpriceday > 0 && (
                      <div className="alert alert-light border mt-3 mb-0">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Количество ночей:</span>
                          <strong>{forpriceday}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Итого к оплате:</span>
                          <strong>{allprice} сом</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPayModal(false)}
                    >
                      Отмена
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={SaveBooking}
                    >
                      Забронировать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Нижняя навигация */}
        <div className="bottom-navigation">
          <div className="nav-item active">
            <Link className="i1" to="/">
              <div className="nav-icon">⌂</div>
              <small>Все отели</small>
            </Link>
          </div>

          <div className="nav-item">
            <Link className="i1" to="/armored">
              <div className="nav-icon">▣</div>
              <small>Бронирования</small>
            </Link>
          </div>

          <div className="nav-item">
            <Link className="i1" to="/favorites">
              <div className="nav-icon">▢</div>
              <small>Избранные</small>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
