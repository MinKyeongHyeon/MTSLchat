#!/bin/bash

echo "🔗 GitHub 저장소 연결 및 푸시 스크립트"
echo "⚠️  먼저 GitHub에서 'MTSLchat' 저장소를 생성해주세요!"
echo ""

read -p "GitHub 사용자명을 입력하세요: " username

if [ -z "$username" ]; then
    echo "❌ 사용자명이 입력되지 않았습니다."
    exit 1
fi

echo "🚀 저장소 연결 중..."

cd /Users/mingyeonghyeon/MTSLchat

# GitHub 저장소 연결
git remote add origin https://github.com/$username/MTSLchat.git

# 메인 브랜치로 푸시
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ 저장소 푸시 완료!"
    echo "🌐 이제 GitHub Pages 설정을 해주세요:"
    echo "   1. GitHub 저장소 페이지 → Settings"
    echo "   2. 왼쪽 메뉴에서 'Pages' 클릭"
    echo "   3. Source를 'Deploy from a branch' 선택"
    echo "   4. Branch를 'gh-pages' 선택"
    echo "   5. Save 클릭"
    echo ""
    echo "🎉 설정 완료 후 다음 명령어로 배포:"
    echo "   cd mtsl-chat && npm run deploy"
else
    echo "❌ 푸시 실패. GitHub 저장소가 올바르게 생성되었는지 확인해주세요."
fi
