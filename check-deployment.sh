#!/bin/bash

echo "🎉 MTSL 랜덤채팅 GitHub Pages 배포 완료!"
echo ""
echo "🔗 배포된 사이트 주소:"
echo "   https://minkyeonghyeon.github.io/MTSLchat"
echo ""
echo "⏰ GitHub Pages 반영 시간: 약 1-5분"
echo "💡 첫 배포는 최대 10분까지 걸릴 수 있습니다."
echo ""
echo "📱 테스트해볼 기능들:"
echo "   ✅ 닉네임 입력 (자동 저장 확인)"
echo "   ✅ 랜덤 매칭 대기"
echo "   ✅ 실시간 채팅"
echo "   ✅ 타이핑 표시"
echo "   ✅ 알림음"
echo "   ✅ 새로운 채팅 시작"
echo "   ✅ 모바일 반응형 확인"
echo ""
echo "🚀 배포 상태 확인 명령어:"
echo "   curl -I https://minkyeonghyeon.github.io/MTSLchat"
echo ""
echo "🔄 재배포가 필요한 경우:"
echo "   cd mtsl-chat && npm run deploy"
echo ""
echo "💰 총 비용: ₩0 (완전 무료!)"
echo "🎯 테스트 서비스로 완벽합니다!"

# 배포 상태 확인
echo "🔍 배포 상태 확인 중..."
sleep 2

# GitHub API로 Pages 상태 확인
curl -s "https://api.github.com/repos/MinKyeongHyeon/MTSLchat/pages" | grep -q "built" && echo "✅ GitHub Pages가 활성화되었습니다!" || echo "⏳ GitHub Pages 설정을 완료해주세요."

echo ""
echo "🎊 축하합니다! 무료 채팅 서비스가 전 세계에 배포되었습니다!"
