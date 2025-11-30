@echo off
:: =======================================
:: Lecture Chat Server 실행 배치 파일
:: =======================================

:: UTF-8 출력 설정
chcp 65001 >nul

:: 강의명 입력
set /p LECTURE_NAME=강의명을 입력하세요: 

:: 로컬 로그 폴더 (존재하지 않으면 생성)
set LOG_DIR=C:\Users\user\Desktop\lecture_chat\logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Docker 컨테이너/이미지 이름
set CONTAINER_NAME=chat-server-container
set IMAGE_NAME=chat-server

:: Docker 존재 확인
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker가 설치되어 있지 않습니다. 설치 후 다시 시도하세요.
    pause
    exit /b
)

:: 이미지 존재 여부 확인
for /f %%i in ('docker images -q %IMAGE_NAME%') do set IMAGE_EXISTS=1
if "%IMAGE_EXISTS%"=="1" (
    echo =======================================
    echo Docker 이미지 "%IMAGE_NAME%" 가 이미 존재합니다. 빌드 건너뜀
    echo =======================================
) else (
    echo =======================================
    echo Docker 이미지 빌드 중...
    docker build -t %IMAGE_NAME% .
    if errorlevel 1 (
        echo 이미지 빌드 실패!
        pause
        exit /b
    )
    echo Docker 이미지 빌드 완료!
    echo =======================================
)

:: 기존 컨테이너가 있으면 중지/삭제
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

:: 컨테이너 실행
docker run -d --name %CONTAINER_NAME% -p 3000:3000 -e LECTURE_NAME="%LECTURE_NAME%" -v "%LOG_DIR%:/usr/src/app/logs" %IMAGE_NAME%

:: 안내
echo.
echo =======================================
echo 서버 실행 완료!
echo 접속 주소: http://localhost:3000
echo Docker 컨테이너 이름: %CONTAINER_NAME%
echo 로그 폴더: %LOG_DIR%
echo =======================================
pause
