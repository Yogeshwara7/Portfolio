// Wallet Connection Module
// Handles MetaMask integration and wallet functionality

// Global variables (only declare once)
let currentAccount = null;
let currentNetwork = null;
let isConnecting = false; // Prevent multiple connection attempts

// Expose the connectWallet function globally for script.js compatibility
window.connectWalletFromModule = connectWallet;

// Mobile MetaMask detection and connection
function detectMobileMetaMask() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    if (isMobile) {
        console.log('📱 Mobile device detected');
        
        // Check if MetaMask mobile app is installed
        const checkMetaMaskMobile = () => {
            // Try to detect MetaMask mobile app
            const metamaskUrl = 'metamask://';
            const link = document.createElement('a');
            link.href = metamaskUrl;
            
            // If we can't open the URL, MetaMask might not be installed
            try {
                window.location.href = metamaskUrl;
                return true;
            } catch (e) {
                console.log('MetaMask mobile app not detected');
                return false;
            }
        };
        
        return {
            isMobile: true,
            hasMetaMask: checkMetaMaskMobile()
        };
    }
    
    return {
        isMobile: false,
        hasMetaMask: false
    };
}

// Mobile MetaMask connection
function connectMobileMetaMask() {
    console.log('📱 Attempting mobile MetaMask connection...');
    
    const mobileInfo = detectMobileMetaMask();
    
    if (!mobileInfo.isMobile) {
        console.log('Not a mobile device, using desktop connection');
        return connectWallet();
    }
    
    // Show mobile-specific instructions
    showMobileMetaMaskInstructions();
    
    // Create mobile connection options
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        // Create a container for mobile options
        const mobileOptions = document.createElement('div');
        mobileOptions.id = 'mobile-options';
        mobileOptions.style.cssText = `
            display: flex; flex-direction: column; gap: 10px; margin-top: 15px;
        `;
        
        // Option 1: Direct deep link
        const deepLinkBtn = document.createElement('button');
        deepLinkBtn.innerHTML = '<i class="fab fa-mobile-alt"></i> Open MetaMask App';
        deepLinkBtn.onclick = () => {
            const deepLinkUrl = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
            window.open(deepLinkUrl, '_blank');
            showNotification('Opening MetaMask mobile app...', 'info');
        };
        deepLinkBtn.style.cssText = `
            background: #00ff88; color: #000; border: none; padding: 12px; 
            border-radius: 8px; cursor: pointer; font-weight: bold;
        `;
        
        // Option 2: QR Code
        const qrBtn = document.createElement('button');
        qrBtn.innerHTML = '<i class="fas fa-qrcode"></i> Show QR Code';
        qrBtn.onclick = generateMobileQRCode;
        qrBtn.style.cssText = `
            background: #ffaa00; color: #000; border: none; padding: 12px; 
            border-radius: 8px; cursor: pointer; font-weight: bold;
        `;
        
        // Option 3: Demo Mode
        const demoBtn = document.createElement('button');
        demoBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
        demoBtn.onclick = connectDemoWallet;
        demoBtn.style.cssText = `
            background: #ff6b6b; color: #fff; border: none; padding: 12px; 
            border-radius: 8px; cursor: pointer; font-weight: bold;
        `;
        
        // Add buttons to container
        mobileOptions.appendChild(deepLinkBtn);
        mobileOptions.appendChild(qrBtn);
        mobileOptions.appendChild(demoBtn);
        
        // Insert after the connect button
        connectBtn.parentNode.insertBefore(mobileOptions, connectBtn.nextSibling);
        
        // Update main button
        connectBtn.innerHTML = '<i class="fab fa-mobile-alt"></i> Mobile Options';
        connectBtn.disabled = true;
        connectBtn.style.background = '#666';
    }
}

