import { updateButtonsState } from "./buttons.js";
import { hidePriceDisplay } from "./priceDisplay.js";

document.addEventListener('DOMContentLoaded', function () {

    const addButton = document.getElementById('add');
    if (!addButton) {
        console.error('Кнопка "Добавить" не найдена');
        return;
    }

    addButton.addEventListener('click', function (event) {
        event.preventDefault(); // Предотвращаем стандартное поведение кнопки
    
        const selectedButtons = document.querySelectorAll('.booking-button.selected');
        const firstname = document.getElementById('firstName').value;
        const lastname = document.getElementById('lastName').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const date = document.getElementById('date').value;
        const comment = document.getElementById('comment').value;
        if (!firstname || !phone || !email) {
            event.preventDefault(); // предотвращает отправку формы
            alert("Пожалуйста, заполните все обязательные поля.");
            return;
        }
    
        if (selectedButtons.length === 0) {
            alert('Пожалуйста, выберите хотя бы одно время бронирования.');
            return;
        }
    
        // Извлекаем название игры
        const gameTitleElement = document.querySelector('.navigation h1');
        const namegame = gameTitleElement ? gameTitleElement.textContent.trim() : '';
    
        // Определяем тип игры по наличию контейнера
        const isOpenType = document.querySelector('.booking-container-open') !== null;
    
        let selectedTimes = [];
        let selectedPlayersCount = [];
        let selectedPrice = [];
    
        if (isOpenType) {
            // Для типа OPEN
            selectedButtons.forEach(function (button) {
                const time = button.querySelector('.time').textContent;
                selectedTimes.push(time);
    
                const priceButton = parseInt(button.querySelector('.price').textContent, 10);
                const playersCount = parseInt(button.querySelector('.player-input').value, 10);
                selectedPlayersCount.push(playersCount);
                const price = priceButton * playersCount;
                selectedPrice.push(price);
            });
        } else {
            // Для типа CLOSE количество игроков всегда 10
            selectedButtons.forEach(function (button) {
                const time = button.querySelector('.time').textContent;
                const priceButton = parseInt(button.querySelector('.price').textContent, 10);
                selectedTimes.push(time);
    
                selectedPlayersCount.push(10); // Количество игроков всегда 10
                selectedPrice.push(priceButton); // Фиксированная стоимость
            });
        }
    
        // Создаем строку данных для отправки в формате x-www-form-urlencoded
        const postData = `firstname=${encodeURIComponent(firstname)}` +
                         `&lastname=${encodeURIComponent(lastname)}` +
                         `&phone=${encodeURIComponent(phone)}` +
                         `&email=${encodeURIComponent(email)}` +
                         `&placegame=${encodeURIComponent('ARENA')}` +
                         `&typegame=${encodeURIComponent(isOpenType ? 'OPEN' : 'CLOSE')}` +  // Используем тип игры
                         `&namegame=${encodeURIComponent(namegame)}` +
                         `&date=${encodeURIComponent(date)}` +
                         `&times=${encodeURIComponent(selectedTimes.join(','))}` +
                         `&playerCount=${encodeURIComponent(selectedPlayersCount.join(','))}` +
                         `&price=${encodeURIComponent(selectedPrice.join(','))}` +
                         `&comment=${encodeURIComponent(comment)}`;
    
        console.log('Sending data:', postData);
    
        // Создаем запрос через XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://91.218.94.121/addBookingOpenArena', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
        // Обрабатываем ответ от сервера
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                alert('Бронирование успешно отправлено.');
                console.log('Response data:', xhr.responseText);
                // Вызов функции обновления после добавления
                updateBookingContainer();
                
            } else {
                alert(`Ошибка отправки бронирования: ${ xhr.responseText}`);
                updateBookingContainer();
            }
        };
    
        xhr.onerror = function () {
            alert('Ошибка сети.');
            console.error('Network Error');
        };
    
        // Отправляем данные на сервер
        xhr.send(postData);
    });
    
});

// Функция обновления контейнера бронирования
function updateBookingContainer() {
    // Получаем данные о доступных слотах
    const date = document.getElementById('date').value;
    const placegame = 'ARENA';
    const bookingButtons = document.querySelectorAll('.booking-button');


    // Извлекаем название игры
    const gameTitleElement = document.querySelector('.navigation h1');
    const namegame = gameTitleElement ? gameTitleElement.textContent.trim() : '';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://91.218.94.121/getBookingOpenArena?placegame=${encodeURIComponent(placegame)}&date=${encodeURIComponent(date)}&namegame=${encodeURIComponent(namegame)}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const availability = JSON.parse(xhr.responseText);
                if (typeof updateButtonsState === 'function') {
                    updateButtonsState(availability, bookingButtons);
                    hidePriceDisplay(); 
                } else {
                    console.error('Функция updateButtonsState не найдена');
                }
            } catch (error) {
                console.error('Ошибка при обработке ответа:', error);
            }
        } else {
            console.error('Ошибка запроса доступности. Статус:', xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error('Ошибка сети.');
    };

    xhr.send();
}
