// main.js - Полная версия со всеми исправлениями
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  initializeMobileMenu();
  initializeActivePage();
  initializeSmoothScroll();
  initializeLanguageSwitcher();
  initializeCountdownRefresh();
  initializeAnimations();
});

// 1. Инициализация темы
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const osTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const currentTheme = savedTheme || osTheme;

  document.documentElement.setAttribute('data-theme', currentTheme);
  if (!savedTheme) localStorage.setItem('theme', currentTheme);

  // Установка времени следующего розыгрыша (если не установлено)
  if (!localStorage.getItem('nextDrawTime')) {
    const nextDraw = new Date();
    nextDraw.setUTCHours(20, 0, 0, 0);
    nextDraw.setUTCDate(nextDraw.getUTCDate() + 3);
    localStorage.setItem('nextDrawTime', nextDraw.getTime());
  }

  // Кнопка переключения темы
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeIcon(currentTheme);
  }

  // Следим за изменением системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateThemeIcon(newTheme);
    }
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// 2. Мобильное меню
function initializeMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('nav ul');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      this.classList.toggle('open');
      navMenu.classList.toggle('show');
    });

    document.querySelectorAll('nav ul li a').forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          mobileMenuBtn.classList.remove('open');
          navMenu.classList.remove('show');
        }
      });
    });
  }
}

// 3. Активная страница в меню
function initializeActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav ul li a').forEach(link => {
    if (currentPage === link.getAttribute('href')) {
      link.classList.add('active');
    }
  });
}

// 4. Плавная прокрутка
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// 5. Переключатель языка
function initializeLanguageSwitcher() {
  const languageSelect = document.getElementById('languageSelect');
  if (!languageSelect) return;

  // Установка текущего языка
  const savedLanguage = localStorage.getItem('language') || 'ru';
  languageSelect.value = savedLanguage;
  applyTranslations(savedLanguage);

  // Обработчик изменения
  languageSelect.addEventListener('change', function() {
    const newLanguage = this.value;
    localStorage.setItem('language', newLanguage);
    applyTranslations(newLanguage);

    // Обновляем таймер
    const event = new Event('languageChanged');
    window.dispatchEvent(event);
  });
}

// 6. Обновление таймера при изменении языка
function initializeCountdownRefresh() {
  window.addEventListener('languageChanged', function() {
    const countdownScript = document.createElement('script');
    countdownScript.src = 'js/countdown.js';
    document.head.appendChild(countdownScript);
  });
}

// 7. Анимации при скролле
function initializeAnimations() {
  function animateOnScroll() {
    const elements = document.querySelectorAll('.step, .feature, .winner-card');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        element.classList.add('animate');
      }
    });
  }

  animateOnScroll();
  window.addEventListener('scroll', animateOnScroll);
}

// Вспомогательные функции
function applyTranslations(lang) {
  if (!window.translations) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang]?.[key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// Уведомления
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}
// Защита от множественных отправок
document.addEventListener('submit', function(e) {
  const form = e.target.closest('form');
  if (form) {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn && submitBtn.disabled) {
      e.preventDefault();
    }
  }
}, true);