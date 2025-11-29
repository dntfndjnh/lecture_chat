const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const fs = require("fs");
const path = require("path");

// public 폴더의 정적 파일 제공
app.use(express.static("public"));

// logs 폴더 생성
const logDir = path.join(process.cwd(), "logs");
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log("logs 폴더 생성됨");
  }
  console.log("logs 폴더 절대 경로:", logDir);
} catch (err) {
  console.error("logs 폴더 생성 실패:", err);
}

// ----------------------
// ✔ 한국 시간 반환 함수
// ----------------------
function getKST() {
  const now = new Date();
  now.setHours(now.getHours() + 9); // UTC → KST 변환
  return now.toISOString().replace("T", " ").split(".")[0]; // YYYY-MM-DD HH:MM:SS
}

// 접속자 수 저장
let userCount = 0;

// 채팅 로그 저장 배열
let chatLogs = [];

// ----------------------
// ✔ 로그 파일명도 한국시간 기준
// ----------------------
const start = new Date();
start.setHours(start.getHours() + 9); // 한국시간
const logFileName =
  `chat_` +
  `${start.getFullYear()}` +
  `${String(start.getMonth() + 1).padStart(2, "0")}` +
  `${String(start.getDate()).padStart(2, "0")}_` +
  `${String(start.getHours()).padStart(2, "0")}` +
  `${String(start.getMinutes()).padStart(2, "0")}_` +
  `${String(start.getSeconds()).padStart(2, "0")}.txt`;

const logFilePath = path.join(logDir, logFileName);

// ----------------------
// ✔ 소켓 연결
// ----------------------
io.on("connection", (socket) => {
  userCount++;
  console.log("사용자 연결됨");
  io.emit("user-count", userCount);

  // 메시지 수신
  socket.on("chat", (msg) => {
    const timestamp = getKST();
    const logEntry = `[${timestamp}] ${msg}\n`;

    chatLogs.push(logEntry);

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) console.error("로그 저장 실패:", err);
      else console.log(`로그 갱신됨: ${logFilePath}`);
    });

    // ✔ 브라우저에도 한국 시간으로 전송
    io.emit("chat", { time: timestamp, message: msg });
  });

  // 전체 로그 수동 저장 요청
  socket.on("save-log", () => {
    fs.writeFile(logFilePath, chatLogs.join(""), (err) => {
      if (err) console.error("사용자 요청 로그 저장 실패:", err);
      else console.log(`사용자 요청 로그 저장됨: ${logFilePath}`);
    });
  });

  socket.on("disconnect", () => {
    userCount--;
    console.log("사용자 연결 종료");
    io.emit("user-count", userCount);
  });
});

// ----------------------
// 서버 시작
// ----------------------
http.listen(3000, () => {
  console.log("서버 실행: http://localhost:3000");
});
