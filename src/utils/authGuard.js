import axios from "axios";

export const API_DATA_URL = "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/data";
export const API_HOTELS_URL =
  "https://6adcd03ffa5e73d4ab2dba7b.mockapi.io/hotels";

export const getCurrentUser = async () => {
  const savedId = localStorage.getItem("id");
  if (!savedId) return null;

  const id = String(savedId).replaceAll('"', "");
  try {
    const response = await axios.get(`${API_DATA_URL}/${id}`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error("Auth check error:", error);
  }
  return null;
};

export const enforceRole = async (allowedRoles, navigate) => {
  const user = await getCurrentUser();

  if (!user) {
    navigate("/adminsignin", { replace: true });
    return null;
  }

  if (allowedRoles.includes(user.userstatus)) {
    return user;
  }

  if (user.userstatus === "padmin") {
    navigate("/padmin", { replace: true });
    return null;
  }

  if (user.userstatus === "cleaning") {
    navigate("/cleaning", { replace: true });
    return null;
  }

  if (user.userstatus === "admin") {
    navigate("/admin", { replace: true });
    return null;
  }

  if (user.userstatus === "user") {
    navigate("/home", { replace: true });
    return null;
  }

  localStorage.removeItem("id");
  localStorage.removeItem("adminId");
  localStorage.removeItem("userId");
  navigate("/adminsignin", { replace: true });
  return null;
};

export const staffLogout = (navigate) => {
  localStorage.removeItem("id");
  localStorage.removeItem("adminId");
  localStorage.removeItem("userId");
  navigate("/adminsignin");
};

// ==========================================
// Хранилище заявок отелей/хостелов (padmin)
// ==========================================
const INITIAL_APPLICATIONS = [
  {
    id: "app_1",
    namehotels: "Отель Golden Tulip Bishkek",
    type: "hotel",
    location: "Бишкек",
    price: "4200",
    people: "2",
    avatarhotels:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop",
    discount: "10",
    applicantName: "Руслан Касымов",
    applicantPhone: "+996 555 112233",
    status: "Новая",
    createdAt: "2026-10-25",
    comment:
      "Подаем заявку на подключение 4-звездочного отеля в центре Бишкека.",
  },
  {
    id: "app_2",
    namehotels: "Хостел Apple Hostel Bishkek",
    type: "hostel",
    location: "Бишкек",
    price: "750",
    people: "6",
    avatarhotels:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop",
    discount: "0",
    applicantName: "Чынгыз Асанов",
    applicantPhone: "+996 700 889900",
    status: "Новая",
    createdAt: "2026-10-26",
    comment: "Уютный хостел рядом с Западным автовокзалом.",
  },
  {
    id: "app_3",
    namehotels: "Курортный Отель Raduga Issyk-Kul",
    type: "hotel",
    location: "Иссык-Куль",
    price: "5500",
    people: "3",
    avatarhotels:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop",
    discount: "15",
    applicantName: "Нурбек Садыков",
    applicantPhone: "+996 777 445566",
    status: "Новая",
    createdAt: "2026-10-26",
    comment: "Отель на северном берегу Иссык-Куля с коттеджами и номерами.",
  },
];

export const getStoredApplications = () => {
  try {
    const raw = localStorage.getItem("partner_hotel_applications");
    if (!raw) {
      localStorage.setItem(
        "partner_hotel_applications",
        JSON.stringify(INITIAL_APPLICATIONS),
      );
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading applications:", e);
    return INITIAL_APPLICATIONS;
  }
};

export const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem("partner_hotel_applications", JSON.stringify(apps));
  } catch (e) {
    console.error("Error saving applications:", e);
  }
};

// ==========================================
// Хранилище статусов клининга (cleaning)
// ==========================================
const INITIAL_ROOMS = [
  {
    id: "room_1",
    hotelId: "1",
    hotelName: "Отель Hyatt / Гостиница",
    hotelType: "hotel",
    roomNumber: "101",
    placeType: "Люкс с видом на город",
    status: "Убрано", // "Убрано" | "Не убрано"
    cleanedBy: "Айгуль Темирова (Клининг)",
    cleanedAt: "2026-10-26 11:20",
    comment: "Генеральная уборка проведена, заменено постельное бельё.",
  },
  {
    id: "room_2",
    hotelId: "1",
    hotelName: "Отель Hyatt / Гостиница",
    hotelType: "hotel",
    roomNumber: "102",
    placeType: "Стандарт двухместный",
    status: "Не убрано",
    cleanedBy: "—",
    cleanedAt: "—",
    comment:
      "Гость выехал, требуется смена постельного белья и влажная уборка.",
  },
  {
    id: "room_3",
    hotelId: "1",
    hotelName: "Отель Hyatt / Гостиница",
    hotelType: "hotel",
    roomNumber: "201",
    placeType: "Полулюкс",
    status: "Убрано",
    cleanedBy: "Айгуль Темирова (Клининг)",
    cleanedAt: "2026-10-26 13:45",
    comment:
      "Уборка завершена, полотенца и туалетные принадлежности пополнены.",
  },
  {
    id: "room_4",
    hotelId: "1",
    hotelName: "Отель Hyatt / Гостиница",
    hotelType: "hotel",
    roomNumber: "202",
    placeType: "Стандарт одноместный",
    status: "Не убрано",
    cleanedBy: "—",
    cleanedAt: "—",
    comment: "Запланирована плановая уборка перед заселением.",
  },
  {
    id: "room_5",
    hotelId: "2",
    hotelName: "Городской Хостел",
    hotelType: "hostel",
    roomNumber: "Комната 1 (Место А1)",
    placeType: "Кровать в общем номере (нижний ярус)",
    status: "Убрано",
    cleanedBy: "Айгуль Темирова (Клининг)",
    cleanedAt: "2026-10-26 10:15",
    comment: "Свежее бельё заправлено, шторка и полка протерты.",
  },
  {
    id: "room_6",
    hotelId: "2",
    hotelName: "Городской Хостел",
    hotelType: "hostel",
    roomNumber: "Комната 1 (Место А2)",
    placeType: "Кровать в общем номере (верхний ярус)",
    status: "Не убрано",
    cleanedBy: "—",
    cleanedAt: "—",
    comment: "Требуется смена белья после выезда гостя.",
  },
];

export const getStoredCleaningRooms = () => {
  try {
    const raw = localStorage.getItem("hotel_cleaning_records");
    if (!raw) {
      localStorage.setItem(
        "hotel_cleaning_records",
        JSON.stringify(INITIAL_ROOMS),
      );
      return INITIAL_ROOMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading cleaning records:", e);
    return INITIAL_ROOMS;
  }
};

export const saveStoredCleaningRooms = (rooms) => {
  try {
    localStorage.setItem("hotel_cleaning_records", JSON.stringify(rooms));
  } catch (e) {
    console.error("Error saving cleaning records:", e);
  }
};
