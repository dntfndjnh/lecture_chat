const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

// public 폴더의 정적 파일 제공
app.use(express.static("public"));

// 접속자 수 저장
let userCount = 0;

// 클라이언트 접속 이벤트
io.on("connection", (socket) => {
  userCount++;
  console.log("사용자 연결됨");

  // 접속자 수를 모든 클라이언트에 전송
  io.emit("user-count", userCount);

  // 채팅 메시지 수신
  socket.on("chat", (msg) => {
    io.emit("chat", msg); // 모든 클라이언트에 메시지 전송
  });

  // 클라이언트 연결 종료
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
