// Heart Rate Service and Characteristic UUIDs (same as Rust implementation)
const HRS_UUID = 0x180D; // Heart Rate Service
const HRM_UUID = 0x2A37; // Heart Rate Measurement Characteristic

// Internationalization System
const translations = {
    zh: {
        title: "🏃‍♂️ 小米手环心率监控",
        heartRateMonitor: "小米手环心率监控",
    bpm: "次/分",
        statusPrefix: "状态",
        statusNotConnected: "未连接",
        statusScanning: "扫描设备中...",
        statusConnecting: "连接中...",
        statusDiscovering: "发现服务中...",
        statusGettingCharacteristics: "获取特征中...",
        statusConnected: "已连接 - 正在监测心率",
        statusReconnecting: "重连中...",
        device: "设备",
        deviceId: "设备ID",
        sensorContactDetected: "传感器接触: 已检测到",
        sensorContactNotDetected: "传感器接触: 未检测到",
        sensorContactUnknown: "传感器接触: 未知",
        connectBtn: "🔗 连接小米手环",
        disconnectBtn: "🔌 断开连接",
        pipBtn: "📺 画中画模式",
        debugBtn: "🔧 调试模式",
        pipSettingsTitle: "📺 画中画设置",
        pipShowIconSetting: "在画中画窗口中显示心形图标",
        debugTitle: "🔧 调试信息",
        debugClear: "清除日志",
        debugConnectionStatus: "连接状态",
        debugDeviceName: "设备名称",
        debugServiceStatus: "服务状态",
        debugHeartRateUpdates: "心率更新次数",
        debugLastUpdate: "最后更新",
        debugStatusDisconnected: "已断开",
        debugStatusConnected: "已连接",
        debugStatusNotConnected: "未连接",
        debugStatusServiceDiscovered: "服务已发现",
        debugStatusGattConnected: "GATT已连接",
        debugDeviceNameNone: "无",
        debugLastUpdateNever: "从未",
        debugLog: "调试日志",
        errorPrefix: "错误: ",
        errorWebBluetoothNotSupported: "此浏览器不支持Web蓝牙。请使用Chrome或Edge浏览器并确保使用HTTPS。",
        errorBluetoothNotAvailable: "此设备上蓝牙不可用。",
        errorConnectFirst: "请先连接设备（或启用调试模式进行测试）",
        errorPipNotSupported: "不支持画中画功能",
        errorPipFailed: "画中画失败: ",
        errorNoDevice: "未选择设备",
        errorDisconnect: "断开连接时出错: ",
        errorParsingHeartRate: "解析心率数据时出错: ",
        errorEmptyHeartRateData: "收到空的心率数据",
        errorInsufficientData16bit: "16位心率值数据不足",
        errorInsufficientData8bit: "8位心率值数据不足",
        errorPipVideoNotAvailable: "画中画视频元素不可用",
        errorPipCanvasContext: "无法创建画中画画布上下文",
        errorPipVideoError: "画中画视频错误",
        errorAutoReconnectFailed: "自动重连失败: ",
        errorAutoReconnectInitFailed: "自动重连启动失败: ",
        warningHeartRateZero: "收到心率值为0（设备可能正在初始化）",
        warningPipReadinessTimeout: "画中画就绪超时；继续使用最后渲染的帧",
        warningVideoPlay: "视频播放警告: ",
        infoRequestingDevice: "正在请求具有心率服务的蓝牙设备...",
        infoDeviceSelected: "设备已选择",
        infoConnectingGatt: "连接到GATT服务器...",
        infoGattConnected: "已连接到GATT服务器",
        infoGettingService: "获取心率服务...",
        infoServiceObtained: "心率服务已获取",
        infoGettingCharacteristic: "获取心率测量特征...",
        infoCharacteristicObtained: "心率测量特征已获取",
        infoStartingNotifications: "启动通知...",
        infoConnectedSuccess: "成功连接并开始监测心率",
        infoDeviceDisconnected: "设备已断开连接",
        infoAttemptingReconnect: "尝试自动重连...",
        infoStoppingNotifications: "停止通知...",
        infoDisconnectingGatt: "断开GATT服务器连接...",
        infoDisconnectionHandled: "断开连接已处理",
        infoPipInitialized: "画中画初始化成功",
        infoPipEntered: "进入画中画模式",
        infoPipLeft: "离开画中画模式",
        infoPipActivated: "画中画激活成功",
        infoPipVideoPlaying: "画中画视频播放成功",
        infoPipStreamStopped: "画中画流已停止",
        infoPipExiting: "退出画中画模式",
        infoPipEntering: "进入画中画模式",
        infoTogglePipCalled: "togglePictureInPicture 已调用",
        infoPipBlocked: "画中画被阻止：设备未连接且调试模式已禁用",
        infoMibandInitialized: "小米手环心率监控已初始化",
        infoWebBluetoothAvailable: "Web蓝牙API可用",
        infoEdgeDetected: "检测到Edge浏览器：画中画需要HTTPS或localhost",
        infoPipApiAvailable: "画中画API可用",
        infoDebugModeEnabled: "调试模式已启用",
        infoDebugModeDisabled: "调试模式已禁用",
        infoPipHeartIcon: "画中画心形图标",
        infoPipIconShown: "显示",
        infoPipIconHidden: "隐藏",
        infoPipIconPreferenceUpdated: "画中画心形图标首选项已更新",
        infoTestingPipFunctionality: "测试画中画功能",
        infoPipTestCompleted: "画中画测试完成",
        infoPipTestFailed: "画中画测试失败",
        infoRawDataParsing: "原始数据",
        infoHeartRate: "心率",
        infoDebugLogCleared: "调试日志已清除",
        languageToggle: "🌐 English",
        unknown: "未知",
        themeECG: "ECG心电图",
        themeCyber: "赛博",
        themeGlass: "玻璃拟态",
        themeSport: "运动环",
        themePixel: "像素复古"
    ,themeDarkGlass: "暗黑玻璃"
    ,themeVaporwave: "蒸汽波"
    },
    en: {
        title: "🏃‍♂️ MiBand Heart Rate Monitor",
        heartRateMonitor: "MiBand Heart Rate Monitor",
        bpm: "BPM",
        statusPrefix: "Status",
        statusNotConnected: "Not connected",
        statusScanning: "Scanning for devices...",
        statusConnecting: "Connecting to device...",
        statusDiscovering: "Discovering services...",
        statusGettingCharacteristics: "Getting characteristics...",
        statusConnected: "Connected - Monitoring heart rate",
        statusReconnecting: "Reconnecting...",
        device: "Device",
        deviceId: "Device ID",
        sensorContactDetected: "Sensor Contact: Detected",
        sensorContactNotDetected: "Sensor Contact: Not Detected",
        sensorContactUnknown: "Sensor Contact: Unknown",
        connectBtn: "🔗 Connect to MiBand",
        disconnectBtn: "🔌 Disconnect",
        pipBtn: "📺 Picture-in-Picture",
        debugBtn: "🔧 Debug Mode",
        pipSettingsTitle: "📺 Picture-in-Picture Settings",
        pipShowIconSetting: "Show heart icon in PiP window",
        debugTitle: "🔧 Debug Information",
        debugClear: "Clear Log",
        debugConnectionStatus: "Connection Status",
        debugDeviceName: "Device Name",
        debugServiceStatus: "Service Status",
        debugHeartRateUpdates: "Heart Rate Updates",
        debugLastUpdate: "Last Update",
        debugStatusDisconnected: "Disconnected",
        debugStatusConnected: "Connected",
        debugStatusNotConnected: "Not connected",
        debugStatusServiceDiscovered: "Service discovered",
        debugStatusGattConnected: "GATT connected",
        debugDeviceNameNone: "None",
        debugLastUpdateNever: "Never",
        debugLog: "Debug Log",
        errorPrefix: "Error: ",
        errorWebBluetoothNotSupported: "Web Bluetooth is not supported in this browser. Please use Chrome or Edge with HTTPS.",
        errorBluetoothNotAvailable: "Bluetooth is not available on this device.",
        errorConnectFirst: "Please connect to a device first (or enable debug mode to test)",
        errorPipNotSupported: "Picture-in-Picture is not supported",
        errorPipFailed: "Picture-in-Picture failed: ",
        errorNoDevice: "No device selected",
        errorDisconnect: "Error during disconnect: ",
        errorParsingHeartRate: "Error parsing heart rate data: ",
        errorEmptyHeartRateData: "Received empty heart rate data",
        errorInsufficientData16bit: "Insufficient data for 16-bit heart rate value",
        errorInsufficientData8bit: "Insufficient data for 8-bit heart rate value",
        errorPipVideoNotAvailable: "PiP video element not available",
        errorPipCanvasContext: "Unable to create PiP canvas context",
        errorPipVideoError: "PiP video error",
        errorAutoReconnectFailed: "Auto-reconnect failed: ",
        errorAutoReconnectInitFailed: "Auto-reconnect initiation failed: ",
        warningHeartRateZero: "Received heart rate value of 0 (device may be initializing)",
        warningPipReadinessTimeout: "PiP readiness timed out; continuing with last rendered frame",
        warningVideoPlay: "Video play warning: ",
        infoRequestingDevice: "Requesting Bluetooth device with Heart Rate Service...",
        infoDeviceSelected: "Device selected",
        infoConnectingGatt: "Connecting to GATT server...",
        infoGattConnected: "Connected to GATT server",
        infoGettingService: "Getting Heart Rate Service...",
        infoServiceObtained: "Heart Rate Service obtained",
        infoGettingCharacteristic: "Getting Heart Rate Measurement characteristic...",
        infoCharacteristicObtained: "Heart Rate Measurement characteristic obtained",
        infoStartingNotifications: "Starting notifications...",
        infoConnectedSuccess: "Successfully connected and monitoring heart rate",
        infoDeviceDisconnected: "Device disconnected",
        infoAttemptingReconnect: "Attempting auto-reconnect...",
        infoStoppingNotifications: "Stopping notifications...",
        infoDisconnectingGatt: "Disconnecting from GATT server...",
        infoDisconnectionHandled: "Disconnection handled",
        infoPipInitialized: "PiP initialized successfully",
        infoPipEntered: "Entered Picture-in-Picture mode",
        infoPipLeft: "Left Picture-in-Picture mode",
        infoPipActivated: "PiP activated successfully",
        infoPipVideoPlaying: "PiP video playing successfully",
        infoPipStreamStopped: "PiP stream stopped",
        infoPipExiting: "Exiting PiP mode",
        infoPipEntering: "Entering PiP mode",
        infoTogglePipCalled: "togglePictureInPicture called",
        infoPipBlocked: "PiP blocked: device not connected and debug mode disabled",
        infoMibandInitialized: "MiBand Heart Rate Monitor initialized",
        infoWebBluetoothAvailable: "Web Bluetooth API available",
        infoEdgeDetected: "Edge detected: PiP requires HTTPS or localhost",
        infoPipApiAvailable: "Picture-in-Picture API available",
        infoDebugModeEnabled: "Debug mode enabled",
        infoDebugModeDisabled: "Debug mode disabled",
        infoPipHeartIcon: "PiP heart icon",
        infoPipIconShown: "shown",
        infoPipIconHidden: "hidden",
        infoPipIconPreferenceUpdated: "PiP heart icon preference updated",
        infoTestingPipFunctionality: "Testing PiP functionality",
        infoPipTestCompleted: "PiP test completed",
        infoPipTestFailed: "PiP test failed",
        infoRawDataParsing: "Raw data",
        infoHeartRate: "Heart Rate",
        infoDebugLogCleared: "Debug log cleared",
        languageToggle: "🌐 中文",
        unknown: "Unknown",
        themeECG: "ECG",
        themeCyber: "Cyber",
        themeGlass: "Glass",
        themeSport: "Sport Ring",
        themePixel: "Pixel Retro"
    ,themeDarkGlass: "Dark Glass"
    ,themeVaporwave: "Vaporwave"
    }
};

