#!/bin/bash

# MTSL Chat GitHub Pages 배포 스크립트
echo "🚀 MTSL 랜덤채팅 GitHub Pages 배포 시작..."

# 1. 최신 코드 빌드
echo "📦 프로덕션 빌드 중..."
cd mtsl-chat
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
    
    # 2. GitHub Pages에 배포
    echo "🌐 GitHub Pages에 배포 중..."
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo "🎉 배포 완료!"
        echo "🔗 사이트 주소: https://mingyeonghyeon.github.io/MTSLchat"
        echo "⏰ GitHub Pages 반영까지 약 1-2분 소요됩니다."
    else
        echo "❌ 배포 실패. GitHub 저장소 설정을 확인해주세요."
    fi
else
    echo "❌ 빌드 실패. 코드를 확인해주세요."
fi
