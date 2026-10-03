import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Favorites() {
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || [],
  );

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [guests, setGuests] = useState("1");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  // Удаление из избранного
  const removeFavorite = (hotel) => {
    const newFavorites = favorites.filter((item) => item.name !== hotel.name);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
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

  // Бронирование из избранного: отправляем на MockAPI
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

  return (
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
                  <span>Фото отеля</span>
                </div>

                <div className="p-3">
                  <h5 className="mb-1">{item.name}</h5>
                  <p className="text-secondary mb-2">{item.city}</p>

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

                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedHotel(item);
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
            ))
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
                    <div className="mb-3">
                      <label className="form-label">Дата заезда</label>
                      <input
                        type="date"
                        className="form-control"
                        min={getToday()}
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                      />
                    </div>

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

        {/* Навигация */}
        <div className="bottom-navigation">
          <div className="nav-item">
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

          <div className="nav-item active">
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

export default Favorites;
