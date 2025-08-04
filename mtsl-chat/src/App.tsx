import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NicknameInput from './components/NicknameInput';
import WaitingScreen from './components/WaitingScreen';
import ChatScreen from './components/ChatScreen';
import { chatService } from './services/chatService';
import { AppState, User, Message } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('nickname');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPartner, setCurrentPartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  useEffect(() => {
    // 매칭 성공 이벤트 리스너
    chatService.onMatchFound((partner: User) => {
      setCurrentPartner(partner);
      setAppState('chatting');
      setMessages([]);
    });

    // 메시지 수신 이벤트 리스너
    chatService.onMessageReceived((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // 상대방 연결 해제 이벤트 리스너
    chatService.onPartnerDisconnected(() => {
      setCurrentPartner(null);
      setAppState('waiting');
      setMessages([]);
      setIsPartnerTyping(false);
    });

    // 타이핑 상태 변경 이벤트 리스너
    chatService.onTypingStatusChanged((isTyping: boolean) => {
      setIsPartnerTyping(isTyping);
    });

    return () => {
      chatService.disconnect();
    };
  }, []);

  const handleNicknameSubmit = (nickname: string) => {
    const user: User = {
      id: uuidv4(),
      nickname
    };
    
    setCurrentUser(user);
    chatService.connect(user);
    setAppState('waiting');
    chatService.findMatch();
  };

  const handleSendMessage = (text: string) => {
    if (!currentUser) return;

    const message: Message = {
      id: uuidv4(),
      text,
      sender: 'me',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    chatService.sendMessage(text);
  };

  const handleNewChat = () => {
    setAppState('waiting');
    setCurrentPartner(null);
    chatService.startNewChat();
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case 'nickname':
        return <NicknameInput onNicknameSubmit={handleNicknameSubmit} />;
      
      case 'waiting':
        return <WaitingScreen nickname={currentUser?.nickname || ''} />;
      
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
