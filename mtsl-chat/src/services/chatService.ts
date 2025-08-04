import { v4 as uuidv4 } from 'uuid';
import { Message, User } from '../types';

// 모의 사용자 풀
const mockUsers: string[] = [
  '익명의 친구', '대화 좋아하는 사람', '밤올빼미', '커피 러버', 
  '책 읽는 사람', '영화 매니아', '여행자', '음악 애호가',
  '운동 좋아하는 사람', '요리하는 사람', '게임 유저', '개발자',
  '학생', '직장인', '프리랜서', '창업가'
];

class MockChatService {
  private currentUser: User | null = null;
  private currentPartner: User | null = null;
  private messages: Message[] = [];
  private isConnected = false;
  private isPartnerTyping = false;
  private typingTimeout: NodeJS.Timeout | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  
  // 콜백 함수들
  private onMatchFoundCallback: ((partner: User) => void) | null = null;
  private onMessageReceivedCallback: ((message: Message) => void) | null = null;
  private onPartnerDisconnectedCallback: (() => void) | null = null;
  private onTypingStatusChangedCallback: ((isTyping: boolean) => void) | null = null;
  private onConnectionStatusChangedCallback: ((status: string) => void) | null = null;

  // 자동 응답을 위한 메시지 풀
  private autoResponses = [
    '안녕하세요! 😊',
    '오늘 하루 어떠셨나요?',
    '날씨가 참 좋네요!',
    '요즘 뭐 하며 지내세요?',
    '취미가 뭐예요?',
    '좋아하는 음식이 있나요?',
    '주말에 뭐 하실 예정이에요?',
    '좋은 영화 추천해주세요!',
    '스트레스 해소는 어떻게 하세요?',
    '여행 가고 싶은 곳이 있나요?',
    '좋아하는 계절이 언제예요?',
    '반가워요! 잘 부탁드려요 ✨',
    '대화 나누니까 좋네요 😄',
    '또 이야기하고 싶어요!',
    '시간 가는 줄 모르겠네요',
    '커피 좋아하세요? ☕',
    '음악은 어떤 장르 좋아하세요?',
    '운동은 하시나요?',
    '책 읽는 것 좋아하세요? 📚',
    '게임 하시나요?',
    '요리 잘하세요?',
    '펫샵 가본 적 있어요? 🐕',
    '드라마 추천해주세요!',
    '좋아하는 색깔이 뭐예요?',
    '야식으로 뭐 먹을까요? 🍕',
    '내일 날씨 어떨까요?',
    '새해 계획 있으세요?',
    '최근에 재밌게 본 유튜브 있나요?',
    '잠이 안 와요... 😴',
    '오늘 뭐 하셨어요?',
    '힘든 일 있으면 말해주세요',
    '웃긴 얘기 해주세요! 😂',
    '고민 있으면 들어드릴게요',
    '기분이 좋네요! ✨',
    '오늘 저녁 뭐 드셨어요?'
  ];

  // 연결
  connect(user: User) {
    this.currentUser = user;
    this.isConnected = true;
    this.connectionStatus = 'connected';
    if (this.onConnectionStatusChangedCallback) {
      this.onConnectionStatusChangedCallback('connected');
    }
  }

  // 매칭 시작
  findMatch() {
    this.connectionStatus = 'connecting';
    if (this.onConnectionStatusChangedCallback) {
      this.onConnectionStatusChangedCallback('connecting');
    }

    // 실제로는 서버에서 매칭을 하지만, 여기서는 시뮬레이션
    setTimeout(() => {
      const randomName = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      this.currentPartner = {
        id: uuidv4(),
        nickname: randomName
      };
      
      if (this.onMatchFoundCallback && this.currentPartner) {
        this.onMatchFoundCallback(this.currentPartner);
      }

      // 상대방이 먼저 인사하는 경우가 있도록 시뮬레이션
      if (Math.random() > 0.7) {
        setTimeout(() => {
          this.simulatePartnerMessage();
        }, 1000 + Math.random() * 3000);
      }
    }, 2000 + Math.random() * 3000); // 2-5초 대기
  }

  // 메시지 전송
  sendMessage(text: string) {
    if (!this.currentUser || !this.currentPartner) return;

    const message: Message = {
      id: uuidv4(),
      text,
      sender: 'me',
      timestamp: new Date()
    };

    this.messages.push(message);

    // 상대방의 자동 응답 시뮬레이션 (70% 확률)
    if (Math.random() > 0.3) {
      // 타이핑 상태 시뮬레이션
      this.simulatePartnerTyping();
      
      setTimeout(() => {
        this.simulatePartnerMessage();
      }, 1000 + Math.random() * 4000); // 1-5초 후 응답
    }
  }

  // 상대방 타이핑 시뮬레이션
  private simulatePartnerTyping() {
    this.isPartnerTyping = true;
    if (this.onTypingStatusChangedCallback) {
      this.onTypingStatusChangedCallback(true);
    }

    // 1-3초 후 타이핑 상태 해제
    setTimeout(() => {
      this.isPartnerTyping = false;
      if (this.onTypingStatusChangedCallback) {
        this.onTypingStatusChangedCallback(false);
      }
    }, 1000 + Math.random() * 2000);
  }

  // 상대방 메시지 시뮬레이션
  private simulatePartnerMessage() {
    if (!this.currentPartner || !this.onMessageReceivedCallback) return;

    const randomResponse = this.autoResponses[
      Math.floor(Math.random() * this.autoResponses.length)
    ];

    const message: Message = {
      id: uuidv4(),
      text: randomResponse,
      sender: 'partner',
      timestamp: new Date()
    };

    this.messages.push(message);
    this.onMessageReceivedCallback(message);
  }

  // 새로운 채팅 시작
  startNewChat() {
    this.messages = [];
    this.currentPartner = null;
    
    if (this.onPartnerDisconnectedCallback) {
      this.onPartnerDisconnectedCallback();
    }

    // 새로운 매칭 시작
    setTimeout(() => {
      this.findMatch();
    }, 500);
  }

  // 연결 해제
  disconnect() {
    this.isConnected = false;
    this.currentUser = null;
    this.currentPartner = null;
    this.messages = [];
    this.connectionStatus = 'disconnected';
    if (this.onConnectionStatusChangedCallback) {
      this.onConnectionStatusChangedCallback('disconnected');
    }
  }

  // 이벤트 리스너 등록
  onMatchFound(callback: (partner: User) => void) {
    this.onMatchFoundCallback = callback;
  }

  onMessageReceived(callback: (message: Message) => void) {
    this.onMessageReceivedCallback = callback;
  }

  onPartnerDisconnected(callback: () => void) {
    this.onPartnerDisconnectedCallback = callback;
  }

  onTypingStatusChanged(callback: (isTyping: boolean) => void) {
    this.onTypingStatusChangedCallback = callback;
  }

  // 연결 상태 변경 이벤트 리스너
  onConnectionStatusChanged(callback: (status: string) => void) {
    this.onConnectionStatusChangedCallback = callback;
  }

  // 현재 상태 조회
  getCurrentPartner(): User | null {
    return this.currentPartner;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  isUserConnected(): boolean {
    return this.isConnected;
  }

  getPartnerTypingStatus(): boolean {
    return this.isPartnerTyping;
  }

  // 현재 연결 상태 조회
  getConnectionStatus(): string {
    return this.connectionStatus;
  }
}

export const chatService = new MockChatService();
