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
        console.log('MetaMask accounts check:', accounts);
        // MetaMask is unlocked if we can get accounts (even if empty array)
        // The error would be thrown if MetaMask is locked
        return true; // If we reach here without error, MetaMask is unlocked
    } catch (error) {
        console.error('Error checking MetaMask lock state:', error);
        // Check specific error messages to determine if locked
        if (error.message && error.message.includes('locked')) {
        return false;
        }
        // For other errors, assume unlocked but no permission yet
        return true;
    }
}

// Global variable to store selected wallet info
let selectedWallet = null;

// Wallet detection and selection
function detectAvailableWallets() {
    const wallets = [];
    
    // Check for MetaMask
    if (window.ethereum) {
        if (window.ethereum.providers) {
            // Multiple providers
            window.ethereum.providers.forEach(provider => {
                if (provider.isMetaMask) {
                    wallets.push({
                        name: 'MetaMask',
                        provider: provider,
                        icon: 'fab fa-ethereum',
                        color: '#f6851b'
                    });
                }
                if (provider.isPhantom) {
                    wallets.push({
                        name: 'Phantom',
                        provider: provider,
                        icon: 'fas fa-ghost',
                        color: '#ab9ff2'
                    });
                }
                if (provider.isCoinbaseWallet) {
                    wallets.push({
                        name: 'Coinbase Wallet',
                        provider: provider,
                        icon: 'fas fa-coins',
                        color: '#0052ff'
                    });
                }
            });
        } else {
            // Single provider
            if (window.ethereum.isMetaMask) {
                wallets.push({
                    name: 'MetaMask',
                    provider: window.ethereum,
                    icon: 'fab fa-ethereum',
                    color: '#f6851b'
                });
            } else if (window.ethereum.isPhantom) {
                wallets.push({
                    name: 'Phantom',
                    provider: window.ethereum,
                    icon: 'fas fa-ghost',
                    color: '#ab9ff2'
                });
            } else if (window.ethereum.isCoinbaseWallet) {
                wallets.push({
                    name: 'Coinbase Wallet',
                    provider: window.ethereum,
                    icon: 'fas fa-coins',
                    color: '#0052ff'
                });
            } else {
                wallets.push({
                    name: 'Unknown Wallet',
                    provider: window.ethereum,
                    icon: 'fas fa-wallet',
                    color: '#888888'
                });
            }
        }
    }
    
    // Check for Phantom (Solana) - might inject separately
    if (window.solana && window.solana.isPhantom) {
        const phantomExists = wallets.some(w => w.name === 'Phantom');
        if (!phantomExists) {
            wallets.push({
                name: 'Phantom (Solana)',
                provider: window.solana,
                icon: 'fas fa-ghost',
                color: '#ab9ff2',
                type: 'solana'
            });
        }
    }
    
    return wallets;
}

