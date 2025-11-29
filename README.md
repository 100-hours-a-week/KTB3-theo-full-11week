# 🐟 FE : 오늘의 수산 (Today’s Seafood)

<p align="center">
  <img width="200" height="200" alt="Image" src="https://github.com/user-attachments/assets/cce90705-8f49-48cf-9e9d-a783ef18305a" />
</p>

# 🐠 오늘의 수산?

> 오늘의 수산은 당일 수산물 시세 정보와 수산 커뮤니티 기능을 제공하는 웹 서비스입니다.
> <br> 실시간으로 공유되는 정보, 가격 차트, 리뷰, 게시글 등을 통해
> <br> 수산물이 처음인 사람도 "오늘 적정가가 얼마인지" 쉽게 확인할 수 있도록 돕는 것이 목표입니다.
> <br>

<br>

## 🔎 서비스 기획의도

### ❗️ 문제

-   수산물 가격은 어획량·계절·금어기·날씨·수요에 따라 크게 변합니다.

    → 같은 꽃게라도 오늘은 2만원, 내일은 3만원, 소비자는 "적정가"를 판단하기 어렵습니다.

<br>


### 🐚 이 프로젝트는 "직접 시장에서 꽃게 가격을 모르고 헤맨 경험"에서 출발했습니다.

    → 25년 11월, 꽃게 1kg 적정가를 몰라 여러 가게를 돌아다녀야 했던 경험

    → "이 가격이 비싼건지, 싼 건지" 판단 기준이 필요하다는 문제를 인식했습니다.

<br>

### 🎨 기획 방향

-   가격 사이클을 시각적으로 보여주는 캔들차트 UI

-   어종별 실시간 사용자 채팅

-   어종별 커뮤니티 + 리뷰 / 후기

-   직관적인 UI + 빠른 정보 접근 UX


<br>

> 💬 "시세 데이터 + 사람들이 공유하는 경험"이 합쳐진 서비스를 목표로 합니다.


<br>


## 📽️ DEMO / DOCS

⚠️ 배포 전 초안 Demo 영상<br>

[https://github.com/user-attachments/assets/63cea51e-9d08-4fb4-9f92-7788cabb7e6a](https://github.com/user-attachments/assets/63cea51e-9d08-4fb4-9f92-7788cabb7e6a)

<br>


## 👥 개발인원 및 기간

-   개발 기간 : 2025.9.22 ~ ing
-   개발 인원 : 1인 개발(Fullstack)

<br>


## 🎯 Features

### 📈 수산물 시세 조회(예정)

-   전국 공영 도매시장 데이터를 기반으로 한 당일 시세 제공
-   어종 / 지역 필터링
-   어종별 차트(캔들 차트) 시각화 제공
-   하루 단위 변동성, 평균가, 최고 / 최저가

### 💬 실시간 사용자 소통(예정)

-   어종별 차트 페이지에 "현재 접속 중인 사용자 수" 표시
-   WebSocket 기반의 실시간 채팅

### 🐟 수산 커뮤니티

-   게시글 작성 / 수정 / 삭제
-   댓글 등록 / 수정 / 삭제
-   좋아요
-   무한 스크롤 기반 게시글 목록

### 👤 개인 프로필

-   프로필 이미지 업로드
-   닉네임 변경
-   사용자 작성 글 관리


<br>



## 🎨 서비스 컬러 & 디자인 컨셉

### 🎨 메인 컬러 팔레트

> 전체적으로 `바다` / `파도` / `해양` 느낌을 강조했습니다

아래는 오늘의 수산 서비스 전반에서 사용되는
핵심 6가지 베이스 컬러 팔레트입니다.<br>
(Brand / Ocean Pastel / Surface 톤 기준)

### 🎨 사용 색상 코드

<img width="500" height="500" alt="Image" src="https://github.com/user-attachments/assets/6baf7b75-77ec-4d48-a59e-81f857d55101" />

-   Brand Main Blue: #1A73E8

-   Brand Sky Blue: #4F9DFF

-   Action Deep Blue: #1D4ED8

-   cean Pastel Blue: #E0F2FE

-   Ocean Soft Tint: #EFF6FF

-   Page Light Gray: #F9FAFB

### 🖼️ UI 컨셉

-   파도 모양 오버레이와 인터랙션을 통해 시각적으로 '수산물' 테마 강화

-   군더더기 없는 카드 기반 구조

-   시세 차트는 주식차트 형태로 디자인하여 변동성을 쉽게 파악

-   웹 우선 구현 후 모바일 대응 예정

### 🖼️ UI 컨셉 이미지

<img width="1267" height="588" alt="Image" src="https://github.com/user-attachments/assets/5592c514-1c12-493b-9c87-068e79e3f4ec" />

<br>



## 🏗️ Front Architecture

```bash
/shared # 컴포넌트 공유 자원
  /lib (api, util, eventBus)
  /path (css path, image path)
  /dom (activeFeatureCss loader)

 /feature # 도메인별 레이어
    /auth
    /post
    /chart
    /profile
    ...

```

## 🧩 FrontEnd 적용 기술

### ⚙️ Vanilla JS 기반 SPA 아키텍처

-   화면 단위 컴포넌트 기반 모듈 구성

-   navigate() 기반 커스텀 라우터



### 🔔 EventBus 패턴

-   재사용 가능한 커스텀 이벤트 시스템
    ```
    post:updateCard/${id}, post:backToList..
    ```

### ♾️ 무한 스크롤 기반 리스트

-   IntersectionObserver 활용

### 🔐 JWT 인증

-   Access Token, Refresh Token 지원

## 📁 프론트 엔드 폴더 구조

```bash
/src
  ├── feature
  │     ├── auth/
  │     ├── post/
  │     ├── chart/
  │     └── profile/
  │
  ├── shared
  │     ├── lib/
  │     │      ├── api/
  │     │      ├── eventBus.js
  │     │      └── util/
  │     ├── path/
  │     │      ├── cssPath.js
  │     │      └── imgPath.js
  │     └── dom/
  │            └── activeFeatureCss.js
  │
  ├── router/
  │     └── navigate.js
  │
  └── index.html

```

-   커스텀 이벤트 기반 Event Bus 패턴

-   무한 스크롤 기반 게시글 리스팅

-   JWT 인증 처리 & 자동 리프레시


<br>



## 🌐 Deployment URL (Production)

배포가 완료되면 아래 주소로 접속할 수 있습니다.

### 🐟 오늘의 수산 (Front-end)

사용자가 실제로 접속하는 메인 서비스 URL

```
https://your-domain.com
```

### 🟦 Bank-end API 서버

Spring Boot 기반 REST API

```
https://api.your-domain.com
```

<br>



## 🚴 Develop Road Map

### ✔ 현재

-   바닐라 JS 기반 SPA 완성도 향상

-   시세 UI, 커뮤니티 UI 개발

### 🔜 다음 단계

-   React로 마이그레이션

-   TradingView 기반 캔들 차트 도입

### 🎯 최종 목표

> 실시간 시세 + 실시간 사용자 대화를 한 화면에서 제공하는 수산 시세 플랫폼


<br>



## 📊 DataSet

### 한국농수산식품유통공사 (데이터 검증 전)

전국 공영도매시장 실시간 경매정보(공공데이터 포함)

-   어종 / 지역별 시세 데이터 확보

https://www.data.go.kr/data/15141808/openapi.do

### 노량진 수산 시장, 오늘의 시세

-   노량진 수산 시장 당일 경매 시세 데이터

https://www.susansijang.co.kr/nsis/miw/ko/info/miw3110
