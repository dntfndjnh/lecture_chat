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
console.log(`강의명: ${lectureName}`);

app.use(express.static("public"));

// 로그 디렉토리 생성
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// 사용자 수
let userCount = 0;

// ────────────────────────────
//   KST 변환 함수 (정확한 버전)
// ────────────────────────────
function getKSTDate() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC → KST

    const year = kst.getUTCFullYear();
    const month = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const day = String(kst.getUTCDate()).padStart(2, "0");
    const hour = String(kst.getUTCHours()).padStart(2, "0");
    const min = String(kst.getUTCMinutes()).padStart(2, "0");
    const sec = String(kst.getUTCSeconds()).padStart(2, "0");

    return { year, month, day, hour, min, sec };
}

// KST 로그 타임스탬프 (문자열 그대로 사용)
function getKSTTime() {
    return new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}

// 최초 로그 파일명 생성
const { year, month, day, hour, min, sec } = getKSTDate();
const logFileName = `${lectureName}_${year}${month}${day}_${hour}${min}_${sec}.txt`;
const logFilePath = path.join(logDir, logFileName);

// ────────────────────────────
//     소켓 서버
// ────────────────────────────
io.on("connection", (socket) => {
    userCount++;
    io.emit("user-count", userCount);

    // 강의명 보내기
    socket.emit("lecture-name", lectureName);

    // 채팅 로그 처리
    socket.on("chat", (msg) => {
        const timestamp = getKSTTime(); // KST 문자열
        const logEntry = `[${timestamp}] ${msg}\n`;

        fs.appendFile(logFilePath, logEntry, () => {});

        // 클라이언트로 보내는 시간도 문자열 그대로 유지
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