// Language Management System
class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectBrowserLanguage();
        this.loadLanguagePreference();
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.languages[0];
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    }

    loadLanguagePreference() {
        const saved = localStorage.getItem('miband-language');
        if (saved && translations[saved]) {
            this.currentLanguage = saved;
        }
    }

    saveLanguagePreference() {
        localStorage.setItem('miband-language', this.currentLanguage);
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            this.saveLanguagePreference();
            this.updateUI();
        }
    }

    toggleLanguage() {
        this.setLanguage(this.currentLanguage === 'zh' ? 'en' : 'zh');
    }

    t(key, fallback = null) {
        const translation = translations[this.currentLanguage]?.[key];
        return translation || fallback || key;
    }

    updateUI() {
        // Update page title
        document.title = this.t('title');
        
        // Update main heading
        const mainHeading = document.querySelector('h1');
        if (mainHeading) {
            mainHeading.textContent = this.t('heartRateMonitor');
        }

        // Update BPM text (explicit element for reliability)
        const bpmUnitEl = document.getElementById('bpmUnit');
        if (bpmUnitEl) bpmUnitEl.textContent = this.t('bpm');

        // Update buttons
        this.updateButtonTexts();
        
        // Update static text elements
        this.updateStaticElements();

        // Update status and other dynamic content
        this.updateDynamicContent();

        // Update language toggle button
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.textContent = this.t('languageToggle');
        }
        // Update theme buttons
        this.updateThemeButtons();
    }

    updateButtonTexts() {
        const buttons = {
            'connectBtn': 'connectBtn',
            'disconnectBtn': 'disconnectBtn',
            'pipBtn': 'pipBtn',
            'debugToggle': 'debugBtn'
        };

        Object.entries(buttons).forEach(([id, key]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.textContent = this.t(key);
            }
        });
    }

    updateStaticElements() {
        // Update PiP settings
        const pipTitle = document.querySelector('#pipSettingsPanel h3');
        if (pipTitle) {
            pipTitle.textContent = this.t('pipSettingsTitle');
        }

        const pipIconLabel = document.querySelector('label span');
        if (pipIconLabel && pipIconLabel.textContent.includes('Show heart icon')) {
            pipIconLabel.textContent = this.t('pipShowIconSetting');
        }

        // Update debug panel
        const debugTitle = document.querySelector('#debugPanel h3');
        if (debugTitle) {
            debugTitle.textContent = this.t('debugTitle');
        }

        const debugClearBtn = document.querySelector('.debug-clear');
        if (debugClearBtn) {
            debugClearBtn.textContent = this.t('debugClear');
        }

        // Update debug stats labels
        this.updateDebugLabels();
    }

    updateDebugLabels() {
        const debugStats = document.getElementById('debugStats');
        if (debugStats) {
            const labels = [
                { selector: 'div:nth-child(1) strong', key: 'debugConnectionStatus' },
                { selector: 'div:nth-child(2) strong', key: 'debugDeviceName' },
                { selector: 'div:nth-child(3) strong', key: 'debugServiceStatus' },
                { selector: 'div:nth-child(4) strong', key: 'debugHeartRateUpdates' },
                { selector: 'div:nth-child(5) strong', key: 'debugLastUpdate' }
            ];

            labels.forEach(({ selector, key }) => {
                const element = debugStats.querySelector(selector);
                if (element) {
                    element.textContent = this.t(key) + ':';
                }
            });
        }

        const debugLogTitle = document.querySelector('.debug-log h4');
        if (debugLogTitle) {
            debugLogTitle.textContent = this.t('debugLog') + ':';
        }
    }

    updateDynamicContent() {
        // This will be called by monitor when status changes
        if (window.monitor) {
            monitor.updateUITexts();
        }
    }

    updateThemeButtons(){
        const container = document.getElementById('themeSwitcher');
        if(!container) return;
        const map = {
            ecg: 'themeECG',
            cyber: 'themeCyber',
            glass: 'themeGlass',
            sport: 'themeSport',
            pixel: 'themePixel',
            darkglass: 'themeDarkGlass',
            vaporwave: 'themeVaporwave'
        };
        container.querySelectorAll('button[data-theme]').forEach(btn => {
            const key = map[btn.dataset.theme];
            if(key) btn.textContent = this.t(key);
        });
    }
}

