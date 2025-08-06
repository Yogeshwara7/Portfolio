// Global variables
let konamiCode = [];
let konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
let memoryGame = {
    tiles: [],
    flipped: [],
    matched: [],
    score: 0
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupDynamicTagline();
    var projectCount = document.querySelectorAll('.project-card').length;
    var countElem = document.getElementById('projectCount');
    if (countElem) {
        countElem.textContent = projectCount;
    }
});

// Initialize all website functionality
function initializeWebsite() {
    setupNavigation();
    setupProjectFilters();
    setupScrollAnimations();
    setupThemeToggle();
    setupKonamiCode();
    setupContactForm();
    loadCryptoData();
    loadGasData();
    startMemoryGame();
    setupTypingAnimation();
    setupInteractiveTerminal();
}

// Navigation functionality
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Project filters
function setupProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                    card.classList.add('fade-in-up');
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Theme toggle
function setupThemeToggle() {
    const themeBtn = document.getElementById('themeBtn');
    const icon = themeBtn.querySelector('i');
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        icon.className = 'fas fa-sun';
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        } else {
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        }
        
        // Add a subtle animation effect
        themeBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeBtn.style.transform = 'scale(1)';
        }, 150);
    });
}

// Konami Code for Hacker Mode
function setupKonamiCode() {
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            toggleHackerMode();
            konamiCode = [];
        }
    });
}

// Dynamic Tagline Effect
function setupDynamicTagline() {
    const taglines = [
        'Web3 Developer',
        'ML Explorer',
        'IoT Innovator',
        'Full-Stack Engineer',
        'Blockchain Enthusiast'
    ];
    const taglineText = document.getElementById('tagline-text');
    let current = 0;
    function showNextTagline() {
        // Fade out
        taglineText.classList.remove('fade-in');
        taglineText.classList.add('fade-out');
        setTimeout(() => {
            // Change text
            current = (current + 1) % taglines.length;
            taglineText.textContent = taglines[current];
            // Fade in
            taglineText.classList.remove('fade-out');
            taglineText.classList.add('fade-in');
        }, 500);
    }
    // Initial fade-in
    taglineText.classList.add('fade-in');
    setInterval(showNextTagline, 2500);
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function downloadResume() {
    // Try to download actual resume file first
    const resumeFile = 'Yogeshwara-resume.pdf';
    const link = document.createElement('a');
    
    // Check if resume file exists
    fetch(resumeFile, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                // Resume file exists, download it
                link.href = resumeFile;
                link.download = resumeFile;
                link.click();
            } else {
                // Fallback to text version
                createTextResume();
            }
        })
        .catch(() => {
            // Fallback to text version
            createTextResume();
        });
}

function createTextResume() {
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(
        `Yogeshwara B - Resume\n\n` +
        `Computer Science & Engineering\n` +
        `Alvas Institute of Engineering and Technology\n\n` +
        `Skills: Full-Stack Web Development, Blockchain/Web3, IoT, Machine Learning\n\n` +
        `Projects:\n` +
        `- ArbiNet – IoT Crypto Arbitrage System\n` +
        `- Decentralized Crowdfunding DApp\n` +
        `- Bird Species Classifier\n` +
        `- Coffee Management System\n` +
        `- Vegetation Monitoring using AI and Cloud\n` +
        `- LLM NER Testing\n\n` +
        `Contact: yogeshwara567@gmail.com\n` +
        `LinkedIn: https://www.linkedin.com/in/yogeshwara7/\n` +
        `GitHub: https://github.com/Yogeshwara7`
    );
    link.download = 'Yogeshwara_B_Resume.txt';
    link.click();
}

// Wallet connection is now handled in wallet.js
// This function is kept for compatibility but delegates to wallet.js
function connectWallet() {
    // Delegate to the wallet.js implementation
    if (typeof window.connectWalletFromModule === 'function') {
        window.connectWalletFromModule();
    } else {
        console.error('Wallet module not loaded');
        showNotification('Wallet module not available', 'error');
    }
}

