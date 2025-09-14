@echo off
echo ========================================
echo   DEPLOYING TO RAILWAY
echo   Perfect for Live Video Streaming!
echo ========================================
echo.

echo Step 1: Installing Railway CLI...
npm install -g @railway/cli

echo.
echo Step 2: Logging into Railway...
echo Please follow the browser login prompts...
railway login

echo.
echo Step 3: Deploying your Calculator app...
railway deploy

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Calculator app is now live at:
echo https://your-app.railway.app
echo.
echo SHARE WITH FRIEND:
echo https://your-app.railway.app
echo.
echo YOUR MONITORING DASHBOARD:
echo https://your-app.railway.app?monitor=true
echo.
echo ✅ Live video streaming works!
echo ✅ Friend can access from anywhere!
echo ✅ You can monitor her video in real-time!
echo.
pause