// Show mobile MetaMask instructions
function showMobileMetaMaskInstructions() {
    const instructions = `
        <div style="background: #1a1a1a; border: 2px solid #00ff88; border-radius: 10px; padding: 20px; margin: 20px 0; color: white;">
            <h3 style="color: #00ff88; margin-top: 0;">📱 Mobile MetaMask Instructions</h3>
            <ol style="text-align: left;">
                <li>Make sure MetaMask mobile app is installed</li>
                <li>Click "Open MetaMask App" button below</li>
                <li>MetaMask app will open automatically</li>
                <li>Approve the connection in MetaMask</li>
                <li>Return to this page to see your wallet info</li>
            </ol>
            <p style="color: #ffaa00; margin-bottom: 0;">
                💡 <strong>Tip:</strong> If MetaMask doesn't open, try opening it manually and scanning a QR code
            </p>
        </div>
    `;
    
    // Add instructions to the page
    const web3Section = document.querySelector('.web3-section') || document.querySelector('.wallet-connect');
    if (web3Section) {
        const instructionDiv = document.createElement('div');
        instructionDiv.innerHTML = instructions;
        instructionDiv.id = 'mobile-instructions';
        web3Section.appendChild(instructionDiv);
    }
}

// Enhanced wallet connection with mobile support
function connectWallet() {
    console.log('=== WALLET CONNECTION DEBUG ===');
    console.log('connectWallet function called');
    console.log('Current origin:', window.location.origin);
    console.log('Current hostname:', window.location.hostname);
    console.log('Protocol:', window.location.protocol);
    
    // Check if we're on mobile
    const mobileInfo = detectMobileMetaMask();
    
    if (mobileInfo.isMobile) {
        console.log('📱 Mobile device detected, using mobile connection');
        return connectMobileMetaMask();
    }
    
    // Desktop connection logic (existing code)
    if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask detected');
        console.log('MetaMask version:', window.ethereum.version);
        
        // Set connecting flag
        isConnecting = true;
        
        // Show connecting state
        const connectBtn = document.getElementById('connectWalletBtn');
        if (!connectBtn) {
            console.error('❌ Connect wallet button not found');
            showNotification('Wallet button not found', 'error');
            isConnecting = false;
            return;
        }
        
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectBtn.disabled = true;

        // Quick MetaMask health check
        const healthCheck = async () => {
            try {
                // Very quick test - if this fails, MetaMask has issues
                const testResult = await Promise.race([
                    window.ethereum.request({ method: 'eth_accounts' }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 1000))
                ]);
                
                // If we get here, MetaMask is responsive
                console.log('✅ MetaMask health check passed');
                return true;
            } catch (error) {
                console.log('❌ MetaMask health check failed:', error.message);
                return false;
            }
        };

        // Run health check and decide approach
        healthCheck().then(isHealthy => {
            if (isHealthy) {
                // MetaMask is healthy, try normal connection
                tryConnectMetaMask()
                    .then(accounts => {
                        if (accounts && accounts.length > 0) {
                            currentAccount = accounts[0];
                            console.log('✅ Wallet connected successfully:', currentAccount);
                            
                            // Display wallet info
                            displayWalletInfo(currentAccount);
                            
                            // Update button
                            connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connected';
                            connectBtn.onclick = disconnectWallet;
                            connectBtn.disabled = false;
                            
                            showNotification('Wallet connected successfully!', 'success');
                            
                            // Setup listeners
                            setupWalletListeners();
                        } else {
                            console.warn('⚠️ No accounts found');
                            showNotification('No accounts found. Please unlock MetaMask.', 'warning');
                            resetConnectButton(connectBtn);
                        }
                    })
                    .catch(error => {
                        console.error('❌ Connection failed:', error);
                        showNotification('Connection failed. Try Demo Mode instead!', 'warning');
                        
                        // Auto-switch to demo mode
                        connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
                        connectBtn.onclick = connectDemoWallet;
                        connectBtn.disabled = false;
                    })
                    .finally(() => {
                        isConnecting = false;
                    });
            } else {
                // MetaMask has issues, go straight to demo mode
                console.log('🔧 MetaMask has issues, switching to demo mode...');
                showNotification('MetaMask has issues. Using Demo Mode instead!', 'info');
                
                // Auto-switch to demo mode
                connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
                connectBtn.onclick = connectDemoWallet;
                connectBtn.disabled = false;
                isConnecting = false;
            }
        });
        
    } else {
        console.error('❌ MetaMask not detected');
        showNotification('MetaMask not found. Please install MetaMask extension.', 'error');
        
        // Show installation guide
        showMetaMaskInstallationGuide();
        
        // Offer demo mode
        const connectBtn = document.getElementById('connectWalletBtn');
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
            connectBtn.onclick = connectDemoWallet;
            connectBtn.disabled = false;
        }
    }
}

