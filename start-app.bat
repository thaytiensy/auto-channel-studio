@echo off
chcp 65001 >nul
title Auto Channel Studio - Auto MXH Video Engine

echo =======================================================
echo    Auto Channel Studio - Hệ Thống Tạo Video Auto MXH
echo =======================================================
echo.
cd /d "%~dp0"

echo [1/3] Kiểm tra dependencies...
if not exist node_modules (
    echo Đang cài đặt thư viện...
    call npm install
)

echo [2/3] Khởi chạy hệ thống toàn diện...
echo Mở trình duyệt tại http://localhost:3000/auto ...
call node scripts/start-all.mjs

pause
