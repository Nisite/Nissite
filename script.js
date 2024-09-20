const adminEmail = "ilyaparf2021@gmail.com"; // Укажите email администратора
const adminPassword = "i2l0y1a0"; // Укажите пароль администратора

const events = JSON.parse(localStorage.getItem('events')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let isAdmin = false;
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let deleteEventIndex = null; // Индекс мероприятия для удаления
let editEventIndex = null;   // Индекс мероприятия для редактирования

// Сохраняем мероприятия в локальное хранилище
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Загружаем мероприятия и отображаем их
function loadEvents() {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "<h3>Предстоящие мероприятия:</h3>";
    if (events.length === 0) {
        eventList.innerHTML += `<p>Нет предстоящих мероприятий.</p>`;
    } else {
        events.forEach((event, index) => {
            eventList.innerHTML += `
                <div class="event-item" style="background-image: url('${event.image}'); background-size: cover;">
                    <div class="event-details">
                        <h4>${event.name}</h4>
                        <p>Дата: ${event.date} Время: ${event.time}</p>
                    </div>
                    ${isAdmin ? `<div class="event-actions">
                        <button onclick="openConfirmModal(${index})">Удалить</button>
                        <button onclick="openEditModal(${index})">Редактировать</button>
                    </div>` : ''}
                </div>
            `;
        });
    }
}

// Открываем модальное окно для подтверждения удаления
function openConfirmModal(index) {
    deleteEventIndex = index;
    document.getElementById("confirm-modal").style.display = "block";
}

// Закрываем модальное окно подтверждения удаления
function closeConfirmModal() {
    deleteEventIndex = null;
    document.getElementById("confirm-modal").style.display = "none";
}

// Подтверждение удаления мероприятия
document.getElementById("confirm-delete-button").onclick = function() {
    if (deleteEventIndex !== null) {
        deleteEvent(deleteEventIndex);
        closeConfirmModal();
    }
};

// Открываем модальное окно уведомления
function openNotificationModal(message) {
    document.getElementById("notification-message").textContent = message;
    document.getElementById("notification-modal").style.display = "block";
}

// Закрываем модальное окно уведомления
function closeNotificationModal() {
    document.getElementById("notification-modal").style.display = "none";
}

// Открываем модальное окно для добавления/редактирования мероприятия
function openModal() {
    if (!isAdmin) {
        openNotificationModal("У вас нет прав для добавления мероприятий.");
        return;
    }
    document.getElementById("modal").style.display = "block";
}

// Открываем модальное окно для редактирования мероприятия
function openEditModal(index) {
    editEventIndex = index;
    const event = events[index];
    document.getElementById("event-name").value = event.name;
    document.getElementById("event-date").value = event.date;
    document.getElementById("event-time").value = event.time;
    document.getElementById("event-image").value = ""; // Сброс значения файла
    document.getElementById("modal").style.display = "block";
}

// Закрываем модальное окно и очищаем форму
function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("event-form").reset();
    editEventIndex = null; // Сброс индекса редактируемого мероприятия
}

// Добавление или редактирование мероприятия
function addOrEditEvent(event) {
    event.preventDefault();
    const eventName = document.getElementById("event-name").value.trim();
    const eventDate = document.getElementById("event-date").value;
    const eventTime = document.getElementById("event-time").value;
    const eventImageInput = document.getElementById("event-image");

    if (eventName && eventDate && eventTime) {
        let eventImage = null;

        // Если загружено изображение, читаем его как Data URL
        if (eventImageInput.files && eventImageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                eventImage = e.target.result;
                saveNewEvent(eventName, eventDate, eventTime, eventImage);
            };
            reader.readAsDataURL(eventImageInput.files[0]);
        } else {
            saveNewEvent(eventName, eventDate, eventTime, eventImage);
        }
    }
}

function saveNewEvent(name, date, time, image) {
    if (editEventIndex !== null) {
        // Редактируем существующее мероприятие
        events[editEventIndex] = { name, date, time, image };
    } else {
        // Добавляем новое мероприятие
        events.push({ name, date, time, image });
    }
    saveEvents();
    loadEvents();
    closeModal();
}

// Удаление мероприятия
function deleteEvent(index) {
    events.splice(index, 1); // Удаляем мероприятие по индексу
    saveEvents(); // Сохраняем изменения в локальном хранилище
    loadEvents(); // Загружаем обновлённый список мероприятий
}

// Загрузка информации о текущем пользователе
function loadUser() {
    if (loggedInUser) {
        document.getElementById("user-email").textContent = `Привет, ${loggedInUser.email}!`;
        document.getElementById("user-info").style.display = "block";
        isAdmin = loggedInUser.isAdmin;
        document.getElementById("admin-controls").style.display = isAdmin ? "block" : "none";
        loadEvents(); // Загружаем мероприятия после обновления статуса администратора
    } else {
        document.getElementById("user-info").style.display = "none";
        isAdmin = false;
        document.getElementById("admin-controls").style.display = "none"; // Скрыть админ-контроль для незалогиненных пользователей
        loadEvents(); // Обновляем мероприятия при выходе из аккаунта
    }
}

// Функция для обработки входа и регистрации
document.getElementById("auth-form").onsubmit = function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === adminEmail && password === adminPassword) {
        isAdmin = true;
        loggedInUser = { email, isAdmin };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        loadUser();
        document.getElementById("auth-message").textContent = "Успешный вход как администратор!";
        document.getElementById("auth-form").reset();
        return;
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        if (existingUser.password === password) {
            loggedInUser = existingUser;
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            loadUser();
            openNotificationModal("Успешный вход!");
            document.getElementById("auth-form").reset();
        } else {
            openNotificationModal("Неверный пароль.");
        }
    } else {
        openNotificationModal("Пользователь не найден.");
    }
};

// Функция выхода
function logout() {
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    loadUser(); // Обновляем состояние после выхода
}

// Обработчик для кнопки регистрации
document.getElementById("register-button").onclick = function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (email && password) {
        const existingUser = users.find(user => user.email === email);
        if (!existingUser) {
            users.push({ email, password, isAdmin: false });
            localStorage.setItem('users', JSON.stringify(users));
            openNotificationModal("Регистрация успешна!");
            document.getElementById("auth-form").reset();
        } else {
            openNotificationModal("Пользователь с такой электронной почтой уже зарегистрирован.");
        }
    } else {
        openNotificationModal("Пожалуйста, заполните все поля.");
    }
};

// Инициализация
loadUser(); // Загрузка информации о пользователе при загрузке страницы
loadEvents(); // Загрузка мероприятий