// Improved MetaMask connection function
async function tryConnectMetaMask() {
    console.log('🔄 Attempting MetaMask connection...');
    
    // Method 1: Try eth_requestAccounts first
    try {
        console.log('Trying eth_requestAccounts...');
        const accounts = await Promise.race([
            window.ethereum.request({ method: 'eth_requestAccounts' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);
        console.log('✅ eth_requestAccounts successful:', accounts);
        return accounts;
    } catch (error) {
        console.log('❌ eth_requestAccounts failed:', error.message);
        
        // Check if it's a MetaMask internal error
        if (error.message.includes('Unexpected error') || error.message.includes('hook.js')) {
            console.log('🔧 MetaMask has internal issues, suggesting demo mode...');
            throw new Error('MetaMask internal error - try demo mode');
        }
        
        // Method 2: Try eth_accounts (check if already connected)
        try {
            console.log('Trying eth_accounts...');
            const accounts = await Promise.race([
                window.ethereum.request({ method: 'eth_accounts' }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
            ]);
            console.log('✅ eth_accounts successful:', accounts);
            return accounts;
        } catch (error2) {
            console.log('❌ eth_accounts failed:', error2.message);
            
            // Check if it's a MetaMask internal error
            if (error2.message.includes('Unexpected error') || error2.message.includes('hook.js')) {
                console.log('🔧 MetaMask has internal issues, suggesting demo mode...');
                throw new Error('MetaMask internal error - try demo mode');
            }
            
            throw new Error('All connection methods failed');
        }
    }
}

// Reset connect button to original state
function resetConnectButton(connectBtn) {
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
        connectBtn.onclick = connectWallet;
        connectBtn.disabled = false;
    }
}

function displayWalletInfo(account) {
    console.log('displayWalletInfo called with account:', account);
    
    const walletInfo = document.getElementById('walletInfo');
    const walletAddress = document.getElementById('walletAddress');
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletStatus = document.getElementById('walletStatus');
    const walletShortAddress = document.getElementById('walletShortAddress');
    const walletDropdownAddress = document.getElementById('walletDropdownAddress');
    
    console.log('Wallet elements found:', {
        walletInfo: !!walletInfo,
        walletAddress: !!walletAddress,
        connectBtn: !!connectBtn,
        walletStatus: !!walletStatus,
        walletShortAddress: !!walletShortAddress,
        walletDropdownAddress: !!walletDropdownAddress
    });
    
    if (!walletInfo || !walletAddress || !connectBtn) {
        console.error('Required wallet elements not found:', {
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
    
    // Update wallet status indicator in navigation
    if (walletStatus && walletShortAddress && walletDropdownAddress) {
        console.log('Updating wallet status indicator...');
        walletShortAddress.textContent = `${account.slice(0, 6)}...${account.slice(-4)}`;
        walletDropdownAddress.textContent = account;
        walletStatus.style.display = 'block';
        console.log('Wallet status indicator should now be visible');
    } else {
        console.error('Wallet status elements not found:', {
            walletStatus: !!walletStatus,
            walletShortAddress: !!walletShortAddress,
            walletDropdownAddress: !!walletDropdownAddress
        });
    }
    
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
            const walletDropdownBalance = document.getElementById('walletDropdownBalance');
            
            const balanceText = `${ethBalance.toFixed(4)} ETH`;
            const usdText = `($${(ethBalance * 2847.32).toFixed(2)} USD)`;
            
            balanceElement.innerHTML = `
                <span class="balance-amount">${balanceText}</span>
                <span class="balance-usd">${usdText}</span>
            `;
            
            // Update dropdown balance
            if (walletDropdownBalance) {
                walletDropdownBalance.textContent = `${balanceText} ${usdText}`;
            }
        })
        .catch(error => {
            console.error('Error getting balance:', error);
            document.getElementById('walletBalance').textContent = 'Balance unavailable';
            const walletDropdownBalance = document.getElementById('walletDropdownBalance');
            if (walletDropdownBalance) {
                walletDropdownBalance.textContent = 'Balance unavailable';
            }
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
    const walletDropdownNetwork = document.getElementById('walletDropdownNetwork');
    
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
    
    // Update dropdown network info
    if (walletDropdownNetwork && currentNetwork) {
        walletDropdownNetwork.textContent = currentNetwork;
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
    const walletStatus = document.getElementById('walletStatus');
    
    walletInfo.style.display = 'none';
    connectBtn.style.display = 'block';
    connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
    connectBtn.disabled = false;
    
    // Hide wallet status indicator
    if (walletStatus) {
        walletStatus.style.display = 'none';
    }
    
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
    console.log('Demo wallet connection initiated');
    
    // Show demo connecting state
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Demo Mode...';
        connectBtn.disabled = true;
    }
    
    // Simulate connection delay
    setTimeout(() => {
        // Demo account data
        currentAccount = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        
        // Display demo wallet info
        displayWalletInfo(currentAccount);
        
        // Show demo notification
        showNotification('Demo wallet connected! This is for testing purposes.', 'info');
        
        // Update button
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Demo Connected';
            connectBtn.disabled = true;
        }
        
        // Show demo mode indicator
        const walletInfo = document.getElementById('walletInfo');
        if (walletInfo) {
            const demoIndicator = document.createElement('div');
            demoIndicator.innerHTML = '<span style="color: #ffa500; font-size: 0.8rem;"><i class="fas fa-exclamation-triangle"></i> Demo Mode</span>';
            demoIndicator.style.marginTop = '0.5rem';
            walletInfo.appendChild(demoIndicator);
        }
        
        // Auto-disconnect after 30 seconds in demo mode
        setTimeout(() => {
            if (currentAccount === '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6') {
                disconnectWallet();
                showNotification('Demo session ended. Connect real wallet for full functionality.', 'info');
            }
        }, 30000);
        
    }, 1500);
}

function refreshMetaMask() {
    console.log('Refreshing MetaMask connection');
    
    // Show refresh state
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn) {
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        connectBtn.disabled = true;
    }
    
    // Disconnect current connection
    disconnectWallet();
    
    // Wait a moment then try to reconnect
    setTimeout(() => {
        if (typeof window.ethereum !== 'undefined') {
            // Try to reconnect
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(accounts => {
                    if (accounts && accounts.length > 0) {
                        currentAccount = accounts[0];
                        displayWalletInfo(currentAccount);
                        showNotification('MetaMask refreshed successfully!', 'success');
                    } else {
                        showNotification('No accounts found. Please unlock MetaMask.', 'warning');
                        if (connectBtn) {
                            connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
                            connectBtn.disabled = false;
                        }
                    }
                })
                .catch(error => {
                    console.error('MetaMask refresh failed:', error);
                    showNotification('MetaMask refresh failed. Try demo mode or check MetaMask.', 'error');
                    if (connectBtn) {
                        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
                        connectBtn.disabled = false;
                    }
                });
        } else {
            showNotification('MetaMask not detected. Please install MetaMask extension.', 'error');
            if (connectBtn) {
                connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
                connectBtn.disabled = false;
            }
        }
    }, 1000);
}

// Show troubleshooting guide
function showTroubleshootingGuide() {
    const troubleshooting = `
        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
            <h4 style="color: #ffc107; margin: 0 0 0.5rem 0;">🔧 Troubleshooting Guide:</h4>
            <ul style="margin: 0; padding-left: 1.5rem; color: #666;">
                <li>Make sure MetaMask is unlocked</li>
                <li>Check if MetaMask is on the correct network</li>
                <li>Try refreshing the page</li>
                <li>Check browser console for errors</li>
                <li>Try using 127.0.0.1 instead of localhost</li>
                <li>Use Demo Mode for testing</li>
            </ul>
        </div>
    `;
    
    // Add to page
    const container = document.querySelector('.web3-section .container');
    if (container) {
        const guideDiv = document.createElement('div');
        guideDiv.innerHTML = troubleshooting;
        container.appendChild(guideDiv);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (guideDiv.parentNode) {
                guideDiv.parentNode.removeChild(guideDiv);
            }
        }, 10000);
    }
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

// Test wallet connection function
function testWalletConnection() {
    console.log('🧪 Testing wallet connection...');
    
    // Test 1: Check if ethereum object exists
    if (typeof window.ethereum !== 'undefined') {
        console.log('✅ Ethereum object found');
        
        // Test 2: Quick health check (very short timeout)
        const quickHealthCheck = async () => {
            try {
                const result = await Promise.race([
                    window.ethereum.request({ method: 'eth_accounts' }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Quick test timeout')), 500))
                ]);
                
                if (result && result.length > 0) {
                    console.log('✅ MetaMask is ready with accounts');
                    showNotification('MetaMask is ready! Click "Connect Wallet" to connect.', 'success');
                } else {
                    console.log('⚠️ MetaMask is locked');
                    showNotification('MetaMask is locked. Please unlock MetaMask.', 'warning');
                }
            } catch (error) {
                console.log('❌ MetaMask health check failed:', error.message);
                
                // Don't show error notifications for health check failures
                // Just log them and let the user try connecting manually
                console.log('🔧 MetaMask may have issues. User can try connecting manually or use Demo Mode.');
            }
        };
        
        // Run the quick health check
        quickHealthCheck();
        
    } else {
        console.log('❌ Ethereum object not found');
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

// Auto-test on page load with delay
document.addEventListener('DOMContentLoaded', () => {
    // Wait longer for MetaMask to load completely
    setTimeout(testWalletConnection, 2000);
});


// Export functions to global scope
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.copyAddress = copyAddress;
window.connectDemoWallet = connectDemoWallet;
window.refreshMetaMask = refreshMetaMask;

// Simple direct MetaMask connection (alternative approach)
function connectMetaMaskDirect() {
    console.log('🔗 Attempting direct MetaMask connection...');
    
    if (typeof window.ethereum !== 'undefined') {
        // Try the most direct approach
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                if (accounts && accounts.length > 0) {
                    currentAccount = accounts[0];
                    console.log('✅ Direct connection successful:', currentAccount);
                    
                    // Display wallet info
                    displayWalletInfo(currentAccount);
                    
                    // Update button
                    const connectBtn = document.getElementById('connectWalletBtn');
                    if (connectBtn) {
                        connectBtn.innerHTML = '<i class="fab fa-ethereum"></i> Connected';
                        connectBtn.onclick = disconnectWallet;
                        connectBtn.disabled = false;
                    }
                    
                    showNotification('Wallet connected successfully!', 'success');
                    setupWalletListeners();
                } else {
                    showNotification('No accounts found. Please unlock MetaMask.', 'warning');
                }
            })
            .catch(error => {
                console.error('❌ Direct connection failed:', error);
                showNotification('MetaMask connection failed. Try Demo Mode!', 'error');
                
                // Switch to demo mode
                const connectBtn = document.getElementById('connectWalletBtn');
                if (connectBtn) {
                    connectBtn.innerHTML = '<i class="fas fa-play"></i> Try Demo Mode';
                    connectBtn.onclick = connectDemoWallet;
                    connectBtn.disabled = false;
                }
            });
    } else {
        showNotification('MetaMask not found. Please install MetaMask extension.', 'error');
    }
}

// Expose the direct connection function globally
window.connectMetaMaskDirect = connectMetaMaskDirect;

// Generate QR code for mobile connection
function generateMobileQRCode() {
    const currentUrl = window.location.href;
    const qrData = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
    
    // Create QR code using a simple API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    const qrModal = `
        <div id="qr-modal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
            align-items: center; justify-content: center;
        ">
            <div style="
                background: #1a1a1a; border: 2px solid #00ff88; border-radius: 15px; 
                padding: 30px; text-align: center; color: white; max-width: 90%;
            ">
                <h3 style="color: #00ff88; margin-top: 0;">📱 Connect with MetaMask Mobile</h3>
                <img src="${qrUrl}" alt="QR Code" style="border: 2px solid #00ff88; border-radius: 10px; margin: 20px 0;">
                <p>1. Open MetaMask mobile app</p>
                <p>2. Tap "Scan QR Code"</p>
                <p>3. Scan this QR code</p>
                <p>4. Approve the connection</p>
                <button onclick="closeQRModal()" style="
                    background: #00ff88; color: #000; border: none; padding: 10px 20px; 
                    border-radius: 5px; cursor: pointer; margin-top: 15px;
                ">Close</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', qrModal);
}

// Close QR modal
function closeQRModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) {
        modal.remove();
    }
}

// Expose functions globally
window.generateMobileQRCode = generateMobileQRCode;
window.closeQRModal = closeQRModal;


 