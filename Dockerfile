# Node.js 공식 이미지 사용
FROM node:18

# 작업 디렉토리
WORKDIR /usr/src/app

# package.json 복사 및 npm 설치
COPY package*.json ./
RUN npm install

# 앱 소스 복사
COPY . .

# 3000 포트 오픈
EXPOSE 3000

# 서버 실행
CMD ["node", "server.js"]