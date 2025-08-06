// Wallet Connection Module - Enhanced for Better MetaMask Handling
// Handles MetaMask integration and wallet functionality

// Global variables
let currentAccount = null;
let currentNetwork = null;

// Expose the connectWallet function globally for script.js compatibility
window.connectWalletFromModule = connectWallet;

// Step 1: Add a function to detect MetaMask lock state
async function isMetaMaskUnlocked() {
    if (typeof window.ethereum === 'undefined') return false;
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts.length > 0;
    } catch (error) {
        console.error('Error checking MetaMask lock state:', error);
        return false;
    }
}

// Main wallet connection function - Enhanced
async function connectWallet() {
    console.log('=== WALLET CONNECTION DEBUG ===');
    console.log('connectWallet function called');

    const connectBtn = document.getElementById('connectWalletBtn');
    if (!connectBtn) {
        console.error('❌ Connect wallet button not found');
        showNotification('Wallet button not found', 'error');
        return;
    }

    if (typeof window.ethereum === 'undefined') {
        console.error('❌ MetaMask not detected');
        showNotification('MetaMask not found. Please install MetaMask extension.', 'error');
        showMetaMaskInstallationGuide();
        connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
        connectBtn.onclick = connectDemoWallet;
        connectBtn.disabled = false;
        return;
    }

    console.log('✅ MetaMask detected');
    connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    connectBtn.disabled = true;

    try {
        // Step 2: Check lock status before requesting
        const unlocked = await isMetaMaskUnlocked();
        if (!unlocked) {
            console.log('🔒 MetaMask is locked or no account connected');
            showNotification('MetaMask is locked. Please unlock it and try again.', 'warning');
            resetConnectButton(connectBtn);
            return;
        }

        console.log('🔄 Attempting MetaMask connection...');
        const connectionPromise = window.ethereum.request({ method: 'eth_requestAccounts' });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout')), 15000);
        });

        const accounts = await Promise.race([connectionPromise, timeoutPromise]);
        
        console.log('✅ Connection successful:', accounts);

        if (accounts && accounts.length > 0) {
            currentAccount = accounts[0];
            displayWalletInfo(currentAccount);
            connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connected';
            connectBtn.onclick = disconnectWallet;
            connectBtn.disabled = false;
            showNotification('Wallet connected successfully!', 'success');
            setupWalletListeners();
        } else {
            console.warn('⚠️ No accounts found after connection attempt');
            showNotification('No accounts found. Please unlock MetaMask.', 'warning');
            resetConnectButton(connectBtn);
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);

        if (error.message.includes('timeout')) {
            showNotification('Connection timed out. Please ensure MetaMask is unlocked and try again.', 'error');
        } else if (error.code === 4001) {
            showNotification('Connection request rejected by user.', 'warning');
        } else if (error.message.includes('Unexpected error') || 
                   error.message.includes('evmAsk.js') ||
                   error.message.includes('hook.js')) {
            console.log('🔧 MetaMask has internal issues, suggesting demo mode...');
            showNotification('MetaMask has internal issues. Try Demo Mode instead!', 'warning');
            
            // Auto-switch to demo mode
            connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
            connectBtn.onclick = connectDemoWallet;
            connectBtn.disabled = false;
        } else {
            showNotification('Connection failed. Try Demo Mode or refresh MetaMask.', 'error');
            resetConnectButton(connectBtn);
        }
    }
}

// Reset connect button to original state - Enhanced with retry
function resetConnectButton(connectBtn) {
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Retry Connect';
        connectBtn.onclick = connectWallet;
        connectBtn.disabled = false;
    }
}

