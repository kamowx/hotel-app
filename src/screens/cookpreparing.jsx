import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const FOOD_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/foodorders";

function Cookpreparing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Получаем заказы, которые готовятся
  const getOrders = async () => {
    try {
      const response = await axios.get(FOOD_URL);

      const preparingOrders = response.data.filter(
        (item) => item.status === "Готовится",
      );

      setOrders(preparingOrders.reverse());
    } catch (error) {
      console.log("Ошибка получения заказов:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();

    // Обновляем список каждые 3 секунды
    const interval = setInterval(() => {
      getOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Завершить заказ
  const finishOrder = async (id) => {
    try {
      await axios.put(`${FOOD_URL}/${id}`, {
        status: "Завершён",
      });

      setOrders((prev) =>
        prev.filter((item) => String(item.id) !== String(id)),
      );
    } catch (error) {
      console.log("Ошибка изменения статуса:", error);
    }
  };

  return (
    <div className="cook-page">
      <aside className="cook-sidebar">
        <div className="cook-logo">
          <i className="fa-solid fa-utensils"></i>
          <span>FirstHotel</span>
        </div>

        <div className="cook-profile">
          <div className="cook-avatar">
            <i className="fa-solid fa-user"></i>
          </div>
          <div>
            <strong>Повар</strong>
            <span>Персонал кухни</span>
          </div>
        </div>

        <nav className="cook-menu">
          <NavLink to="/cook" className="cook-menu-item i1">
            <i className="fa-solid fa-clipboard-list"></i>
            <span>Заказы</span>
          </NavLink>

          <NavLink to="/cookpreparing" className="cook-menu-item active i1">
            <i className="fa-solid fa-fire-burner"></i>
            <span>Готовятся</span>
          </NavLink>

          <NavLink to="/cookready" className="cook-menu-item i1">
            <i className="fa-solid fa-circle-check"></i>
            <span>Готовые блюда</span>
          </NavLink>
        </nav>

        <div className="cook-sidebar-bottom">
          <div className="cook-menu-item">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Выйти</span>
          </div>
        </div>
      </aside>

      <main className="cook-main">
        <header className="cook-header">
          <div>
            <h2>Готовятся</h2>
            <p>Заказы, которые сейчас готовятся на кухне</p>
          </div>

          <div className="cook-header-right">
            <span className="cook-online">
              <i></i> На смене
            </span>
            <div className="cook-header-avatar">
              <i className="fa-solid fa-user"></i>
            </div>
          </div>
        </header>

        <section className="cook-stats">
          <div className="cook-stat-card">
            <div className="cook-stat-icon blue">
              <i className="fa-solid fa-fire-burner"></i>
            </div>
            <div>
              <span>Всего готовится</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="cook-stat-card">
            <div className="cook-stat-icon orange">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <span>В процессе</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="cook-stat-card">
            <div className="cook-stat-icon green">
              <i className="fa-solid fa-check"></i>
            </div>
            <div>
              <span>Ожидают завершения</span>
              <strong>{orders.length}</strong>
            </div>
          </div>
        </section>

        <div className="cook-orders-title">
          <h3>Заказы в приготовлении</h3>
          <span>Сегодня</span>
        </div>

        <section className="cook-orders">
          {loading ? (
            <p>Загрузка заказов...</p>
          ) : orders.length === 0 ? (
            <p>Заказов в приготовлении пока нет</p>
          ) : (
            orders.map((order) => (
              <div className="cook-order-card" key={order.id}>
                <div className="cook-order-top">
                  <div>
                    <strong>Заказ №{order.id}</strong>
                    <span>
                      Комната №{order.room} · {order.time}
                    </span>
                  </div>

                  <span className="cook-badge cooking">Готовится</span>
                </div>

                {order.foods?.map((food, index) => (
                  <div className="cook-order-food" key={index}>
                    <div>
                      <strong>{food.name}</strong>
                      <span>Количество: {food.quantity} шт.</span>
                    </div>
                  </div>
                ))}

                <div className="cook-order-bottom">
                  <strong>{order.total} сом</strong>

                  <button
                    className="cook-action-button ready-button"
                    onClick={() => finishOrder(order.id)}
                  >
                    <i className="fa-solid fa-check"></i>
                    Заказ готов
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Cookpreparing;
