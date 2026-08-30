# WORKFLOW.md

이 문서는 `todo` 앱(HTML/CSS/JS 기반, 빌드 도구 없음)을 **처음부터 다시 만든다면** 어떤 순서로 진행해야 하는지 정리한 개발자용 절차 매뉴얼입니다. 실제 진행했던 대화 순서가 아니라, 재현 가능하도록 정리한 표준 절차입니다.

## 0. 사전 준비

- Git이 설치되어 있고 GitHub 계정에 SSH 키가 등록되어 있는지 확인
- 별도의 런타임/패키지 매니저(Node, npm 등) 불필요 — 브라우저만 있으면 실행 가능

## 1. 저장소 초기화

```bash
mkdir -p ~/work/todo
cd ~/work/todo
git init
git branch -m main               # 기본 브랜치명을 main으로 통일
git remote add origin git@github.com:elldia/todo.git
```

- 이미 원격 저장소에 파일이 있다면 `git init` 대신 `git clone git@github.com:elldia/todo.git`으로 시작한다.
- 저장소 최상위 경로가 다른 프로젝트(예: 클래스룸 공유 저장소) 내부와 겹치지 않는지 반드시 확인한다.

## 2. 프로젝트 구조 설계

앱을 구성하는 파일을 역할별로 최소 단위로 나눈다.

```
todo/
├── index.html   # 마크업 구조
├── style.css    # 스타일
├── script.js    # 동작 로직
├── README.md    # 사용 기술 + 사용자 매뉴얼
├── CLAUDE.md    # 작업 히스토리/의사결정 기록
└── WORKFLOW.md  # 본 문서
```

- 빌드 스텝이 없으므로 `index.html`을 브라우저에서 직접 열어 확인하는 것을 전제로 설계한다.
- 데이터 저장 방식(서버 없음 → `localStorage`)을 이 단계에서 미리 결정한다.

## 3. 기능 요구사항 정의

Todo 앱에 필요한 핵심 기능을 먼저 목록화한다.

1. 할 일 추가
2. 완료 상태 토글 (체크박스)
3. 할 일 내용 수정 (인라인 편집)
4. 할 일 삭제
5. 필터링 (전체 / 진행 중 / 완료)
6. 완료 항목 일괄 삭제
7. 남은 할 일 개수 표시
8. 새로고침 후에도 데이터 유지 (영속성)

## 4. HTML 마크업 작성 (`index.html`)

- 입력 폼(`<form>` + `<input>` + 추가 버튼)
- 필터 버튼 3개 (`data-filter` 속성으로 상태 구분)
- 목록을 렌더링할 빈 `<ul id="todo-list">`
- 하단에 남은 개수 표시 영역과 "완료 항목 삭제" 버튼
- `style.css`, `script.js`를 각각 `<link>`, `<script>`로 연결

## 5. 스타일 작성 (`style.css`)

- 전체 레이아웃(중앙 정렬 카드형 컨테이너)부터 잡는다.
- 컴포넌트 단위로 스타일링: 입력 폼 → 필터 버튼 → 목록 아이템 → 완료 상태(취소선) → 편집 모드 인풋 → 하단 푸터.
- 완료된 항목은 `.completed` 클래스를 토글하여 시각적으로 구분한다(취소선 + 흐린 색).

## 6. 동작 로직 작성 (`script.js`)

권장 구현 순서:

1. **상태 저장/불러오기**: `localStorage`에서 todo 배열을 읽고 쓰는 `loadTodos()` / `saveTodos()` 구현
2. **렌더링 함수**: 현재 필터 조건에 맞는 목록만 그리는 `render()` / `createTodoItem()` 구현 (목록이 비어있을 때 안내 문구 포함)
3. **CRUD 함수**: `addTodo`, `toggleTodo`, `deleteTodo`, `clearCompleted` 구현 — 상태 변경 후 반드시 `saveTodos()` + `render()` 순서로 호출
4. **인라인 수정**: 텍스트 더블클릭 시 입력창으로 교체하는 `startEdit()` 구현, `Enter`로 저장/`blur`로 저장/`Esc`로 취소 처리
5. **이벤트 바인딩**: 폼 submit, 필터 버튼 click, 완료 항목 삭제 버튼 click을 마지막에 연결
6. 초기 로드 시 `render()` 한 번 호출하여 저장된 데이터를 화면에 반영

## 7. 검증

- `node --check script.js` 등으로 문법 오류 여부를 먼저 점검한다.
- 브라우저에서 `index.html`을 열어 다음 시나리오를 직접 클릭해본다:
  - 추가 → 체크 → 더블클릭 수정 → 삭제
  - 필터 전환(전체/진행 중/완료)이 목록에 정확히 반영되는지
  - 완료 항목 일괄 삭제 버튼 동작
  - 새로고침 후 데이터가 유지되는지 (`localStorage` 확인)

## 8. 문서화

- **README.md**: 사용한 기술 스택(HTML/CSS/Vanilla JS/localStorage, 빌드 불필요)과 사용자 입장의 사용법을 단계별로 작성한다.
- **CLAUDE.md**: 작업 중 나눈 논의와 의사결정 배경을 기록해 향후 맥락 파악을 돕는다.
- **WORKFLOW.md**: 본 문서처럼 재현 가능한 절차를 남겨, 동일한 앱을 처음부터 다시 만들 때 참고할 수 있게 한다.

## 9. 커밋 및 배포

- 변경 사항은 사용자가 명시적으로 커밋/푸시를 요청했을 때만 반영한다.
- 커밋 시 `git status`로 무엇이 포함되는지 확인한 뒤 필요한 파일만 `git add`한다.

```bash
git add index.html style.css script.js README.md CLAUDE.md WORKFLOW.md
git commit -m "Add vanilla HTML/CSS/JS todo app"
git push -u origin main
```

## 10. 향후 확장 시 고려사항 (선택)

- 여러 기기 간 동기화가 필요해지면 `localStorage`를 서버 API(예: 간단한 FastAPI + DB)로 교체하는 방향을 검토한다.
- 항목이 많아지면 드래그 정렬, 우선순위, 마감일 등 기능을 추가로 고려할 수 있다.
- 이 문서의 범위는 "HTML/CSS/JS만으로 구성된 앱"이므로, 확장 시에는 새로운 WORKFLOW 섹션이나 별도 문서로 분리하는 것을 권장한다.
