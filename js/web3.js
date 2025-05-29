// web3.js - Полная версия с поддержкой перевода

document.addEventListener('DOMContentLoaded', function() {
    const WALLETS = {
        METAMASK: 'metamask',
        TRUST: 'trust',
        COINBASE: 'coinbase',
        WALLETCONNECT: 'walletconnect'
    };

    let mockAccounts = [];
    let currentWallet = null;

    // Показать модальное окно выбора кошелька
    function showWalletModal() {
        const modal = document.createElement('div');
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 data-i18n="select_wallet">Выберите кошелек</h3>
                <p class="test-mode-notice" data-i18n="test_mode">(тестовый режим)</p>
                <button class="wallet-option" data-wallet="${WALLETS.METAMASK}">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask">
                    <span data-i18n="install_metamask">MetaMask</span>
                </button>
                <button class="wallet-option" data-wallet="${WALLETS.TRUST}">
                    <img src="https://trustwallet.com/assets/images/media/assets/TWT.png" alt="Trust Wallet">
                    <span data-i18n="install_trust">Trust Wallet</span>
                </button>
                <button class="wallet-option" data-wallet="${WALLETS.WALLETCONNECT}">
                    <img src="https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo-300x300.webp" alt="WalletConnect">
                    <span>WalletConnect</span>
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        // Применить переводы для модального окна
        applyTranslations(getCurrentLanguage());

        // Закрытие при клике вне окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Обработка выбора кошелька
        modal.querySelectorAll('.wallet-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const walletType = btn.getAttribute('data-wallet');
                connectWallet(walletType);
                modal.remove();
            });
        });
    }

    // Имитация подключения кошелька
    function connectWallet(walletType) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
                mockAccounts = [mockAddress];
                currentWallet = walletType;
                updateWalletUI(mockAddress, walletType);
                showNotification(translate('wallet_connected'), 'success');
                resolve(mockAddress);
            }, 500);
        });
    }

    // Обновление UI кошелька
    function updateWalletUI(address, walletType) {
        const connectBtn = document.getElementById('connectWalletBtn');
        if (!connectBtn) return;

        if (address) {
            connectBtn.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span data-i18n="wallet_connected">Кошелек подключен</span>
                <span class="wallet-address">${address}</span>
                <button class="disconnect-btn" data-i18n="disconnect_wallet">Отключить</button>
            `;
            connectBtn.classList.add('connected');
            connectBtn.dataset.address = address;
            connectBtn.dataset.wallet = walletType;

            // Применить переводы для кнопки
            applyTranslations(getCurrentLanguage());

            // Обработчик отключения кошелька
            connectBtn.querySelector('.disconnect-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                disconnectWallet();
            });
        } else {
            connectBtn.innerHTML = `
                <i class="fas fa-wallet"></i>
                <span data-i18n="connect_wallet">Подключить кошелек</span>
            `;
            connectBtn.classList.remove('connected');
            delete connectBtn.dataset.address;
            delete connectBtn.dataset.wallet;
            applyTranslations(getCurrentLanguage());
        }
    }

    // Отключение кошелька
    function disconnectWallet() {
        mockAccounts = [];
        currentWallet = null;
        updateWalletUI(null);
        showNotification(translate('wallet_disconnected'), 'info');
    }

    // Инициализация
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!mockAccounts.length) {
                showWalletModal();
            }
        });
    }

    // Стили для модального окна
    const style = document.createElement('style');
    style.textContent = `
        .wallet-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        .wallet-modal .modal-content {
            background: var(--card-bg);
            padding: 25px;
            border-radius: var(--radius);
            width: 100%;
            max-width: 350px;
            box-shadow: var(--shadow);
            text-align: center;
        }
        .wallet-modal h3 {
            color: var(--text);
            margin-bottom: 5px;
        }
        .test-mode-notice {
            color: var(--text-light);
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .wallet-option {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: var(--transition);
            color: var(--text);
        }
        .wallet-option:hover {
            background: var(--primary);
            color: white;
            transform: translateY(-2px);
        }
        .wallet-option img {
            width: 24px;
            height: 24px;
            object-fit: contain;
        }
        .wallet-address {
            font-family: monospace;
            font-size: 14px;
            margin: 0 8px;
            color: var(--text-light);
        }
        .disconnect-btn {
            background: rgba(0,0,0,0.1);
            border: none;
            color: var(--text);
            padding: 2px 8px;
            border-radius: 12px;
            cursor: pointer;
            transition: var(--transition);
            font-size: 12px;
        }
        .disconnect-btn:hover {
            background: rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);

    // Добавляем недостающие переводы, если их нет
    if (!translations.en.wallet_disconnected) {
        translations.en.wallet_disconnected = "Wallet disconnected";
        translations.ru.wallet_disconnected = "Кошелек отключен";
    }
    if (!translations.en.test_mode) {
        translations.en.test_mode = "(test mode)";
        translations.ru.test_mode = "(тестовый режим)";
    }
});

// Вспомогательная функция для перевода (если используется отдельно от translations.js)
function translate(key) {
    if (typeof translations !== 'undefined') {
        const lang = localStorage.getItem('language') || 'ru';
        return translations[lang][key] || key;
    }
    return key;
}

// Функция применения переводов (если используется отдельно от translations.js)
function applyTranslations(lang) {
    if (typeof translations === 'undefined') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

// Проверяем обновления джекпота каждую минуту
setInterval(function() {
  const jackpotScript = document.createElement('script');
  jackpotScript.src = 'js/jackpot.js';
  document.head.appendChild(jackpotScript);
}, 60000);

// Получение текущего языка (если используется отдельно от translations.js)
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ru';
}