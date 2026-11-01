import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FOOD_URL = "https://6ae6edba56b2ee1e543ff943.mockapi.io/food";
const USERS_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";

function Adminfood() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Основные блюда");
  const [avatar, setAvatar] = useState("");

  // Проверка пользователя
  useEffect(() => {
    async function checkAdmin() {
      try {
        const id = localStorage.getItem("id");

        if (!id) {
          navigate("/signin");
          return;
        }

        const userId = String(id).replaceAll('"', "");

        const response = await axios.get(`${USERS_URL}/${userId}`);

        if (
          response.data.userstatus !== "admin" &&
          response.data.userstatus !== "padmin"
        ) {
          navigate("/signin");
          return;
        }

        getFoods();
      } catch (error) {
        console.log("Ошибка проверки пользователя:", error);
        navigate("/signin");
      }
    }

    checkAdmin();
  }, [navigate]);

  // Получение блюд из MockAPI
  async function getFoods() {
    try {
      const response = await axios.get(FOOD_URL);
      setFoods(response.data);
    } catch (error) {
      console.log("Ошибка загрузки блюд:", error);
      alert("Не удалось загрузить блюда");
    } finally {
      setLoading(false);
    }
  }

  // Открыть добавление
  function openAddModal() {
    setEditId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Основные блюда");
    setAvatar("");
    setShowModal(true);
  }

  // Открыть редактирование
  function openEditModal(food) {
    setEditId(food.id);
    setName(food.name);
    setDescription(food.description || "");
    setPrice(food.price);
    setCategory(food.category);
    setAvatar(food.avatar || "");
    setShowModal(true);
  }

  // Добавление и редактирование
  async function saveFood(event) {
    event.preventDefault();

    if (!name.trim() || !price || !avatar.trim()) {
      alert("Заполните название, цену и добавьте URL фотографии");
      return;
    }

    const newFood = {
      name: name.trim(),
      description: description.trim(),
      price: price,
      category: category,
      avatar: avatar.trim(),
    };

    try {
      if (editId) {
        await axios.put(`${FOOD_URL}/${editId}`, newFood);
      } else {
        await axios.post(FOOD_URL, newFood);
      }

      await getFoods();
      setShowModal(false);
    } catch (error) {
      console.log("Ошибка сохранения блюда:", error);
      alert("Не удалось сохранить блюдо");
    }
  }

  // Удаление блюда
  async function deleteFood(id) {
    if (window.confirm("Вы действительно хотите удалить это блюдо?")) {
      try {
        await axios.delete(`${FOOD_URL}/${id}`);
        await getFoods();
      } catch (error) {
        console.log("Ошибка удаления:", error);
        alert("Не удалось удалить блюдо");
      }
    }
  }

  return (
    <div className="adminfood-page">
      {/* Боковое меню */}
      <aside className="adminfood-sidebar">
        <div className="adminfood-logo">
          <i className="fa-solid fa-hotel"></i>
          <span>FirstHotel</span>
        </div>

        <div className="adminfood-profile">
          <div className="adminfood-avatar">
            <i className="fa-solid fa-user"></i>
          </div>

          <div>
            <strong>Администратор</strong>
            <span>Панель управления</span>
          </div>
        </div>

        <nav className="adminfood-menu">
          <a href="/admin" className="adminfood-menu-item">
            <i className="fa-solid fa-house"></i>
            <span>Главная</span>
          </a>

          <a href="/adminfood" className="adminfood-menu-item active">
            <i className="fa-solid fa-utensils"></i>
            <span>Блюда</span>
          </a>

          <a href="/adminorders" className="adminfood-menu-item">
            <i className="fa-solid fa-clipboard-list"></i>
            <span>Заказы еды</span>
          </a>
        </nav>

        <div className="adminfood-sidebar-bottom">
          <a href="/adminsignin" className="adminfood-menu-item">
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Выйти</span>
          </a>
        </div>
      </aside>

      {/* Основная часть */}
      <main className="adminfood-main">
        <div className="adminfood-header">
          <div>
            <h2>Управление блюдами</h2>
            <p>Добавляйте и редактируйте блюда ресторана</p>
          </div>

          <button className="adminfood-add-button" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Добавить блюдо
          </button>
        </div>

        {/* Статистика */}
        <div className="adminfood-stats">
          <div className="adminfood-stat-card">
            <div className="adminfood-stat-icon green">
              <i className="fa-solid fa-utensils"></i>
            </div>
            <div>
              <span>Всего блюд</span>
              <h3>{foods.length}</h3>
            </div>
          </div>

          <div className="adminfood-stat-card">
            <div className="adminfood-stat-icon orange">
              <i className="fa-solid fa-bowl-food"></i>
            </div>
            <div>
              <span>Категории</span>
              <h3>{new Set(foods.map((food) => food.category)).size}</h3>
            </div>
          </div>

          <div className="adminfood-stat-card">
            <div className="adminfood-stat-icon blue">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
            <div>
              <span>Средняя цена</span>
              <h3>
                {foods.length
                  ? Math.round(
                      foods.reduce((sum, food) => sum + Number(food.price), 0) /
                        foods.length,
                    ).toLocaleString("ru-RU") + " сом"
                  : "0 сом"}
              </h3>
            </div>
          </div>
        </div>

        {/* Заголовок списка */}
        <div className="adminfood-list-header">
          <div>
            <h3>Все блюда</h3>
            <p>Список блюд вашего ресторана</p>
          </div>

          <span>{foods.length} блюд</span>
        </div>

        {/* Карточки блюд */}
        {loading ? (
          <div className="adminfood-empty">
            <p>Загрузка блюд...</p>
          </div>
        ) : foods.length > 0 ? (
          <div className="adminfood-grid">
            {foods.map((food) => (
              <div className="adminfood-card" key={food.id}>
                <div className="adminfood-card-image">
                  <img src={food.avatar} alt={food.name} />

                  <span className="adminfood-category">{food.category}</span>
                </div>

                <div className="adminfood-card-content">
                  <h4>{food.name}</h4>

                  <p>{food.description || "Описание не добавлено"}</p>

                  <div className="adminfood-card-bottom">
                    <strong>
                      {Number(food.price).toLocaleString("ru-RU")} сом
                    </strong>

                    <div className="adminfood-card-actions">
                      <button
                        className="adminfood-edit"
                        onClick={() => openEditModal(food)}
                        title="Редактировать"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>

                      <button
                        className="adminfood-delete"
                        onClick={() => deleteFood(food.id)}
                        title="Удалить"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="adminfood-empty">
            <i className="fa-solid fa-utensils"></i>
            <h3>Пока нет блюд</h3>
            <p>Добавьте первое блюдо в меню ресторана</p>
            <button onClick={openAddModal}>Добавить блюдо</button>
          </div>
        )}
      </main>

      {/* Окно добавления / редактирования */}
      {showModal && (
        <div
          className="adminfood-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="adminfood-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="adminfood-modal-header">
              <div>
                <h3>{editId ? "Редактировать блюдо" : "Добавить блюдо"}</h3>
                <p>Заполните информацию о блюде</p>
              </div>

              <button
                className="adminfood-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={saveFood}>
              <label className="adminfood-label">URL фотографии блюда</label>

              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
              />

              {avatar && (
                <div className="adminfood-upload">
                  <img src={avatar} alt="Предпросмотр блюда" />
                </div>
              )}

              <label className="adminfood-label">Название блюда</label>

              <input
                type="text"
                placeholder="Например: Паста Карбонара"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <label className="adminfood-label">Описание</label>

              <textarea
                placeholder="Краткое описание блюда..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows="3"
              ></textarea>

              <label className="adminfood-label">Категория</label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Основные блюда</option>
                <option>Салаты</option>
                <option>Супы</option>
                <option>Десерты</option>
                <option>Напитки</option>
                <option>Завтраки</option>
              </select>

              <label className="adminfood-label">Цена (сом)</label>

              <input
                type="number"
                min="1"
                placeholder="Например: 450"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />

              <div className="adminfood-modal-actions">
                <button
                  type="button"
                  className="adminfood-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>

                <button type="submit" className="adminfood-save">
                  {editId ? "Сохранить изменения" : "Добавить блюдо"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adminfood;
