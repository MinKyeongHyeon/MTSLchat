import { io, Socket } from 'socket.io-client';
import { Message, User } from '../types';

// 서버 URL 설정 (개발/배포 환경 자동 감지)
const getServerUrl = () => {
  // 개발 환경에서는 로컬호스트 사용
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // 배포 환경에서는 Cloudflare Tunnel URL 사용
  return process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
};

// 보안 강화: 개발 모드 확인
const isDevelopment = process.env.NODE_ENV === 'development';

// 보안 로깅 함수 - 민감한 정보 마스킹
const secureLog = (message: string, sensitive = false) => {
  if (isDevelopment || !sensitive) {
    console.log(message);
  }
};

class RealChatService {
  private socket: Socket | null = null;
  private currentUser: User | null = null;
  private currentPartner: User | null = null;
  private currentRoomId: string | null = null;
  private messages: Message[] = [];
  private isConnected = false;
  private isPartnerTyping = false;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  
  // 콜백 함수들
  private onMatchFoundCallback: ((partner: User) => void) | null = null;
  private onMessageReceivedCallback: ((message: Message) => void) | null = null;
  private onPartnerDisconnectedCallback: (() => void) | null = null;
  private onTypingStatusChangedCallback: ((isTyping: boolean) => void) | null = null;
  private onConnectionStatusChangedCallback: ((status: string) => void) | null = null;
  private onMatchingTimeoutCallback: ((message: string) => void) | null = null;

  private autoMatchEnabled = false;

  // 매칭 타임아웃 이벤트 리스너 등록
  onMatchingTimeout(callback: (message: string) => void) {
    this.onMatchingTimeoutCallback = callback;
  }

  // 자동 매칭 활성화 (모든 콜백이 등록된 후 호출)
  enableAutoMatching() {
    this.autoMatchEnabled = true;
    // 이미 연결되어 있다면 즉시 매칭 시작
    if (this.isConnected && this.currentUser) {
      console.log('🔍 지연된 자동 매칭 시작...');
      this.findPartner(this.currentUser.nickname);
    }
  }

  // 서버 연결
  connect(user: User) {
    this.currentUser = user;
    this.connectionStatus = 'connecting';
    this.onConnectionStatusChangedCallback?.('서버에 연결 중...');

    const serverUrl = getServerUrl();
    console.log(`🔌 서버 연결 시도: ${serverUrl}`);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // 연결 성공
    this.socket.on('connect', () => {
      console.log('✅ 서버 연결 성공!');
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.onConnectionStatusChangedCallback?.('연결됨');
      
      // 자동 매칭이 활성화되어 있다면 매칭 시작
      if (this.autoMatchEnabled) {
        setTimeout(() => {
          console.log('🔍 자동 매칭 시작...');
          this.findPartner(user.nickname);
        }, 100);
      }
    });

    // 연결 실패 시 처리
    this.socket.on('connect_error', (error) => {
      console.error('❌ 서버 연결 실패:', error);
      this.connectionStatus = 'disconnected';
      this.onConnectionStatusChangedCallback?.('연결 실패 - 서버를 확인해주세요');
    });

    // 파트너 찾기 완료 (실제 사용자만)
    this.socket.on('partner-found', (data: { roomId: string; partnerNickname: string; isRealUser: boolean }) => {
      console.log(`💕 실제 사용자와 매칭 완료: ${data.partnerNickname}`);
      this.currentRoomId = data.roomId;
      this.currentPartner = {
        id: 'partner',
        nickname: data.partnerNickname
      };
      
      // 상태 업데이트
      this.onConnectionStatusChangedCallback?.('채팅 중');
      
      // 매칭 완료 콜백 호출
      if (this.onMatchFoundCallback) {
        console.log('🔄 매칭 콜백 호출 중... UI를 채팅 화면으로 전환합니다');
        this.onMatchFoundCallback(this.currentPartner);
      } else {
        console.warn('⚠️ 매칭 콜백이 설정되지 않음!');
      }
    });

    // 매칭 타임아웃 (다른 사용자가 없음)
    this.socket.on('matching-timeout', (data: { message: string }) => {
      console.log('⏰ 매칭 타임아웃:', data.message);
      this.onConnectionStatusChangedCallback?.(data.message);
      
      // 타임아웃 콜백이 있다면 호출
      if (this.onMatchingTimeoutCallback) {
        this.onMatchingTimeoutCallback(data.message);
      }
    });

    // 대기 중 상태
    this.socket.on('waiting-for-partner', () => {
      console.log('⏳ 파트너 대기 중...');
      this.onConnectionStatusChangedCallback?.('파트너를 찾는 중...');
    });

    // 메시지 수신
    this.socket.on('receive-message', (messageData: any) => {
      secureLog('📨 메시지 수신 (길이: ' + (messageData.text?.length || 0) + '자)', true);
      const message: Message = {
        id: messageData.id,
        text: messageData.text,
        sender: 'partner',
        timestamp: new Date(messageData.timestamp)
      };
      this.messages.push(message);
      this.onMessageReceivedCallback?.(message);
    });

    // 파트너 타이핑 상태
    this.socket.on('partner-typing', (data: { isTyping: boolean }) => {
      secureLog('⌨️ 파트너 타이핑 상태 변경', true);
      this.isPartnerTyping = data.isTyping;
      this.onTypingStatusChangedCallback?.(data.isTyping);
    });

    // 파트너 연결 해제
    this.socket.on('partner-left', () => {
      secureLog('💔 파트너 연결 해제');
      this.onPartnerDisconnectedCallback?.();
    });

    // 서버 연결 해제
    this.socket.on('disconnect', () => {
      secureLog('🔌 서버 연결 해제');
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.onConnectionStatusChangedCallback?.('연결 해제됨');
    });
  }

