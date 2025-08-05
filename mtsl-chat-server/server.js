const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Socket.IO와 연결
const io = socketIo(server, {
  cors: {
    origin: "*", // 모든 origin 허용 (테스트용)
    methods: ["GET", "POST"],
    credentials: false,
  },
});

app.use(
  cors({
    origin: "*", // 모든 origin 허용 (테스트용)
  })
);

app.use(express.json());

// 대기 중인 사용자들과 활성 채팅방
let waitingUsers = [];
let activeRooms = new Map();

// 서버 상태 확인 API
app.get("/", (req, res) => {
  res.json({
    message: "🎉 MTSL 실시간 채팅 서버가 정상 작동중입니다!",
    timestamp: new Date().toLocaleString("ko-KR"),
    activeUsers: waitingUsers.length + activeRooms.size * 2,
    waitingUsers: waitingUsers.length,
    activeRooms: activeRooms.size,
    totalConnections: io.engine.clientsCount,
  });
});

// 상세 상태 확인 API (개발용)
app.get("/status", (req, res) => {
  const roomDetails = Array.from(activeRooms.entries()).map(
    ([roomId, roomData]) => ({
      roomId: roomId.substring(0, 15) + "...",
      userCount: roomData.users.length,
      createdAt: roomData.createdAt,
      duration: Math.floor((new Date() - roomData.createdAt) / 1000) + "초",
    })
  );

  res.json({
    server: "MTSL 실시간 채팅 서버",
    status: "정상 작동",
    timestamp: new Date().toLocaleString("ko-KR"),
    statistics: {
      totalConnections: io.engine.clientsCount,
      waitingUsers: waitingUsers.length,
      activeRooms: activeRooms.size,
      totalActiveUsers: waitingUsers.length + activeRooms.size * 2,
    },
    rooms: roomDetails,
    waitingQueue: waitingUsers.map((user, index) => ({
      position: index + 1,
      waitTime: Math.floor((new Date() - user.joinedAt) / 1000) + "초",
    })),
  });
});

// 실제 사용자 간 매칭 전용 서버 - 봇 기능 제거

// 보안 강화: 사용자 ID 마스킹 함수
const maskNickname = (nickname) => {
  if (!nickname || nickname.length <= 2) return "***";
  return `${nickname.substring(0, 2)}***`;
};

// 개발 모드 확인 (운영에서는 false로 설정)
const isDevelopment = process.env.NODE_ENV === "development" || false;

// 보안 로깅 함수
const secureLog = (message, sensitive = false) => {
  if (isDevelopment || !sensitive) {
    console.log(message);
  }
};

