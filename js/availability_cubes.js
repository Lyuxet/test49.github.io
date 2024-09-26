import { updateButtonsState } from "./buttons.js";

export function checkAvailability(bookingButtons) {
    var date = document.getElementById('date').value;
    var placegame = 'CUBES';
    // Проверяем URL и задаем значение для namegame в зависимости от пути файла
    // Извлекаем название игры
    const gameTitleElement = document.querySelector('.navigation h1');
    const namegame = gameTitleElement ? gameTitleElement.textContent.trim() : '';

    if (!date || !namegame) {
        console.error('Заполните все поля.');
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:8080/getBookingCubes?placegame=${encodeURIComponent(placegame)}&date=${encodeURIComponent(date)}&namegame=${encodeURIComponent(namegame)}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const availability = JSON.parse(xhr.responseText);

                updateButtonsState(availability, bookingButtons);
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