// Global language manager instance
const languageManager = new LanguageManager();

// Theme Manager for multi-style rendering
class ThemeManager {
    constructor() {
    this.supported = ['ecg','cyber','glass','sport','pixel','darkglass','vaporwave'];
        this.current = this.loadTheme();
        this.applyTheme(this.current);
    }
    loadTheme() {
        const saved = localStorage.getItem('miband-theme');
        if (saved && this.supported.includes(saved)) return saved;
        return 'ecg';
    }
    applyTheme(theme) {
        if (!this.supported.includes(theme)) return;
        this.current = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('miband-theme', theme);
        this.updateActiveButton();
    }
    updateActiveButton() {
        const container = document.getElementById('themeSwitcher');
        if (!container) return;
        container.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.current);
        });
    }
}

const themeManager = new ThemeManager();

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
    // Heart rate history for waveform / analytics
    this.heartRateHistory = [];
    this.maxHistory = 240; // approx 240 samples (adjust as needed)

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
        this.statusElement.textContent = `${languageManager.t('statusPrefix', 'Status')}: ${message}`;
        this.statusElement.className = `status ${className}`;
    }

    showError(message) {
        // Use textContent to prevent XSS vulnerabilities
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        const strongElement = document.createElement('strong');
        strongElement.textContent = languageManager.t('errorPrefix');
        errorDiv.appendChild(strongElement);
        errorDiv.appendChild(document.createTextNode(message));

        this.errorElement.replaceChildren(errorDiv);
        console.error('MiBand Error:', message);
    }

    updateUITexts() {
        // Update status if currently shown
        if (this.statusElement) {
            const currentText = this.statusElement.textContent;
            if (currentText.includes('Not connected') || currentText.includes('未连接')) {
                this.updateStatus(languageManager.t('statusNotConnected'), 'disconnected');
            } else if (currentText.includes('Connected') || currentText.includes('已连接')) {
                this.updateStatus(languageManager.t('statusConnected'), 'connected');
            }
        }

        // Update device info labels
        if (this.deviceInfoElement && this.deviceInfoElement.style.display !== 'none') {
            const deviceName = this.deviceNameElement?.textContent || languageManager.t('unknown');
            const deviceId = this.deviceIdElement?.textContent || languageManager.t('unknown');
            this.deviceInfoElement.innerHTML = `
                <strong>${languageManager.t('device')}:</strong> <span id="deviceName">${deviceName}</span><br>
                <strong>${languageManager.t('deviceId')}:</strong> <span id="deviceId">${deviceId}</span>
            `;
            // Restore element references
            this.deviceNameElement = document.getElementById('deviceName');
            this.deviceIdElement = document.getElementById('deviceId');
        }
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
            this.debugConnectionStatus.textContent = this.isConnected ? languageManager.t('debugStatusConnected') : languageManager.t('debugStatusDisconnected');
        }
        if (this.debugDeviceName) {
            this.debugDeviceName.textContent = this.device?.name || languageManager.t('debugDeviceNameNone');
        }
        if (this.debugServiceStatus) {
            let status = languageManager.t('debugStatusNotConnected');
            if (this.server && this.server.connected) {
                status = this.service ? languageManager.t('debugStatusServiceDiscovered') : languageManager.t('debugStatusGattConnected');
            }
            this.debugServiceStatus.textContent = status;
        }
        if (this.debugHeartRateCount) {
            this.debugHeartRateCount.textContent = this.heartRateUpdateCount;
        }
        if (this.debugLastUpdate) {
            this.debugLastUpdate.textContent = this.lastUpdateTime || languageManager.t('debugLastUpdateNever');
        }
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;

        if (this.debugPanel) {
            this.debugPanel.style.display = this.debugMode ? 'block' : 'none';
        }

        if (this.debugMode) {
            this.debugLog(languageManager.t('infoDebugModeEnabled'), 'success');
            this.updateDebugStats();
            this.updateDebugLogDisplay();
        } else {
            console.log(languageManager.t('infoDebugModeDisabled'));
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
        this.debugLog(languageManager.t('infoDebugLogCleared'), 'warning');
    }

    // Simplified PiP renderer powered by a high-resolution canvas
    async startSimplePipStream() {
        if (!this.pipVideo) {
            throw new Error(languageManager.t('errorPipVideoNotAvailable'));
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
            throw new Error(languageManager.t('errorPipCanvasContext'));
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
            this.debugLog(languageManager.t('infoPipVideoPlaying'), 'success');
        } catch (playError) {
            this.debugLog(`${languageManager.t('warningVideoPlay')} ${playError.message}`, 'warning');
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

        this.debugLog(languageManager.t('infoPipStreamStopped'), 'info');
    }

    async ensureVideoReady(video, timeout = 1500) {
        if (!video) {
            throw new Error(languageManager.t('errorPipVideoNotAvailable'));
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
                    reject(event?.error || new Error(languageManager.t('errorPipVideoError')));
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
            this.debugLog(`${languageManager.t('errorPipVideoError')}: ${error.message}`, 'error');
            throw error;
        }

        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            this.debugLog(languageManager.t('warningPipReadinessTimeout'), 'warning');
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
    const theme = themeManager.current;
    const smallScale = width/320; // adapt drawing for small PiP sizes
        const hr = this.heartRateElement?.textContent?.trim() || '--';
        const numericHR = parseInt(hr,10);

        // Background per theme
        if (theme === 'ecg') {
            ctx.fillStyle = '#0a1014';
            ctx.fillRect(0,0,width,height);
            // grid
            ctx.strokeStyle = '#18232c';
            ctx.lineWidth = 1 * smallScale;
            ctx.globalAlpha = 0.25;
            const step = 20 * smallScale;
            for(let x=0;x<width;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
            for(let y=0;y<height;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
            ctx.globalAlpha = 1;
        } else if (theme === 'cyber') {
            const g = ctx.createLinearGradient(0,0,width,height);
            g.addColorStop(0,'#04151b'); g.addColorStop(1,'#061e29');
            ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
            // subtle scan lines
            ctx.globalAlpha = .18; ctx.fillStyle = '#06d9ff33';
            const spacing = Math.max(2, Math.round(3 * smallScale));
            for(let y=0;y<height;y+=spacing){ctx.fillRect(0,y,width,1);} ctx.globalAlpha=1;
            // glow border
            ctx.strokeStyle = '#06d9ff55'; ctx.lineWidth = 3 * smallScale; ctx.strokeRect(1,1,width-2,height-2);
        } else if (theme === 'glass') {
            const g = ctx.createLinearGradient(0,0,width,height);
            g.addColorStop(0,'#e8eef3'); g.addColorStop(1,'#f5f9fc');
            ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
        } else if (theme === 'darkglass') {
            const g = ctx.createLinearGradient(0,0,width,height);
            g.addColorStop(0,'#0d1117'); g.addColorStop(1,'#17202a');
            ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
            // frosted panel
            ctx.fillStyle = '#ffffff10';
            const panelW = width*0.75, panelH = height*0.55;
            // roundRect polyfill fallback
            if (typeof ctx.roundRect !== 'function') {
                const rx = 12*smallScale;
                const x = (width-panelW)/2, y = (height-panelH)/2;
                const w = panelW, h = panelH;
                ctx.beginPath();
                ctx.moveTo(x+rx,y);
                ctx.lineTo(x+w-rx,y);
                ctx.quadraticCurveTo(x+w,y,x+w,y+rx);
                ctx.lineTo(x+w,y+h-rx);
                ctx.quadraticCurveTo(x+w,y+h,x+w-rx,y+h);
                ctx.lineTo(x+rx,y+h);
                ctx.quadraticCurveTo(x,y+h,x,y+h-rx);
                ctx.lineTo(x,y+rx);
                ctx.quadraticCurveTo(x,y,x+rx,y);
                ctx.closePath();
            } else {
                ctx.roundRect((width-panelW)/2,(height-panelH)/2,panelW,panelH,12*smallScale);
            }
            ctx.fill();
            ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 2*smallScale; ctx.stroke();
        } else if (theme === 'sport') {
            ctx.fillStyle = '#0f1115'; ctx.fillRect(0,0,width,height);
        } else if (theme === 'pixel') {
            ctx.fillStyle = '#1b1f23'; ctx.fillRect(0,0,width,height);
        } else if (theme === 'vaporwave') {
            const g = ctx.createLinearGradient(0,0,width,height);
            g.addColorStop(0,'#ff9a9e'); g.addColorStop(.4,'#fad0c4'); g.addColorStop(.75,'#8e54e9'); g.addColorStop(1,'#2c82c9');
            ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
            // pastel grid
            ctx.globalAlpha=.22; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1*smallScale;
            const gridStep=24*smallScale;
            for(let x=0;x<width;x+=gridStep){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
            for(let y=0;y<height;y+=gridStep){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
            ctx.globalAlpha=1;
        } else { // fallback
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4c6ef5');
            gradient.addColorStop(1, '#7b2cbf');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        const accent = getComputedStyle(document.body).getPropertyValue('--accent') || '#ff6b6b';
        const fg = getComputedStyle(document.body).getPropertyValue('--fg') || '#ffffff';

        // Waveform for ecg & cyber
        if(['ecg','cyber','vaporwave'].includes(theme) && this.heartRateHistory.length > 1){
            const minHR = 40, maxHR = 200;
            ctx.lineWidth = (theme==='cyber'?2.2:2) * smallScale + (smallScale<1?0.5:0);
            ctx.strokeStyle = accent.trim();
            ctx.beginPath();
            const len = this.heartRateHistory.length;
            for(let i=0;i<len;i++){
                const v = this.heartRateHistory[i];
                const norm = (v - minHR)/(maxHR - minHR);
                const x = i * (width/(this.maxHistory-1));
                const y = height - norm*height;
                if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            }
            ctx.stroke();
            // glow
            ctx.shadowColor = accent.trim();
            ctx.shadowBlur = 12;
        }

        // Sport ring
        if(theme==='sport' && !isNaN(numericHR)){
            const pct = Math.min(numericHR/200,1);
            const radius = Math.min(width,height)/2 - 20;
            const cx = width/2, cy = height/2 - 10;
            ctx.lineWidth = 18;
            ctx.strokeStyle = '#333';
            ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.stroke();
            ctx.strokeStyle = accent.trim();
            ctx.beginPath(); ctx.arc(cx,cy,radius,-Math.PI/2, -Math.PI/2 + pct*Math.PI*2); ctx.stroke();
        }

        // Heart rate number
    let baseSize = 72 * smallScale;
    if(theme==='pixel') baseSize = 54 * smallScale;
    if(theme==='ecg') baseSize = 64 * smallScale;
    if(theme==='sport') baseSize = 60 * smallScale;
    if(theme==='vaporwave') baseSize = 66 * smallScale;
    if(theme==='darkglass') baseSize = 68 * smallScale;
    const fontMain = (theme==='pixel'? 'bold ' + Math.round(baseSize) + 'px "Press Start 2P", monospace'
              : (theme==='ecg'? '600 ' + Math.round(baseSize) + 'px JetBrains Mono, monospace'
              : '600 ' + Math.round(baseSize) + 'px "Segoe UI", Arial, sans-serif'));
        const rateY = height/2 + (theme==='sport'?0:10);
        ctx.shadowColor = theme==='glass'? 'rgba(0,0,0,0.15)': 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = theme==='pixel'?0:20;
        ctx.fillStyle = fg.trim();
        ctx.font = fontMain;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(hr, width/2, rateY);
        ctx.shadowBlur = 0;
        ctx.fillStyle = theme==='glass'? '#1e2a36' : 'rgba(255,255,255,0.85)';
    const subSize = theme==='pixel'? 16*smallScale : 24*smallScale;
    ctx.font = theme==='pixel'? 'bold ' + Math.round(subSize) + 'px "Press Start 2P", monospace' : '500 ' + Math.round(subSize) + 'px JetBrains Mono, Arial, sans-serif';
    ctx.fillText(languageManager.t('bpm'), width/2, rateY + (theme==='pixel'? (34*smallScale) : (38*smallScale)));
    }

    updateHeartRate(heartRate, sensorContact = null) {
        this.heartRateElement.textContent = heartRate;
        this.heartRateUpdateCount++;
        this.lastUpdateTime = new Date().toLocaleTimeString();
        const n = parseInt(heartRate,10);
        if(!isNaN(n)) {
            this.heartRateHistory.push(n);
            if(this.heartRateHistory.length > this.maxHistory) this.heartRateHistory.shift();
        }

        if (sensorContact !== null) {
            this.sensorContactElement.style.display = 'block';
            if (sensorContact) {
                this.sensorContactElement.textContent = languageManager.t('sensorContactDetected');
                this.sensorContactElement.className = 'sensor-contact detected';
            } else {
                this.sensorContactElement.textContent = languageManager.t('sensorContactNotDetected');
                this.sensorContactElement.className = 'sensor-contact not-detected';
            }
        } else {
            this.sensorContactElement.style.display = 'none';
        }

        // Debug logging
        this.debugLog(`${languageManager.t('infoHeartRate')}: ${heartRate} ${languageManager.t('bpm')}, ${languageManager.t('sensorContactUnknown').split(':')[0]}: ${sensorContact}`, 'success');
        this.updateDebugStats();
    }

    updateDeviceInfo(name, id) {
        this.deviceNameElement.textContent = name || languageManager.t('unknown');
        this.deviceIdElement.textContent = id || languageManager.t('unknown');
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
            throw new Error(languageManager.t('errorWebBluetoothNotSupported'));
        }

        const available = await navigator.bluetooth.getAvailability();
        if (!available) {
            throw new Error(languageManager.t('errorBluetoothNotAvailable'));
        }
    }

    async connectToDevice() {
        try {
            this.clearError();
            await this.checkWebBluetoothSupport();

            this.updateStatus(languageManager.t('statusScanning'), 'scanning');

            // Request device with Heart Rate Service
            this.debugLog(languageManager.t('infoRequestingDevice'), 'info');

            const requestOptions = {
                filters: [{
                    services: [HRS_UUID]
                }],
                optionalServices: []
            };

            this.device = await navigator.bluetooth.requestDevice(requestOptions);

            this.debugLog(`${languageManager.t('infoDeviceSelected')}: ${this.device.name} (${this.device.id})`, 'success');
            this.updateDeviceInfo(this.device.name, this.device.id);

            // Add disconnect event listener
            this.device.addEventListener('gattserverdisconnected', () => {
                this.debugLog(languageManager.t('infoDeviceDisconnected'), 'warning');
                this.handleDisconnection();
                // Start auto-reconnect process
                setTimeout(() => {
                    try {
                        this.autoReconnect();
                    } catch (error) {
                        this.debugLog(`${languageManager.t('errorAutoReconnectInitFailed')}: ${error.message}`, 'error');
                    }
                }, this.RECONNECT_DELAY_MS);
            });

            this.updateStatus(languageManager.t('statusConnecting'), 'scanning');

            // Connect to GATT server
            this.debugLog(languageManager.t('infoConnectingGatt'), 'info');
            this.server = await this.device.gatt.connect();

            this.debugLog(languageManager.t('infoGattConnected'), 'success');
            this.updateStatus(languageManager.t('statusDiscovering'), 'scanning');

            // Get Heart Rate Service
            this.debugLog(languageManager.t('infoGettingService'), 'info');
            this.service = await this.server.getPrimaryService(HRS_UUID);
            this.debugLog(languageManager.t('infoServiceObtained'), 'success');

            this.updateStatus(languageManager.t('statusGettingCharacteristics'), 'scanning');

            // Get Heart Rate Measurement Characteristic
            this.debugLog(languageManager.t('infoGettingCharacteristic'), 'info');
            this.characteristic = await this.service.getCharacteristic(HRM_UUID);
            this.debugLog(languageManager.t('infoCharacteristicObtained'), 'success');

            // Setup heart rate monitoring BEFORE starting notifications
            this.setupHeartRateMonitoring();

            // Start notifications
            this.debugLog(languageManager.t('infoStartingNotifications'), 'info');
            await this.characteristic.startNotifications();

            this.isConnected = true;
            this.isMonitoring = true;
            this.updateStatus(languageManager.t('statusConnected'), 'connected');
            this.updateButtons();
            this.updateDebugStats();

            this.debugLog(languageManager.t('infoConnectedSuccess'), 'success');

        } catch (error) {
            this.debugLog(`${languageManager.t('errorPrefix').slice(0, -2)}: ${error.message}`, 'error');
            this.showError(error.message);
            this.handleDisconnection();
        }
    }

    handleHeartRateData(dataView) {
        try {
            // Validate that we have data
            if (!dataView || dataView.byteLength === 0) {
                this.debugLog(languageManager.t('errorEmptyHeartRateData'), 'warning');
                return;
            }

            // Parse heart rate data (same logic as Rust implementation)
            const flags = dataView.getUint8(0);

            // Heart Rate Value Format
            let heartRateValue;
            if (flags & 0x01) {
                // 16-bit heart rate value
                if (dataView.byteLength < 3) {
                    this.debugLog(languageManager.t('errorInsufficientData16bit'), 'error');
                    return;
                }
                heartRateValue = dataView.getUint16(1, true); // little endian
            } else {
                // 8-bit heart rate value
                if (dataView.byteLength < 2) {
                    this.debugLog(languageManager.t('errorInsufficientData8bit'), 'error');
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
            this.debugLog(`${languageManager.t('infoRawDataParsing')}: flags=0x${flags.toString(16)}, HR=${heartRateValue}, SC=${sensorContact}`, 'info');

            // Validate heart rate value
            if (heartRateValue === 0) {
                this.debugLog(languageManager.t('warningHeartRateZero'), 'warning');
            }

            this.updateHeartRate(heartRateValue, sensorContact);

        } catch (error) {
            this.debugLog(`${languageManager.t('errorParsingHeartRate')} ${error.message}`, 'error');
            this.showError(languageManager.t('errorParsingHeartRate') + error.message);
        }
    }

    async disconnectDevice() {
        try {
            this.clearError();

            if (this.characteristic && this.isMonitoring) {
                console.log(languageManager.t('infoStoppingNotifications'));
                await this.characteristic.stopNotifications();
            }

            if (this.server && this.server.connected) {
                console.log(languageManager.t('infoDisconnectingGatt'));
                this.server.disconnect();
            }

        } catch (error) {
            console.error('Disconnect error:', error);
            this.showError(languageManager.t('errorDisconnect') + error.message);
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

        this.updateStatus(languageManager.t('statusNotConnected'), 'disconnected');
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

        console.log(languageManager.t('infoDisconnectionHandled'));
    }

    // Auto-reconnect functionality (like the Rust version's loop)
    async autoReconnect() {
        if (!this.isConnected && this.device) {
            console.log(languageManager.t('infoAttemptingReconnect'));
            this.updateStatus(languageManager.t('statusReconnecting'), 'scanning');

            try {
                await this.connectToExistingDevice();
            } catch (error) {
                console.error('Auto-reconnect failed:', error);
                this.showError(languageManager.t('errorAutoReconnectFailed') + error.message);

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
            throw new Error(languageManager.t('errorNoDevice'));
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
        this.updateStatus(languageManager.t('statusConnected'), 'connected');
        this.updateButtons();
    }

    // Picture-in-Picture functionality using standard API
    initializePip() {
        if (!this.pipVideo) {
            this.debugLog(languageManager.t('errorPipVideoNotAvailable'), 'error');
            return;
        }

        this.pipVideo.addEventListener('enterpictureinpicture', () => {
            this.isPipActive = true;
            this.debugLog(languageManager.t('infoPipEntered'), 'success');
        });

        this.pipVideo.addEventListener('leavepictureinpicture', () => {
            this.isPipActive = false;
            this.stopPipStream();
            this.debugLog(languageManager.t('infoPipLeft'), 'info');
        });

        this.pipVideo.addEventListener('error', (event) => {
            const message = event?.message || event?.error?.message || languageManager.t('errorPipVideoError');
            this.debugLog(`${languageManager.t('errorPipVideoError')}: ${message}`, 'error');
        });

        this.debugLog(languageManager.t('infoPipInitialized'), 'success');
    }

    async togglePictureInPicture() {
        this.debugLog(languageManager.t('infoTogglePipCalled'), 'info');

        if (!this.isConnected && !this.debugMode) {
            this.showError(languageManager.t('errorConnectFirst'));
            this.debugLog(languageManager.t('infoPipBlocked'), 'warning');
            return;
        }

        try {
            if (!document.pictureInPictureEnabled) {
                throw new Error(languageManager.t('errorPipNotSupported'));
            }

            if (document.pictureInPictureElement) {
                this.debugLog(languageManager.t('infoPipExiting'), 'info');
                await document.exitPictureInPicture();
                this.stopPipStream();
                return;
            }

            this.debugLog(languageManager.t('infoPipEntering'), 'info');
            await this.startSimplePipStream();

            // Ensure at least one frame has rendered before requesting PiP
            await new Promise(resolve => requestAnimationFrame(resolve));

            await this.pipVideo.requestPictureInPicture();
            this.debugLog(languageManager.t('infoPipActivated'), 'success');
        } catch (error) {
            this.stopPipStream();
            this.debugLog(`${languageManager.t('errorPipFailed')}: ${error.message}`, 'error');
            this.showError(`${languageManager.t('errorPipFailed')} ${error.message}`);
        }
    }

    togglePipHeartIcon() {
        this.showHeartIcon = !this.showHeartIcon;
        this.debugLog(`${languageManager.t('infoPipHeartIcon')}: ${this.showHeartIcon ? languageManager.t('infoPipIconShown') : languageManager.t('infoPipIconHidden')}`, 'info');

        if (this.pipContext) {
            this.drawPipFrame();
        }
    }

    updatePipIconPreference() {
        if (!this.pipShowIconSetting) {
            return;
        }

        this.showHeartIcon = this.pipShowIconSetting.checked;
        this.debugLog(`${languageManager.t('infoPipIconPreferenceUpdated')}: ${this.showHeartIcon ? languageManager.t('infoPipIconShown') : languageManager.t('infoPipIconHidden')}`, 'info');

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

// Language toggle function
function toggleLanguage() {
    languageManager.toggleLanguage();
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
    console.log(languageManager.t('infoTestingPipFunctionality'));
    monitor.debugLog(languageManager.t('infoTestingPipFunctionality'), 'info');

    if (!document.pictureInPictureEnabled) {
        console.error(languageManager.t('errorPipNotSupported'));
        monitor.showError(languageManager.t('errorPipNotSupported'));
        return;
    }

    // Temporarily override connection check
    const originalConnected = monitor.isConnected;
    monitor.isConnected = true;

    monitor.togglePictureInPicture().then(() => {
        console.log(languageManager.t('infoPipTestCompleted'));
    }).catch(error => {
        console.error(languageManager.t('infoPipTestFailed'), error);
    }).finally(() => {
        // Restore original connection state
        monitor.isConnected = originalConnected;
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize language system first
    languageManager.updateUI();
    // Theme switcher binding
    const ts = document.getElementById('themeSwitcher');
    if(ts){
        ts.addEventListener('click', e=>{
            const btn = e.target.closest('button[data-theme]');
            if(!btn) return;
            themeManager.applyTheme(btn.dataset.theme);
            // Redraw PiP frame if active
            if(monitor.pipContext) monitor.drawPipFrame();
        });
        themeManager.updateActiveButton();
    }
    
    // Use setTimeout to ensure all methods are available
    setTimeout(() => {
        monitor.debugLog(languageManager.t('infoMibandInitialized'), 'success');

        // Check Web Bluetooth support on load
        if (!navigator.bluetooth) {
            monitor.showError(languageManager.t('errorWebBluetoothNotSupported'));
            monitor.debugLog(languageManager.t('errorWebBluetoothNotSupported'), 'error');
        } else {
            monitor.debugLog(languageManager.t('infoWebBluetoothAvailable'), 'success');
        }

        // Check Picture-in-Picture support and provide Edge-specific guidance
        if (!document.pictureInPictureEnabled) {
            const isEdge = navigator.userAgent.includes('Edg');
            const isHTTPS = location.protocol === 'https:';
            const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

            if (isEdge && !isHTTPS && !isLocalhost) {
                monitor.debugLog(languageManager.t('infoEdgeDetected'), 'warning');
                console.log('🔧 Edge PiP Debug Tips:');
                console.log('1. Enable edge://flags/#allow-insecure-localhost');
                console.log('2. Use the start-edge-dev.bat file');
                console.log('3. Deploy to GitHub Pages for HTTPS');
            }
        } else {
            monitor.debugLog(languageManager.t('infoPipApiAvailable'), 'success');
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
    // Theme quick shortcuts Ctrl+1..5
    if(e.ctrlKey && ['1','2','3','4','5'].includes(e.key)){
        const idxMap = { '1':'ecg','2':'cyber','3':'glass','4':'sport','5':'pixel' };
        themeManager.applyTheme(idxMap[e.key]);
        if(monitor.pipContext) monitor.drawPipFrame();
    }
});