// Show wallet selection modal
function showWalletSelectionModal() {
    const wallets = detectAvailableWallets();
    
    if (wallets.length === 0) {
        showNotification('No wallets detected. Please install a wallet extension.', 'error');
        return;
    }
    
    if (wallets.length === 1) {
        // Only one wallet, connect directly
        connectToWallet(wallets[0]);
        return;
    }
    
    // Multiple wallets, show selection modal
    const modal = document.createElement('div');
    modal.id = 'walletModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'JetBrains Mono', monospace;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1a1a1a;
        border: 2px solid #00ff88;
        border-radius: 10px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;
    
    modalContent.innerHTML = `
        <h3 style="color: #00ff88; margin-top: 0;">Select Wallet</h3>
        <p style="color: #ccc; margin-bottom: 20px;">Choose a wallet to connect:</p>
        <div id="walletList"></div>
        <button onclick="closeWalletModal()" style="
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            font-family: 'JetBrains Mono', monospace;
        ">Cancel</button>
    `;
    
    modal.appendChild(modalContent);
    
    const walletList = modalContent.querySelector('#walletList');
    wallets.forEach(wallet => {
        const walletBtn = document.createElement('button');
        walletBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            background: #333;
            border: 2px solid ${wallet.color};
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s ease;
        `;
        
        walletBtn.innerHTML = `
            <i class="${wallet.icon}" style="color: ${wallet.color}; margin-right: 15px; font-size: 24px;"></i>
            <span style="font-weight: bold;">${wallet.name}</span>
        `;
        
        walletBtn.onmouseover = () => {
            walletBtn.style.background = wallet.color + '20';
            walletBtn.style.transform = 'scale(1.02)';
        };
        
        walletBtn.onmouseout = () => {
            walletBtn.style.background = '#333';
            walletBtn.style.transform = 'scale(1)';
        };
        
        walletBtn.onclick = () => {
            closeWalletModal();
            connectToWallet(wallet);
        };
        
        walletList.appendChild(walletBtn);
    });
    
    document.body.appendChild(modal);
}

// Close wallet modal
function closeWalletModal() {
    const modal = document.getElementById('walletModal');
    if (modal) {
        modal.remove();
    }
}

// Connect to specific wallet
async function connectToWallet(wallet) {
    console.log('=== CONNECTING TO WALLET ===');
    console.log('Selected wallet:', wallet.name);
    
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting to ${wallet.name}...`;
        connectBtn.disabled = true;
    }
    
    selectedWallet = wallet;
    
    try {
        let accounts = [];
        
        if (wallet.type === 'solana') {
            // Solana wallet (Phantom)
            const response = await wallet.provider.connect();
            accounts = [response.publicKey.toString()];
        } else {
            // Ethereum-based wallet
            accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
        }
        
        if (accounts && accounts.length > 0) {
            currentAccount = accounts[0];
            displayWalletInfo(currentAccount, false, wallet);
            
            if (connectBtn) {
                connectBtn.innerHTML = `<i class="${wallet.icon}"></i> Connected to ${wallet.name}`;
                connectBtn.onclick = disconnectWallet;
                connectBtn.disabled = false;
                connectBtn.style.background = wallet.color;
            }
            
            showNotification(`${wallet.name} connected successfully!`, 'success');
            
            // Setup listeners for Ethereum wallets
            if (wallet.type !== 'solana') {
                setupWalletListeners(wallet.provider);
                getWalletBalance(currentAccount, wallet.provider);
                getNetworkInfo(wallet.provider);
            }
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);
        
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
            connectBtn.onclick = connectWallet;
            connectBtn.disabled = false;
            connectBtn.style.background = '';
        }
        
        if (error.code === 4001) {
            showNotification('Connection request rejected by user.', 'warning');
        } else {
            showNotification(`Failed to connect to ${wallet.name}. Please try again.`, 'error');
        }
    }
}

// Main wallet connection function - Now shows wallet selection
async function connectWallet() {
    console.log('=== WALLET CONNECTION DEBUG ===');
    console.log('connectWallet function called');

    const connectBtn = document.getElementById('connectWalletBtn');
    if (!connectBtn) {
        console.error('❌ Connect wallet button not found');
        showNotification('Wallet button not found', 'error');
        return;
    }

    showWalletSelectionModal();
}

// Reset connect button to original state - Enhanced with retry
function resetConnectButton(connectBtn) {
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Retry Connect';
        connectBtn.onclick = connectWallet;
        connectBtn.disabled = false;
    }
}

