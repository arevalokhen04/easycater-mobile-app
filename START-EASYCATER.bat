@echo off
title EasyCater Launcher
color 0E
echo ============================================
echo    EASYCATER - ONE-CLICK LAUNCHER
echo ============================================
echo.

echo [0/3] Sinisiguro na gumagana ang MongoDB service...
net start MongoDB >nul 2>&1
sc query MongoDB | findstr "RUNNING" >nul && echo       MongoDB: RUNNING OK || echo       MongoDB: HINDI TUMAKBO (bawal ang admin - pero auto-start ito pag nag-boot, kaya malamang OK na)

echo.
echo [1/3] Backend API (port 4000) - magbubukas ng bagong window...
start "EasyCater Backend" cmd /k "cd /d C:\Users\Khen\OneDrive\Desktop\cater event\EasyCater\backend-api && npm run dev"

timeout /t 6 /nobreak >nul

echo [2/3] Mobile app (port 8100) - magbubukas ng bagong window...
start "EasyCater Mobile" cmd /k "cd /d C:\Users\Khen\OneDrive\Desktop\cater event\EasyCater\mobile-app && npx @ionic/cli serve --port 8100 --no-open"

echo [3/3] Admin panel (port 8101) - magbubukas ng bagong window...
start "EasyCater Admin" cmd /k "cd /d C:\Users\Khen\OneDrive\Desktop\cater event\EasyCater\admin-panel && npx @ionic/cli serve --port 8101 --no-open"

echo.
echo ============================================
echo   HINTAYIN MAG-LOAD ANG MGA WINDOW (1-2 min)
echo ============================================
echo.
echo   MOBILE APP  : http://localhost:8100
echo   ADMIN PANEL : http://localhost:8101
echo   BACKEND OK? : http://localhost:4000/api/v1/health
echo                 (dapat may JSON na "status":"ok")
echo.
echo   PARA SA PHONE (APK):
echo     1. I-ON ang hotspot ng phone
echo     2. I-connect ang PC Wi-Fi sa hotspot ng phone
echo     3. Hindi na kailangan ng cable - gumagana na ang apps!
echo.
echo   Ang IPv4 sa baba ang IP ng PC sa hotspot:
ipconfig | findstr /C:"IPv4"
echo     (Dapat 10.151.28.131 ito - kung nag-iba, kailangan i-rebuild ang APKs)
echo.
pause
