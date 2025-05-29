// lottery.js - Финальная оптимизированная версия
document.addEventListener('DOMContentLoaded', function() {
  // Конфигурация
  const CONFIG = {
    TICKET_PRICE: 10,
    MAX_TICKETS: 100,
    BASE_WIN_CHANCE: 0.8, // 0.8% за билет
    MAX_WIN_CHANCE: 95,
    SIMULATE_ERROR_CHANCE: 0.1 // 10% шанс ошибки (только для теста)
  };

  // Кэшируем DOM-элементы
  const DOM = {
    ticketOptions: document.querySelectorAll('.ticket-option'),
    customTicketInput: document.getElementById('customTicketCount'),
    setCustomTicketsBtn: document.getElementById('setCustomTickets'),
    totalAmount: document.getElementById('totalAmount'),
    buyTicketsBtn: document.getElementById('buyTicketsBtn'),
    chanceBar: document.getElementById('chanceBar'),
    chanceText: document.getElementById('chanceText'),
    userTicketCount: document.getElementById('userTicketCount')
  };

  // Состояние приложения
  const state = {
    selectedTickets: 0,
    lastNotificationTime: 0,
    isProcessing: false
  };

  // Инициализация
  init();

  function init() {
    loadUserTickets();
    setupEventListeners();
    initNotificationStyles();
  }

  function loadUserTickets() {
    const savedTickets = parseInt(localStorage.getItem('mockTickets')) || 0;
    DOM.userTicketCount.textContent = savedTickets;
  }

  function setupEventListeners() {
    // Делегирование событий для билетов
    document.querySelector('.ticket-options').addEventListener('click', (e) => {
      const option = e.target.closest('.ticket-option');
      if (option) handleTicketOptionClick(option);
    });

    DOM.setCustomTicketsBtn.addEventListener('click', handleCustomTickets);
    DOM.customTicketInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleCustomTickets();
    });

    DOM.buyTicketsBtn.addEventListener('click', () => {
      if (!state.isProcessing) handleTicketPurchase();
    });
  }

  function handleTicketOptionClick(option) {
    state.selectedTickets = parseInt(option.dataset.count);
    updateUI();

    DOM.ticketOptions.forEach(btn => btn.classList.remove('active'));
    option.classList.add('active');
    DOM.customTicketInput.value = '';
  }

  function handleCustomTickets() {
    const customCount = parseInt(DOM.customTicketInput.value);

    if (!customCount || customCount < 1) {
      showNotification('Введите число больше 0', 'warning');
      return;
    }

    if (customCount > CONFIG.MAX_TICKETS) {
      showNotification(`Максимум ${CONFIG.MAX_TICKETS} билетов`, 'warning');
      return;
    }

    state.selectedTickets = customCount;
    updateUI();
    DOM.ticketOptions.forEach(btn => btn.classList.remove('active'));
  }

  async function handleTicketPurchase() {
    if (state.selectedTickets === 0) {
      showNotification('Выберите количество билетов', 'warning');
      return;
    }

    state.isProcessing = true;
    setLoadingState(true);

    try {
      await simulatePurchase();
      updateUserTickets();
      showNotification(`Успешно куплено ${state.selectedTickets} билетов`, 'success');
      createConfetti();
      resetSelection();
    } catch (error) {
      console.error('Purchase error:', error);
      showNotification(error.message || 'Ошибка при покупке', 'error');
    } finally {
      state.isProcessing = false;
      setLoadingState(false);
    }
  }

  function simulatePurchase() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (CONFIG.SIMULATE_ERROR_CHANCE > 0 && Math.random() < CONFIG.SIMULATE_ERROR_CHANCE) {
          reject(new Error('Ошибка сети (тестовый режим)'));
        } else {
          resolve();
        }
      }, 2000);
    });
  }

  function updateUserTickets() {
    const currentTickets = parseInt(DOM.userTicketCount.textContent) || 0;
    const newTickets = currentTickets + state.selectedTickets;
    DOM.userTicketCount.textContent = newTickets;
    localStorage.setItem('mockTickets', newTickets.toString());
  }

  function resetSelection() {
    state.selectedTickets = 0;
    DOM.customTicketInput.value = '';
    DOM.ticketOptions.forEach(btn => btn.classList.remove('active'));
    updateUI();
  }

  function updateUI() {
    const totalCost = state.selectedTickets * CONFIG.TICKET_PRICE;
    DOM.totalAmount.textContent = `${totalCost} USDT`;

    const chance = Math.min(
      state.selectedTickets * CONFIG.BASE_WIN_CHANCE,
      CONFIG.MAX_WIN_CHANCE
    );
    DOM.chanceBar.style.width = `${chance}%`;
    DOM.chanceText.textContent = `${chance.toFixed(1)}%`;
  }

  function setLoadingState(isLoading) {
    DOM.buyTicketsBtn.disabled = isLoading;
    DOM.buyTicketsBtn.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Покупка...'
      : 'Купить билеты';
  }

  function showNotification(message, type = 'info') {
    const now = Date.now();
    if (now - state.lastNotificationTime < 100) return;
    state.lastNotificationTime = now;

    // Удаляем предыдущие уведомления
    document.querySelectorAll('.notification').forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type} slide-up`;
    notification.innerHTML = `
      <i class="fas ${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  function getNotificationIcon(type) {
    const icons = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle'
    };
    return icons[type] || 'fa-info-circle';
  }

  function initNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--radius);
        color: white;
        background: var(--primary);
        box-shadow: var(--shadow);
        z-index: 1000;
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
      }
      .notification.show {
        transform: translateY(0);
        opacity: 1;
      }
      .notification i { font-size: 1.2em; }
      .notification.info { background: var(--primary); }
      .notification.success { background: var(--success); }
      .notification.warning { background: var(--warning); color: #000; }
      .notification.error { background: var(--danger); }
    `;
    document.head.appendChild(style);
  }

  function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1000';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.borderRadius = '50%';
      confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
      container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 3000);
  }

  // Добавляем анимацию конфетти в DOM
  if (!document.getElementById('confetti-animation')) {
    const style = document.createElement('style');
    style.id = 'confetti-animation';
    style.textContent = `
      @keyframes fall {
        to { transform: translateY(100vh) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
});