// Display wallet information
function displayWalletInfo(account, isDemo = false) {
    console.log('Displaying wallet info for:', account);
    
    const walletInfo = document.getElementById('walletInfo');
    if (!walletInfo) {
        console.error('Wallet info container not found');
        return;
    }
    
    // Format account address
    const shortAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);
    
    // Demo or real wallet data
    const balance = isDemo ? '2.547 ETH' : 'Loading...';
    const network = isDemo ? 'Ethereum Mainnet' : 'Loading...';
    
    walletInfo.innerHTML = `
        <div style="background: #1a1a1a; border: 2px solid ${isDemo ? '#ffaa00' : '#00ff88'}; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h3 style="color: ${isDemo ? '#ffaa00' : '#00ff88'}; margin-top: 0;">
                ${isDemo ? '🎮 Demo Wallet' : '🔗 Connected Wallet'}
            </h3>
            <div style="margin-bottom: 15px;">
                <strong>Address:</strong> 
                <span style="font-family: monospace; background: #333; padding: 2px 6px; border-radius: 4px;">
                    ${shortAddress}
                </span>
                <button onclick="copyAddress('${account}')" style="
                    background: #333; color: #fff; border: none; padding: 4px 8px; 
                    border-radius: 4px; cursor: pointer; margin-left: 8px; font-size: 12px;
                ">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Balance:</strong> 
                <span style="color: ${isDemo ? '#ffaa00' : '#00ff88'}; font-weight: bold;">
                    ${balance}
                </span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Network:</strong> 
                <span style="color: #00aaff;">${network}</span>
            </div>
            ${isDemo ? `
                <div style="background: #ffaa00; color: #000; padding: 10px; border-radius: 5px; margin-top: 15px; font-size: 14px;">
                    <i class="fas fa-info-circle"></i> This is a demo wallet for testing purposes.
                </div>
            ` : ''}
        </div>
    `;
    
    // If not demo, try to get real balance and network info
    if (!isDemo) {
        getWalletBalance(account);
        getNetworkInfo();
    }
}

// Get wallet balance
function getWalletBalance(account) {
    if (typeof window.ethereum !== 'undefined' && account) {
        window.ethereum.request({
            method: 'eth_getBalance',
            params: [account, 'latest']
        })
        .then(balance => {
            const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
            const balanceText = `${ethBalance.toFixed(4)} ETH`;
            const usdText = `($${(ethBalance * 2847.32).toFixed(2)} USD)`;
            
            // Update balance display
            const balanceElement = document.querySelector('#walletInfo .balance-amount');
            if (balanceElement) {
                balanceElement.textContent = balanceText;
            }
        })
        .catch(error => {
            console.error('Error getting balance:', error);
        });
    }
}

// Get network information
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

// Get network name from chain ID
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

// Update network display
function updateNetworkDisplay() {
    const networkElement = document.querySelector('#walletInfo .network-info');
    if (networkElement && currentNetwork) {
        networkElement.innerHTML = `<i class="fas fa-network-wired"></i> ${currentNetwork}`;
    }
}

// Setup wallet event listeners
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

// Disconnect wallet
function disconnectWallet() {
    currentAccount = null;
    currentNetwork = null;
    
    const walletInfo = document.getElementById('walletInfo');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (walletInfo) {
        walletInfo.style.display = 'none';
    }
    
    if (connectBtn) {
        connectBtn.style.display = 'block';
        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
        connectBtn.onclick = connectWallet;
        connectBtn.disabled = false;
    }
    
    // Remove demo indicator if present
    const demoIndicator = document.getElementById('demo-indicator');
    if (demoIndicator) {
        demoIndicator.remove();
    }
    
    showNotification('Wallet disconnected', 'info');
}

// Copy address to clipboard
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

