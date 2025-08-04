import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1.1rem;
  margin-bottom: 20px;
  transition: border-color 0.3s ease;
  outline: none;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #aaa;
  }

  @media (max-width: 768px) {
    padding: 14px;
    font-size: 16px; /* iOS 확대 방지 */
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 16px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 14px;
    font-size: 1rem;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 0.95rem;
  }
`;

interface NicknameInputProps {
  onNicknameSubmit: (nickname: string) => void;
}

const NicknameInput: React.FC<NicknameInputProps> = ({ onNicknameSubmit }) => {
  const [nickname, setNickname] = useState('');

  // 컴포넌트 마운트 시 저장된 닉네임 불러오기
  useEffect(() => {
    const savedNickname = localStorage.getItem('randomchat-nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      // 닉네임을 로컬 스토리지에 저장
      localStorage.setItem('randomchat-nickname', nickname.trim());
      onNicknameSubmit(nickname.trim());
    }
  };

  return (
    <Container>
      <Card>
        <Title>💬</Title>
        <Title>랜덤 채팅</Title>
        <Subtitle>새로운 사람들과 익명으로 대화해보세요!</Subtitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <Button type="submit" disabled={!nickname.trim()}>
            채팅 시작하기
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default NicknameInput;
