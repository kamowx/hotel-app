import { useEffect, useState } from "react";
import axios from "axios";

const FOOD_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/foodorders";

const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Adminorders() {
  const [activeFilter, setActiveFilter] = useState("Все");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ["Все", "Новые", "Подтверждённые", "Отклонённые"];

  useEffect(() => {
    getOrders();
  }, []);

  // Получаем все заказы и пользователей
  const getOrders = async () => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        axios.get(FOOD_URL),
        axios.get(USERS_URL),
      ]);

      const users = usersResponse.data;

      const allOrders = ordersResponse.data.map((order) => {
        const customer = users.find(
          (user) => String(user.id) === String(order.userId),
        );

        let foods = order.foods || [];

        if (typeof foods === "string") {
          try {
            foods = JSON.parse(foods);
          } catch {
            foods = [];
          }
        }

        return {
          ...order,
          foods: Array.isArray(foods) ? foods : [],
          customer:
            customer?.name ||
            customer?.fullname ||
            customer?.firstname ||
            customer?.email ||
            "Клиент",
          total: Number(order.total || 0),
        };
      });

      setOrders(allOrders.reverse());
    } catch (error) {
      console.log("GET FOOD ORDERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // Изменяем статус заказа в MockAPI
  const changeStatus = async (id, status) => {
    try {
      await axios.put(`${FOOD_URL}/${id}`, {
        status: status,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order.id) === String(id)
            ? { ...order, status: status }
            : order,
        ),
      );
    } catch (error) {
      console.log("CHANGE ORDER STATUS ERROR:", error);
      alert("Не удалось изменить статус заказа");
    }
  };

  // Фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "Все") return true;
    if (activeFilter === "Новые") return order.status === "Новый";
    if (activeFilter === "Подтверждённые")
      return order.status === "Подтверждён";
    if (activeFilter === "Отклонённые") return order.status === "Отклонён";

    return true;
  });

  return (
    <div className="adminorders-page">
      {/* Боковое меню */}
      <aside className="adminorders-sidebar">
        <div className="adminorders-logo">
          <i className="fa-solid fa-hotel"></i>
          <span>FirstHotel</span>
        </div>

        <div className="adminorders-profile">
          <div className="adminorders-avatar">
            <i className="fa-solid fa-user"></i>
          </div>

          <div>
            <strong>Администратор</strong>
            <span>Панель управления</span>
          </div>
        </div>

        <nav className="adminorders-menu">
          <a href="/admin" className="adminorders-menu-item">
            <i className="fa-solid fa-house"></i>
            <span>Главная</span>
          </a>

          <a href="/adminfood" className="adminorders-menu-item">
            <i className="fa-solid fa-utensils"></i>
            <span>Блюда</span>
          </a>

          <a href="/adminorders" className="adminorders-menu-item active">
            <i className="fa-solid fa-clipboard-list"></i>
            <span>Заказы еды</span>
          </a>
        </nav>

        <div className="adminorders-sidebar-bottom">
          <a href="/adminsignin" className="adminorders-menu-item">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Выйти</span>
          </a>
        </div>
      </aside>

      {/* Основная часть */}
      <main className="adminorders-main">
        <div className="adminorders-header">
          <div>
            <h2>Заказы еды</h2>
            <p>Просматривайте и подтверждайте заказы клиентов</p>
          </div>

          <div className="adminorders-header-date">
            <i className="fa-regular fa-calendar"></i>
            {new Date().toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Статистика */}
        <div className="adminorders-stats">
          <div className="adminorders-stat-card">
            <div className="adminorders-stat-icon green">
              <i className="fa-solid fa-clipboard-list"></i>
            </div>
            <div>
              <span>Всего заказов</span>
              <h3>{orders.length}</h3>
            </div>
          </div>

          <div className="adminorders-stat-card">
            <div className="adminorders-stat-icon orange">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <span>Новые заказы</span>
              <h3>{orders.filter((o) => o.status === "Новый").length}</h3>
            </div>
          </div>

          <div className="adminorders-stat-card">
            <div className="adminorders-stat-icon blue">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <span>Подтверждённые</span>
              <h3>{orders.filter((o) => o.status === "Подтверждён").length}</h3>
            </div>
          </div>

          <div className="adminorders-stat-card">
            <div className="adminorders-stat-icon red">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <div>
              <span>Отклонённые</span>
              <h3>{orders.filter((o) => o.status === "Отклонён").length}</h3>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="adminorders-filter-section">
          <div>
            <h3>Список заказов</h3>
            <p>Все заявки на заказ блюд</p>
          </div>

          <div className="adminorders-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Заказы */}
        <div className="adminorders-list">
          {loading ? (
            <div className="adminorders-empty">
              <p>Загрузка заказов...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div className="adminorders-card" key={order.id}>
                <div className="adminorders-card-top">
                  <div className="adminorders-order-number">
                    <div className="adminorders-order-icon">
                      <i className="fa-solid fa-receipt"></i>
                    </div>

                    <div>
                      <h4>Заказ #{order.id}</h4>
                      <span>
                        {order.date || "—"} · {order.time || "—"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`adminorders-status ${
                      order.status === "Новый"
                        ? "new"
                        : order.status === "Подтверждён"
                          ? "confirmed"
                          : "rejected"
                    }`}
                  >
                    {order.status || "Новый"}
                  </span>
                </div>

                <div className="adminorders-customer">
                  <div>
                    <i className="fa-solid fa-user"></i>
                    <span>{order.customer}</span>
                  </div>

                  <div>
                    <i className="fa-solid fa-hotel"></i>
                    <span>{order.hotelname || "Отель"}</span>
                  </div>

                  <div>
                    <i className="fa-solid fa-door-open"></i>
                    <span>Комната {order.room || "—"}</span>
                  </div>
                </div>

                <div className="adminorders-foods">
                  <h5>Заказанные блюда</h5>

                  {order.foods.map((food, index) => (
                    <div className="adminorders-food-row" key={index}>
                      <div>
                        <strong>{food.name}</strong>
                        <span>
                          {food.price} сом × {food.quantity}
                        </span>
                      </div>

                      <strong>
                        {(
                          Number(food.price) * Number(food.quantity)
                        ).toLocaleString("ru-RU")}{" "}
                        сом
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="adminorders-card-bottom">
                  <div className="adminorders-total">
                    <span>Итого к оплате</span>
                    <strong>{order.total.toLocaleString("ru-RU")} сом</strong>
                  </div>

                  {order.status === "Новый" && (
                    <div className="adminorders-actions">
                      <button
                        className="adminorders-reject"
                        onClick={() => changeStatus(order.id, "Отклонён")}
                      >
                        Отклонить
                      </button>

                      <button
                        className="adminorders-confirm"
                        onClick={() => changeStatus(order.id, "Подтверждён")}
                      >
                        <i className="fa-solid fa-check"></i>
                        Подтвердить
                      </button>
                    </div>
                  )}

                  {order.status === "Подтверждён" && (
                    <div className="adminorders-sent">
                      <i className="fa-solid fa-check-circle"></i>
                      Заказ подтверждён
                    </div>
                  )}

                  {order.status === "Отклонён" && (
                    <div className="adminorders-rejected-text">
                      <i className="fa-solid fa-circle-xmark"></i>
                      Заказ отклонён
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="adminorders-empty">
              <i className="fa-solid fa-clipboard-list"></i>
              <h3>Заказов нет</h3>
              <p>В этой категории пока нет заказов</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Adminorders;
