import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 100vh;
    min-height: 100dvh;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 16px;
    max-width: 350px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 20px;
    margin: 0 8px;
  }
`;

const LoadingIcon = styled.div`
  font-size: 4rem;
  animation: ${pulse} 2s infinite;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 3rem;
  }
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e1e5e9;
  border-left: 4px solid #667eea;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin: 20px auto;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    border-width: 3px;
    margin: 16px auto;
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const NicknameDisplay = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 2px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const NicknameLabel = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const NicknameValue = styled.span`
  color: #495057;
  font-size: 1.2rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

interface WaitingScreenProps {
  nickname: string;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ nickname }) => {
  return (
    <Container>
      <Card>
        <LoadingIcon>🔍</LoadingIcon>
        <Title>매칭 중...</Title>
        <Subtitle>새로운 채팅 상대를 찾고 있어요</Subtitle>
        
        <NicknameDisplay>
          <NicknameLabel>내 닉네임</NicknameLabel>
          <NicknameValue>{nickname}</NicknameValue>
        </NicknameDisplay>
        
        <Spinner />
        
        <Subtitle style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          잠시만 기다려주세요...
        </Subtitle>
      </Card>
    </Container>
  );
};

export default WaitingScreen;
