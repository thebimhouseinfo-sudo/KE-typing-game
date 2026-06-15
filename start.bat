@echo off
chcp 65001 > nul
title Bé Tập Gõ Phím - Khởi Động

echo ==================================================
echo   CHƯƠNG TRÌNH HỌC GÕ PHÍM CHO HỌC SINH LỚP 3
echo ==================================================
echo.

:: Kiểm tra cài đặt Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Không tìm thấy Node.js trên máy tính của bạn.
    echo Vui lòng cài đặt Node.js từ https://nodejs.org/ trước khi tiếp tục.
    echo.
    pause
    exit /b
)

:: Kiểm tra node_modules, nếu chưa cài đặt thì chạy npm install
if not exist node_modules (
    echo [THÔNG BÁO] Đang cài đặt thư viện cho dự án (lần đầu)...
    call npm install
)

echo [THÔNG BÁO] Đang khởi động máy chủ và mở trình duyệt...

:: Chạy ngầm: Chờ 3 giây để máy chủ Vite sẵn sàng rồi mở trình duyệt mặc định
start /b cmd /c "timeout /t 3 >nul && explorer "http://localhost:3000""

:: Khởi chạy ứng dụng
call npm run dev

pause