// Demo wallet connection
function connectDemoWallet() {
    console.log('🎮 Connecting to Demo Wallet...');
    
    const connectBtn = document.getElementById('connectWalletBtn');
    if (!connectBtn) {
        console.error('❌ Connect wallet button not found');
        return;
    }
    
    // Show connecting state
    connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting Demo...';
    connectBtn.disabled = true;
    
    // Simulate connection delay
    setTimeout(() => {
        const demoAccount = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        
        console.log('✅ Demo wallet connected:', demoAccount);
        
        // Set current account
        currentAccount = demoAccount;
        
        // Display demo wallet info
        displayWalletInfo(demoAccount, true);
        
        // Update button
        connectBtn.innerHTML = '<i class="fas fa-play"></i> Demo Connected';
        connectBtn.onclick = disconnectWallet;
        connectBtn.disabled = false;
        connectBtn.style.background = '#ffaa00';
        
        // Show demo notification
        showNotification('Demo wallet connected! This is a simulation.', 'info');
        
        // Add demo indicator
        const demoIndicator = document.createElement('div');
        demoIndicator.id = 'demo-indicator';
        demoIndicator.innerHTML = `
            <div style="
                background: #ffaa00; color: #000; padding: 8px 12px; 
                border-radius: 20px; font-size: 12px; font-weight: bold;
                position: fixed; top: 20px; right: 20px; z-index: 1000;
                border: 2px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
                🎮 DEMO MODE
            </div>
        `;
        document.body.appendChild(demoIndicator);
        
        // Auto-disconnect after 30 seconds
        setTimeout(() => {
            if (currentAccount === demoAccount) {
                showNotification('Demo session ended. Try connecting real MetaMask!', 'info');
                disconnectWallet();
            }
        }, 30000);
        
    }, 1500);
}

// Show MetaMask installation guide
function showMetaMaskInstallationGuide() {
    const guide = `
        <div style="background: rgba(0, 123, 255, 0.1); border: 1px solid #007bff; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
            <h4 style="color: #007bff; margin: 0 0 0.5rem 0;">📦 Install MetaMask:</h4>
            <ol style="margin: 0; padding-left: 1.5rem; color: #666;">
                <li>Go to <a href="https://metamask.io" target="_blank" style="color: #007bff;">metamask.io</a></li>
                <li>Download and install the extension</li>
                <li>Create or import a wallet</li>
                <li>Unlock MetaMask</li>
                <li>Refresh this page and try again</li>
            </ol>
        </div>
    `;
    
    // Add to page
    const container = document.querySelector('.web3-section .container');
    if (container) {
        const guideDiv = document.createElement('div');
        guideDiv.innerHTML = guide;
        container.appendChild(guideDiv);
        
        // Remove after 15 seconds
        setTimeout(() => {
            if (guideDiv.parentNode) {
                guideDiv.parentNode.removeChild(guideDiv);
            }
        }, 15000);
    }
}

// Test wallet connection on page load
function testWalletConnection() {
    console.log('🧪 Testing wallet connection...');
    
    if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask detected - ready for connection');
        showNotification('MetaMask detected! Click "Connect Wallet" to connect.', 'success');
    } else {
        console.log('❌ MetaMask not detected');
        showNotification('MetaMask not detected. Please install MetaMask extension.', 'error');
        
        // Auto-suggest demo mode
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
            connectBtn.onclick = connectDemoWallet;
            connectBtn.disabled = false;
        }
    }
}

// Bonus: Automatically reconnect if unlocked on page load
async function autoReconnect() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const unlocked = await isMetaMaskUnlocked();
            if (unlocked) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    currentAccount = accounts[0];
                    displayWalletInfo(currentAccount);
                    setupWalletListeners();
                    const connectBtn = document.getElementById('connectWalletBtn');
                    if (connectBtn) {
                        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connected';
                        connectBtn.onclick = disconnectWallet;
                        connectBtn.disabled = false;
                    }
                    showNotification('Wallet auto-reconnected!', 'success');
                }
            }
        } catch (error) {
            console.log('Auto-reconnect failed:', error);
        }
    }
}

// Auto-test on page load - Enhanced
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        testWalletConnection();
        autoReconnect();
    }, 2000);
});

// Export functions to global scope
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.copyAddress = copyAddress;
window.connectDemoWallet = connectDemoWallet;


 