@echo off
echo Sezino GitHub Push Script
echo.
if "%1"=="" (
    echo Usage: push.bat YOUR_GITHUB_TOKEN
    echo.
    echo Get a token from: https://github.com/settings/tokens
    echo.
    pause
    exit /b 1
)

powershell -Command "& { .\push.ps1 -Token '%1' }"
pause