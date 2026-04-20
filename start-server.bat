@echo off
chcp 65001 >nul
echo ==========================================
echo    专注小树 - 本地服务器启动器
echo ==========================================
echo.
echo 正在启动本地服务器...
echo 请稍候...
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] 使用Python启动服务器
    start http://localhost:8080/home.html
    python -m http.server 8080
    goto :end
)

:: 检查Python3是否安装
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] 使用Python3启动服务器
    start http://localhost:8080/home.html
    python3 -m http.server 8080
    goto :end
)

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] 使用Node.js启动服务器
    start http://localhost:8080/home.html
    npx serve -l 8080
    goto :end
)

echo [错误] 未检测到Python或Node.js！
echo.
echo 请安装以下任意一个：
echo 1. Python (https://www.python.org/downloads/)
echo 2. Node.js (https://nodejs.org/)
echo.
echo 或者手动使用VS Code的Live Server插件打开文件。
pause

:end