function displayWalletInfo(account) {
    console.log('displayWalletInfo called with account:', account);
    
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (!walletInfo || !walletAddress || !connectBtn) {
        console.error('Wallet elements not found:', {
            walletInfo: !!walletInfo,
            walletAddress: !!walletAddress,
            connectBtn: !!connectBtn
        });
        showNotification('Wallet display elements not found', 'error');
        return;
    }
    
    // Create a clickable address that copies to clipboard
    walletAddress.innerHTML = `
        <span class="address-text">${account.slice(0, 6)}...${account.slice(-4)}</span>
        <button class="copy-btn" onclick="copyAddress('${account}')" title="Copy address">
            <i class="fas fa-copy"></i>
        </button>
        <button class="disconnect-btn" onclick="disconnectWallet()" title="Disconnect">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    walletInfo.style.display = 'block';
    connectBtn.style.display = 'none';
    
    console.log('Wallet info displayed successfully');
}

function getWalletBalance(account) {
    if (typeof window.ethereum !== 'undefined' && account) {
        window.ethereum.request({
            method: 'eth_getBalance',
            params: [account, 'latest']
        })
        .then(balance => {
            const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
            const balanceElement = document.getElementById('walletBalance');
            balanceElement.innerHTML = `
                <span class="balance-amount">${ethBalance.toFixed(4)} ETH</span>
                <span class="balance-usd">($${(ethBalance * 2847.32).toFixed(2)} USD)</span>
            `;
        })
        .catch(error => {
            console.error('Error getting balance:', error);
            document.getElementById('walletBalance').textContent = 'Balance unavailable';
        });
    }
}

function getNetworkInfo() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_chainId' })
            .then(chainId => {
                currentNetwork = getNetworkName(chainId);
                updateNetworkDisplay();
            })
            .catch(error => {
                console.error('Error getting network:', error);
                currentNetwork = 'Unknown';
                updateNetworkDisplay();
            });
    }
}

function getNetworkName(chainId) {
    const networks = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x2a': 'Kovan Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Mumbai Testnet',
        '0xa': 'Optimism',
        '0xa4b1': 'Arbitrum One'
    };
    return networks[chainId] || `Chain ID: ${parseInt(chainId, 16)}`;
}

function updateNetworkDisplay() {
    const walletInfo = document.getElementById('walletInfo');
    if (walletInfo && currentNetwork) {
        // Add network info if not already present
        let networkElement = walletInfo.querySelector('.network-info');
        if (!networkElement) {
            networkElement = document.createElement('div');
            networkElement.className = 'network-info';
            walletInfo.appendChild(networkElement);
        }
        networkElement.innerHTML = `<i class="fas fa-network-wired"></i> ${currentNetwork}`;
    }
}

function setupWalletListeners() {
    if (typeof window.ethereum !== 'undefined') {
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                displayWalletInfo(currentAccount);
                getWalletBalance(currentAccount);
                showNotification('Account switched', 'info');
            } else {
                disconnectWallet();
            }
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', (chainId) => {
            currentNetwork = getNetworkName(chainId);
            updateNetworkDisplay();
            showNotification(`Network switched to ${currentNetwork}`, 'info');
        });
    }
}

function disconnectWallet() {
    currentAccount = null;
    currentNetwork = null;
    
    const walletInfo = document.getElementById('walletInfo');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    walletInfo.style.display = 'none';
    connectBtn.style.display = 'block';
    connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
    connectBtn.disabled = false;
    
    showNotification('Wallet disconnected', 'info');
}

function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        showNotification('Address copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Address copied to clipboard!', 'success');
    });
}

function showMetaMaskGuide() {
    const guide = `
        <div class="metamask-guide">
            <h4>Install MetaMask</h4>
            <ol>
                <li>Visit <a href="https://metamask.io" target="_blank">metamask.io</a></li>
                <li>Click "Download" and install the extension</li>
                <li>Create or import a wallet</li>
                <li>Refresh this page and try connecting again</li>
            </ol>
        </div>
    `;
    
    // Show installation guide and offer demo mode
    showNotification('MetaMask not detected. Try demo mode or install MetaMask.', 'info');
    
    // Add demo mode button
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
        connectBtn.onclick = connectDemoWallet;
    }
}

// Demo wallet connection for testing
function connectDemoWallet() {
    console.log('Connecting demo wallet...');
    
    const connectBtn = document.getElementById('connectWalletBtn');
    const originalText = connectBtn.innerHTML;
    connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting Demo...';
    connectBtn.disabled = true;
    
    // Simulate connection delay
    setTimeout(() => {
        // Demo account
        currentAccount = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        currentNetwork = 'Ethereum Mainnet (Demo)';
        
        displayWalletInfo(currentAccount);
        
        // Demo balance
        const balanceElement = document.getElementById('walletBalance');
        if (balanceElement) {
            balanceElement.innerHTML = `
                <span class="balance-amount">2.8473 ETH</span>
                <span class="balance-usd">($8,123.45 USD)</span>
            `;
        }
        
        // Demo network info
        updateNetworkDisplay();
        
        showNotification('Demo wallet connected! (Not a real wallet)', 'success');
        
        // Reset button to show disconnect option
        connectBtn.innerHTML = '<i class="fas fa-times"></i> Disconnect Demo';
        connectBtn.onclick = disconnectWallet;
        connectBtn.disabled = false;
    }, 1500);
}

// Crypto data loading with CORS-friendly approach
async function loadCryptoData() {
    console.log('🔄 Loading crypto data...');
    
    try {
        // Try CORS-friendly proxy or alternative API first
        let response;
        let data;
        
        try {
            // Option 1: Try with a CORS proxy (you can use public ones or set up your own)
            response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,tether&vs_currencies=usd&include_24hr_change=true', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            data = await response.json();
            console.log('✅ Crypto data fetched successfully');
            
        } catch (corsError) {
            console.warn('⚠️ CORS error, falling back to mock data:', corsError.message);
            throw corsError;
        }
        
        // Update prices if API call was successful
        if (data && data.ethereum) {
            document.getElementById('ethPrice').textContent = `$${data.ethereum.usd.toLocaleString()}`;
        }
        if (data && data['matic-network']) {
            document.getElementById('maticPrice').textContent = `$${data['matic-network'].usd.toFixed(4)}`;
        }
        if (data && data.tether) {
            document.getElementById('usdtPrice').textContent = `$${data.tether.usd.toFixed(2)}`;
        }
        
        // Auto-refresh every 60 seconds (reduced frequency to avoid rate limiting)
        setTimeout(loadCryptoData, 60000);
        
    } catch (error) {
        console.error('❌ Error fetching crypto data:', error);
        
        // Removed notification to avoid popup clutter
        // showNotification('Using demo crypto prices (API blocked by CORS)', 'info');
        
        // Fallback to realistic mock data with some variation
        const mockPrices = generateMockCryptoPrices();
        document.getElementById('ethPrice').textContent = `$${mockPrices.eth.toLocaleString()}`;
        document.getElementById('maticPrice').textContent = `$${mockPrices.matic.toFixed(4)}`;
        document.getElementById('usdtPrice').textContent = `$${mockPrices.usdt.toFixed(2)}`;
        
        // Retry with longer interval
        setTimeout(loadCryptoData, 120000);
    }
}

// Generate realistic mock crypto prices with some variation
function generateMockCryptoPrices() {
    const baseTime = Date.now();
    const variation = Math.sin(baseTime / 10000) * 0.02; // Small price variation
    
    return {
        eth: 2847.32 + (2847.32 * variation),
        matic: 0.89 + (0.89 * variation),
        usdt: 1.00 + (Math.random() * 0.002 - 0.001) // Very small USDT variation
    };
}

async function loadGasData() {
    console.log('⛽ Loading gas data...');
    
    try {
        // Note: Etherscan API requires a real API key and has CORS restrictions
        console.warn('⚠️ Etherscan API requires API key and may have CORS issues');
        
        // Skip API call and use mock data for demo
        throw new Error('Using demo gas data for CORS compatibility');
        
    } catch (error) {
        console.error('❌ Error fetching gas data:', error);
        
        // Removed notification to avoid popup clutter
        // showNotification('Using demo gas prices (API requires setup)', 'info');
        
        // Generate realistic mock gas prices
        const mockGas = generateMockGasPrices();
        document.getElementById('slowGas').textContent = `${mockGas.slow} Gwei`;
        document.getElementById('standardGas').textContent = `${mockGas.standard} Gwei`;
        document.getElementById('fastGas').textContent = `${mockGas.fast} Gwei`;
        
        // Retry with longer interval
        setTimeout(loadGasData, 180000); // 3 minutes
    }
}

// Generate realistic mock gas prices
function generateMockGasPrices() {
    const baseTime = Date.now();
    const networkLoad = Math.sin(baseTime / 20000) * 0.3 + 0.7; // Simulate network load
    
    const baseGas = {
        slow: 15,
        standard: 25,
        fast: 35
    };
    
    return {
        slow: Math.round(baseGas.slow * networkLoad),
        standard: Math.round(baseGas.standard * networkLoad),
        fast: Math.round(baseGas.fast * networkLoad)
    };
}

// Removed loadGasDataAlternative - using mock data for better CORS compatibility

// Hash generation
async function generateHash() {
    const input = document.getElementById('hashInput').value;
    console.log('Hash input value:', input);
    if (input.trim() === '') {
        showNotification('Please enter text to hash', 'error');
        return;
    }
    // Use SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hashOutput').textContent = hashHex;
}

// Playground Games

// --- Guess the Hash game ---

// List of possible words
const guessWords = ['hello', 'blockchain', 'web3'];
let targetWord = '';
let targetHash = '';

// Utility: Compute SHA256 hash and return hex string
async function sha256Hex(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pick a random word and compute its hash
async function setupGuessHashGame() {
    // Pick random word
    targetWord = guessWords[Math.floor(Math.random() * guessWords.length)];
    targetHash = await sha256Hex(targetWord);
    // Display the hash in the UI
    let hashElem = document.getElementById('targetHash');
    if (!hashElem) {
        // Create the element if it doesn't exist
        hashElem = document.createElement('div');
        hashElem.id = 'targetHash';
        hashElem.className = 'hash-to-guess';
        // Insert above the input
        const inputBox = document.getElementById('guessHashInput');
        if (inputBox && inputBox.parentNode) {
            inputBox.parentNode.insertBefore(hashElem, inputBox);
        }
    }
    hashElem.textContent = targetHash;
}

// Guess the Hash game logic
async function guessHash() {
    const guess = document.getElementById('guessHashInput').value;
    const result = document.getElementById('guessHashResult');
    if (guess.trim() === '') {
        result.textContent = 'Please enter a guess';
        result.style.color = '';
        return;
    }
    // Hash the user's guess
    const guessHashVal = await sha256Hex(guess.trim());
    if (guessHashVal === targetHash) {
        result.textContent = '🎉 Correct! You guessed it!';
        result.style.color = '#00ff88';
        playSound('success');
    } else {
        result.textContent = `❌ Wrong!`;
        result.style.color = '#ff0080';
        playSound('error');
    }
}

// On page load, set up the game
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGuessHashGame);
} else {
    setupGuessHashGame();
}

// Mine the Block game
function mineBlock() {
    const blockHash = document.getElementById('blockHash');
    const nonceElement = document.getElementById('nonce');
    let nonce = parseInt(nonceElement.textContent.split(': ')[1]);
    
    nonce++;
    nonceElement.textContent = `Nonce: ${nonce}`;
    
    // Simulate mining
    const newHash = generateBlockHash(nonce);
    blockHash.textContent = newHash;
    
    // Check if block is mined (ends with 000)
    if (newHash.endsWith('000')) {
        showNotification('🎉 Block mined successfully!', 'success');
        playSound('success');
        // Reset for next mining
        setTimeout(() => {
            nonceElement.textContent = 'Nonce: 0';
            blockHash.textContent = '0000000000000000000000000000000000000000000000000000000000000000';
        }, 2000);
    }
}

function generateBlockHash(nonce) {
    // Simple hash generation for demo
    const base = 'block' + nonce + Date.now();
    return btoa(base).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
}

// Smart Contract Debug game
function debugContract() {
    const fixedCode = `contract Secure {
    mapping(address => uint) balances;
    bool private locked;
    
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    function withdraw() public nonReentrant {
        uint amount = balances[msg.sender];
        require(amount > 0, "No balance");
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}`;
    
    showNotification('✅ Contract fixed! Added reentrancy guard.', 'success');
    playSound('success');
    
    // Show the fixed code
    setTimeout(() => {
        alert('Fixed Contract Code:\n\n' + fixedCode);
    }, 1000);
}

// Memory Match game
function startMemoryGame() {
    const tokens = ['ETH', 'MATIC', 'USDT', 'DAI', 'LINK', 'UNI', 'AAVE', 'COMP'];
    const gameTokens = [...tokens, ...tokens]; // Duplicate for pairs
    const shuffledTokens = gameTokens.sort(() => Math.random() - 0.5);
    
    memoryGame.tiles = shuffledTokens;
    memoryGame.flipped = [];
    memoryGame.matched = [];
    memoryGame.score = 0;
    
    renderMemoryGame();
}

function renderMemoryGame() {
    const memoryGrid = document.getElementById('memoryGame');
    memoryGrid.innerHTML = '';
    
    memoryGame.tiles.forEach((token, index) => {
        const tile = document.createElement('div');
        tile.className = 'memory-tile';
        tile.textContent = memoryGame.matched.includes(index) || memoryGame.flipped.includes(index) ? token : '?';
        
        if (memoryGame.matched.includes(index)) {
            tile.classList.add('flipped');
        }
        
        tile.addEventListener('click', () => flipTile(index));
        memoryGrid.appendChild(tile);
    });
}

function flipTile(index) {
    if (memoryGame.flipped.length === 2 || memoryGame.matched.includes(index) || memoryGame.flipped.includes(index)) {
        return;
    }
    
    memoryGame.flipped.push(index);
    renderMemoryGame();
    
    if (memoryGame.flipped.length === 2) {
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [index1, index2] = memoryGame.flipped;
    const token1 = memoryGame.tiles[index1];
    const token2 = memoryGame.tiles[index2];
    
    if (token1 === token2) {
        memoryGame.matched.push(index1, index2);
        memoryGame.score += 10;
        showNotification(`🎉 Match found! Score: ${memoryGame.score}`, 'success');
        playSound('success');
        
        if (memoryGame.matched.length === memoryGame.tiles.length) {
            showNotification('🎊 Game Complete! All tokens matched!', 'success');
            playSound('success');
        }
    } else {
        showNotification('❌ No match! Try again.', 'error');
        playSound('error');
    }
    
    memoryGame.flipped = [];
    renderMemoryGame();
}

// Easter Eggs and Special Features

function toggleHackerMode() {
    const hackerMode = document.getElementById('hackerMode');
    hackerMode.style.display = hackerMode.style.display === 'none' ? 'flex' : 'none';
    
    if (hackerMode.style.display === 'flex') {
        showNotification('🔥 HACKER MODE ACTIVATED!', 'success');
        playSound('success');
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            hackerMode.style.display = 'none';
        }, 5000);
    }
}

function showTechStack() {
    const techStack = `
🛠️ Tech Stack:

Frontend:
├── HTML5
├── CSS3 (Custom Properties, Grid, Flexbox)
├── JavaScript (ES6+, Async/Await)
└── React.js

Backend:
├── Node.js
├── JSP (JavaServer Pages)
└── JDBC (Java Database Connectivity)

Blockchain:
├── Solidity (Smart Contracts)
├── Web3.js
├── Uniswap Protocol
└── IPFS (InterPlanetary File System)

IoT:
├── Arduino UNO
├── LCD Display
└── Various Sensors

Machine Learning:
├── Python
├── CNN (Convolutional Neural Networks)
└── Scikit-learn

Tools & Platforms:
├── GitHub
├── Google Cloud Platform
├── XAMPP
├── VS Code
└── Maven

Font: JetBrains Mono
Theme: Dark Futuristic
Animations: CSS3 + JavaScript
    `;
    
    alert(techStack);
}

// Sound effects
function playSound(type) {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
    } else if (type === 'error') {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff0080' : '#0080ff'};
        color: #000;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 10000;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Typing animation for terminal
function setupTypingAnimation() {
    const terminalLines = document.querySelectorAll('.terminal-line');
    
    terminalLines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateX(0)';
        }, index * 1000);
    });
}

// Contact form handling
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        if (name && email && message) {
            showNotification('📧 Message sent successfully! (Demo)', 'success');
            contactForm.reset();
        } else {
            showNotification('❌ Please fill all fields', 'error');
        }
    });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .terminal-line {
        opacity: 0;
        transform: translateX(-20px);
        transition: all 0.5s ease;
    }
`;
document.head.appendChild(style);

// Initialize memory game on page load
document.addEventListener('DOMContentLoaded', () => {
    startMemoryGame();
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.downloadResume = downloadResume;
// Wallet functions are now in wallet.js

// Wallet debug functions moved to wallet.js
window.guessHash = guessHash;
window.mineBlock = mineBlock;
window.debugContract = debugContract;
window.startMemoryGame = startMemoryGame;
window.toggleHackerMode = toggleHackerMode;
window.showTechStack = showTechStack;
window.generateHash = generateHash;

// Interactive Terminal Functions
function setupInteractiveTerminal() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');
    
    console.log('Setting up interactive terminal...');
    console.log('Terminal input found:', terminalInput);
    console.log('Terminal body found:', terminalBody);
    
    if (!terminalInput || !terminalBody) {
        console.error('Terminal elements not found!');
        return;
    }
    
    // Debug terminal body dimensions
    console.log('Terminal body dimensions:');
    console.log('- Client height:', terminalBody.clientHeight);
    console.log('- Offset height:', terminalBody.offsetHeight);
    console.log('- Scroll height:', terminalBody.scrollHeight);
    console.log('- Computed style height:', window.getComputedStyle(terminalBody).height);
    console.log('- Computed style overflow:', window.getComputedStyle(terminalBody).overflow);
    console.log('- Computed style display:', window.getComputedStyle(terminalBody).display);
    console.log('- Computed style visibility:', window.getComputedStyle(terminalBody).visibility);
    
    // Ensure terminal body is properly configured
    terminalBody.style.overflowY = 'auto';
    terminalBody.style.maxHeight = '500px';
    terminalBody.style.minHeight = '300px';
    terminalBody.style.padding = '10px';
    terminalBody.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    console.log('Terminal body configured with forced styles');
    
    // Command history
    let commandHistory = [];
    let historyIndex = -1;
    
    // Available commands
    const commands = {
        'help': () => {
            return `Available commands:
• help - Show this help message
• whoami - Display user information
• skills - Show technical skills
• projects - List projects
• about - About me
• contact - Contact information
• clear - Clear terminal
• date - Current date/time
• crypto - Live crypto prices
• gas - Ethereum gas tracker
• hash <text> - Generate hash
• matrix - Enable matrix mode
• hack - Enter hacker mode
• ls - List files and directories
• cd <dir> - Change directory
• pwd - Print working directory
• mkdir <dir> - Create directory
• rm <file> - Remove file
• cat <file> - Read file content
• echo <text> - Echo text
• ping - Test connection
• calc <expression> - Calculator
• history - Show command history`;
        },
        'whoami': () => {
            return `Yogeshwara B
Computer Science & Engineering Student
Alvas Institute of Engineering and Technology
Specializing in Full-Stack Web Development, Blockchain/Web3, IoT, and Machine Learning`;
        },
        'skills': () => {
            return `Technical Skills:
Frontend: HTML, CSS, JavaScript, React
Backend: Node.js, JSP, JDBC
Blockchain: Solidity, Uniswap, Web3.js, IPFS
IoT: Arduino UNO, LCD, Sensors
Machine Learning: Python, CNN, Scikit-learn
Tools: GitHub, GCP, XAMPP, VS Code, Maven`;
        },
        'projects': () => {
            return `Featured Projects:
1. ArbiNet – IoT Crypto Arbitrage System
2. Decentralized Crowdfunding DApp
3. Bird Species Classifier
4. Coffee Management System

Type 'projects --web3' for Web3 projects
Type 'projects --iot' for IoT projects
Type 'projects --ml' for ML projects`;
        },
        'about': () => {
            return `About Yogeshwara B:
• Computer Science & Engineering Student
• Passionate about Web3, IoT, and ML
• Participated in Virsat Fest
• International Jamboree attendee
• Rover & Rangers member
• Building secure, smart, and decentralized systems`;
        },
        'contact': () => {
            return `Contact Information:
• Email: yogeshwara@example.com
• GitHub: github.com/yogeshwara
• LinkedIn: linkedin.com/in/yogeshwara
• ENS: yogeshwara.eth
• Location: Karnataka, India`;
        },
        'clear': () => {
            clearTerminal();
            return null;
        },
        'date': () => {
            return new Date().toString();
        },
        'crypto': () => {
            return `Live Crypto Prices (Demo):
• ETH: $2,847.32 (+2.4%)
• BTC: $43,156.78 (+1.8%)
• MATIC: $0.89 (+5.2%)
• USDT: $1.00 (stable)`;
        },
        'gas': () => {
            return `Ethereum Gas Tracker:
• Slow: 15 gwei ($2.34)
• Standard: 25 gwei ($3.90)
• Fast: 35 gwei ($5.46)
• Instant: 50 gwei ($7.80)`;
        },
        'hash': (args) => {
            if (!args) return 'Usage: hash <text>';
            return `SHA256 Hash: ${generateSHA256(args)}`;
        },
        'matrix': () => {
            const terminal = document.querySelector('.terminal-intro');
            terminal.classList.add('matrix-mode');
            setTimeout(() => {
                terminal.classList.remove('matrix-mode');
            }, 5000);
            return 'Matrix mode activated for 5 seconds...';
        },
        'hack': () => {
            const terminal = document.querySelector('.terminal-intro');
            terminal.classList.toggle('hacker-mode');
            return terminal.classList.contains('hacker-mode') ? 'Hacker mode activated!' : 'Hacker mode deactivated!';
        },
        'ls': (args) => {
            const currentDir = getCurrentDirectory();
            if (args && args.startsWith('-')) {
                if (args.includes('a')) {
                    return `Directory listing (including hidden):
${currentDir.files.map(f => f.hidden ? f.name : f.name).join('\n')}
${currentDir.dirs.map(d => d.hidden ? d.name : d.name).join('\n')}`;
                }
                if (args.includes('l')) {
                    return `Detailed directory listing:
${currentDir.files.map(f => `${f.permissions} ${f.size} ${f.date} ${f.name}`).join('\n')}
${currentDir.dirs.map(d => `${d.permissions} ${d.size} ${d.date} ${d.name}/`).join('\n')}`;
                }
            }
            return `Directory listing:
${currentDir.dirs.map(d => d.hidden ? '' : `${d.name}/`).filter(d => d).join('\n')}
${currentDir.files.map(f => f.hidden ? '' : f.name).filter(f => f).join('\n')}`;
        },
        'cd': (args) => {
            if (!args) {
                changeDirectory('/home/yogeshwara');
                return 'Changed to home directory';
            }
            if (args === '..') {
                const result = changeDirectory('..');
                return result ? 'Changed to parent directory' : 'Cannot go up from root';
            }
            if (args === '~') {
                changeDirectory('/home/yogeshwara');
                return 'Changed to home directory';
            }
            const result = changeDirectory(args);
            return result ? `Changed to ${args}` : `Directory '${args}' not found`;
        },
        'pwd': () => {
            return getCurrentPath();
        },
        'mkdir': (args) => {
            if (!args) return 'Usage: mkdir <directory_name>';
            const currentDir = getCurrentDirectory();
            const newDir = {
                name: args,
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: '4096',
                date: new Date().toLocaleDateString(),
                hidden: false
            };
            currentDir.dirs.push(newDir);
            return `Created directory '${args}'`;
        },
        'rm': (args) => {
            if (!args) return 'Usage: rm <filename>';
            const currentDir = getCurrentDirectory();
            const fileIndex = currentDir.files.findIndex(f => f.name === args);
            if (fileIndex !== -1) {
                currentDir.files.splice(fileIndex, 1);
                return `Removed '${args}'`;
            }
            return `File '${args}' not found`;
        },
        'cat': (args) => {
            if (!args) return 'Usage: cat <filename>';
            const files = {
                'resume.pdf': 'PDF file - Yogeshwara B Resume',
                'portfolio.html': 'Main portfolio HTML file',
                'styles.css': 'CSS styles for the portfolio',
                'script.js': 'JavaScript functionality',
                'README.md': '# Yogeshwara B Portfolio\n\nFull-Stack Web Developer & Blockchain Enthusiast\n\n## Skills\n- Frontend: HTML, CSS, JavaScript, React\n- Backend: Node.js, JSP, JDBC\n- Blockchain: Solidity, Web3.js\n- IoT: Arduino, Sensors\n- ML: Python, CNN',
                '.gitignore': 'node_modules/\n.env\n.DS_Store\n*.log',
                'package.json': '{\n  "name": "yogeshwara-portfolio",\n  "version": "1.0.0",\n  "description": "Personal portfolio website",\n  "main": "index.html"\n}'
            };
            return files[args] || `File '${args}' not found`;
        },
        'echo': (args) => {
            return args || 'Usage: echo <text>';
        },
        'ping': () => {
            return 'PONG! Connection successful.';
        },
        'calc': (args) => {
            if (!args) return 'Usage: calc <expression>';
            try {
                // Safe evaluation for basic math
                const result = eval(args.replace(/[^0-9+\-*/().]/g, ''));
                return isFinite(result) ? `Result: ${result}` : 'Invalid expression';
            } catch (e) {
                return 'Invalid expression';
            }
        },
        'history': () => {
            if (commandHistory.length === 0) return 'No command history';
            return commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
        }
    };
    
    // Handle command execution
    function executeCommand(cmd) {
        console.log('Executing command:', cmd);
        const parts = cmd.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');
        
        console.log('Command:', command, 'Args:', args);
        
        if (commands[command]) {
            console.log('Command found, executing...');
            const result = commands[command](args);
            console.log('Command result:', result);
            return result !== null ? result : '';
        } else {
            console.log('Command not found:', command);
            return `Command '${command}' not found. Type 'help' for available commands.`;
        }
    }
    
    // Generate SHA256 hash (simplified)
    function generateSHA256(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
    
    // Clear terminal
    function clearTerminal() {
        const lines = terminalBody.querySelectorAll('.terminal-line:not(.terminal-input-line)');
        lines.forEach(line => line.remove());
    }
    
    // Add output to terminal
    function addOutput(text) {
        console.log('Adding output to terminal:', text);
        
        // Create output element with proper CSS class
        const outputLine = document.createElement('div');
        outputLine.className = 'terminal-line';
        outputLine.innerHTML = `<span class="output">${text}</span>`;
        
        // Insert the output into the terminal body
        const inputLine = terminalBody.querySelector('.terminal-input-line');
        if (inputLine) {
            terminalBody.insertBefore(outputLine, inputLine);
        } else {
            terminalBody.appendChild(outputLine);
        }
        
        // Force scroll to bottom
        setTimeout(() => {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }, 50);
        
        console.log('Output added with proper CSS class, should be visible:', text);
    }
    
    // Handle input submission
    terminalInput.addEventListener('keydown', (e) => {
        console.log('Key pressed:', e.key);
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            console.log('Command entered:', command);
            if (command) {
                // Add command to history
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                
                // Display command
                const commandLine = document.createElement('div');
                commandLine.className = 'terminal-line';
                commandLine.innerHTML = `
                    <span class="prompt">yogeshwara@portfolio:${getCurrentPath()}$</span>
                    <span class="command">${command}</span>
                `;
                
                // Find the input line and insert before it
                const inputLine = terminalBody.querySelector('.terminal-input-line');
                if (inputLine) {
                    terminalBody.insertBefore(commandLine, inputLine);
                } else {
                    terminalBody.appendChild(commandLine);
                }
                
                // Execute command and show output
                const output = executeCommand(command);
                console.log('Command output:', output);
                if (output) {
                    addOutput(output);
                    console.log('Output should be visible now');
                }
                
                // Clear input
                terminalInput.value = '';
                
                // Scroll to bottom
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        }
    });
    
    // Focus on input when terminal is clicked
    terminalBody.addEventListener('click', () => {
        terminalInput.focus();
    });
    
    // Auto-focus on load
    setTimeout(() => {
        terminalInput.focus();
    }, 2000);

    // File system simulation
    let currentPath = '/home/yogeshwara';
    let fileSystem = {
        '/home/yogeshwara': {
            dirs: [
                { name: 'projects', type: 'directory', permissions: 'drwxr-xr-x', size: '4096', date: '2024-01-15', hidden: false },
                { name: 'skills', type: 'directory', permissions: 'drwxr-xr-x', size: '4096', date: '2024-01-15', hidden: false },
                { name: 'about', type: 'directory', permissions: 'drwxr-xr-x', size: '4096', date: '2024-01-15', hidden: false },
                { name: 'contact', type: 'directory', permissions: 'drwxr-xr-x', size: '4096', date: '2024-01-15', hidden: false },
                { name: 'web3', type: 'directory', permissions: 'drwxr-xr-x', size: '4096', date: '2024-01-15', hidden: false }
            ],
            files: [
                { name: 'resume.pdf', type: 'file', permissions: '-rw-r--r--', size: '245KB', date: '2024-01-15', hidden: false },
                { name: 'portfolio.html', type: 'file', permissions: '-rw-r--r--', size: '12KB', date: '2024-01-15', hidden: false },
                { name: 'styles.css', type: 'file', permissions: '-rw-r--r--', size: '8KB', date: '2024-01-15', hidden: false },
                { name: 'script.js', type: 'file', permissions: '-rw-r--r--', size: '15KB', date: '2024-01-15', hidden: false },
                { name: 'README.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false },
                { name: '.gitignore', type: 'file', permissions: '-rw-r--r--', size: '1KB', date: '2024-01-15', hidden: true },
                { name: 'package.json', type: 'file', permissions: '-rw-r--r--', size: '500B', date: '2024-01-15', hidden: false }
            ]
        },
        '/home/yogeshwara/projects': {
            dirs: [],
            files: [
                { name: 'arbinet.md', type: 'file', permissions: '-rw-r--r--', size: '5KB', date: '2024-01-15', hidden: false },
                { name: 'crowdfunding.md', type: 'file', permissions: '-rw-r--r--', size: '4KB', date: '2024-01-15', hidden: false },
                { name: 'bird-classifier.md', type: 'file', permissions: '-rw-r--r--', size: '3KB', date: '2024-01-15', hidden: false },
                { name: 'coffee-system.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false },
                { name: 'vegetation-monitoring.md', type: 'file', permissions: '-rw-r--r--', size: '4KB', date: '2024-01-15', hidden: false },
                { name: 'llm-ner-testing.md', type: 'file', permissions: '-rw-r--r--', size: '3KB', date: '2024-01-15', hidden: false }
            ]
        },
        '/home/yogeshwara/skills': {
            dirs: [],
            files: [
                { name: 'frontend.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false },
                { name: 'backend.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false },
                { name: 'blockchain.md', type: 'file', permissions: '-rw-r--r--', size: '3KB', date: '2024-01-15', hidden: false },
                { name: 'iot.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false },
                { name: 'ml.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false }
            ]
        },
        '/home/yogeshwara/about': {
            dirs: [],
            files: [
                { name: 'bio.md', type: 'file', permissions: '-rw-r--r--', size: '1KB', date: '2024-01-15', hidden: false },
                { name: 'education.md', type: 'file', permissions: '-rw-r--r--', size: '1KB', date: '2024-01-15', hidden: false },
                { name: 'experience.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false }
            ]
        },
        '/home/yogeshwara/contact': {
            dirs: [],
            files: [
                { name: 'email.txt', type: 'file', permissions: '-rw-r--r--', size: '100B', date: '2024-01-15', hidden: false },
                { name: 'github.txt', type: 'file', permissions: '-rw-r--r--', size: '100B', date: '2024-01-15', hidden: false },
                { name: 'linkedin.txt', type: 'file', permissions: '-rw-r--r--', size: '100B', date: '2024-01-15', hidden: false }
            ]
        },
        '/home/yogeshwara/web3': {
            dirs: [],
            files: [
                { name: 'solidity.md', type: 'file', permissions: '-rw-r--r--', size: '3KB', date: '2024-01-15', hidden: false },
                { name: 'uniswap.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false },
                { name: 'ipfs.md', type: 'file', permissions: '-rw-r--r--', size: '2KB', date: '2024-01-15', hidden: false }
            ]
        }
    };
    
    function getCurrentDirectory() {
        return fileSystem[currentPath] || { dirs: [], files: [] };
    }
    
    function getCurrentPath() {
        return currentPath;
    }
    
    function changeDirectory(dir) {
        if (dir === '..') {
            const pathParts = currentPath.split('/').filter(part => part);
            if (pathParts.length > 1) {
                pathParts.pop();
                currentPath = '/' + pathParts.join('/');
                return true;
            }
            return false;
        }
        
        if (dir.startsWith('/')) {
            if (fileSystem[dir]) {
                currentPath = dir;
                return true;
            }
            return false;
        }
        
        const newPath = currentPath.endsWith('/') ? currentPath + dir : currentPath + '/' + dir;
        if (fileSystem[newPath]) {
            currentPath = newPath;
            return true;
        }
        return false;
    }
} 