// Display wallet information - Updated to work with existing HTML structure and multiple wallets
function displayWalletInfo(account, isDemo = false, wallet = null) {
    console.log('Displaying wallet info for:', account);
    
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const walletBalance = document.getElementById('walletBalance');
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (!walletInfo || !walletAddress || !connectBtn) {
        console.error('Wallet elements not found:', {
            walletInfo: !!walletInfo,
            walletAddress: !!walletAddress,
            walletBalance: !!walletBalance,
            connectBtn: !!connectBtn
        });
        showNotification('Wallet display elements not found', 'error');
        return;
    }
    
    // Format account address
    const shortAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);
    
    // Update wallet address with copy and disconnect buttons
    const walletName = wallet ? wallet.name : (isDemo ? 'Demo Wallet' : 'Connected Wallet');
    const walletColor = wallet ? wallet.color : (isDemo ? '#ffaa00' : '#00ff88');
    const walletIcon = wallet ? wallet.icon : (isDemo ? 'fas fa-play' : 'fas fa-wallet');
    
    walletAddress.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <i class="${walletIcon}" style="color: ${walletColor}; font-size: 16px;"></i>
            <span style="color: ${walletColor}; font-weight: bold;">${walletName}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <span class="address-text" style="font-family: monospace; background: #333; padding: 4px 8px; border-radius: 4px;">
                    ${shortAddress}
                </span>
                <button onclick="copyAddress('${account}')" style="
                background: ${walletColor}; color: ${walletColor === '#ffaa00' ? '#000' : '#fff'}; border: none; padding: 4px 8px; 
                border-radius: 4px; cursor: pointer; font-size: 12px;
            " title="Copy address">
                    <i class="fas fa-copy"></i>
                </button>
            <button onclick="disconnectWallet()" style="
                background: #ff4444; color: #fff; border: none; padding: 4px 8px; 
                border-radius: 4px; cursor: pointer; font-size: 12px;
            " title="Disconnect">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Update balance
    if (walletBalance) {
        const balance = isDemo ? '2.547 ETH' : 'Loading...';
        walletBalance.innerHTML = `
            <div style="color: ${isDemo ? '#ffaa00' : '#00ff88'}; font-weight: bold;">
                ${balance}
                ${isDemo ? '<br><small style="color: #ffaa00;">(Demo Mode)</small>' : ''}
            </div>
        `;
    }
    
    // Show wallet info and hide connect button
    walletInfo.style.display = 'block';
    connectBtn.style.display = 'none';
    
    // If not demo, try to get real balance and network info
    if (!isDemo && wallet && wallet.type !== 'solana') {
        getWalletBalance(account, wallet.provider);
        getNetworkInfo(wallet.provider);
    } else if (!isDemo && !wallet) {
        // Fallback for backward compatibility
        getWalletBalance(account);
        getNetworkInfo();
    }
    
    console.log('Wallet info displayed successfully');
}

// Get wallet balance with enhanced error handling
function getWalletBalance(account, provider = null) {
    console.log('🔄 Fetching balance for account:', account);
    
    if (!account) {
        console.error('❌ No account provided for balance fetch');
        return;
    }
    
    // Use provided provider or fall back to detection
    if (!provider) {
        if (window.ethereum) {
            if (window.ethereum.providers) {
                provider = window.ethereum.providers.find(p => p.isMetaMask);
            } else if (window.ethereum.isMetaMask) {
                provider = window.ethereum;
            }
        }
    }
    
    if (!provider) {
        console.error('❌ MetaMask provider not found for balance fetch');
        const balanceElement = document.getElementById('walletBalance');
        if (balanceElement) {
            balanceElement.innerHTML = `
                <div style="color: #ff4444;">
                    Provider not available
                </div>
            `;
        }
        return;
    }
    
    console.log('🔍 Using provider for balance:', provider.isMetaMask ? 'MetaMask' : 'Unknown');
    
    // Show loading state
    const balanceElement = document.getElementById('walletBalance');
    if (balanceElement) {
        balanceElement.innerHTML = `
            <div style="color: #888;">
                <i class="fas fa-spinner fa-spin"></i> Loading balance...
            </div>
        `;
    }
    
    provider.request({
            method: 'eth_getBalance',
            params: [account, 'latest']
        })
        .then(balance => {
        console.log('✅ Raw balance received:', balance);
        
        if (!balance || balance === '0x') {
            console.warn('⚠️ Empty or invalid balance received');
            const ethBalance = 0;
            const balanceText = `${ethBalance.toFixed(4)} ETH`;
            const usdText = `($0.00 USD)`;
            
            if (balanceElement) {
                balanceElement.innerHTML = `
                    <div style="color: #00ff88; font-weight: bold;">
                        ${balanceText}
                        <br><small style="color: #888;">${usdText}</small>
                    </div>
                `;
            }
            return;
        }
        
            const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
            const balanceText = `${ethBalance.toFixed(4)} ETH`;
            const usdText = `($${(ethBalance * 2847.32).toFixed(2)} USD)`;
            
        console.log('💰 Formatted balance:', balanceText);
        
        // Update balance display in the correct element
            if (balanceElement) {
            balanceElement.innerHTML = `
                <div style="color: #00ff88; font-weight: bold;">
                    ${balanceText}
                    <br><small style="color: #888;">${usdText}</small>
                </div>
            `;
            }
        })
        .catch(error => {
        console.error('❌ Error getting balance:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            data: error.data
        });
        
        if (balanceElement) {
            let errorMessage = 'Balance unavailable';
            
            // Provide more specific error messages
            if (error.code === -32603) {
                errorMessage = 'Network error - try again';
            } else if (error.code === 4001) {
                errorMessage = 'Request rejected';
            } else if (error.message && error.message.includes('network')) {
                errorMessage = 'Network connection issue';
            } else if (error.message && error.message.includes('rate limit')) {
                errorMessage = 'Too many requests - wait a moment';
            }
            
            balanceElement.innerHTML = `
                <div style="color: #ff4444;">
                    ${errorMessage}
                    <br><small style="color: #888;">Click to retry</small>
                </div>
            `;
            
            // Make balance element clickable to retry
            balanceElement.style.cursor = 'pointer';
            balanceElement.onclick = () => {
                balanceElement.style.cursor = 'default';
                balanceElement.onclick = null;
                setTimeout(() => getWalletBalance(account), 1000);
            };
        }
    });
}

