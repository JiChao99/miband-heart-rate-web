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
        this.pipDisplay = document.getElementById('pipDisplay');
        this.pipDisplayIcon = document.getElementById('pipDisplayIcon');
        this.pipDisplayHeartRate = document.getElementById('pipDisplayHeartRate');
        
        // PiP state
        this.isPipActive = false;
        this.showHeartIcon = true;
        this.pipStream = null;
        
        // PiP Settings UI Elements
        this.pipSettingsPanel = document.getElementById('pipSettingsPanel');
        this.pipShowIconSetting = document.getElementById('pipShowIconSetting');
        
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

    // 全新的简单PiP实现 - 直接使用Canvas，不需要SVG转换
    async startSimplePipStream() {
        // 创建固定尺寸的Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        // 配置高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 创建流
        const stream = canvas.captureStream(30);
        
        // 存储渲染循环引用，方便停止
        this.pipRenderLoop = null;
        
        // 开始持续渲染循环
        const renderFrame = () => {
            // 只要PiP窗口存在就继续渲染
            if (!document.pictureInPictureElement) {
                this.pipRenderLoop = null;
                return;
            }
            
            // 清除画布
            ctx.clearRect(0, 0, 200, 150);
            
            // 渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 200, 150);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 200, 150);
            
            // 心率图标
            if (this.showHeartIcon) {
                ctx.font = '28px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText('❤️', 100, 60);
            }
            
            // 心率数值 - 直接从DOM元素获取最新值
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            
            // 直接从页面获取最新心率
            let heartRate = '--';
            if (this.heartRateElement && this.heartRateElement.textContent) {
                heartRate = this.heartRateElement.textContent;
            }
            
            const yPos = this.showHeartIcon ? 100 : 80;
            ctx.fillText(heartRate, 100, yPos);
            
            // BPM标签
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowColor = 'transparent';
            ctx.fillText('BPM', 100, yPos + 25);
            
            // 继续下一帧 - 这里是关键，必须持续调用
            this.pipRenderLoop = requestAnimationFrame(renderFrame);
        };
        
        // 确保video元素准备就绪
        this.pipVideo.srcObject = stream;
        
        // 等待视频元数据加载
        await new Promise((resolve, reject) => {
            this.pipVideo.addEventListener('loadedmetadata', resolve, { once: true });
            this.pipVideo.addEventListener('error', reject, { once: true });
            
            // 添加超时保护
            setTimeout(() => resolve(), 1000);
        });
        
        // 开始播放视频
        try {
            await this.pipVideo.play();
            this.debugLog('PiP video playing successfully', 'success');
        } catch (playError) {
            this.debugLog(`Video play error: ${playError.message}`, 'warning');
            // 即使播放失败也继续，因为流可能已经在工作
        }
        
        // 开始渲染循环
        this.debugLog('Starting PiP render loop', 'info');
        renderFrame();
    }
    
    stopPipStream() {
        // 停止渲染循环
        if (this.pipRenderLoop) {
            cancelAnimationFrame(this.pipRenderLoop);
            this.pipRenderLoop = null;
        }
        
        // 停止视频流
        if (this.pipVideo && this.pipVideo.srcObject) {
            const tracks = this.pipVideo.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.pipVideo.srcObject = null;
        }
        
        this.debugLog('PiP stream stopped', 'info');
    }

    updateHeartRate(heartRate, sensorContact = null) {
        this.heartRateElement.textContent = heartRate;
        this.currentHeartRate = heartRate; // 存储当前心率给PiP使用
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
        if (!this.pipVideo || !this.pipDisplay) {
            this.debugLog('PiP elements not found', 'error');
            return;
        }

        this.debugLog('PiP initialized successfully', 'success');

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

        // Handle video errors
        this.pipVideo.addEventListener('error', (e) => {
            this.debugLog(`PiP video error: ${e.message}`, 'error');
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
            } else {
                this.debugLog('Entering PiP mode', 'info');
                
                try {
                    // 使用简化的流媒体方案
                    await this.startSimplePipStream();
                    
                    // 小延迟确保视频流准备好
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    await this.pipVideo.requestPictureInPicture();
                    this.debugLog('PiP activated successfully', 'success');
                } catch (pipError) {
                    this.debugLog(`PiP setup error: ${pipError.message}`, 'error');
                    this.stopPipStream(); // 清理资源
                    throw pipError;
                }
            }
        } catch (error) {
            this.debugLog(`PiP error: ${error.message}`, 'error');
            this.showError(`Picture-in-Picture failed: ${error.message}`);
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
        
        // Get size info
        const sizes = {
            small: { width: 160, height: 120 },
            medium: { width: 200, height: 150 },
            large: { width: 240, height: 180 }
        };
        const size = sizes[this.pipSize] || sizes.small;
        
        // Clear canvas with actual pixel dimensions
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create and render SVG
        const svgContent = this.createPipSVG(size);
        this.renderSVGToCanvas(svgContent, ctx, size);
    }

    createPipSVG(size) {
        const heartRate = this.heartRateElement ? this.heartRateElement.textContent : '--';
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        
        // Scale fonts based on size
        const fontScale = size.width / 160;
        
        // Animate heart
        const time = Date.now() / 1000;
        const heartScale = 1 + 0.1 * Math.sin(time * 2);
        
        // Heart icon SVG path (optimized for small sizes)
        const heartPath = `M50 15C50 15 40 5 25 15C10 5 0 15 0 15C0 15 0 25 25 50C50 25 50 15 50 15Z`;
        
        const yOffset = this.showHeartIcon ? 12 * fontScale : 0;
        
        return `
            <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea"/>
                        <stop offset="100%" style="stop-color:#764ba2"/>
                    </linearGradient>
                    <filter id="textShadow">
                        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                </defs>
                
                <!-- Background -->
                <rect width="100%" height="100%" fill="url(#bgGradient)" rx="8"/>
                
                ${this.showHeartIcon ? `
                <!-- Heart Icon -->
                <g transform="translate(${centerX}, ${centerY - 18 * fontScale}) scale(${heartScale * fontScale * 0.5})">
                    <path d="${heartPath}" fill="#ff6b6b" transform="translate(-25, -25)"/>
                </g>
                ` : ''}
                
                <!-- Heart Rate Value -->
                <text x="${centerX}" y="${centerY + yOffset}" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      font-family="Arial, sans-serif" 
                      font-size="${Math.round(32 * fontScale)}px" 
                      font-weight="bold" 
                      fill="#ff6b6b"
                      filter="url(#textShadow)">${heartRate}</text>
                
                <!-- BPM Label -->
                <text x="${centerX}" y="${centerY + yOffset + 22 * fontScale}" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      font-family="Arial, sans-serif" 
                      font-size="${Math.round(11 * fontScale)}px" 
                      fill="#cccccc">BPM</text>
            </svg>
        `;
    }

    renderSVGToCanvas(svgContent, ctx, size) {
        const img = new Image();
        const svg = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svg);
        
        img.onload = () => {
            // Use smooth scaling for crisp rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Calculate scale for high DPI
            const dpr = window.devicePixelRatio || 1;
            ctx.drawImage(img, 0, 0, size.width * dpr, size.height * dpr);
            
            URL.revokeObjectURL(url);
        };
        
        img.onerror = () => {
            // Fallback to canvas rendering if SVG fails
            this.debugLog('SVG rendering failed, using canvas fallback', 'warning');
            this.renderPipFrameCanvas(ctx, size);
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    }

    renderPipFrameCanvas(ctx, size) {
        const heartRate = this.heartRateElement ? this.heartRateElement.textContent : '--';
        const centerX = size.width / 2;
        const centerY = size.height / 2;
        const fontScale = size.width / 160;
        const dpr = window.devicePixelRatio || 1;
        
        // Clear and draw background gradient
        ctx.clearRect(0, 0, size.width * dpr, size.height * dpr);
        const gradient = ctx.createLinearGradient(0, 0, size.width * dpr, size.height * dpr);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size.width * dpr, size.height * dpr);
        
        // Set up high quality text rendering
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw heart icon if enabled
        if (this.showHeartIcon) {
            const time = Date.now() / 1000;
            const scale = 1 + 0.1 * Math.sin(time * 2);
            
            ctx.save();
            ctx.translate(centerX * dpr, (centerY - 18 * fontScale) * dpr);
            ctx.scale(scale * dpr, scale * dpr);
            ctx.font = `${Math.round(28 * fontScale)}px Arial`;
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('💖', 0, 0);
            ctx.restore();
        }
        
        // Draw heart rate value
        const yOffset = this.showHeartIcon ? 12 * fontScale : 0;
        ctx.font = `bold ${Math.round(32 * fontScale * dpr)}px Arial`;
        ctx.fillStyle = '#ff6b6b';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3 * fontScale * dpr;
        ctx.shadowOffsetX = 1 * fontScale * dpr;
        ctx.shadowOffsetY = 1 * fontScale * dpr;
        ctx.fillText(heartRate, centerX * dpr, (centerY + yOffset) * dpr);
        
        // Draw BPM label
        ctx.shadowColor = 'transparent';
        ctx.font = `${Math.round(11 * fontScale * dpr)}px Arial`;
        ctx.fillStyle = '#cccccc';
        ctx.fillText('BPM', centerX * dpr, (centerY + yOffset + 22 * fontScale) * dpr);
    }

    togglePipHeartIcon() {
        this.showHeartIcon = !this.showHeartIcon;
        this.debugLog(`PiP heart icon: ${this.showHeartIcon ? 'shown' : 'hidden'}`, 'info');
    }

    updatePipCanvasSize() {
        if (!this.pipCanvas || !this.pipVideo) return;

        // Define size presets
        const sizes = {
            small: { width: 160, height: 120 },
            medium: { width: 200, height: 150 },
            large: { width: 240, height: 180 }
        };

        const size = sizes[this.pipSize] || sizes.small;
        
        // Set high DPI for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        this.pipCanvas.width = size.width * dpr;
        this.pipCanvas.height = size.height * dpr;
        this.pipCanvas.style.width = `${size.width}px`;
        this.pipCanvas.style.height = `${size.height}px`;
        
        // Update video size too
        this.pipVideo.style.width = `${size.width}px`;
        this.pipVideo.style.height = `${size.height}px`;
        
        // Reset and configure context for high quality rendering
        this.pipContext.resetTransform();
        this.pipContext.imageSmoothingEnabled = true;
        this.pipContext.imageSmoothingQuality = 'high';
        
        // Re-render initial frame
        this.renderPipFrame();
        
        // Update video stream
        this.setupVideoStream();

        this.debugLog(`PiP canvas resized to ${size.width}x${size.height} (${this.pipSize}) at ${dpr}x DPI`, 'info');
    }

    setupVideoStream() {
        if (!this.pipCanvas || !this.pipVideo) return;
        
        const stream = this.pipCanvas.captureStream(30); // 30 FPS
        this.pipVideo.srcObject = stream;
        
        // Set video properties
        this.pipVideo.muted = true;
        this.pipVideo.playsInline = true;
        this.pipVideo.loop = true;
    }

    updatePipSettings() {
        // Update heart icon setting
        if (this.pipShowIconSetting) {
            this.showHeartIcon = this.pipShowIconSetting.checked;
        }
        
        // Update size setting
        if (this.pipSizeSetting) {
            this.pipSize = this.pipSizeSetting.value;
            this.updatePipCanvasSize();
        }
        
        this.debugLog(`PiP settings updated: Icon=${this.showHeartIcon}, Size=${this.pipSize}`, 'info');
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
    monitor.updatePipSettings();
}

// updatePipSizeSetting 已被移除 - 使用固定尺寸

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