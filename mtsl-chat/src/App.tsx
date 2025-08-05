import React, { useState, useEffect } from 'react';
import NicknameInput from './components/NicknameInput';
import WaitingScreen from './components/WaitingScreen';
import ChatScreen from './components/ChatScreen';
import chatService from './services/realChatService';
import { AppState, User, Message } from './types';

// 보안 강화: 개발 모드에서만 상세 로깅, 프로덕션에서는 기본적인 상태 로그만
const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugMode = isDevelopment || window.location.search.includes('debug=true');

function App() {
  const [appState, setAppState] = useState<AppState>('nickname');
  
  // 상태 변경 로깅
  useEffect(() => {
    console.log('📱 App 상태 변경:', appState);
  }, [appState]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPartner, setCurrentPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('연결 안됨');

  useEffect(() => {
    // 매칭 성공 이벤트 리스너
    chatService.onMatchFound((partner: User) => {
      console.log('🎉 매칭 성공, 채팅창으로 전환 - 파트너:', partner.nickname);
      setCurrentPartner(partner);
      setAppState('chatting');
      setMessages([]);
      setConnectionStatus('채팅 중');
    });

    // 메시지 수신 이벤트 리스너
    chatService.onMessageReceived((message: Message) => {
      isDebugMode && console.log('📨 메시지 수신');
      setMessages(prev => [...prev, message]);
    });

    // 파트너 연결 해제 이벤트 리스너
    chatService.onPartnerDisconnected(() => {
      console.log('💔 파트너 연결 해제');
      alert('상대방이 대화를 종료했습니다.');
      setAppState('nickname');
      setCurrentPartner(null);
      setMessages([]);
      setConnectionStatus('연결 해제됨');
    });

    // 타이핑 상태 변경 이벤트 리스너
    chatService.onTypingStatusChanged((typing: boolean) => {
      setIsPartnerTyping(typing);
    });

    // 연결 상태 변경 이벤트 리스너
    chatService.onConnectionStatusChanged((status: string) => {
      console.log('🔗 연결 상태 변경:', status);
      setConnectionStatus(status);
    });

    // 매칭 타임아웃 이벤트 리스너
    chatService.onMatchingTimeout((message: string) => {
      console.log('⏰ 매칭 타임아웃:', message);
      alert(`매칭 타임아웃: ${message}`);
      setAppState('nickname');
      setCurrentUser(null);
      setCurrentPartner(null);
      setMessages([]);
    });

    // 모든 콜백 등록 완료 후 자동 매칭 활성화
    chatService.enableAutoMatching();

    // 컴포넌트 언마운트 시 정리
    return () => {
      chatService.disconnect();
    };
  }, []);

  const handleNicknameSubmit = async (nickname: string) => {
    const user: User = {
      id: Date.now().toString(),
      nickname
    };

    console.log('🚀 닉네임 제출:', nickname);
    setCurrentUser(user);
    setAppState('waiting');
    
    try {
      // 서버에 연결 (connect 내부에서 자동으로 매칭 시작됨)
      console.log('🔌 서버 연결 시작...');
      chatService.connect(user);
    } catch (error) {
      console.error('❌ 연결 실패:', error);
      alert('서버 연결에 실패했습니다. 다시 시도해주세요.');
      setAppState('nickname');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'me',
      timestamp: new Date()
    };

    // 내 메시지를 즉시 화면에 표시
    setMessages(prev => [...prev, message]);
    
    try {
      // 서버로 메시지 전송
      await chatService.sendMessage(text);
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  const handleNewChat = async () => {
    setAppState('waiting');
    setCurrentPartner(null);
    setMessages([]);
    
    try {
      isDevelopment && console.log('🔄 새로운 채팅 시작...');
      await chatService.startNewChat();
    } catch (error) {
      console.error('❌ 새 채팅 시작 실패:', error);
      alert('새로운 채팅을 시작할 수 없습니다.');
      setAppState('nickname');
    }
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case 'nickname':
        return (
          <div>
            <NicknameInput onNicknameSubmit={handleNicknameSubmit} />
            <div style={{ 
              position: 'fixed', 
              bottom: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              background: connectionStatus.includes('실패') || connectionStatus.includes('안됨') ? '#ff4444' : '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              zIndex: 1000
            }}>
              서버 상태: {connectionStatus}
            </div>
          </div>
        );
      
      case 'waiting':
        return (
          <div>
            <WaitingScreen nickname={currentUser?.nickname || ''} />
            <div style={{ 
              position: 'fixed', 
              bottom: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              background: '#2196F3',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              zIndex: 1000
            }}>
              {connectionStatus}
            </div>
          </div>
        );
      
      case 'chatting':
        return (
          <ChatScreen
            nickname={currentUser?.nickname || ''}
            partnerNickname={currentPartner?.nickname || '알 수 없음'}
            messages={messages}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            isPartnerTyping={isPartnerTyping}
          />
        );
      
      default:
        return <NicknameInput onNicknameSubmit={handleNicknameSubmit} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