io.on("connection", (socket) => {
  secureLog(
    `✅ 사용자 연결: ${socket.id.substring(
      0,
      6
    )}*** (${new Date().toLocaleString("ko-KR")})`
  );

  // 파트너 찾기 - 실제 사용자끼리만 매칭
  socket.on("find-partner", (userData) => {
    secureLog(
      `🔍 매칭 요청: ${maskNickname(userData.nickname)} (현재 대기자: ${
        waitingUsers.length
      }명)`,
      true
    );

    if (waitingUsers.length > 0) {
      // 대기 중인 실제 사용자와 즉시 매칭
      const partner = waitingUsers.shift();
      const roomId = `room_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 방 입장
      socket.join(roomId);
      partner.socket.join(roomId);

      // 매칭 완료 알림 (isRealUser는 항상 true)
      socket.emit("partner-found", {
        roomId,
        partnerNickname: partner.nickname,
        isRealUser: true,
      });

      partner.socket.emit("partner-found", {
        roomId,
        partnerNickname: userData.nickname,
        isRealUser: true,
      });

      // 활성 방에 추가
      activeRooms.set(roomId, {
        users: [
          { id: socket.id, nickname: userData.nickname },
          { id: partner.socket.id, nickname: partner.nickname },
        ],
        createdAt: new Date(),
      });

      secureLog(
        `💕 실제 사용자 매칭 성공: ${maskNickname(
          userData.nickname
        )} ↔ ${maskNickname(partner.nickname)} (룸: ${roomId.substring(
          0,
          10
        )}...)`
      );
    } else {
      // 대기열에 추가
      socket.userData = userData;
      waitingUsers.push({
        socket: socket,
        nickname: userData.nickname,
        joinedAt: new Date(),
      });

      socket.emit("waiting-for-partner");
      secureLog(
        `⏳ 대기열 추가: ${maskNickname(userData.nickname)} (총 대기자: ${
          waitingUsers.length
        }명)`
      );

      // 주기적으로 매칭 체크 (실제 사용자끼리만)
      let matchingAttempts = 0;
      const maxAttempts = 360; // 30분 동안 5초마다 체크

      const checkForRealUsers = () => {
        matchingAttempts++;
        const userStillWaiting = waitingUsers.find(
          (user) => user.socket.id === socket.id
        );

        if (userStillWaiting) {
          // 다른 실제 사용자가 대기 중인지 확인
          const otherUsers = waitingUsers.filter(
            (user) => user.socket.id !== socket.id
          );

          secureLog(
            `🔍 매칭 체크 시도 ${matchingAttempts}/${maxAttempts}: 현재 대기자 ${waitingUsers.length}명, 다른 사용자 ${otherUsers.length}명`,
            true
          );

          if (otherUsers.length > 0) {
            // 즉시 매칭!
            const partner = otherUsers[0];

            // 대기열에서 두 사용자 모두 제거
            waitingUsers = waitingUsers.filter(
              (user) =>
                user.socket.id !== socket.id &&
                user.socket.id !== partner.socket.id
            );

            const roomId = `room_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`;

            socket.join(roomId);
            partner.socket.join(roomId);

            socket.emit("partner-found", {
              roomId,
              partnerNickname: partner.nickname,
              isRealUser: true,
            });

            partner.socket.emit("partner-found", {
              roomId,
              partnerNickname: userData.nickname,
              isRealUser: true,
            });

            activeRooms.set(roomId, {
              users: [
                { id: socket.id, nickname: userData.nickname },
                { id: partner.socket.id, nickname: partner.nickname },
              ],
              createdAt: new Date(),
            });

            secureLog(
              `🚀 지연 매칭 성공 (${matchingAttempts}번째 시도): ${maskNickname(
                userData.nickname
              )} ↔ ${maskNickname(partner.nickname)} (룸: ${roomId.substring(
                0,
                10
              )}...)`
            );
            clearInterval(matchingInterval);
            return;
          } else if (matchingAttempts >= maxAttempts) {
            // 최대 시도 횟수 도달 - 더 이상 봇 매칭하지 않음
            clearInterval(matchingInterval);
            socket.emit("matching-timeout", {
              message:
                "현재 접속한 다른 사용자가 없습니다. 잠시 후 다시 시도해주세요.",
            });

            // 대기열에서 제거
            waitingUsers = waitingUsers.filter(
              (user) => user.socket.id !== socket.id
            );
            secureLog(
              `⏰ 매칭 시간 초과: ${maskNickname(
                userData.nickname
              )} - 대기열에서 제거`,
              true
            );
          }
        } else {
          // 사용자가 더 이상 대기 중이 아님 (이미 매칭됨)
          clearInterval(matchingInterval);
          secureLog(
            `✅ 사용자가 이미 매칭됨: ${maskNickname(userData.nickname)}`,
            true
          );
        }
      };

      // 5초마다 실제 사용자 매칭 체크
      const matchingInterval = setInterval(checkForRealUsers, 5000);
    }
  });

  // 메시지 전송
  socket.on("send-message", (data) => {
    secureLog(`💬 메시지 전송 길이: ${data.text?.length || 0}자`, true);

    // 같은 방의 다른 사용자에게 메시지 전달
    socket.to(data.roomId).emit("receive-message", {
      id: Date.now().toString(),
      text: data.text,
      sender: "partner",
      timestamp: new Date(),
    });
  });

  // 타이핑 상태 전달
  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("partner-typing", {
      isTyping: data.isTyping,
    });
  });

  // 새로운 채팅 요청
  socket.on("new-chat", (data) => {
    secureLog(`🔄 새 채팅 요청: ${socket.id.substring(0, 6)}***`, true);

    // 이전 방에서 나가기
    socket.leave(data.roomId);
    socket.to(data.roomId).emit("partner-left");

    // 활성 방에서 제거
    if (activeRooms.has(data.roomId)) {
      activeRooms.delete(data.roomId);
    }

    // 다시 대기열에 추가 (userData가 있으면)
    if (socket.userData) {
      waitingUsers.push({
        socket: socket,
        nickname: socket.userData.nickname,
        joinedAt: new Date(),
      });

      socket.emit("waiting-for-partner");
      secureLog(
        `⏳ 재매칭 대기: ${maskNickname(socket.userData.nickname)}`,
        true
      );
    }
  });

  // 연결 해제
  socket.on("disconnect", () => {
    secureLog(`❌ 사용자 연결 해제: ${socket.id.substring(0, 6)}***`);

    // 대기열에서 제거
    const wasWaiting = waitingUsers.find(
      (user) => user.socket.id === socket.id
    );
    if (wasWaiting) {
      waitingUsers = waitingUsers.filter(
        (user) => user.socket.id !== socket.id
      );
      secureLog(
        `🗑️ 대기열에서 제거: ${maskNickname(
          wasWaiting.nickname
        )} (남은 대기자: ${waitingUsers.length}명)`,
        true
      );
    }

    // 활성 방에서 제거하고 상대방에게 알림
    for (let [roomId, roomData] of activeRooms) {
      const userInRoom = roomData.users.find((user) => user.id === socket.id);
      if (userInRoom) {
        // 상대방에게 파트너가 나갔다고 알림
        socket.to(roomId).emit("partner-left");

        // 방 해체
        activeRooms.delete(roomId);

        secureLog(
          `💔 방 해체: ${maskNickname(
            userInRoom.nickname
          )} 퇴장 (룸: ${roomId.substring(0, 10)}...)`,
          true
        );

        // 남은 사용자가 있다면 대기열로 돌려보내기 (자동 재매칭)
        const remainingUsers = roomData.users.filter(
          (user) => user.id !== socket.id
        );
        if (remainingUsers.length > 0) {
          const remainingUser = remainingUsers[0];
          const remainingSocket = io.sockets.sockets.get(remainingUser.id);

          if (remainingSocket && remainingSocket.userData) {
            // 남은 사용자를 대기열에 자동으로 추가
            waitingUsers.push({
              socket: remainingSocket,
              nickname: remainingUser.nickname,
              joinedAt: new Date(),
            });

            remainingSocket.emit("waiting-for-partner");

            secureLog(
              `🔄 자동 재매칭 대기열 추가: ${maskNickname(
                remainingUser.nickname
              )}`,
              true
            );
          }
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("🚀 ================================");
  console.log("🎉 MTSL 실시간 채팅 서버 시작!");
  console.log("👥 실제 사용자끼리만 매칭하는 서비스");
  console.log(`📡 포트: ${PORT}`);
  console.log(`⏰ 시작 시간: ${new Date().toLocaleString("ko-KR")}`);
  console.log("💝 완전 무료 실시간 채팅 서비스");
  console.log("🚀 ================================");
});
