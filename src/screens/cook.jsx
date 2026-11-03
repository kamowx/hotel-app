import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FOOD_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/foodorders";
const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Cook() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Выход из аккаунта
  const logout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("id");
    localStorage.removeItem("adminId");
    localStorage.removeItem("accountType");
    localStorage.removeItem("userstatus");
    localStorage.removeItem("currentUser");

    navigate("/staffsignin");
  };

  // Проверка пользователя
  useEffect(() => {
    const checkUser = async () => {
      try {
        const savedId = localStorage.getItem("id");

        if (!savedId) {
          navigate("/staffsignin");
          return;
        }

        const id = String(savedId).replaceAll('"', "");

        const response = await axios.get(USERS_URL);

        const currentUser = response.data.find(
          (item) => String(item.id) === id,
        );

        if (!currentUser) {
          navigate("/staffsignin");
          return;
        }

        const status = String(currentUser.userstatus || currentUser.role || "")
          .trim()
          .toLowerCase();

        if (status !== "chef") {
          if (status === "padmin") {
            navigate("/padmin");
          } else if (status === "cleaning") {
            navigate("/cleaning");
          } else if (status === "admin") {
            navigate("/admin");
          } else {
            navigate("/staffsignin");
          }
          return;
        }
      } catch (error) {
        console.log("Ошибка проверки пользователя:", error);
        navigate("/staffsignin");
      }
    };

    checkUser();
  }, [navigate]);

  // Получаем заказы
  const getOrders = async () => {
    try {
      const response = await axios.get(FOOD_URL);

      // Показываем только подтверждённые заказы
      const confirmedOrders = response.data.filter(
        (item) => item.status === "Подтверждён",
      );

      setOrders(confirmedOrders.reverse());
    } catch (error) {
      console.log("Ошибка получения заказов:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();

    // Проверяем новые заказы каждые 3 секунды
    const interval = setInterval(() => {
      getOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Начать готовить
  const startCooking = async (id) => {
    try {
      await axios.put(`${FOOD_URL}/${id}`, {
        status: "Готовится",
      });

      // Убираем заказ из списка
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
          <div className="cook-menu-item active i1">
            <i className="fa-solid fa-clipboard-list"></i>
            <span>Заказы</span>
          </div>

          <a className="i1" href="/cookpreparing">
            <div className="cook-menu-item">
              <i className="fa-solid fa-fire-burner"></i>
              <span>Готовятся</span>
            </div>
          </a>

          <a className="i1" href="/cookready">
            <div className="cook-menu-item">
              <i className="fa-solid fa-circle-check"></i>
              <span>Готовые блюда</span>
            </div>
          </a>
        </nav>

        <div className="cook-sidebar-bottom">
          <div className="cook-menu-item" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Выйти</span>
          </div>
        </div>
      </aside>

      <main className="cook-main">
        <header className="cook-header">
          <div>
            <h2>Заказы кухни</h2>
            <p>Управление приготовлением блюд</p>
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
            <div className="cook-stat-icon orange">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div>
              <span>Новые заказы</span>
              <strong>{orders.length}</strong>
            </div>
          </div>
        </section>

        <div className="cook-orders-title">
          <h3>Список заказов</h3>
          <span>Сегодня</span>
        </div>

        <section className="cook-orders">
          {loading ? (
            <p>Загрузка заказов...</p>
          ) : orders.length === 0 ? (
            <p>Новых заказов пока нет</p>
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

                  <span className="cook-badge new">Новый заказ</span>
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
                    className="cook-action-button start"
                    onClick={() => startCooking(order.id)}
                  >
                    <i className="fa-solid fa-play"></i>
                    Начать готовить
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

export default Cook;
