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

    updateHeartRate(heartRate, sensorContact = null) {
        this.heartRateElement.textContent = heartRate;
        
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
    }

    updateDeviceInfo(name, id) {
        this.deviceNameElement.textContent = name || 'Unknown';
        this.deviceIdElement.textContent = id || 'Unknown';
        this.deviceInfoElement.style.display = 'block';
    }

    updateButtons() {
        this.connectBtn.disabled = this.isConnected;
        this.disconnectBtn.disabled = !this.isConnected;
    }

    setupHeartRateMonitoring() {
        // Remove any existing event listeners to prevent duplicates
        if (this.heartRateHandler && this.characteristic) {
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
            console.log('Requesting Bluetooth device with Heart Rate Service...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{
                    services: [HRS_UUID]
                }],
                optionalServices: []
            });

            console.log('Device selected:', this.device.name, this.device.id);
            this.updateDeviceInfo(this.device.name, this.device.id);

            // Add disconnect event listener
            this.device.addEventListener('gattserverdisconnected', () => {
                console.log('Device disconnected');
                this.handleDisconnection();
                // Start auto-reconnect process
                setTimeout(() => this.autoReconnect(), 2000);
            });

            this.updateStatus('Connecting to device...', 'scanning');

            // Connect to GATT server
            console.log('Connecting to GATT server...');
            this.server = await this.device.gatt.connect();
            
            console.log('Connected to GATT server');
            this.updateStatus('Discovering services...', 'scanning');

            // Get Heart Rate Service
            console.log('Getting Heart Rate Service...');
            this.service = await this.server.getPrimaryService(HRS_UUID);
            
            console.log('Heart Rate Service obtained');
            this.updateStatus('Getting characteristics...', 'scanning');

            // Get Heart Rate Measurement Characteristic
            console.log('Getting Heart Rate Measurement characteristic...');
            this.characteristic = await this.service.getCharacteristic(HRM_UUID);
            
            console.log('Heart Rate Measurement characteristic obtained');
            
            // Start notifications
            console.log('Starting notifications...');
            await this.characteristic.startNotifications();
            
            // Setup heart rate monitoring
            this.setupHeartRateMonitoring();

            this.isConnected = true;
            this.isMonitoring = true;
            this.updateStatus('Connected - Monitoring heart rate', 'connected');
            this.updateButtons();
            
            console.log('Successfully connected and monitoring heart rate');

        } catch (error) {
            console.error('Connection error:', error);
            this.showError(error.message);
            this.handleDisconnection();
        }
    }

    handleHeartRateData(dataView) {
        try {
            // Parse heart rate data (same logic as Rust implementation)
            const flags = dataView.getUint8(0);
            
            // Heart Rate Value Format
            let heartRateValue;
            if (flags & 0x01) {
                // 16-bit heart rate value
                heartRateValue = dataView.getUint16(1, true); // little endian
            } else {
                // 8-bit heart rate value
                heartRateValue = dataView.getUint8(1);
            }

            // Sensor Contact Supported and Status
            let sensorContact = null;
            if (flags & 0x04) {
                // Sensor Contact feature supported
                sensorContact = !!(flags & 0x02); // Sensor Contact detected
            }

            console.log(`Heart Rate: ${heartRateValue} BPM, Sensor Contact: ${sensorContact}`);
            this.updateHeartRate(heartRateValue, sensorContact);
            
        } catch (error) {
            console.error('Error parsing heart rate data:', error);
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
                
                // Try again after 5 seconds
                setTimeout(() => {
                    if (!this.isConnected && this.device) {
                        this.autoReconnect();
                    }
                }, 5000);
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
        
        // Start notifications
        await this.characteristic.startNotifications();
        
        // Setup heart rate monitoring
        this.setupHeartRateMonitoring();

        this.isConnected = true;
        this.isMonitoring = true;
        this.updateStatus('Connected - Monitoring heart rate', 'connected');
        this.updateButtons();
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('MiBand Heart Rate Monitor initialized');
    
    // Check Web Bluetooth support on load
    if (!navigator.bluetooth) {
        monitor.showError('Web Bluetooth is not supported in this browser. Please use Chrome or Edge with HTTPS.');
    }
});