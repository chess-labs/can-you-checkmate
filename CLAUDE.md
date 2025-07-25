# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TanStack Start application - a type-safe, client-first, full-stack React framework. The project is based on the TanStack Router example and appears to be the source code for TanStack.com website.

# 투 나이트 체크메이트 불가능성 증명 - 인터랙티브 화면 구성 프롬프트

## 전체 화면 레이아웃

### 1. 헤더 섹션

- **제목**: "투 나이트 체크메이트 불가능성 증명"
- **부제**: "이분 그래프 이론과 알고리즘적 접근"
- **간단한 설명**: "체스판의 수학적 구조를 통한 엄밀한 증명"

### 2. 메인 콘텐츠 영역 (3단 구성)

#### 왼쪽 패널: 인터랙티브 체스판

```
기능 요구사항:
- 8x8 체스판 (흰색/검은색 칸 명확히 구분)
- 드래그 앤 드롭으로 킹, 나이트 2개 배치 가능
- 나이트가 공격할 수 있는 칸들을 실시간으로 하이라이트
- 색깔별로 다른 하이라이트 (흰색 칸 공격 vs 검은색 칸 공격)
- 왕 주변 탈출 가능 칸들 표시
- "체크메이트 시도" 버튼으로 현재 배치 검증
```

#### 중앙 패널: 단계별 증명 과정

```
1. 이분 그래프 이론 소개
   - 체스판 = 이분 그래프 시각화
   - 나이트 이동 = 간선 표현
   - 애니메이션으로 나이트 이동 패턴 설명

2. 색깔 제약 조건 증명
   - 나이트 A (흰색 칸) → 검은색 칸만 공격 가능
   - 나이트 B (검은색 칸) → 흰색 칸만 공격 가능
   - 실시간 시각화로 제약 조건 설명

3. 탈출 경로 분석
   - 왕 주변 8칸의 색깔 분포
   - 각 나이트가 차단할 수 있는 경로 vs 차단할 수 없는 경로
   - 반례 시나리오 자동 생성

4. 수학적 결론
   - 완전한 지배 집합 형성 불가능
   - 구조적 한계 설명
```

#### 오른쪽 패널: 알고리즘 코드 및 분석

```
실시간 코드 시각화 영역:
- 현재 보드 상태 분석 코드 (JavaScript)
- 공격 가능한 칸 계산 알고리즘 표시
- 체크메이트 가능성 검증 함수 실행 결과
- 시간 복잡도 시각화 (O(1) 상수 시간 계산)
- 실행 과정을 단계별로 시각적 표시
- 모든 계산이 브라우저에서 즉시 실행됨
```

### 3. 하단 인터랙션 영역

#### 시나리오 테스트 섹션

```
- "랜덤 배치 생성" 버튼
- "최적 공격 시도" 버튼
- "반례 찾기" 버튼
- "단계별 증명 재생" 버튼
- 각 시나리오에 대한 실시간 분석 결과 표시
```

## 시각적 요소 및 UX

### 색상 체계

- **흰색 칸**: #f0d9b5 (체스판 전통 색상)
- **검은색 칸**: #b58863
- **나이트 공격 범위**:
  - 흰색 칸 공격 시 → 파란색 하이라이트
  - 검은색 칸 공격 시 → 빨간색 하이라이트
- **왕 탈출 경로**: 반투명 녹색
- **차단된 경로**: 반투명 빨간색

### 애니메이션 효과

- 나이트 이동 시 부드러운 전환 효과
- 공격 범위 하이라이트 페이드 인/아웃
- 증명 단계별 전환 애니메이션
- 호버 효과로 설명 툴팁 표시

### 반응형 디자인

- 데스크톱: 3단 레이아웃
- 태블릿: 2단 레이아웃 (상하 구성)
- 모바일: 1단 레이아웃 (탭 형태)

## 교육적 가치 극대화

### 단계별 학습 지원

1. **초급**: 체스 룰 기본 이해
2. **중급**: 이분 그래프 개념 학습
3. **고급**: 알고리즘적 증명 이해
4. **전문가**: 수학적 엄밀성 확인

