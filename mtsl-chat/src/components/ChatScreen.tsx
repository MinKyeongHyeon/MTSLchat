import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Message } from '../types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
  position: relative;
  
  @media (max-width: 768px) {
    height: 100vh;
    height: 100dvh; /* 모바일 브라우저 주소창 고려 */
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const PartnerName = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const OnlineIndicator = styled.div`
  width: 10px;
  height: 10px;
  background: #28a745;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
  
  @media (max-width: 768px) {
    width: 8px;
    height: 8px;
  }
`;

const NewChatButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
`;

// 확인 다이얼로그 스타일
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogBox = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 24px;
    margin: 0 16px;
  }
`;

const DialogTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3rem;
`;

const DialogMessage = styled.p`
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const DialogButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #dee2e6;
    
    &:hover {
      background: #e9ecef;
    }
  `}
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 8px;
  }
`;

const MessageBubble = styled.div<{ isMe: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 20px;
  align-self: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  background: ${props => props.isMe 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : '#ffffff'};
  color: ${props => props.isMe ? 'white' : '#333'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 18px;
  }
`;

const MessageTime = styled.span<{ isMe: boolean }>`
  font-size: 0.7rem;
  color: ${props => props.isMe ? 'rgba(255, 255, 255, 0.7)' : '#666'};
  align-self: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    margin-bottom: 8px;
  }
`;

const InputContainer = styled.div`
  padding: 20px;
  background: white;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  position: sticky;
  bottom: 0;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 8px;
  }
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #667eea;
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 16px; /* iOS 확대 방지 */
    border-radius: 22px;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    border-radius: 22px;
  }
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  margin: 10px 0;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 8px;
    margin: 8px 0;
  }
`;

const typing = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 10px;
  align-self: flex-start;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 3px;
  margin-left: 10px;
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: ${typing} 1.4s infinite;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

const TypingText = styled.span`
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
`;

interface ChatScreenProps {
  nickname: string;
  partnerNickname: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  isPartnerTyping?: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  nickname,
  partnerNickname,
  messages,
  onSendMessage,
  onNewChat,
  isPartnerTyping = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        onSendMessage(newMessage.trim());
        setNewMessage('');
      }
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // 알림음 재생 함수
  const playNotificationSound = () => {
    // 간단한 알림음 (Web Audio API 사용)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // 메시지가 추가될 때마다 알림음 재생 (상대방 메시지만)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'partner') {
        playNotificationSound();
      }
    }
  }, [messages]);

  const handleNewChatClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmNewChat = () => {
    setShowConfirmDialog(false);
    onNewChat();
  };

  const handleCancelNewChat = () => {
    setShowConfirmDialog(false);
  };

  return (
    <Container>
      <Header>
        <HeaderInfo>
          <OnlineIndicator />
          <PartnerName>{partnerNickname}</PartnerName>
        </HeaderInfo>
        <NewChatButton onClick={handleNewChatClick}>
          새로운 채팅
        </NewChatButton>
      </Header>

      <MessagesContainer>
        <SystemMessage>
          {partnerNickname}님과 연결되었습니다. 즐거운 대화 나누세요! 🎉
        </SystemMessage>
        
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <MessageBubble isMe={message.sender === 'me'}>
              {message.text}
            </MessageBubble>
            <MessageTime isMe={message.sender === 'me'}>
              {formatTime(message.timestamp)}
            </MessageTime>
          </React.Fragment>
        ))}
        
        {isPartnerTyping && (
          <TypingIndicator>
            <TypingText>{partnerNickname}님이 입력 중</TypingText>
            <TypingDots>
              <TypingDot />
              <TypingDot />
              <TypingDot />
            </TypingDots>
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />

      </MessagesContainer>

      <InputContainer>
        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '10px' }}>
          <MessageInput
            type="text"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={500}
          />
          <SendButton type="submit" disabled={!newMessage.trim()}>
            전송
          </SendButton>
        </form>
      </InputContainer>

      {showConfirmDialog && (
        <DialogOverlay>
          <DialogBox>
            <DialogTitle>새로운 채팅 시작</DialogTitle>
            <DialogMessage>현재 채팅 내용을 잃고 새로운 채팅을 시작합니다. 계속하시겠습니까?</DialogMessage>
            <DialogButtons>
              <DialogButton variant="secondary" onClick={handleCancelNewChat}>취소</DialogButton>
              <DialogButton variant="primary" onClick={handleConfirmNewChat}>확인</DialogButton>
            </DialogButtons>
          </DialogBox>
        </DialogOverlay>
      )}
    </Container>
  );
};

export default ChatScreen;
