# 랜덤 채팅 애플리케이션 🎯

실제 사용자들끼리만 매칭하는 익명 실시간 채팅 애플리케이션입니다.

## ✨ 주요 기능

- **닉네임 입력**: 채팅에서 사용할 닉네임 설정
- **실시간 매칭**: 실제 접속한 다른 사용자와 실시간 매칭
- **실시간 채팅**: 즉석에서 메시지 주고받기
- **타이핑 표시**: 상대방이 입력 중일 때 실시간 표시
- **새로운 매칭**: 언제든지 다른 사람과 새로운 채팅 시작
- **알림음**: 새 메시지 도착 시 사운드 알림
- **반응형 디자인**: 모바일 및 데스크톱 완벽 지원
- **로컬 저장**: 닉네임 자동 저장 기능

## 🚀 시작하기

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd MTSLchat/mtsl-chat

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 빌드

```bash
npm run build
```

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **스타일링**: Styled Components
- **상태 관리**: React Hooks
- **아이콘**: 이모지
- **반응형**: CSS Media Queries

## 📱 사용 방법

1. **닉네임 입력**: 첫 화면에서 채팅에서 사용할 닉네임을 입력합니다
2. **실시간 매칭**: 서버에서 현재 접속한 다른 실제 사용자와 자동 매칭해줍니다
3. **채팅 시작**: 매칭이 완료되면 실시간으로 메시지를 주고받을 수 있습니다
4. **새로운 채팅**: 언제든지 "새로운 채팅" 버튼을 눌러 다른 사람과 대화할 수 있습니다

**주의**: 현재 접속한 다른 사용자가 없으면 최대 30분간 대기 후 타임아웃됩니다.

## 🎨 주요 컴포넌트

- `NicknameInput`: 닉네임 입력 화면
- `WaitingScreen`: 매칭 대기 화면
- `ChatScreen`: 실시간 채팅 화면
- `realChatService`: 실시간 채팅 서버 연결 및 Socket.IO 통신 서비스

## 🔧 개발 환경

- Node.js 14+
- npm 또는 yarn
- 모던 브라우저 (Chrome, Firefox, Safari, Edge)

## 📋 향후 개선 사항

- [ ] 사용자 인증 시스템
- [ ] 채팅방 기록 저장
- [ ] 이미지/파일 전송 기능
- [ ] 차단/신고 기능
- [ ] 다국어 지원
- [ ] 사용자 통계 및 분석

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🙋‍♂️ 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해 주세요.

---

**즐거운 채팅 되세요! 💬✨**
