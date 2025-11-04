@echo off
echo Starting Edge with development flags for PiP testing...
echo This will create a temporary profile for testing.
echo.

start msedge.exe --allow-running-insecure-content --disable-web-security --ignore-certificate-errors --ignore-ssl-errors --user-data-dir="%TEMP%\edge-dev-profile" http://localhost:8080

echo.
echo Edge started with development flags.
echo You can now test Picture-in-Picture functionality.
echo.
echo Note: This creates a temporary profile for testing only.
echo Your normal Edge profile and data are not affected.
echo.
pause