  // 파트너 찾기
  findPartner(nickname: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('서버에 연결되지 않았습니다'));
        return;
      }

      console.log(`🔍 파트너 찾기 요청: ${nickname}`);
      this.socket.emit('find-partner', { nickname });

      // 타임아웃 설정 (Promise는 백업용)
      setTimeout(() => {
        reject(new Error('매칭 시간 초과'));
      }, 65000);
    });
  }

  // 메시지 전송
  sendMessage(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected || !this.currentRoomId) {
        reject(new Error('채팅방에 연결되지 않았습니다'));
        return;
      }

      const message: Message = {
        id: Date.now().toString(),
        text,
        sender: 'me',
        timestamp: new Date()
      };

      secureLog('📤 메시지 전송 (길이: ' + text.length + '자)', true);
      this.socket.emit('send-message', {
        text,
        roomId: this.currentRoomId
      });

      this.messages.push(message);
      resolve();
    });
  }

  // 타이핑 상태 전송
  setTyping(isTyping: boolean) {
    if (this.socket && this.isConnected && this.currentRoomId) {
      this.socket.emit('typing', {
        isTyping,
        roomId: this.currentRoomId
      });
    }
  }

  // 새로운 채팅 시작
  startNewChat(): Promise<User> {
    if (this.socket && this.currentRoomId) {
      secureLog('🔄 새로운 채팅 요청');
      this.socket.emit('new-chat', { roomId: this.currentRoomId });
      this.currentRoomId = null;
      this.currentPartner = null;
      this.messages = [];
    }

    // 새로운 파트너 찾기
    return this.findPartner(this.currentUser?.nickname || '익명');
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      secureLog('🔌 연결 해제');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentRoomId = null;
    this.currentPartner = null;
    this.messages = [];
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

  onConnectionStatusChanged(callback: (status: string) => void) {
    this.onConnectionStatusChangedCallback = callback;
  }

  // 게터
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentPartner(): User | null {
    return this.currentPartner;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  getIsPartnerTyping(): boolean {
    return this.isPartnerTyping;
  }

  getConnectionStatus(): string {
    switch (this.connectionStatus) {
      case 'connecting':
        return '연결 중...';
      case 'connected':
        return '연결됨';
      case 'disconnected':
      default:
        return '연결 안됨';
    }
  }
}

// 싱글톤 인스턴스 생성
const chatService = new RealChatService();

export default chatService;
