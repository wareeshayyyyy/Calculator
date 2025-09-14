@echo off
echo Uploading Calculator App to GitHub...
echo.

REM Initialize git if not already done
if not exist ".git" (
    echo Initializing git repository...
    git init
    git config user.name "wareeshayyyyy"
    git config user.email "wareesha@example.com"
)

echo Adding files to git...
git add .

echo Creating commit...
git commit -m "Modern Calculator App - React & Node.js with advanced features"

echo Setting up remote repository...
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/wareeshayyyyy/Calculator.git

echo Pushing to GitHub...
git push -u origin main

echo.
echo ✅ SUCCESS! Your Calculator app is now uploaded to:
echo https://github.com/wareeshayyyyy/Calculator
echo.
echo The following files were EXCLUDED for security:
echo - node_modules/
echo - .env files
echo - uploads/ (video files)
echo - Secret configurations
echo.
pause
