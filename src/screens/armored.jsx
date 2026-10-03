import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Armored() {
  const [bookings, setBookings] = useState([]);

  // Получаем только забронированные отели из MockAPI
  const getBookings = async () => {
    try {
      const response = await axios.get(
        "https://6aae654c606bd915d110c57c.mockapi.io/data",
      );
      setBookings(response.data);
    } catch (error) {
      console.error("Ошибка при получении бронирований:", error);
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  // Отмена бронирования - удаляем запись из MockAPI
  const removeBooking = async (id) => {
    try {
      await axios.delete(
        `https://6aae654c606bd915d110c57c.mockapi.io/data/${id}`,
      );
      setBookings(bookings.filter((item) => item.id !== id));
      alert("Бронирование отменено!");
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
    }
  };

  return (
    <div className="hotel-page">
      <div className="mobile-app">
        <div className="page-content">
          <div className="mb-4">
            <h2 className="mb-1">Мои бронирования</h2>
            <p className="text-secondary mb-0">Список забронированных отелей</p>
          </div>

          {bookings.length === 0 ? (
            <p className="text-secondary">Пока нет бронирований</p>
          ) : (
            bookings.map((item) => (
              <div className="hotel-card mb-3" key={item.id}>
                <div className="p-3">
                  <h5>{item.name}</h5>
                  <p className="text-secondary mb-2">{item.city}</p>

                  <p className="mb-1">
                    <b>Цена:</b> {item.price} сом / ночь
                  </p>

                  {item.forpriceday ? (
                    <p className="mb-1">
                      <b>Дней:</b> {item.forpriceday}
                    </p>
                  ) : null}

                  {item.allprice ? (
                    <p className="mb-1">
                      <b>Общая сумма:</b> <b>{item.allprice}</b> сом
                    </p>
                  ) : null}

                  <p className="mb-1">
                    <b>Заезд:</b> {item.date1}
                  </p>

                  <p className="mb-1">
                    <b>Выезд:</b> {item.date2}
                  </p>

                  <p className="mb-3">
                    <b>Гостей:</b> {item.guests}
                  </p>

                  <button
                    className="btn btn-danger w-100"
                    onClick={() => removeBooking(item.id)}
                  >
                    Отменить бронирование
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Навигация */}
        <div className="bottom-navigation">
          <div className="nav-item">
            <Link className="i1" to="/">
              <div className="nav-icon">⌂</div>
              <small>Все отели</small>
            </Link>
          </div>

          <div className="nav-item active">
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

export default Armored;
