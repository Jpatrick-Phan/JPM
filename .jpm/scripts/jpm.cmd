@echo off
setlocal

REM Attempt to find Git Bash first to avoid WSL issues
if exist "C:\Program Files\Git\bin\bash.exe" (
    set "BASH_CMD=C:\Program Files\Git\bin\bash.exe"
) else if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    set "BASH_CMD=C:\Program Files (x86)\Git\bin\bash.exe"
) else (
    REM Fallback to system bash (might be WSL)
    set "BASH_CMD=bash"
)

"%BASH_CMD%" "%~dp0jpm.sh" %*
