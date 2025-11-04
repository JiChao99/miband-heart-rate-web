// Heart Rate Service and Characteristic UUIDs (same as Rust implementation)
const HRS_UUID = 0x180D; // Heart Rate Service
const HRM_UUID = 0x2A37; // Heart Rate Measurement Characteristic

class MiBandHeartRateMonitor {
    constructor() {
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        this.isConnected = false;
        this.isMonitoring = false;
        
        // Configuration constants
        this.RECONNECT_DELAY_MS = 2000;
        this.RECONNECT_RETRY_DELAY_MS = 5000;
        this.heartRateHandler = null;
        
        // Debug mode
        this.debugMode = false;
        this.debugLogEntries = [];
        this.heartRateUpdateCount = 0;
        this.lastUpdateTime = null;
        
        // UI Elements
        this.statusElement = document.getElementById('status');
        this.heartRateElement = document.getElementById('heartRateValue');
        this.sensorContactElement = document.getElementById('sensorContact');
        this.deviceInfoElement = document.getElementById('deviceInfo');
        this.deviceNameElement = document.getElementById('deviceName');
        this.deviceIdElement = document.getElementById('deviceId');
        this.errorElement = document.getElementById('errorMessage');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.pipBtn = document.getElementById('pipBtn');
        
        // Debug UI Elements
        this.debugPanel = document.getElementById('debugPanel');
        this.debugLogContent = document.getElementById('debugLogContent');
        this.debugConnectionStatus = document.getElementById('debugConnectionStatus');
        this.debugDeviceName = document.getElementById('debugDeviceName');
        this.debugServiceStatus = document.getElementById('debugServiceStatus');
        this.debugHeartRateCount = document.getElementById('debugHeartRateCount');
        this.debugLastUpdate = document.getElementById('debugLastUpdate');

        // Picture-in-Picture Elements
        this.pipVideo = document.getElementById('pipVideo');
        this.pipCanvas = document.getElementById('pipCanvas');
        this.pipContext = this.pipCanvas.getContext('2d');
        
        // PiP state
        this.isPipActive = false;
        this.showHeartIcon = true;
        this.animationFrameId = null;
        
        // Initialize PiP functionality
        this.initializePip();
    }

    updateStatus(message, className = 'disconnected') {
        this.statusElement.textContent = `Status: ${message}`;
        this.statusElement.className = `status ${className}`;
    }

    showError(message) {
        // Use textContent to prevent XSS vulnerabilities
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        const strongElement = document.createElement('strong');
        strongElement.textContent = 'Error: ';
        errorDiv.appendChild(strongElement);
        errorDiv.appendChild(document.createTextNode(message));
        
        this.errorElement.replaceChildren(errorDiv);
        console.error('MiBand Error:', message);
    }

    clearError() {
        this.errorElement.replaceChildren();
    }

    // Debug functionality
    debugLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        
        this.debugLogEntries.push(logEntry);
        
        // Keep only last 100 entries
        if (this.debugLogEntries.length > 100) {
            this.debugLogEntries.shift();
        }
        
        // Update UI if debug mode is enabled
        if (this.debugMode && this.debugLogContent) {
            this.updateDebugLogDisplay();
        }
        
