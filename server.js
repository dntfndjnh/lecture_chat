const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const fs = require("fs");
const path = require("path");

// public 폴더의 정적 파일 제공
app.use(express.static("public"));

// Docker 마운트 경로 기준 logs 폴더
const logDir = path.join(process.cwd(), "logs");

// logs 폴더 생성 (없으면 생성)
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log("logs 폴더 생성됨");
  }
  console.log("logs 폴더 절대 경로:", logDir);
} catch (err) {
  console.error("logs 폴더 생성 실패:", err);
}

// 접속자 수 저장
let userCount = 0;

// 채팅 로그 저장용 배열
let chatLogs = [];

// 채팅 시작 시점 기준 로그 파일 생성
const now = new Date();
const logFileName = `chat_${now.getFullYear()}${(now.getMonth()+1)
  .toString().padStart(2,"0")}${now.getDate().toString().padStart(2,"0")}_` +
  `${now.getHours().toString().padStart(2,"0")}${now.getMinutes().toString().padStart(2,"0")}_${now.getSeconds().toString().padStart(2,"0")}.txt`;
const logFilePath = path.join(logDir, logFileName);

// 소켓 연결
io.on("connection", (socket) => {
  userCount++;
  console.log("사용자 연결됨");

  // 접속자 수 전송
  io.emit("user-count", userCount);

  // 채팅 메시지 수신
  socket.on("chat", (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${msg}\n`;

    chatLogs.push(logEntry);

    // 기존 파일에 누적 저장
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) console.error("로그 저장 실패:", err);
      else console.log(`로그 갱신됨: ${logFilePath}`);
    });

    // 브라우저에 시간 포함해서 전송
    io.emit("chat", { time: timestamp, message: msg });
  });

  // 전체 로그 다운로드 요청
  socket.on("save-log", () => {
    fs.writeFile(logFilePath, chatLogs.join(""), (err) => {
      if (err) console.error("사용자 요청 로그 저장 실패:", err);
      else console.log(`사용자 요청 로그 저장됨: ${logFilePath}`);
    });
  });

  // 연결 종료
  socket.on("disconnect", () => {
    userCount--;
    console.log("사용자 연결 종료");
    io.emit("user-count", userCount);
  });
});

// 서버 포트 3000
http.listen(3000, () => {
  console.log("서버 실행: http://localhost:3000");
});
