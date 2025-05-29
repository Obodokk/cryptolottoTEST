/**
 * Логика работы с билетами (покупка, отображение)
 */

// Цена одного билета в USDT
const TICKET_PRICE = 10;
// Максимальное количество билетов, которое можно купить
const MAX_TICKETS = 500;

// Текущее количество выбранных билетов
let selectedTickets = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация кнопок выбора билетов
    initTicketButtons();

    // Инициализация поля для ввода своего количества
    initCustomAmountInput();

    // Инициализация кнопки покупки билетов
    initBuyButton();

    // Загрузка купленных билетов пользователя
    loadUserTickets();
});

/**
 * Инициализация кнопок выбора билетов
 */
function initTicketButtons() {
    const ticketOptions = document.querySelectorAll('.ticket-option');

    ticketOptions.forEach(option => {
        option.addEventListener('click', function() {
            const amount = parseInt(this.getAttribute('data-amount'));
            selectTickets(amount);

            // Подсветка выбранной опции
            ticketOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

/**
 * Инициализация поля для ввода своего количества билетов
 */
function initCustomAmountInput() {
    const customInput = document.getElementById('customTicketAmount');
    const setButton = document.getElementById('setCustomAmount');

    if (customInput && setButton) {
        setButton.addEventListener('click', function() {
            const amount = parseInt(customInput.value) || 0;
            selectTickets(amount);
        });

        customInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const amount = parseInt(this.value) || 0;
                selectTickets(amount);
            }
        });
    }
}

/**
 * Выбор количества билетов
 * @param {number} amount - Количество билетов
 */
function selectTickets(amount) {
    // Проверяем максимальное количество
    if (amount > MAX_TICKETS) {
        showNotification(`Максимальное количество билетов: ${MAX_TICKETS}`, 'error');
        amount = MAX_TICKETS;
        document.getElementById('customTicketAmount').value = MAX_TICKETS;
    }

    selectedTickets = amount;
    updateTotalCost();
    updateChancePercentage();
}

/**
 * Обновление отображения общей стоимости
 */
function updateTotalCost() {
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        const total = selectedTickets * TICKET_PRICE;
        totalElement.textContent = total + ' USDT';
    }
}

/**
 * Обновление отображения шанса на победу
 */
function updateChancePercentage() {
    // В реальной реализации здесь будет запрос к контракту для получения общего количества билетов
    const totalTickets = 1000; // Заглушка для демонстрации

    const chancePercentage = document.getElementById('chancePercentage');
    const chancePercentText = document.getElementById('chancePercentText');

    if (selectedTickets === 0) {
        if (chancePercentage) chancePercentage.style.width = '0%';
        if (chancePercentText) chancePercentText.textContent = '0%';
        return;
    }

    const chance = (selectedTickets / totalTickets) * 100;
    const displayChance = Math.min(chance, 100); // Не более 100%

    if (chancePercentage) chancePercentage.style.width = `${displayChance}%`;
    if (chancePercentText) chancePercentText.textContent = `${displayChance.toFixed(2)}%`;
}

/**
 * Инициализация кнопки покупки билетов
 */
function initBuyButton() {
    const buyButton = document.getElementById('buyTicketsBtn');

    if (buyButton) {
        buyButton.addEventListener('click', async function() {
            // Проверяем подключение кошелька
            const address = getCurrentAddress();
            if (!address) {
                showNotification('Пожалуйста, подключите кошелек', 'error');
                return;
            }

            // Проверяем правильную сеть
            const isCorrectNetwork = await checkNetwork();
            if (!isCorrectNetwork) return;

            // Проверяем количество билетов
            if (selectedTickets <= 0) {
                showNotification('Пожалуйста, выберите количество билетов', 'error');
                return;
            }

            // Покупка билетов
            buyTickets(address, selectedTickets);
        });
    }
}

/**
 * Покупка билетов
 * @param {string} address - Адрес кошелька
 * @param {number} amount - Количество билетов
 */
async function buyTickets(address, amount) {
    try {
        // В реальной реализации здесь будет вызов метода контракта
        console.log(`Покупка ${amount} билетов для адреса ${address}`);

        // Показываем индикатор загрузки
        const buyButton = document.getElementById('buyTicketsBtn');
        if (buyButton) {
            buyButton.disabled = true;
            buyButton.innerHTML = '<span class="loading-spinner"></span> Обработка...';
        }

        // Имитация запроса к блокчейну
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Успешная покупка
        showNotification(`Успешно куплено ${amount} билетов!`, 'success');

        // Обновляем список билетов пользователя
        addUserTickets(address, amount);

    } catch (error) {
        console.error('Ошибка покупки билетов:', error);
        showNotification(`Ошибка: ${error.message}`, 'error');
    } finally {
        // Восстанавливаем кнопку
        const buyButton = document.getElementById('buyTicketsBtn');
        if (buyButton) {
            buyButton.disabled = false;
            buyButton.textContent = 'Купить билеты';
        }
    }
}

/**
 * Добавление билетов пользователя
 * @param {string} address - Адрес кошелька
 * @param {number} amount - Количество билетов
 */
function addUserTickets(address, amount) {
    // В реальной реализации здесь будет запись в контракт
    // Для демонстрации сохраняем в localStorage
    const tickets = JSON.parse(localStorage.getItem('userTickets') || '{}');
    tickets[address] = (tickets[address] || 0) + amount;
    localStorage.setItem('userTickets', JSON.stringify(tickets));

    // Обновляем отображение
    loadUserTickets();
}

/**
 * Загрузка билетов пользователя
 */
function loadUserTickets() {
    const address = getCurrentAddress();
    if (!address) return;

    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;

    // В реальной реализации здесь будет запрос к контракту
    const tickets = JSON.parse(localStorage.getItem('userTickets') || '{}');
    const userTickets = tickets[address] || 0;

    if (userTickets > 0) {
        ticketsList.innerHTML = `
            <div class="user-tickets-info">
                <h3>У вас ${userTickets} билетов в этом раунде</h3>
                <p>Ваши шансы на победу: ${((userTickets / 1000) * 100).toFixed(2)}%</p>
                <p>Номер вашего билета: #${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
            </div>
        `;
    } else {
        ticketsList.innerHTML = '<p class="no-tickets">У вас пока нет билетов в этом раунде</p>';
    }
}