### 인터랙티브 요소

- 마우스 호버로 즉시 설명 표시
- 클릭으로 상세 정보 토글
- 실시간 피드백 및 힌트 제공
- 사용자 시도에 대한 즉각적인 검증

## 기술적 구현 고려사항 (프론트엔드 전용)

### 클라이언트 사이드 구현

- React 기반 컴포넌트 구조
- Canvas 또는 SVG로 체스판 렌더링
- HTML5 드래그 앤 드롭 API 활용
- CSS 트랜지션/애니메이션 또는 Framer Motion

### 로직 처리 (JavaScript)

```javascript
// 모든 체스 로직을 클라이언트에서 처리
const chessEngine = {
  calculateKnightMoves: (position) => {
    /* 나이트 이동 계산 */
  },
  checkBipartiteGraph: (board) => {
    /* 이분 그래프 검증 */
  },
  analyzeCheckmate: (kingPos, knight1, knight2) => {
    /* 체크메이트 분석 */
  },
  generateScenarios: () => {
    /* 시나리오 생성 */
  },
};
```

### 데이터 관리

- React state 또는 Context API로 상태 관리
- 로컬 스토리지 없이 세션 기반 데이터만 사용
- 하드코딩된 시나리오 및 예제 데이터
- 모든 계산 결과를 메모리에 캐싱

### 성능 최적화

- 메모이제이션으로 반복 계산 최소화
- React.memo와 useMemo 활용
- requestAnimationFrame으로 부드러운 애니메이션
- 컴포넌트 지연 로딩 (React.lazy)

## Development Commands

### Basic Development

- `pnpm dev` - Start development server (runs on port 3000)
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server

### Code Quality

- Use Biome for linting and formatting (configured in `biome.json`)
- TypeScript compilation check: `tsc --noEmit` (part of build process)
- Biome uses tab indentation and double quotes for JavaScript/TypeScript

## Architecture

### Core Framework

- **TanStack Start**: Full-stack React framework with file-based routing
- **TanStack Router**: Type-safe routing with automatic route generation
- **React 19**: Latest React version with modern features
- **TypeScript**: Strict type checking enabled
- **Tailwind CSS**: Utility-first CSS framework with Tailwind v4
- **Vite**: Build tool and development server

### Project Structure

```
src/
   router.tsx              # Router configuration and setup
   routeTree.gen.ts        # Auto-generated route tree (do not edit)
   routes/                 # File-based routing
      __root.tsx          # Root route with layout and SEO
      index.tsx           # Home page component
   shared/                 # Shared utilities and components
      styles/app.css      # Global styles
      ui/                 # Reusable UI components
         default-catch-boundary.tsx
         not-found.tsx
      utils/
          seo.ts          # SEO meta tag utilities
          loggingMiddleware.tsx
   pages/                  # Additional page components
```

### Key Architecture Patterns

1. **File-based Routing**: Routes are defined in `src/routes/` and automatically generate the route tree
2. **Type Safety**: Full TypeScript integration with TanStack Router's type system
3. **SEO Management**: Centralized SEO utilities in `shared/utils/seo.ts`
4. **Error Boundaries**: Default error handling with `DefaultCatchBoundary`
5. **Path Aliases**: `~/*` maps to `./src/*` for cleaner imports

### Router Configuration

- Default preload strategy: `'intent'` (preload on hover/focus)
- Scroll restoration enabled
- Custom error and not-found components configured
- Router devtools enabled in development

## Important Notes

- This appears to be the TanStack.com website source code
- The project supports local development of TanStack documentation
- Route tree (`routeTree.gen.ts`) is auto-generated - do not edit manually
- Uses ESM modules with `.mjs` output for production
- Strict TypeScript configuration with modern ES2022 target

## Development Setup

1. Install dependencies: `pnpm install`
2. Start development server: `pnpm dev`
3. Access at `http://localhost:3000`

For documentation editing, follow the multi-repo setup described in README.md to work with TanStack project documentation locally.
