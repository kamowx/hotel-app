import { useState } from "react";

function Armored() {
  const [bookings] = useState(
    JSON.parse(localStorage.getItem("bookings")) || [],
  );

  return (
    <div className="hotel-page">
      <div className="mobile-app">
        <div className="page-content">
          <h2 className="mb-4">Мои бронирования</h2>

          {bookings.length === 0 ? (
            <p className="text-secondary">Пока нет бронирований</p>
          ) : (
            bookings.map((item, index) => (
              <div className="hotel-card mb-3" key={index}>
                <div className="p-3">
                  <h5>{item.name}</h5>

                  <p className="text-secondary mb-2">{item.city}</p>

                  <p className="mb-1">
                    <b>Цена:</b> {item.price} сом / ночь
                  </p>

                  <p className="mb-1">
                    <b>Заезд:</b> {item.date1}
                  </p>

                  <p className="mb-1">
                    <b>Выезд:</b> {item.date2}
                  </p>

                  <p className="mb-0">
                    <b>Гостей:</b> {item.guests}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bottom-navigation">
          <div className="nav-item">
            <a className="i1" href="/">
              <div className="nav-icon">⌂</div>

              <small>Все отели</small>
            </a>
          </div>

          <div className="nav-item active">
            <a className="i1" href="/armored">
              <div className="nav-icon">▣</div>

              <small>Бронирования</small>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Armored;
