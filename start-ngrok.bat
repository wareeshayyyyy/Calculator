@echo off
echo Starting Calculator Media App with ngrok...
echo.

REM Check if ngrok exists
if not exist "ngrok.exe" (
    echo Downloading ngrok...
    powershell -Command "Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip'; Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force; Remove-Item 'ngrok.zip'"
    echo ngrok downloaded successfully!
    echo.
)

REM Start services
echo Starting server...
start "Server" cmd /c "cd server && npm start"
timeout /t 3 /nobreak >nul

echo Starting client...
start "Client" cmd /c "cd client && npm start"
timeout /t 5 /nobreak >nul

echo Starting ngrok tunnel...
echo.
echo ==========================================
echo   HTTPS URLs will appear below:
echo ==========================================
echo.

ngrok http 3000

pause
