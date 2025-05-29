/**
 * Файл для работы с кошельками (подключение, отключение, взаимодействие)
 */

// Поддерживаемые провайдеры
const walletProviders = {
    metamask: {
        name: 'MetaMask',
        icon: 'icons/metamask.svg',
        check: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
    },
    walletconnect: {
        name: 'WalletConnect',
        icon: 'icons/walletconnect.svg',
        check: typeof window.WalletConnect !== 'undefined'
    },
    coinbase: {
        name: 'Coinbase Wallet',
        icon: 'icons/coinbase.svg',
        check: typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet
    },
    trust: {
        name: 'Trust Wallet',
        icon: 'icons/trust.svg',
        check: typeof window.ethereum !== 'undefined' && window.ethereum.isTrust
    }
};

// Текущий подключенный провайдер
let currentProvider = null;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация кнопки подключения кошелька
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.addEventListener('click', showWalletModal);
    }

    // Инициализация кнопки отключения кошелька
    const disconnectBtn = document.getElementById('disconnectWalletBtn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
    }
});

/**
 * Показать модальное окно с выбором кошелька
 */
function showWalletModal() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'wallet-modal';
    modal.innerHTML = `
        <div class="wallet-modal-content">
            <h3>Выберите кошелек</h3>
            <div class="wallet-options" id="walletOptions"></div>
            <button class="btn btn-secondary close-modal">Закрыть</button>
        </div>
    `;

    // Добавляем опции кошельков
    const walletOptions = modal.querySelector('#walletOptions');
    for (const [key, provider] of Object.entries(walletProviders)) {
        if (provider.check) {
            const walletOption = document.createElement('div');
            walletOption.className = 'wallet-option';
            walletOption.innerHTML = `
                <img src="${provider.icon}" alt="${provider.name}">
                <span>${provider.name}</span>
            `;
            walletOption.addEventListener('click', () => connectWallet(key));
            walletOptions.appendChild(walletOption);
        }
    }

    // Добавляем кнопку закрытия
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Добавляем модальное окно на страницу
    document.body.appendChild(modal);

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

/**
 * Подключение кошелька
 * @param {string} providerKey - Ключ провайдера (metamask, walletconnect и т.д.)
 */
async function connectWallet(providerKey) {
    try {
        const provider = walletProviders[providerKey];
        if (!provider) throw new Error('Неизвестный провайдер');

        let accounts = [];

        // Подключение MetaMask и подобных
        if (providerKey === 'metamask' || providerKey === 'coinbase' || providerKey === 'trust') {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Проверяем, что кошелек подключен к сети Polygon
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x89') { // 0x89 - ID сети Polygon
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x89' }],
                    });
                } catch (switchError) {
                    // Если сеть не добавлена, предлагаем добавить
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x89',
                                chainName: 'Polygon Mainnet',
                                nativeCurrency: {
                                    name: 'MATIC',
                                    symbol: 'MATIC',
                                    decimals: 18
                                },
                                rpcUrls: ['https://polygon-rpc.com/'],
                                blockExplorerUrls: ['https://polygonscan.com/']
                            }]
                        });
                    }
                }
            }
        }
        // Подключение WalletConnect (упрощенная реализация)
        else if (providerKey === 'walletconnect') {
            // В реальной реализации здесь будет интеграция с WalletConnect
            accounts = ['0x...']; // Заглушка для демонстрации
        }

        if (accounts.length === 0) throw new Error('Не удалось получить аккаунты');

        // Сохраняем текущий провайдер
        currentProvider = providerKey;

        // Обновляем UI
        updateWalletUI(accounts[0]);

        // Сохраняем в localStorage
        localStorage.setItem('connectedWallet', accounts[0]);

        // Закрываем модальное окно
        const modal = document.querySelector('.wallet-modal');
        if (modal) document.body.removeChild(modal);

        showNotification('Кошелек успешно подключен', 'success');

    } catch (error) {
        console.error('Ошибка подключения кошелька:', error);
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

/**
 * Отключение кошелька
 */
function disconnectWallet() {
    // В реальной реализации здесь будет отключение провайдера
    currentProvider = null;
    localStorage.removeItem('connectedWallet');

    // Обновляем UI
    document.getElementById('connectWalletBtn').style.display = 'block';
    document.getElementById('walletInfo').style.display = 'none';

    showNotification('Кошелек отключен', 'info');
}

/**
 * Обновление интерфейса после подключения кошелька
 * @param {string} address - Адрес кошелька
 */
function updateWalletUI(address) {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');

    if (connectBtn && walletInfo && walletAddress) {
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        walletAddress.textContent = shortenAddress(address);
    }
}

/**
 * Получить текущий адрес кошелька
 * @returns {string|null} Адрес кошелька или null если не подключен
 */
function getCurrentAddress() {
    const savedWallet = localStorage.getItem('connectedWallet');
    return savedWallet || null;
}

/**
 * Проверить, подключен ли кошелек к правильной сети (Polygon)
 * @returns {Promise<boolean>} True если подключен к Polygon
 */
async function checkNetwork() {
    if (currentProvider === 'metamask' || currentProvider === 'coinbase' || currentProvider === 'trust') {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            return chainId === '0x89'; // Polygon Mainnet
        } catch (error) {
            console.error('Ошибка проверки сети:', error);
            return false;
        }
    }
    return true; // Для других провайдеров предполагаем, что сеть правильная
}

/**
 * Показать уведомление о необходимости переключиться на Polygon
 */
async function showNetworkAlert() {
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
        showNotification('Пожалуйста, переключитесь на сеть Polygon', 'error');
    }
    return isCorrectNetwork;
}

// Слушаем изменения аккаунта (если MetaMask)
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            // Аккаунт сменился, обновляем UI
            updateWalletUI(accounts[0]);
            localStorage.setItem('connectedWallet', accounts[0]);
        } else {
            // Пользователь отключил все аккаунты
            disconnectWallet();
        }
    });

    // Слушаем изменения сети
    window.ethereum.on('chainChanged', () => {
        showNetworkAlert();
    });
}