// Get network information
function getNetworkInfo(provider = null) {
    if (!provider && typeof window.ethereum !== 'undefined') {
        provider = window.ethereum;
    }
    
    if (provider) {
        provider.request({ method: 'eth_chainId' })
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
function setupWalletListeners(provider = null) {
    if (!provider && typeof window.ethereum !== 'undefined') {
        provider = window.ethereum;
    }
    
    if (provider && provider.on) {
        // Listen for account changes
        provider.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                displayWalletInfo(currentAccount, false, selectedWallet);
                getWalletBalance(currentAccount, provider);
                showNotification('Account switched', 'info');
            } else {
                disconnectWallet();
            }
        });

        // Listen for network changes
        provider.on('chainChanged', (chainId) => {
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

// Test wallet connection on page load with multiple wallet support
function testWalletConnection() {
    console.log('🧪 Testing wallet connection...');
    
    let metaMaskFound = false;
    
    if (window.ethereum) {
        if (window.ethereum.providers) {
            // Multiple wallets detected
            const walletNames = window.ethereum.providers.map(p => {
                if (p.isMetaMask) return 'MetaMask';
                if (p.isPhantom) return 'Phantom';
                if (p.isCoinbaseWallet) return 'Coinbase Wallet';
                return 'Unknown Wallet';
            });
            
            console.log('🔍 Multiple wallets detected:', walletNames);
            metaMaskFound = window.ethereum.providers.some(p => p.isMetaMask);
            
            // Removed notifications to avoid popup clutter
            // if (metaMaskFound) {
            //     showNotification(`MetaMask found among ${walletNames.length} wallets. Click "Connect Wallet" to connect.`, 'success');
            // } else {
            //     showNotification(`${walletNames.length} wallets detected but MetaMask not found. Please install MetaMask.`, 'warning');
            // }
                } else if (window.ethereum.isMetaMask) {
            // Single MetaMask detected
            console.log('✅ MetaMask detected - ready for connection');
            metaMaskFound = true;
            // Removed notification to avoid popup clutter
            // showNotification('MetaMask detected! Click "Connect Wallet" to connect.', 'success');
        } else {
            // Single non-MetaMask wallet
            console.log('⚠️ Non-MetaMask wallet detected');
            // Removed notification to avoid popup clutter
            // showNotification('Non-MetaMask wallet detected. Please install MetaMask for full compatibility.', 'warning');
        }
    } else {
        console.log('❌ No Ethereum wallet detected');
        showNotification('No Ethereum wallet detected. Please install MetaMask extension.', 'error');
    }
    
    // Auto-suggest demo mode if MetaMask not found
    if (!metaMaskFound) {
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
            connectBtn.onclick = connectDemoWallet;
            connectBtn.disabled = false;
        }
    }
}

// Removed auto-reconnect functionality - users must manually connect

// Test MetaMask availability on page load - NO auto-connect
document.addEventListener('DOMContentLoaded', () => {
    // Wait for MetaMask to be fully injected
    setTimeout(() => {
        testWalletConnection(); // Only test availability, don't connect
    }, 1000);
});

// Export functions to global scope
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.copyAddress = copyAddress;
window.connectDemoWallet = connectDemoWallet;
window.closeWalletModal = closeWalletModal;



 