        // Also log to console
        console.log(`[${timestamp}] ${message}`);
    }

    updateDebugLogDisplay() {
        if (!this.debugLogContent) return;
        
        const logHtml = this.debugLogEntries.map(entry => 
            `<div class="debug-entry ${entry.type}">[${entry.timestamp}] ${entry.message}</div>`
        ).join('');
        
        this.debugLogContent.innerHTML = logHtml;
        // Auto-scroll to bottom
        this.debugLogContent.scrollTop = this.debugLogContent.scrollHeight;
    }

    updateDebugStats() {
        if (!this.debugMode) return;
        
        if (this.debugConnectionStatus) {
            this.debugConnectionStatus.textContent = this.isConnected ? 'Connected' : 'Disconnected';
        }
        if (this.debugDeviceName) {
            this.debugDeviceName.textContent = this.device?.name || 'None';
        }
        if (this.debugServiceStatus) {
            let status = 'Not connected';
            if (this.server && this.server.connected) {
                status = this.service ? 'Service discovered' : 'GATT connected';
            }
            this.debugServiceStatus.textContent = status;
        }
        if (this.debugHeartRateCount) {
            this.debugHeartRateCount.textContent = this.heartRateUpdateCount;
        }
        if (this.debugLastUpdate) {
            this.debugLastUpdate.textContent = this.lastUpdateTime || 'Never';
        }
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugPanel) {
            this.debugPanel.style.display = this.debugMode ? 'block' : 'none';
        }
        
        if (this.debugMode) {
            this.debugLog('Debug mode enabled', 'success');
            this.updateDebugStats();
            this.updateDebugLogDisplay();
        } else {
            console.log('Debug mode disabled');
        }
    }

    clearDebugLog() {
        this.debugLogEntries = [];
        this.heartRateUpdateCount = 0;
        this.lastUpdateTime = null;
        if (this.debugLogContent) {
            this.debugLogContent.innerHTML = '';
        }
        this.updateDebugStats();
        this.debugLog('Debug log cleared', 'warning');
    }

    updateHeartRate(heartRate, sensorContact = null) {
        this.heartRateElement.textContent = heartRate;
        this.heartRateUpdateCount++;
        this.lastUpdateTime = new Date().toLocaleTimeString();
        
        // Update PiP display if active
        if (this.isPipActive && this.pipHeartRate) {
            this.pipHeartRate.textContent = heartRate;
        }
        
        if (sensorContact !== null) {
            this.sensorContactElement.style.display = 'block';
            if (sensorContact) {
                this.sensorContactElement.textContent = 'Sensor Contact: Detected';
                this.sensorContactElement.className = 'sensor-contact detected';
            } else {
                this.sensorContactElement.textContent = 'Sensor Contact: Not Detected';
                this.sensorContactElement.className = 'sensor-contact not-detected';
            }
        } else {
            this.sensorContactElement.style.display = 'none';
        }
        
        // Debug logging
        this.debugLog(`Heart Rate: ${heartRate} BPM, Sensor Contact: ${sensorContact}`, 'success');
        this.updateDebugStats();
    }

    updateDeviceInfo(name, id) {
        this.deviceNameElement.textContent = name || 'Unknown';
        this.deviceIdElement.textContent = id || 'Unknown';
        this.deviceInfoElement.style.display = 'block';
    }

    updateButtons() {
        this.connectBtn.disabled = this.isConnected;
        this.disconnectBtn.disabled = !this.isConnected;
        this.pipBtn.disabled = !this.isConnected;
    }

    setupHeartRateMonitoring() {
        // Remove any existing event listeners to prevent duplicates
        if (this.characteristic && this.heartRateHandler) {
            this.characteristic.removeEventListener('characteristicvaluechanged', this.heartRateHandler);
        }
        
        // Create bound handler for proper cleanup
        this.heartRateHandler = (event) => {
            this.handleHeartRateData(event.target.value);
        };
        
        // Add event listener for heart rate data
        this.characteristic.addEventListener('characteristicvaluechanged', this.heartRateHandler);
    }



    async checkWebBluetoothSupport() {
        if (!navigator.bluetooth) {
            throw new Error('Web Bluetooth is not supported in this browser. Please use Chrome or Edge with HTTPS.');
        }
        
        const available = await navigator.bluetooth.getAvailability();
        if (!available) {
            throw new Error('Bluetooth is not available on this device.');
        }
    }

    async connectToDevice() {
        try {
            this.clearError();
            await this.checkWebBluetoothSupport();

            this.updateStatus('Scanning for devices...', 'scanning');

            // Request device with Heart Rate Service
            this.debugLog('Requesting Bluetooth device with Heart Rate Service...', 'info');
            
            const requestOptions = {
                filters: [{
                    services: [HRS_UUID]
                }],
                optionalServices: []
            };
            
            this.device = await navigator.bluetooth.requestDevice(requestOptions);

            this.debugLog(`Device selected: ${this.device.name} (${this.device.id})`, 'success');
            this.updateDeviceInfo(this.device.name, this.device.id);

            // Add disconnect event listener
            this.device.addEventListener('gattserverdisconnected', () => {
                this.debugLog('Device disconnected', 'warning');
                this.handleDisconnection();
                // Start auto-reconnect process
                setTimeout(() => {
                    try {
                        this.autoReconnect();
                    } catch (error) {
                        this.debugLog(`Auto-reconnect initiation failed: ${error.message}`, 'error');
                    }
                }, this.RECONNECT_DELAY_MS);
            });

            this.updateStatus('Connecting to device...', 'scanning');

            // Connect to GATT server
            this.debugLog('Connecting to GATT server...', 'info');
            this.server = await this.device.gatt.connect();
            
            this.debugLog('Connected to GATT server', 'success');
            this.updateStatus('Discovering services...', 'scanning');



            // Get Heart Rate Service
            this.debugLog('Getting Heart Rate Service...', 'info');
            this.service = await this.server.getPrimaryService(HRS_UUID);
            this.debugLog('Heart Rate Service obtained', 'success');
            
            this.updateStatus('Getting characteristics...', 'scanning');

            // Get Heart Rate Measurement Characteristic
            this.debugLog('Getting Heart Rate Measurement characteristic...', 'info');
            this.characteristic = await this.service.getCharacteristic(HRM_UUID);
            this.debugLog('Heart Rate Measurement characteristic obtained', 'success');
            
            // Setup heart rate monitoring BEFORE starting notifications
            this.setupHeartRateMonitoring();
            
            // Start notifications
            this.debugLog('Starting notifications...', 'info');
            await this.characteristic.startNotifications();

            this.isConnected = true;
            this.isMonitoring = true;
            this.updateStatus('Connected - Monitoring heart rate', 'connected');
            this.updateButtons();
            this.updateDebugStats();
            
            this.debugLog('Successfully connected and monitoring heart rate', 'success');

        } catch (error) {
            this.debugLog(`Connection error: ${error.message}`, 'error');
            this.showError(error.message);
            this.handleDisconnection();
        }
    }

    handleHeartRateData(dataView) {
        try {
            // Validate that we have data
            if (!dataView || dataView.byteLength === 0) {
                this.debugLog('Received empty heart rate data', 'warning');
                return;
            }
            
            // Parse heart rate data (same logic as Rust implementation)
            const flags = dataView.getUint8(0);
            
            // Heart Rate Value Format
            let heartRateValue;
            if (flags & 0x01) {
                // 16-bit heart rate value
                if (dataView.byteLength < 3) {
                    this.debugLog('Insufficient data for 16-bit heart rate value', 'error');
                    return;
                }
                heartRateValue = dataView.getUint16(1, true); // little endian
            } else {
                // 8-bit heart rate value
                if (dataView.byteLength < 2) {
                    this.debugLog('Insufficient data for 8-bit heart rate value', 'error');
                    return;
                }
                heartRateValue = dataView.getUint8(1);
            }

            // Sensor Contact Supported and Status
            let sensorContact = null;
            if (flags & 0x04) {
                // Sensor Contact feature supported
                sensorContact = !!(flags & 0x02); // Sensor Contact detected
            }

            // Data parsing details for debug
            this.debugLog(`Raw data: flags=0x${flags.toString(16)}, HR=${heartRateValue}, SC=${sensorContact}`, 'info');
            
            // Validate heart rate value
            if (heartRateValue === 0) {
                this.debugLog('Received heart rate value of 0 (device may be initializing)', 'warning');
            }
            
            this.updateHeartRate(heartRateValue, sensorContact);
            
        } catch (error) {
            this.debugLog(`Error parsing heart rate data: ${error.message}`, 'error');
            this.showError('Error parsing heart rate data: ' + error.message);
        }
    }

    async disconnectDevice() {
        try {
            this.clearError();
            
            if (this.characteristic && this.isMonitoring) {
                console.log('Stopping notifications...');
                await this.characteristic.stopNotifications();
            }
            
            if (this.server && this.server.connected) {
                console.log('Disconnecting from GATT server...');
                this.server.disconnect();
            }
            
        } catch (error) {
            console.error('Disconnect error:', error);
            this.showError('Error during disconnect: ' + error.message);
        } finally {
            this.handleDisconnection();
        }
    }

    handleDisconnection() {
        // Clean up event listeners
        if (this.characteristic && this.heartRateHandler) {
            this.characteristic.removeEventListener('characteristicvaluechanged', this.heartRateHandler);
            this.heartRateHandler = null;
        }
        
        this.device = null;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        this.isConnected = false;
        this.isMonitoring = false;
        
        this.updateStatus('Not connected', 'disconnected');
        this.updateHeartRate('--');
        this.sensorContactElement.style.display = 'none';
        this.deviceInfoElement.style.display = 'none';
        this.updateButtons();
        
        // Close PiP if active
        if (this.isPipActive && document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(error => {
                console.error('Error exiting PiP:', error);
            });
        }
        
        console.log('Disconnection handled');
    }

    // Auto-reconnect functionality (like the Rust version's loop)
    async autoReconnect() {
        if (!this.isConnected && this.device) {
            console.log('Attempting auto-reconnect...');
            this.updateStatus('Reconnecting...', 'scanning');
            
            try {
                await this.connectToExistingDevice();
            } catch (error) {
                console.error('Auto-reconnect failed:', error);
                this.showError('Auto-reconnect failed: ' + error.message);
                
                // Try again after configured delay
                setTimeout(() => {
                    if (!this.isConnected && this.device) {
                        this.autoReconnect();
                    }
                }, this.RECONNECT_RETRY_DELAY_MS);
            }
        }
    }

    async connectToExistingDevice() {
        if (!this.device) {
            throw new Error('No device selected');
        }

        // Connect to GATT server
        this.server = await this.device.gatt.connect();
        
        // Get Heart Rate Service
        this.service = await this.server.getPrimaryService(HRS_UUID);
        
        // Get Heart Rate Measurement Characteristic
        this.characteristic = await this.service.getCharacteristic(HRM_UUID);
        
        // Setup heart rate monitoring BEFORE starting notifications
        this.setupHeartRateMonitoring();
        
        // Start notifications
        await this.characteristic.startNotifications();

        this.isConnected = true;
        this.isMonitoring = true;
        this.updateStatus('Connected - Monitoring heart rate', 'connected');
        this.updateButtons();
    }

    // Picture-in-Picture functionality using standard API
    initializePip() {
        if (!this.pipVideo || !this.pipCanvas) return;

        // Set up canvas size
        this.pipCanvas.width = 320;
        this.pipCanvas.height = 240;

        // Set up video stream from canvas
        const stream = this.pipCanvas.captureStream(30); // 30 FPS
        this.pipVideo.srcObject = stream;

        // Handle PiP events
        this.pipVideo.addEventListener('enterpictureinpicture', () => {
            this.isPipActive = true;
            this.startPipRendering();
            this.debugLog('Entered Picture-in-Picture mode', 'success');
        });

        this.pipVideo.addEventListener('leavepictureinpicture', () => {
            this.isPipActive = false;
            this.stopPipRendering();
            this.debugLog('Left Picture-in-Picture mode', 'info');
        });
    }

    async togglePictureInPicture() {
        if (!this.isConnected) {
            this.showError('Please connect to a device first');
            return;
        }

        try {
            if (!document.pictureInPictureEnabled) {
                throw new Error('Picture-in-Picture is not supported by this browser');
            }

            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                // Start playing the video first
                await this.pipVideo.play();
                // Request Picture-in-Picture
                await this.pipVideo.requestPictureInPicture();
            }
        } catch (error) {
            this.debugLog(`PiP error: ${error.message}`, 'error');
            this.showError(`Picture-in-Picture error: ${error.message}`);
        }
    }

    startPipRendering() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const render = () => {
            if (!this.isPipActive) return;

            this.renderPipFrame();
            this.animationFrameId = requestAnimationFrame(render);
        };

        render();
    }

    stopPipRendering() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    renderPipFrame() {
        const ctx = this.pipContext;
        const canvas = this.pipCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw status indicator (rounded rectangle)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(15, 15, 120, 24, 12) : ctx.rect(15, 15, 120, 24);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('Heart Rate Monitor', 25, 32);

        // Get current heart rate
        const heartRate = this.heartRateElement ? this.heartRateElement.textContent : '--';
        
        // Calculate center position
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw heart icon if enabled
        if (this.showHeartIcon) {
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Animate heart (simple scale effect)
            const time = Date.now() / 1000;
            const scale = 1 + 0.1 * Math.sin(time * 2); // 2 beats per second
            
            ctx.save();
            ctx.translate(centerX, centerY - 30);
            ctx.scale(scale, scale);
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('💖', 0, 0);
            ctx.restore();
        }

        // Draw heart rate value
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ff6b6b';
        
        // Add text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        const yOffset = this.showHeartIcon ? 20 : 0;
        ctx.fillText(heartRate, centerX, centerY + yOffset);

        // Draw BPM label
        ctx.shadowColor = 'transparent';
        ctx.font = '18px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText('BPM', centerX, centerY + yOffset + 35);
    }

    togglePipHeartIcon() {
        this.showHeartIcon = !this.showHeartIcon;
        this.debugLog(`PiP heart icon: ${this.showHeartIcon ? 'shown' : 'hidden'}`, 'info');
    }
}

