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
        
        // PiP state
        this.isPipActive = false;
        this.shouldRenderPip = false;
        this.showHeartIcon = true;
        this.pipCanvas = null;
        this.pipContext = null;
        this.pipRenderLoop = null;
        this.pipStream = null;
        this.pipScale = window.devicePixelRatio || 1;
        this.pipDimensions = { width: 320, height: 240 };
        
        // PiP Settings UI Elements
        this.pipSettingsPanel = document.getElementById('pipSettingsPanel');
        this.pipShowIconSetting = document.getElementById('pipShowIconSetting');
        if (this.pipShowIconSetting) {
            this.showHeartIcon = this.pipShowIconSetting.checked;
        }
        
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
        
        // Update button states when debug mode changes
        this.updateButtons();
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

    // Simplified PiP renderer powered by a high-resolution canvas
    async startSimplePipStream() {
        if (!this.pipVideo) {
            throw new Error('PiP video element not available');
        }

        // Ensure we start from a clean state
        this.stopPipStream();

        const { width, height } = this.pipDimensions;
        const dpr = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to create PiP canvas context');
        }

        this.pipCanvas = canvas;
        this.pipContext = ctx;
        this.pipScale = dpr;
        this.shouldRenderPip = true;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const stream = canvas.captureStream(30);
        this.pipStream = stream;

        this.pipVideo.muted = true;
        this.pipVideo.playsInline = true;
        this.pipVideo.srcObject = stream;

        const renderFrame = () => {
            if (!this.shouldRenderPip) {
                this.pipRenderLoop = null;
                return;
            }

            this.drawPipFrame();
            this.pipRenderLoop = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        await this.ensureVideoReady(this.pipVideo);

        try {
            await this.pipVideo.play();
            this.debugLog('PiP video playing successfully', 'success');
        } catch (playError) {
            this.debugLog(`Video play warning: ${playError.message}`, 'warning');
        }
    }

    stopPipStream() {
        this.shouldRenderPip = false;

        if (this.pipRenderLoop) {
            cancelAnimationFrame(this.pipRenderLoop);
            this.pipRenderLoop = null;
        }

        if (this.pipStream) {
            this.pipStream.getTracks().forEach(track => track.stop());
            this.pipStream = null;
        }

        if (this.pipVideo) {
            try {
                this.pipVideo.pause();
            } catch (e) {
                // Ignore pause errors on already stopped video
            }
            this.pipVideo.srcObject = null;
        }

        this.pipCanvas = null;
        this.pipContext = null;

        this.debugLog('PiP stream stopped', 'info');
    }

    async ensureVideoReady(video, timeout = 1500) {
        if (!video) {
            throw new Error('PiP video element not available');
        }

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            return;
        }

        try {
            await new Promise((resolve, reject) => {
            let done = false;
            let pollId = null;
            let timeoutId = null;

            const finish = () => {
                if (done) {
                    return;
                }
                done = true;
                clearInterval(pollId);
                clearTimeout(timeoutId);
                video.removeEventListener('loadedmetadata', finish);
                video.removeEventListener('loadeddata', finish);
                video.removeEventListener('error', fail);
                resolve();
            };

            const fail = (event) => {
                if (done) {
                    return;
                }
                done = true;
                clearInterval(pollId);
                clearTimeout(timeoutId);
                video.removeEventListener('loadedmetadata', finish);
                video.removeEventListener('loadeddata', finish);
                video.removeEventListener('error', fail);
                reject(event?.error || new Error('PiP video error'));
            };

            video.addEventListener('loadedmetadata', finish, { once: true });
            video.addEventListener('loadeddata', finish, { once: true });
            video.addEventListener('error', fail, { once: true });

            pollId = setInterval(() => {
                if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    finish();
                }
            }, 50);

            if (typeof video.requestVideoFrameCallback === 'function') {
                video.requestVideoFrameCallback(() => finish());
            }

            timeoutId = setTimeout(finish, timeout);
            });
        } catch (error) {
            this.debugLog(`PiP readiness error: ${error.message}`, 'error');
            throw error;
        }

        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            this.debugLog('PiP readiness timed out; continuing with last rendered frame', 'warning');
        }
    }

    drawPipFrame() {
        if (!this.pipContext || !this.pipCanvas) {
            return;
        }

        const ctx = this.pipContext;
        const { width, height } = this.pipDimensions;
        const dpr = this.pipScale || window.devicePixelRatio || 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#4c6ef5');
        gradient.addColorStop(1, '#7b2cbf');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        if (this.showHeartIcon) {
            this.drawHeartShape(ctx, width / 2, height / 2 - 55, 64);
        }

        const heartRate = this.heartRateElement?.textContent?.trim() || '--';
        const rateY = this.showHeartIcon ? height / 2 + 10 : height / 2;

        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 72px "Segoe UI", Arial, sans-serif';
        ctx.fillText(heartRate, width / 2, rateY);

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '500 24px "Segoe UI", Arial, sans-serif';
        ctx.fillText('BPM', width / 2, rateY + 38);
    }

    drawHeartShape(ctx, x, y, size) {
        const time = performance.now() / 1000;
        const pulse = 1 + 0.08 * Math.sin(time * 2.4);
        const scale = size / 100;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * pulse, scale * pulse);

        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.bezierCurveTo(0, -70, -60, -70, -60, -20);
        ctx.bezierCurveTo(-60, 30, 0, 70, 0, 110);
        ctx.bezierCurveTo(0, 70, 60, 30, 60, -20);
        ctx.bezierCurveTo(60, -70, 0, -70, 0, -30);
        ctx.closePath();

        ctx.fillStyle = '#ff6b6b';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 18;
        ctx.fill();

        ctx.restore();
    }

    updateHeartRate(heartRate, sensorContact = null) {
    this.heartRateElement.textContent = heartRate;
        this.heartRateUpdateCount++;
        this.lastUpdateTime = new Date().toLocaleTimeString();
        
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
        // In debug mode, allow PiP testing even when not connected
        this.pipBtn.disabled = !this.isConnected && !this.debugMode;
        
        // Show PiP settings when connected or in debug mode
        if (this.pipSettingsPanel) {
            this.pipSettingsPanel.style.display = (this.isConnected || this.debugMode) ? 'block' : 'none';
        }
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
        this.stopPipStream();
        
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
        if (!this.pipVideo) {
            this.debugLog('PiP video element not found', 'error');
            return;
        }

        this.pipVideo.addEventListener('enterpictureinpicture', () => {
            this.isPipActive = true;
            this.debugLog('Entered Picture-in-Picture mode', 'success');
        });

        this.pipVideo.addEventListener('leavepictureinpicture', () => {
            this.isPipActive = false;
            this.stopPipStream();
            this.debugLog('Left Picture-in-Picture mode', 'info');
        });

        this.pipVideo.addEventListener('error', (event) => {
            const message = event?.message || event?.error?.message || 'Unknown PiP video error';
            this.debugLog(`PiP video error: ${message}`, 'error');
        });

        this.debugLog('PiP initialized successfully', 'success');
    }

    async togglePictureInPicture() {
        this.debugLog('togglePictureInPicture called', 'info');

        if (!this.isConnected && !this.debugMode) {
            this.showError('Please connect to a device first (or enable debug mode to test)');
            this.debugLog('PiP blocked: device not connected and debug mode disabled', 'warning');
            return;
        }

        try {
            if (!document.pictureInPictureEnabled) {
                throw new Error('Picture-in-Picture is not supported');
            }

            if (document.pictureInPictureElement) {
                this.debugLog('Exiting PiP mode', 'info');
                await document.exitPictureInPicture();
                this.stopPipStream();
                return;
            }

            this.debugLog('Entering PiP mode', 'info');
            await this.startSimplePipStream();

            // Ensure at least one frame has rendered before requesting PiP
            await new Promise(resolve => requestAnimationFrame(resolve));

            await this.pipVideo.requestPictureInPicture();
            this.debugLog('PiP activated successfully', 'success');
        } catch (error) {
            this.stopPipStream();
            this.debugLog(`PiP error: ${error.message}`, 'error');
            this.showError(`Picture-in-Picture failed: ${error.message}`);
        }
    }

    togglePipHeartIcon() {
        this.showHeartIcon = !this.showHeartIcon;
        this.debugLog(`PiP heart icon: ${this.showHeartIcon ? 'shown' : 'hidden'}`, 'info');

        if (this.pipContext) {
            this.drawPipFrame();
        }
    }

    updatePipIconPreference() {
        if (!this.pipShowIconSetting) {
            return;
        }

        this.showHeartIcon = this.pipShowIconSetting.checked;
        this.debugLog(`PiP heart icon preference updated: ${this.showHeartIcon ? 'shown' : 'hidden'}`, 'info');

        if (this.pipContext) {
            this.drawPipFrame();
        }
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

// PiP Settings functions
function updatePipIconSetting() {
    monitor.updatePipIconPreference();
}

// updatePipSizeSetting removed - fixed dimensions stay in use

// Debug function to test PiP without device connection
function testPictureInPicture() {
    console.log('Testing PiP without device connection requirement');
    monitor.debugLog('Testing PiP functionality', 'info');
    
    if (!document.pictureInPictureEnabled) {
        console.error('Picture-in-Picture is not supported');
        monitor.showError('Picture-in-Picture is not supported by this browser');
        return;
    }
    
    // Temporarily override connection check
    const originalConnected = monitor.isConnected;
    monitor.isConnected = true;
    
    monitor.togglePictureInPicture().then(() => {
        console.log('PiP test completed');
    }).catch(error => {
        console.error('PiP test failed:', error);
    }).finally(() => {
        // Restore original connection state
        monitor.isConnected = originalConnected;
    });
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
        
        // Check Picture-in-Picture support and provide Edge-specific guidance
        if (!document.pictureInPictureEnabled) {
            const isEdge = navigator.userAgent.includes('Edg');
            const isHTTPS = location.protocol === 'https:';
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            
            if (isEdge && !isHTTPS && !isLocalhost) {
                monitor.debugLog('Edge detected: PiP requires HTTPS or localhost', 'warning');
                console.log('🔧 Edge PiP Debug Tips:');
                console.log('1. Enable edge://flags/#allow-insecure-localhost');
                console.log('2. Use the start-edge-dev.bat file');
                console.log('3. Deploy to GitHub Pages for HTTPS');
            }
        } else {
            monitor.debugLog('Picture-in-Picture API available', 'success');
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