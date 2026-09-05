import { useState } from "react";

function Home() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [guests, setGuests] = useState("1");

  const [selectedHotel, setSelectedHotel] = useState(null);

  const AddFavorite = (hotel) => {
    const oldFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

    oldFavorites.push(hotel);

    localStorage.setItem("favorites", JSON.stringify(oldFavorites));
  };
  const hotels = [
    {
      name: "Grand Hotel",
      city: "Бишкек",
      price: 2500,
      people: 3,
    },
    {
      name: "Plaza Hotel",
      city: "Бишкек",
      price: 3200,
      people: 2,
    },
    {
      name: "City Hotel",
      city: "Бишкек",
      price: 2800,
      people: 4,
    },
  ];

  //ДАТА МИН МАКСИМАЛЬНО
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const day1 = date1 ? new Date(date1).getDate() : "";
  const day2 = date2 ? new Date(date2).getDate() : "";

  const forpriceday = day2 - day1;

  const allprice = selectedHotel ? forpriceday * selectedHotel.price : 0;

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getMinDate2 = () => {
    if (!date1) return "";

    const date = new Date(date1);
    date.setDate(date.getDate() + 1);

    return date.toISOString().split("T")[0];
  };

  const getMaxDate2 = () => {
    if (!date1) return "";

    const date = new Date(date1);
    date.setDate(date.getDate() + 5);

    return date.toISOString().split("T")[0];
  };

  //  БРОНИРОВАНИЯ
  const SaveBooking = () => {
    if (!selectedHotel) {
      alert("Выберите отель");
      return;
    }

    if (!date1) {
      alert("Выберите дату заезда");
      return;
    }

    if (!date2) {
      alert("Выберите дату выезда");
      return;
    }

    const oldBooking = JSON.parse(localStorage.getItem("bookings")) || [];

    const newBooking = {
      name: selectedHotel.name,
      city: selectedHotel.city,
      price: selectedHotel.price,
      date1: date1,
      date2: date2,
      day1: day1,
      day2: day2,
      forpriceday: forpriceday,
      allprice: allprice,
      guests: guests,
    };

    oldBooking.push(newBooking);

    localStorage.setItem("bookings", JSON.stringify(oldBooking));

    setShowPayModal(false);

    alert("Отель забронирован!");
  };

  // ДАТА
  return (
    <div className="hotel-page">
      <div className="mobile-app">
        <div className="page-content">
          <div className="mb-4">
            <h2 className="mb-1">Отели</h2>

            <p className="text-secondary mb-0">Найдите подходящий отель</p>
          </div>

          {/* Поиск */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control hotel-input"
              placeholder="Поиск отеля"
            />
          </div>

          {/* Отели */}
          {hotels.map((hotel, index) => (
            <div className="hotel-card mb-3" key={index}>
              <div className="hotel-photo">
                <span>Фото отеля</span>
              </div>

              <div className="p-3">
                <h5 className="mb-1">{hotel.name}</h5>

                <p className="text-secondary mb-2">{hotel.city}</p>

                <p>
                  <small>{hotel.people} местная</small>
                </p>

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <b>{hotel.price} сом</b>

                    <small className="text-secondary"> / ночь</small>
                  </div>

                  <div>
                    <button
                      className="btn btn-outline-danger me-2"
                      onClick={() => AddFavorite(hotel)}
                    >
                      ♡
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedHotel(hotel);
                        setShowPayModal(true);
                      }}
                    >
                      Забронировать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                        onChange={(e) => {
                          setDate1(e.target.value);
                          setDate2("");
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Дата выезда</label>

                      <input
                        type="date"
                        className="form-control"
                        min={getMinDate2()}
                        max={getMaxDate2()}
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
                        {selectedHotel?.people >= 1 && (
                          <option value="1">1 гость</option>
                        )}

                        {selectedHotel?.people >= 2 && (
                          <option value="2">2 гостя</option>
                        )}

                        {selectedHotel?.people >= 3 && (
                          <option value="3">3 гостя</option>
                        )}

                        {selectedHotel?.people >= 4 && (
                          <option value="4">4 гостя</option>
                        )}
                      </select>
                    </div>
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

        <div className="bottom-navigation">
          <div className="nav-item active">
            <a className="i1" href="/">
              <div className="nav-icon">⌂</div>

              <small>Все отели</small>
            </a>
          </div>

          <div className="nav-item">
            <a className="i1" href="/armored">
              <div className="nav-icon">▣</div>

              <small>Бронирования</small>
            </a>
          </div>
          <div className="nav-item">
            <a className="i1" href="/favorites">
              <div className="nav-icon">▢</div>
              <small>Избранный</small>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
