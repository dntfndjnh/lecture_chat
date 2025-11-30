@echo off
:: UTF-8 출력 설정
chcp 65001

:: 강의명 입력 받기
set /p LECTURE_NAME=강의명을 입력하세요: 

:: 로컬 로그 폴더 (실제 경로 확인)
set LOG_DIR=C:\Users\user\Desktop\lecture_chat\logs

:: Docker 컨테이너 이름
set CONTAINER_NAME=chat-server-container

:: Docker 이미지 이름
set IMAGE_NAME=chat-server

:: Docker 이미지 빌드
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

:: 기존 컨테이너가 있으면 중지/삭제 (에러 메시지 숨김)
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

:: Docker 실행
docker run -d --name %CONTAINER_NAME% -p 3000:3000 -e LECTURE_NAME="%LECTURE_NAME%" -v "%LOG_DIR%:/usr/src/app/logs" %IMAGE_NAME%

:: 안내
echo.
echo =======================================
echo 서버 실행 완료! 접속: http://localhost:3000
echo Docker 컨테이너 이름: %CONTAINER_NAME%
echo =======================================
pause
