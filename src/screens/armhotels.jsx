import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Armhotels() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  const getBooking = async () => {
    try {
      const userId = localStorage.getItem("id");

      if (!userId) {
        navigate("/signin");
        return;
      }

      const cleanUserId = String(userId).replaceAll('"', "");

      const response = await axios.get(
        `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${cleanUserId}`,
      );

      console.log("GET USER:", response);

      if (response.status === 200) {
        const currentUser = response.data;

        const bookings = Array.isArray(currentUser.bookhotel)
          ? currentUser.bookhotel
          : [];

        const selectedBooking = bookings[Number(id)];

        if (selectedBooking) {
          setBooking(selectedBooking);
        } else {
          alert("Бронирование не найдено");
          navigate("/armored");
        }
      }
    } catch (error) {
      console.error("Ошибка при получении бронирования:", error);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("id");

    if (!userId) {
      navigate("/signin");
      return;
    }

    getBooking();
  }, [id]);

  const removeBooking = async () => {
    try {
      const userId = localStorage.getItem("id");

      if (!userId) {
        navigate("/signin");
        return;
      }

      const cleanUserId = String(userId).replaceAll('"', "");

      const userResponse = await axios.get(
        `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${cleanUserId}`,
      );

      const currentUser = userResponse.data;

      const oldBookings = Array.isArray(currentUser.bookhotel)
        ? currentUser.bookhotel
        : [];

      const index = Number(id);
      const currentBooking = oldBookings[index];

      if (!currentBooking) {
        alert("Бронирование не найдено");
        navigate("/armored");
        return;
      }

      const refundAmount = Number(currentBooking.allprice) || 0;
      const balance = Number(currentUser.check) || 0;

      const newBalance = Number((balance + refundAmount).toFixed(2));

      const updatedBookings = oldBookings.filter(
        (_, itemIndex) => itemIndex !== index,
      );

      const response = await axios.put(
        `https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data/${cleanUserId}`,
        {
          ...currentUser,
          check: newBalance,
          bookhotel: updatedBookings,
        },
      );

      if (response.status === 200) {
        alert(
          `Бронирование отменено! Возвращено ${refundAmount} сом. Баланс: ${newBalance} сом.`,
        );

        navigate("/armored");
      }
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
      alert("Не удалось отменить бронирование");
    }
  };

  const callCleaning = () => {
    alert("Ожидайте!");
  };

  if (!booking) {
    return (
      <div className="app">
        <div className="onboarding armhotel-page">
          <div className="armhotel-loading">
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  const isHostel = booking.type === "hostel";

  return (
    <div className="app">
      <div className="onboarding home-onboarding">
        <div className="armhotel-header">
          <Link to="/armored" className="armhotel-back">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>

          <div className="logo-text">FirstHotel</div>
        </div>

        <div className="armhotel-image">
          {booking.avatarhotels ? (
            <img src={booking.avatarhotels} alt={booking.name} />
          ) : (
            <i className="fa-solid fa-hotel"></i>
          )}
        </div>

        <div className="armhotel-content p-2">
          <div className="armhotel-city">
            <i className="fa-solid fa-location-dot"></i>
            {booking.city}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>{booking.name}</h1>
            <span className={`admin-type-tag ${booking.type || "hotel"}`}>
              {isHostel ? "Хостел" : "Отель"}
            </span>
          </div>

          <div className="armhotel-price">
            {booking.price} сом
            <span>/ ночь</span>
          </div>

          <p>Статус: {booking.status}</p>

          <div className="armhotel-divider"></div>

          <h2>Информация о бронировании</h2>

          <div className="armhotel-info">
            {booking.place ? (
              <div className="armhotel-info-row">
                <div className="armhotel-info-icon">
                  <i className={isHostel ? "fa-solid fa-bed" : "fa-solid fa-door-closed"}></i>
                </div>

                <div>
                  <strong>{isHostel ? "Номер места (койка)" : "Номер комнаты"}</strong>
                  <p>{isHostel ? `Место ${booking.place}` : `Номер ${booking.place}`}</p>
                </div>
              </div>
            ) : null}

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>

              <div>
                <strong>Дата заезда</strong>
                <p>{booking.date1}</p>
              </div>
            </div>

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-calendar-xmark"></i>
              </div>

              <div>
                <strong>Дата выезда</strong>
                <p>{booking.date2}</p>
              </div>
            </div>

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-moon"></i>
              </div>

              <div>
                <strong>Количество ночей</strong>
                <p>{booking.forpriceday}</p>
              </div>
            </div>

            <div className="armhotel-info-row">
              <div className="armhotel-info-icon">
                <i className="fa-solid fa-users"></i>
              </div>

              <div>
                <strong>Количество гостей</strong>
                <p>{booking.guests}</p>
              </div>
            </div>
          </div>

          <div className="armhotel-total">
            <span>Общая сумма</span>
            <strong>{booking.allprice} сом</strong>
          </div>

          <button className="armhotel-cancel-button" onClick={removeBooking}>
            <i className="fa-solid fa-trash"></i>
            Отменить бронирование
          </button>
          <br />
          <br />
        </div>
      </div>
    </div>
  );
}

export default Armhotels;
