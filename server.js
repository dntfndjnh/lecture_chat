const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const fs = require("fs");
const path = require("path");

// ────────────────────────────
//   환경변수에서 강의명 로드
// ────────────────────────────
let lectureName = process.env.LECTURE_NAME;
if (!lectureName || lectureName.trim() === "") {
    lectureName = "강의";
}
console.log(`📘 강의명: ${lectureName}`);

app.use(express.static("public"));

// 로그 디렉토리 생성
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

let userCount = 0;
let chatLogs = [];

// 로그 파일명 생성
const now = new Date();
const logFileName =
    `${lectureName}_` +
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_` +
    `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}_${String(now.getSeconds()).padStart(2, "0")}.txt`;

const logFilePath = path.join(logDir, logFileName);

// ────────────────────────────
//     소켓 연결
// ────────────────────────────
io.on("connection", (socket) => {
    userCount++;
    io.emit("user-count", userCount);

    // 클라이언트에게 강의명 전달
    socket.emit("lecture-name", lectureName);

    // 채팅 수신
    socket.on("chat", (msg) => {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${msg}\n`;

        chatLogs.push(logEntry);
        fs.appendFile(logFilePath, logEntry, () => {});

        io.emit("chat", { time: timestamp, message: msg });
    });

    socket.on("disconnect", () => {
        userCount--;
        io.emit("user-count", userCount);
    });
});

// ────────────────────────────
//     서버 실행
// ────────────────────────────
http.listen(3000, () => {
    console.log("서버 실행: http://localhost:3000");
});
