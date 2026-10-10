import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Bottomnav from "../components/bottomnav";

function Armored() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

  const getBookings = async () => {
    try {
      const id = localStorage.getItem("id");

      if (!id) {
        navigate("/signin");
        return;
      }

      const userId = String(id).replaceAll('"', "");

      const response = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      );

      console.log("GET USER:", response);

      if (response.status === 200) {
        if (Array.isArray(response.data.bookhotel)) {
          setBookings(response.data.bookhotel);
        } else {
          setBookings([]);
        }
      }
    } catch (error) {
      console.error("Ошибка при получении бронирований:", error);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("id");

    if (!id) {
      navigate("/signin");
      return;
    }

    getBookings();
  }, []);

  const removeBooking = async (hotelId) => {
    try {
      const id = localStorage.getItem("id");

      if (!id) {
        navigate("/signin");
        return;
      }

      const userId = String(id).replaceAll('"', "");

      const userResponse = await axios.get(
        `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
      );

      if (userResponse.status === 200) {
        const currentUser = userResponse.data;

        const oldBookings = Array.isArray(currentUser.bookhotel)
          ? currentUser.bookhotel
          : [];

        const newBookings = oldBookings.filter(
          (item) => String(item.hotelId) !== String(hotelId),
        );

        const response = await axios.put(
          `https://6ac221b73f4ae78f6944db9c.mockapi.io/data/${userId}`,
          {
            ...currentUser,
            bookhotel: newBookings,
          },
        );

        console.log("PUT BOOKING:", response);

        if (response.status === 200) {
          setBookings(newBookings);

          alert("Бронирование отменено!");
        }
      }
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
            bookings.map((item, index) => (
              <div className="hotel-card mb-3" key={item.hotelId || index}>
                <div className="hotel-card-image">
                  {item.avatarhotels ? (
                    <img src={item.avatarhotels} alt={item.name} />
                  ) : (
                    <i className="fa-solid fa-hotel"></i>
                  )}
                </div>

                <div className="p-3">
                  <h5>{item.name}</h5>

                  <p className="text-secondary mb-2">
                    <i className="fa-solid fa-location-dot me-1"></i>

                    {item.city}
                  </p>

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
                      <b>Общая сумма:</b> {item.allprice} сом
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

                  <p className="mb-3">
                    <b>Статус:</b> {item.status}
                  </p>

                  <div className="hotel-card-buttons">
                    <Link
                      className="hotel-details-button"
                      to={`/armhotels/${index}`}
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Bottomnav />
      </div>
    </div>
  );
}

export default Armored;
/*hotel*/
