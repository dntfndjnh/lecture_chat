@echo off
:: UTF-8 출력 설정
chcp 65001

:: Docker 컨테이너 이름
set CONTAINER_NAME=chat-server-container

:: 기존 컨테이너 중지/삭제 (에러 메시지 숨김)
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

:: 안내
echo.
echo =======================================
echo 서버 중지 완료!
echo Docker 컨테이너 이름: %CONTAINER_NAME%
echo =======================================
pause