// Global instance
const monitor = new MiBandHeartRateMonitor();

// Global functions for button onclick handlers
async function connectToDevice() {
    await monitor.connectToDevice();
}

async function disconnectDevice() {
    await monitor.disconnectDevice();
}

function toggleDebugMode() {
    monitor.toggleDebugMode();
}

function clearDebugLog() {
    monitor.clearDebugLog();
}

// Picture-in-Picture global functions
function togglePictureInPicture() {
    monitor.togglePictureInPicture();
}

function togglePipHeartIcon() {
    monitor.togglePipHeartIcon();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Use setTimeout to ensure all methods are available
    setTimeout(() => {
        monitor.debugLog('MiBand Heart Rate Monitor initialized', 'success');
        
        // Check Web Bluetooth support on load
        if (!navigator.bluetooth) {
            monitor.showError('Web Bluetooth is not supported in this browser. Please use Chrome or Edge with HTTPS.');
            monitor.debugLog('Web Bluetooth not supported in this browser', 'error');
        } else {
            monitor.debugLog('Web Bluetooth API available', 'success');
        }
    }, 100);
});

// Keyboard shortcuts for PiP
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'p' && monitor.isConnected) {
        e.preventDefault();
        monitor.togglePictureInPicture();
    }
    if (e.ctrlKey && e.key === 'h' && monitor.isPipActive) {
        e.preventDefault();
        monitor.togglePipHeartIcon();
    }
});