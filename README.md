# MiBand Heart Rate Web

> 🌐 A pure web version of MiBand heart rate monitor based on [Tnze/miband-heart-rate](https://github.com/Tnze/miband-heart-rate)

A web-based application for reading real-time heart rate data from Xiaomi Smart Band devices using Web Bluetooth API. No installation required - just open in your browser!

**Live Demo:** Open `index.html` in Chrome/Edge browser with HTTPS

## ✨ Features

- 🔗 **Direct Browser Connection** - No app installation needed
- 💖 **Real-time Heart Rate** - Live BPM monitoring with animated display
- 📊 **Sensor Contact Detection** - Shows if the band is properly worn
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 🔄 **Auto-reconnect** - Handles connection drops gracefully
- 📱 **Mobile Friendly** - Works on mobile browsers too

## 🚀 Quick Start

1. **Enable Heart Rate Broadcast** on your MiBand:
   - Go to MiBand settings → Heart Rate → Enable "Heart Rate Broadcast"

2. **Open the web app**:
   - Serve the files over HTTPS (required for Web Bluetooth)
   - Or simply open `index.html` in Chrome/Edge

3. **Connect your device**:
   - Click "Connect to MiBand"
   - Select your device from the Bluetooth dialog
   - Start monitoring your heart rate!

## 🔧 Technical Requirements

### Browser Support
- ✅ Chrome 56+ (Windows, macOS, Linux, Android)
- ✅ Edge 79+ (Windows, macOS)
- ❌ Firefox (Web Bluetooth not supported)
- ❌ Safari (Web Bluetooth not supported)

### Connection Requirements
- 🔒 **HTTPS required** (Web Bluetooth security requirement)
- 📡 **Bluetooth 4.0+** on your computer/device
- 🏃‍♂️ **MiBand with Heart Rate Broadcast enabled**

## 📱 Supported Devices

**Tested on:**
- MiBand 10/NFC ✅

**Should work with:**
- MiBand 4, 5, 6, 7, 8, 9, 10 (all models with heart rate broadcast)

## 🛠️ Development

### Local Development Server

For local development, you need HTTPS. Use one of these methods:

```bash
# Using Python 3
python -m http.server 8000 --bind localhost

# Using Node.js (http-server)
npx http-server -p 8000 -a localhost

# Using PHP
php -S localhost:8000
```

Then access via `https://localhost:8000` (you may need to accept the self-signed certificate).

### File Structure
```
miband-heart-rate-web/
├── index.html          # Main HTML interface
├── script.js           # Web Bluetooth implementation
└── README.md          # Documentation
```

## 🔌 Web Bluetooth Implementation

This implementation replicates the Rust version's functionality using Web Bluetooth API:

- **Heart Rate Service UUID**: `0x180D`
- **Heart Rate Measurement UUID**: `0x2A37`
- **Data parsing**: Same bit-field parsing as original Rust code
- **Auto-reconnect**: Handles connection drops like the original's loop

## 🆚 Comparison with Original

| Feature | Rust Version | Web Version |
|---------|-------------|-------------|
| Platform | Windows/macOS/Linux | Any modern browser |
| Installation | Compile from source | No installation |
| Bluetooth API | bluest crate | Web Bluetooth API |
| UI | Terminal output | Beautiful web interface |
| Heart Rate Display | Text only | Animated with BPM |
| Sensor Contact | Text output | Visual indicators |
| Reconnection | Automatic loop | Auto-reconnect logic |

## 🐛 Troubleshooting

### "Web Bluetooth not supported"
- Use Chrome or Edge browser
- Ensure you're on HTTPS (not HTTP)

### "Bluetooth not available"
- Enable Bluetooth on your device
- Grant Bluetooth permissions when prompted

### "Device not found"
- Make sure MiBand heart rate broadcast is enabled
- Ensure MiBand is not connected to another app
- Try restarting Bluetooth on your device

### Connection drops frequently
- Keep MiBand close to your device
- Ensure MiBand has sufficient battery
- Close other Bluetooth apps that might interfere

## 📄 License

This project is inspired by and based on [Tnze/miband-heart-rate](https://github.com/Tnze/miband-heart-rate).

## 🤝 Contributing

Feel free to submit issues and pull requests to improve this web version!

---

**Note:** This is a web adaptation of the original Rust implementation. For the native desktop version, check out the [original repository](https://github.com/Tnze/miband-heart-rate).