(() => {
  const scene = document.querySelector("#scene-01");
  if (!scene) return;

  // 기존 화면의 요소를 사용합니다.
  const ageSelector = scene.querySelector(".age-selector");
  const usageTime = scene.querySelector("#usage-time");

  const feedbackValue = scene.querySelector("#feedback-value");
  const feedbackTitle = scene.querySelector("#feedback-title");
  const feedbackDescription = scene.querySelector(
    "#feedback-description"
  );
  const feedbackStatus = scene.querySelector("#feedback-status");

  const resultButton = scene.querySelector("#result-button");
  const buttonText = resultButton?.querySelector("span");

  const resultCard = scene.querySelector("#result-card");
  const resultCardTitle = scene.querySelector("#result-card-title");
  const resultStatLabel = scene.querySelector(
    "#result-card .result-stat-label"
  );
  const resultRate = scene.querySelector("#result-rate");
  const resultBar = scene.querySelector("#result-bar");
  const resultBarFill = scene.querySelector("#result-bar-fill");
  const resultAverage = scene.querySelector("#result-average");

  const requiredElements = [
    ageSelector,
    usageTime,
    feedbackValue,
    feedbackTitle,
    feedbackDescription,
    feedbackStatus,
    resultButton,
    buttonText,
    resultCard,
    resultCardTitle,
    resultStatLabel,
    resultRate,
    resultBar,
    resultBarFill,
    resultAverage,
  ];

  if (requiredElements.some((element) => !element)) {
    console.warn(
      "STATE 04의 결과 카드 HTML과 각 요소의 ID를 확인해주세요."
    );
    return;
  }

  /*
   * 실제 통계 자료
   * 방송통신위원회 「2024 방송매체 이용행태조사」
   *
   * p.51: 스마트폰을 일상생활 필수 매체로 선택한 비율
   *       해당 연령대 전체 응답자 기준
   *
   * p.142: 하루 평균 스마트폰 이용 시간
   *        스마트폰 이용자 기준, 음성통화 제외
   *
   * 평균 시간은 계산 오류를 피하기 위해 '분'으로 저장합니다.
   */
  const ageData = new Map([
    ["10", {
      label: "10대",
      scope: "13~19세 기준",
      averageMinutes: 181,
      essentialRate: 95.0,
    }],

    ["20", {
      label: "20대",
      scope: "",
      averageMinutes: 198,
      essentialRate: 93.0,
    }],

    ["30", {
      label: "30대",
      scope: "",
      averageMinutes: 163,
      essentialRate: 91.1,
    }],

    ["40", {
      label: "40대",
      scope: "",
      averageMinutes: 141,
      essentialRate: 88.0,
    }],

    // 기존 '50대+' 버튼을 유지합니다.
    // 50대·60대·70세 이상의 수치를 임의로 합치지 않습니다.
    ["50-plus", {
      label: "50대+",
      scope: "",
      averageMinutes: null,
      essentialRate: null,
    }],
  ]);

  // 사용자 선택 구간의 비교용 대표값입니다.
  // 실제 측정 시간이 아니라 추정값입니다.
  const timeData = new Map([
    ["under-1", {
      label: "1시간 미만",
      display: "<1H",
      minutes: 30,
    }],
    ["1-2", {
      label: "1~2시간",
      display: "1~2H",
      minutes: 90,
    }],
    ["2-3", {
      label: "2~3시간",
      display: "2~3H",
      minutes: 150,
    }],
    ["3-4", {
      label: "3~4시간",
      display: "3~4H",
      minutes: 210,
    }],
    ["4-5", {
      label: "4~5시간",
      display: "4~5H",
      minutes: 270,
    }],
    ["5-plus", {
      label: "5시간 이상",
      display: "5H+",
      minutes: 330,
    }],
  ]);

  const sourceText =
    "방통위, 2024 방송매체 이용행태조사 p.51·142";

  function formatMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}분`;
    if (minutes === 0) return `${hours}시간`;

    return `${hours}시간 ${minutes}분`;
  }

  function getSelection() {
    const checkedAge = ageSelector.querySelector(
      'input[name="age"]:checked'
    );

    const timeKey = usageTime.value.toLowerCase();

    return {
      age: ageData.get(checkedAge?.value),
      time: timeData.get(timeKey),
      timeKey,
    };
  }

  // STATE 01~03
  function updateScene() {
    const { age, time } = getSelection();

    resultCard.hidden = true;
    feedbackValue.hidden = false;

    buttonText.textContent = "결과 확인하기";
    resultButton.disabled = !(age && time);

    if (age && time) {
      scene.dataset.state = "time-selected";

      feedbackValue.textContent = time.display;
      feedbackTitle.textContent = "선택이 완료되었습니다.";
      feedbackDescription.textContent =
        "아래 버튼을 눌러 결과를 확인해보세요.";
      feedbackStatus.textContent = "READY TO VIEW RESULTS";

    } else if (age) {
      scene.dataset.state = "age-selected";

      feedbackValue.textContent = age.label;
      feedbackTitle.textContent = "연령대가 선택되었습니다.";
      feedbackDescription.textContent =
        "이제 하루 스마트폰 사용시간을 선택해주세요.";
      feedbackStatus.textContent =
        "AGE SELECTED / WAITING FOR TIME...";

    } else {
      scene.dataset.state = "initial";

      feedbackValue.textContent = "?";
      feedbackTitle.textContent = "당신의 하루는?";
      feedbackDescription.textContent =
        "연령대와 사용시간을 선택하면 관련 통계를 확인할 수 있어요.";
      feedbackStatus.textContent = "WAITING FOR INPUT...";
    }
  }

  // STATE 04
  function showResult() {
    const { age, time, timeKey } = getSelection();

    if (!age || !time) {
      updateScene();
      return;
    }

    resultCardTitle.textContent =
      `${age.label}의 스마트폰 이용 현황`;

    resultStatLabel.textContent =
      "스마트폰을 일상생활 필수 매체로 선택한 비율";

    const hasStatistics =
      Number.isFinite(age.averageMinutes) &&
      Number.isFinite(age.essentialRate);

    if (hasStatistics) {
      const rate = age.essentialRate;
      const difference = time.minutes - age.averageMinutes;

      // 기존 숫자와 막대에 실제 수치를 적용합니다.
      resultRate.textContent = `${rate.toFixed(1)}%`;
      resultBarFill.style.width = `${rate}%`;

      resultBar.setAttribute("role", "meter");
      resultBar.setAttribute(
        "aria-label",
        "스마트폰을 일상생활 필수 매체로 선택한 비율"
      );
      resultBar.setAttribute("aria-valuemin", "0");
      resultBar.setAttribute("aria-valuemax", "100");
      resultBar.setAttribute("aria-valuenow", String(rate));
      resultBar.removeAttribute("aria-hidden");

      resultAverage.textContent =
        `하루 평균 ${formatMinutes(age.averageMinutes)} · 음성통화 제외`;

      let comparison;

      if (difference > 0) {
        comparison =
          `평균보다 약 ${formatMinutes(difference)} 길어요.`;
      } else if (difference < 0) {
        comparison =
          `평균보다 약 ${formatMinutes(Math.abs(difference))} 짧아요.`;
      } else {
        comparison = "평균과 같아요.";
      }

      feedbackTitle.textContent = "나의 하루와 비교해보세요.";

      feedbackDescription.textContent =
        `구간 대표값 ${formatMinutes(time.minutes)} 기준, ` +
        comparison;

      const scopeNote = age.scope ? ` · ${age.scope}` : "";

      const estimateNote =
        timeKey === "5-plus"
          ? "5시간 이상은 5시간 30분으로 추정"
          : "구간 대표값으로 추정 비교";

      feedbackStatus.textContent =
        `${estimateNote}${scopeNote} · ${sourceText}`;

    } else {
      // '50대+' 전체를 대표하는 검증된 통합 수치가 없습니다.
      // 0%로 오해하지 않도록 숫자는 '—'로 표시합니다.
      resultRate.textContent = "—";
      resultBarFill.style.width = "0%";

      resultBar.removeAttribute("role");
      resultBar.removeAttribute("aria-valuenow");
      resultBar.setAttribute("aria-hidden", "true");

      resultAverage.textContent = "50대 이상 통합 통계 없음";

      feedbackTitle.textContent = "선택한 시간을 확인해보세요.";
      feedbackDescription.textContent =
        `선택 시간은 ${time.label}입니다. 통합 평균 비교는 제공하지 않아요.`;

      feedbackStatus.textContent =
        `원문은 50대·60대·70세 이상으로 구분 · ${sourceText}`;
    }

    feedbackValue.hidden = true;
    resultCard.hidden = false;

    scene.dataset.state = "result";
    buttonText.textContent = "다음으로 넘어가기";
    resultButton.disabled = false;
  }

  ageSelector.addEventListener("change", (event) => {
    if (event.target.matches('input[name="age"]')) {
      updateScene();
    }
  });

  usageTime.addEventListener("change", updateScene);

  resultButton.addEventListener("click", () => {
 if (scene.dataset.state === "result") {
  const scene02 = document.querySelector("#scene-02");
  const sceneNumber = document.querySelector("#scene-number");

  if (!scene02) {
    console.warn("HTML에 #scene-02가 있는지 확인해주세요.");
    return;
  }

  scene.hidden = true;
  scene02.hidden = false;

  if (sceneNumber) {
    sceneNumber.textContent = "SCENE 02 / 05";
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });

  scene02.querySelector("#scene-02-title")?.focus({
    preventScroll: true,
  });

  return;
}

    showResult();
  });

  // SCENE 2 → SCENE 1 돌아가기
  const scene02 = document.querySelector("#scene-02");
  const backButton = document.querySelector(
    "#scene02-back-button"
  );

  if (scene02 && backButton) {
    backButton.addEventListener("click", () => {
      // SCENE 2를 숨기고 SCENE 1을 다시 표시합니다.
      scene02.hidden = true;
      scene.hidden = false;

      // 공통 헤더를 SCENE 1로 되돌립니다.
      const sceneNumber = document.querySelector("#scene-number");

      if (sceneNumber) {
        sceneNumber.textContent = "SCENE 01 / 05";
      }

      // SCENE 1 진행 표시를 20%로 맞춥니다.
      const progress = scene.querySelector(".scene-progress");
      const progressFill = progress?.querySelector("span");

      if (progress) {
        progress.setAttribute("aria-valuenow", "1");
      }

      if (progressFill) {
        progressFill.style.width = "20%";
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      // 돌아왔을 때 '다음으로 넘어가기' 버튼에 초점을 둡니다.
      resultButton.focus({
        preventScroll: true,
      });

      // updateScene()은 호출하지 않습니다.
      // 기존 선택값과 결과 화면을 그대로 유지하기 위해서입니다.
    });
  }

  updateScene();
  window.addEventListener("pageshow", updateScene);
})();
// SCENE 02 / STATE 01~04
(() => {
  const scene02 = document.querySelector("#scene-02");
  if (!scene02) return;

  const notification = scene02.querySelector(
    "#scene02-notification"
  );
  const messageButton = scene02.querySelector(
    "#scene02-message-button"
  );
  const messagePanel = scene02.querySelector(
    "#scene02-message"
  );
  const messageHeading = scene02.querySelector(
    "#scene02-message-heading"
  );
  const returnButton = scene02.querySelector(
    "#scene02-message-return"
  );
  const readingTitle = scene02.querySelector(
    "#scene02-reading-title"
  );

  const trackerLabel = scene02.querySelector(
    ".scene02-tracker-label"
  );
  const trackerTitle = scene02.querySelector(
    "#scene02-tracker-title"
  );
  const trackerDescription = scene02.querySelector(
    ".scene02-tracker-description"
  );
  const currentFocus = scene02.querySelector(
    "#scene02-current-focus"
  );
  const attentionHistory = scene02.querySelector(
    "#scene02-attention-history"
  );
  const status = scene02.querySelector("#scene02-status");

  const requiredElements = [
    notification,
    messageButton,
    messagePanel,
    messageHeading,
    returnButton,
    readingTitle,
    trackerLabel,
    trackerTitle,
    trackerDescription,
    currentFocus,
    attentionHistory,
    status,
  ];

  if (requiredElements.some((element) => !element)) {
    console.warn(
      "SCENE 2: メッセージ・履歴・タイトルのHTMLとIDを確認してください。"
    );
    return;
  }

  let notificationTimer = null;
  let sceneIsActive = false;

  function cancelNotificationTimer() {
    if (notificationTimer !== null) {
      window.clearTimeout(notificationTimer);
      notificationTimer = null;
    }
  }

  // SCENE 2を離れるとき、初期状態に戻します。
  function resetScene02() {
    cancelNotificationTimer();

    notification.hidden = true;
    messagePanel.hidden = true;
    currentFocus.hidden = true;
    attentionHistory.hidden = true;

    trackerLabel.textContent = "ATTENTION TRACKER / 01";
    trackerTitle.textContent = "읽는 동안 무엇이 일어날까요?";
    trackerDescription.textContent =
      "잠시 글에 집중해보세요. 화면에 변화가 나타날 수 있습니다.";
    status.textContent = "WAITING...";

    scene02.dataset.state = "initial";
  }

  function startNotificationTimer() {
    resetScene02();

    notificationTimer = window.setTimeout(() => {
      notificationTimer = null;

      if (
        scene02.hidden ||
        !sceneIsActive ||
        scene02.dataset.state !== "initial"
      ) {
        return;
      }

      notification.hidden = false;
      scene02.dataset.state = "notification";
    }, 5000);
  }

function syncSceneVisibility() {
  const isVisible = !scene02.hidden;

  if (isVisible && !sceneIsActive) {
    sceneIsActive = true;

    // SCENE 3-A에서 돌아왔다면 STATE 04 유지
    if (scene02.dataset.preserveState === "true") {
      delete scene02.dataset.preserveState;
      cancelNotificationTimer();
      return;
    }

    // SCENE 1에서 새로 들어오면 초기 상태부터 시작
    startNotificationTimer();
    return;
  }

  if (!isVisible) {
    sceneIsActive = false;
    cancelNotificationTimer();

    // SCENE 3-A로 이동할 때는 상태를 지우지 않음
    if (scene02.dataset.preserveState === "true") {
      return;
    }

    // SCENE 1로 나가면 기존처럼 초기화
    resetScene02();
  }
}

  // STATE 02 → STATE 03: 메시지 열기
  messageButton.addEventListener("click", () => {
    if (
      scene02.hidden ||
      notification.hidden ||
      scene02.dataset.state !== "notification"
    ) {
      return;
    }

    cancelNotificationTimer();

    notification.hidden = true;
    messagePanel.hidden = false;
    currentFocus.hidden = false;
    attentionHistory.hidden = true;

    trackerLabel.textContent = "ATTENTION TRACKER / 01";
    status.textContent = "ATTENTION DIVERTED!";

    scene02.dataset.state = "message";

    messageHeading.focus({
      preventScroll: true,
    });
  });

  // STATE 03 → STATE 04: 읽던 글로 돌아가기
  returnButton.addEventListener("click", () => {
    if (
      scene02.hidden ||
      scene02.dataset.state !== "message"
    ) {
      return;
    }

    cancelNotificationTimer();

    notification.hidden = true;
    messagePanel.hidden = true;
    currentFocus.hidden = true;
    attentionHistory.hidden = false;

    trackerLabel.textContent = "ATTENTION TRACKER / 03";
    trackerTitle.textContent = "주의는 어디로 이동했을까요?";
    trackerDescription.textContent =
      "잠시 메시지를 확인한 뒤, 다시 읽던 글로 돌아왔습니다.";
    status.textContent = "BACK TO READING";

    // message 상태를 벗어나면서 기존 흐림 효과도 해제됩니다.
    scene02.dataset.state = "back-to-reading";

    readingTitle.focus({
      preventScroll: true,
    });

    // 타이머를 다시 시작하지 않습니다.
  });
// SCENE 2 ↔ SCENE 3-A 전환
const scene03a = document.querySelector("#scene-03-a");
const nextSceneButton = scene02.querySelector(
  "#scene02-next-button"
);
const scene03aBackButton = scene03a?.querySelector(
  "#scene03a-back"
);
const sceneNumber = document.querySelector("#scene-number");

// 이후 콘텐츠 전환에 사용할 순서입니다.
// 이번 단계에서는 초기 화면만 표시합니다.
const scene03aContents = [
  { key: "cat", label: "고양이" },
  { key: "food", label: "음식" },
  { key: "travel", label: "여행" },
  { key: "exercise", label: "운동" },
  { key: "music", label: "음악" },
];

function updateSceneHeader(text) {
  if (sceneNumber) {
    sceneNumber.textContent = text;
  }
}

function moveFocusTo(element) {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });

  element?.focus({
    preventScroll: true,
  });
}

if (scene03a && nextSceneButton && scene03aBackButton) {
  nextSceneButton.addEventListener("click", () => {
    if (
      scene02.hidden ||
      scene02.dataset.state !== "back-to-reading"
    ) {
      return;
    }

    cancelNotificationTimer();

    // hiddenを変更する前に、STATE 04を保つ印を付けます。
    scene02.dataset.preserveState = "true";
    scene02.hidden = true;

    scene03a.dataset.state = "initial";
    scene03a.dataset.contentIndex = "0";
    scene03a.dataset.contentKey = scene03aContents[0].key;
    scene03a.hidden = false;

    updateSceneHeader("SCENE 03 / 05");

    moveFocusTo(
      scene03a.querySelector("#scene03a-title")
    );
  });

  scene03aBackButton.addEventListener("click", () => {
    if (scene03a.hidden) return;

    scene03a.hidden = true;

    // 再表示時に初期化せず、STATE 04へ戻します。
    scene02.dataset.preserveState = "true";
    scene02.hidden = false;

    updateSceneHeader("SCENE 02 / 05");

    // 本文の見出しへフォーカスを戻します。
    moveFocusTo(readingTitle);
  });
}
  // 기존 장면 전환 코드의 hidden 변경만 감지합니다.
  // data-state 변경에는 반응하지 않아 타이머가 재시작되지 않습니다.
  const visibilityObserver = new MutationObserver(
    syncSceneVisibility
  );

  visibilityObserver.observe(scene02, {
    attributes: true,
    attributeFilter: ["hidden"],
  });

  syncSceneVisibility();

  window.addEventListener("pagehide", () => {
    sceneIsActive = false;
    resetScene02();
  });

  window.addEventListener("pageshow", syncSceneVisibility);
})();
// SCENE 3-A / STATE 01~03
(() => {
  const scene = document.querySelector("#scene-03-a");
  if (!scene) return;

  const phone = scene.querySelector("#scene03a-phone");
  const screen = scene.querySelector("#scene03a-screen");
  const number = scene.querySelector("#scene03a-content-number");
  const title = scene.querySelector("#scene03a-content-title");
  const nextButton = scene.querySelector("#scene03a-content-hint");
  const historyCount = scene.querySelector("#scene03a-history-count");
  const historyItems = scene.querySelectorAll(
    ".scene03a-history-list li"
  );
  const currentNumber = scene.querySelector(
    "#scene03a-current-number"
  );

  const host = scene.querySelector("#scene03a-video-host");
  const note = scene.querySelector("#scene03a-video-note");
  const videoLink = scene.querySelector("#scene03a-video-link");
  const playButton = scene.querySelector("#scene03a-play-button");
  const summary = scene.querySelector(".scene03a-summary");
const memoryPanel = scene.querySelector("#scene03a-memory");
const memoryTitle = scene.querySelector("#scene03a-memory-title");
const memoryInputs = scene.querySelectorAll(
  'input[name="scene03a-memory-answer"]'
);

if (
  !summary ||
  !memoryPanel ||
  !memoryTitle ||
  memoryInputs.length !== 4
) {
  console.warn("SCENE 3-A: 기억 질문 HTML의 위치와 ID를 확인해주세요.");
  return;
}

// 선택한 답변을 저장합니다. 이번 단계에서는 정답을 판정하지 않습니다.
let selectedMemoryAnswer = null;
const memorySubmit = scene.querySelector("#scene03a-memory-submit");
const resultArea = scene.querySelector("#scene03a-result-area");
const resultTitle = scene.querySelector("#scene03a-result-title");
const resultIcon = scene.querySelector("#scene03a-result-icon");
const resultContentLabel = scene.querySelector(
  "#scene03a-result-content-label"
);
const resultContentTitle = scene.querySelector(
  "#scene03a-result-content-title"
);

if (
  !memorySubmit ||
  !resultArea ||
  !resultTitle ||
  !resultIcon ||
  !resultContentLabel ||
  !resultContentTitle
) {
  console.warn("SCENE 3-A: 결과 화면 HTML의 ID를 확인해주세요.");
  return;
}

if (!playButton) {
  console.warn("SCENE 3-A: 카드 내부 재생 버튼을 확인해주세요.");
  return;
}

  if (
    !phone || !screen || !number || !title || !nextButton ||
    !historyCount || historyItems.length !== 5 ||
    !currentNumber || !host || !note || !videoLink
  ) {
    console.warn("SCENE 3-A: 추가한 HTML의 ID를 확인해주세요.");
    return;
  }

 const contents = [
  {
    key: "cat",
    label: "고양이",
    icon: "🐈",
    title: "첫 번째 영상",
    videoId: "6qeQNYLBIWU",
  },
  {
    key: "food",
    label: "음식",
    icon: "🍔",
    title: "두 번째 영상",
    videoId: "_gsTd1a_wiQ",
  },
  {
    key: "travel",
    label: "여행",
    icon: "✈️",
    title: "세 번째 영상",
    videoId: "otutUUlYS4E",
  },
  {
    key: "exercise",
    label: "운동",
    icon: "🏃",
    title: "네 번째 영상",
    videoId: "F-Jd4kI6rdM",
  },
  {
    key: "music",
    label: "음악",
    icon: "🎧",
    title: "다섯 번째 영상",
    videoId: "to3sjq-CAvA",
  },
];

  let index = 0;
  let active = false;
  let locked = false;
  let lockTimer = null;
  let wheelTotal = 0;
  let lastWheelTime = 0;
  let wheelGestureUsed = false;
  let touchStart = null;
  let player = null;
  let renderVersion = 0;
  let lastCanEmbed = null;

  // 공식 API는 한 번만 불러옵니다.
  let apiPromise = null;

  function loadYouTubeAPI() {
    if (window.YT?.Player) {
      return Promise.resolve();
    }

    if (apiPromise) return apiPromise;

    apiPromise = new Promise((resolve, reject) => {
      let finished = false;

      const timeout = window.setTimeout(() => {
        if (finished) return;
        finished = true;
        reject(new Error("유튜브 API 로딩 시간 초과"));
      }, 12000);

      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        try {
          if (typeof previousReady === "function") {
            previousReady();
          }
        } finally {
          if (!finished) {
            finished = true;
            window.clearTimeout(timeout);
            resolve();
          }
        }
      };

      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";

        script.onerror = () => {
          if (finished) return;
          finished = true;
          window.clearTimeout(timeout);
          reject(new Error("유튜브 API 연결 실패"));
        };

        document.head.append(script);
      }
    });

    return apiPromise;
  }

  let playbackTimer = null;

function clearPlaybackTimer() {
  window.clearTimeout(playbackTimer);
  playbackTimer = null;
}

function clearPlayer() {
  clearPlaybackTimer();

  if (player) {
    player.destroy();
    player = null;
  }

  host.replaceChildren();

  playButton.hidden = true;
  playButton.disabled = true;
  videoLink.hidden = true;
}

function showVideoFallback(text) {
  clearPlayer();

  host.hidden = true;
  note.textContent = text;
  note.hidden = false;

  // 실패한 경우에만 외부 링크를 보조 수단으로 표시합니다.
  videoLink.hidden = false;
}

function showInlinePlayButton(text) {
  note.textContent = text;
  note.hidden = false;

  playButton.hidden = false;
  playButton.disabled = false;
  videoLink.hidden = true;
}

// 사용자 클릭으로 현재 카드 안에서 재생합니다.
// 이 이벤트는 한 번만 등록합니다.
playButton.addEventListener("click", () => {
 if (!isContentActive() || !player) return;

  note.textContent = "재생을 요청했습니다. 잠시 기다려주세요.";
  note.hidden = false;

  // 버튼 클릭 안에서 바로 호출해야 사용자 조작으로 처리됩니다.
  player.unMute();
player.setVolume(70);
player.playVideo();
});

// 영상 변경·장면 이탈 시 이전 비동기 작업은 무효가 됩니다.
async function renderVideo() {
  // 콘텐츠 화면에서만 플레이어를 생성합니다.
  if (!isContentActive()) return;

  const version = ++renderVersion;

  clearPlayer();

const content = contents[index];

// 크기 변화 감지 기준을 현재 너비로 맞춥니다.
lastCanEmbed = host.parentElement.clientWidth >= 200;

// 영상이 없는 콘텐츠는 API를 호출하지 않습니다.
if (!content.videoId) {
  host.hidden = false;
  videoLink.hidden = true;
  videoLink.removeAttribute("href");

  const placeholder = document.createElement("div");
  placeholder.className = "scene03a-video-placeholder";

  const icon = document.createElement("span");
  icon.className = "scene03a-placeholder-icon";
  icon.textContent = content.icon;
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "scene03a-placeholder-label";
  label.textContent = content.label;

  placeholder.append(icon, label);
  host.replaceChildren(placeholder);

  note.textContent = "영상 준비 중입니다.";
  note.hidden = false;

  return;
}

videoLink.href =
  `https://www.youtube.com/watch?v=${content.videoId}`;
const isCurrent = () =>
  version === renderVersion &&
  isContentActive();

  // 최소 너비 검사는 유지합니다.
  const canEmbed = host.parentElement.clientWidth >= 200;
  lastCanEmbed = canEmbed;

  if (!canEmbed) {
    showVideoFallback(
      "영상 영역이 200px보다 좁습니다. 화면 너비와 카드 배치를 확인해주세요."
    );
    return;
  }

  // file://에서는 정상적인 HTTP 요청 출처를 전달하기 어렵습니다.
  // 로컬 서버로 실행하도록 명확하게 안내합니다.
  if (
    location.protocol !== "http:" &&
    location.protocol !== "https:"
  ) {
    showVideoFallback(
      "현재 파일 직접 열기 상태입니다. VS Code의 Live Server로 실행해주세요."
    );
    return;
  }

  host.hidden = false;
  note.textContent = "영상 플레이어를 준비하고 있습니다.";
  note.hidden = false;

  try {
    await loadYouTubeAPI();

    if (!isCurrent()) return;

    // iframe을 직접 만들어 재생 권한과 출처 정책을 지정합니다.
    const iframe = document.createElement("iframe");
    const parameters = new URLSearchParams({
      enablejsapi: "1",
      origin: location.origin,
      playsinline: "1",
      autoplay: "1",
      controls: "1",
    });

    iframe.src =
      `https://www.youtube.com/embed/${content.videoId}?${parameters}`;

    iframe.title = content.title;
    iframe.width = "100%";
    iframe.height = "220";

    iframe.allow =
      "autoplay; encrypted-media; picture-in-picture; fullscreen";

    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";

    host.append(iframe);

    player = new window.YT.Player(iframe, {
      events: {
        onReady(event) {
          if (!isCurrent()) return;

          // 아직 실제 재생이 확인된 상태는 아닙니다.
          showInlinePlayButton(
            "소리를 켜고 자동재생을 시도합니다. 시작되지 않으면 영상 재생을 눌러주세요."
          );

          event.target.unMute();
event.target.setVolume(70);
event.target.playVideo();

          // 자동재생 차단 이벤트가 오지 않아도 직접 재생할 수 있습니다.
          clearPlaybackTimer();

          playbackTimer = window.setTimeout(() => {
            if (!isCurrent()) return;

            if (
              event.target.getPlayerState() !==
              window.YT.PlayerState.PLAYING
            ) {
              showInlinePlayButton(
                "영상 재생 버튼을 눌러 카드 안에서 시작해주세요."
              );
            }
          }, 4000);
        },

        onStateChange(event) {
          if (!isCurrent()) return;

          switch (event.data) {
            case window.YT.PlayerState.PLAYING:
              clearPlaybackTimer();

              // 실제 PLAYING 이벤트 이후에만 표시합니다.
              note.textContent = event.target.isMuted()
                ? "무음으로 재생 중입니다."
                : "재생 중입니다.";

              note.hidden = false;
              playButton.hidden = true;
              videoLink.hidden = true;
              break;

            case window.YT.PlayerState.BUFFERING:
              note.textContent = "영상을 불러오는 중입니다.";
              note.hidden = false;
              break;

            case window.YT.PlayerState.PAUSED:
              clearPlaybackTimer();
              showInlinePlayButton(
                "일시정지되었습니다. 영상 재생을 누르면 이어집니다."
              );
              break;

            case window.YT.PlayerState.ENDED:
              clearPlaybackTimer();
              showInlinePlayButton(
                "영상이 끝났습니다. 다시 재생하거나 다음 콘텐츠로 넘겨주세요."
              );
              break;
          }
        },

        onAutoplayBlocked() {
          if (!isCurrent()) return;

          clearPlaybackTimer();

          showInlinePlayButton(
            "자동재생이 차단되었습니다. 영상 재생 버튼을 눌러주세요."
          );
        },

        onError(event) {
          if (!isCurrent()) return;

          const messages = {
            2: "영상 ID 또는 재생 설정이 올바르지 않습니다.",
            5: "브라우저에서 HTML5 영상 재생에 실패했습니다.",
            100: "영상이 삭제되었거나 비공개 상태입니다.",
            101: "영상 소유자가 외부 사이트 재생을 허용하지 않았습니다.",
            150: "영상 소유자가 외부 사이트 재생을 허용하지 않았습니다.",
            153: "유튜브가 재생 요청의 출처를 확인하지 못했습니다.",
          };

          const reason =
            messages[event.data] || "원인을 확인할 수 없는 재생 오류입니다.";

          console.error("SCENE 3-A 유튜브 오류", {
            code: event.data,
            videoId: content.videoId,
            protocol: location.protocol,
          });

          showVideoFallback(
            `재생 오류 ${event.data}: ${reason}`
          );
        },
      },
    });
  } catch (error) {
    if (!isCurrent()) return;

    // 실패한 API 요청을 다음 진입 때 다시 시도할 수 있게 합니다.
    apiPromise = null;

    console.error("SCENE 3-A 플레이어 연결 실패", error);

    showVideoFallback(
      "유튜브 플레이어 연결에 실패했습니다. 인터넷 연결이나 콘텐츠 차단 설정을 확인해주세요."
    );
  }
}
function isContentActive() {
  const contentStates = [
    "initial",
    "content-02",
    "content-03",
    "content-04",
    "content-05",
  ];

  return (
    active &&
    !scene.hidden &&
    contentStates.includes(scene.dataset.state)
  );
}

function resetMemory() {
  selectedMemoryAnswer = null;

  memoryInputs.forEach((input) => {
    input.checked = false;
  });

  memorySubmit.disabled = true;
  memoryPanel.hidden = true;
  resultArea.hidden = true;

  resultTitle.textContent = "";
  resultIcon.textContent = "";
  resultContentLabel.textContent = "";
  resultContentTitle.textContent = "";

  // 공개된 이름·아이콘·정답 표시까지 제거합니다.
  historyItems.forEach((item, itemIndex) => {
    item.classList.remove("is-answer", "is-viewed");
    item.textContent =
      `${String(itemIndex + 1).padStart(2, "0")} EMPTY`;
  });
}

function updateContent() {
  const content = contents[index];
  const total = contents.length;
  const isLast = index === total - 1;
  const displayNumber = String(index + 1).padStart(2, "0");
  const displayTotal = String(total).padStart(2, "0");

  scene.dataset.state =
    index === 0 ? "initial" : `content-${displayNumber}`;

  scene.dataset.contentIndex = String(index);
  scene.dataset.contentKey = content.key;
  screen.dataset.contentIndex = String(index);

  phone.hidden = false;
  summary.hidden = false;
  memoryPanel.hidden = true;

  number.textContent =
    `CONTENT ${displayNumber} / ${displayTotal}`;

  title.textContent = content.title;
  currentNumber.textContent = displayNumber;

// 실제 재생 완료 수가 아니라, 지나온 콘텐츠 수입니다.
  historyCount.textContent =
    `${String(index).padStart(2, "0")} / ${displayTotal}`;

  historyItems.forEach((item, itemIndex) => {
    const viewed = itemIndex < index;
    const current = isLast && itemIndex === index;

    item.classList.toggle("is-viewed", viewed);

    const status = viewed
      ? "VIEWED"
      : current
        ? "CURRENT"
        : "EMPTY";

    item.textContent =
      `${String(itemIndex + 1).padStart(2, "0")} ${status}`;
  });

  const summaryLabel = scene.querySelector(
    ".scene03a-summary-label"
  );
  const summaryTitle = scene.querySelector(
    "#scene03a-summary-title"
  );
  const summaryDescription = scene.querySelector(
    "#scene03a-summary-description"
  );

  summaryLabel.textContent = isLast
    ? "CONTENTS REACHED"
    : "CONTENTS VIEWED";

  summaryTitle.textContent = isLast
    ? "ONE MORE SCROLL?"
    : "KEEP SCROLLING!";

  summaryDescription.textContent = isLast
    ? "방금 지나온 콘텐츠들을 기억하시나요?"
    : "새로운 콘텐츠가 기다리고 있습니다.";

  // 마지막 콘텐츠에서도 질문으로 이동할 수 있도록 활성화합니다.
  nextButton.disabled = false;
  nextButton.textContent = isLast
    ? "기억 확인하기 →"
    : "다음 콘텐츠 ↓";

  renderVideo();
}

function resetInput() {
  wheelTotal = 0;
  lastWheelTime = 0;
  wheelGestureUsed = false;
  touchStart = null;
  locked = false;

  window.clearTimeout(lockTimer);
  lockTimer = null;
}

function showMemoryCheck() {
  if (!isContentActive() || index !== contents.length - 1) {
    return;
  }

  // 먼저 상태를 바꿔 추가 입력과 플레이어 생성을 차단합니다.
  scene.dataset.state = "memory-check";

  // 대기 중인 영상 로딩과 이전 이벤트를 무효화합니다.
  ++renderVersion;

  resetInput();
  clearPlayer();
  resetMemory();

  phone.hidden = true;
  summary.hidden = true;
  memoryPanel.hidden = false;

  const total = String(contents.length).padStart(2, "0");
  historyCount.textContent = `${total} / ${total}`;

  // 마지막 콘텐츠도 지나왔으므로 모든 기록을 완료 표시합니다.
  historyItems.forEach((item, itemIndex) => {
    item.classList.add("is-viewed");
    item.textContent =
      `${String(itemIndex + 1).padStart(2, "0")} VIEWED`;
  });

  memoryTitle.focus({ preventScroll: true });
}
function showMemoryResult() {
  if (
    !active ||
    scene.hidden ||
    scene.dataset.state !== "memory-check" ||
    !selectedMemoryAnswer
  ) {
    return;
  }

  const answerIndex = 2;
  const answer = contents[answerIndex];

  // 선택값이 실제 선택지 중 하나인지 확인합니다.
  const hasValidSelection = Array.from(memoryInputs).some(
    (input) => input.value === selectedMemoryAnswer
  );

  if (!answer || !hasValidSelection) return;

  const isCorrect = selectedMemoryAnswer === answer.key;

  // 상태를 먼저 바꿔 중복 실행과 콘텐츠 입력을 차단합니다.
  scene.dataset.state = "memory-result";
  memorySubmit.disabled = true;

  // 남아 있는 영상 작업과 재생 확인 타이머를 정리합니다.
  ++renderVersion;
  resetInput();
  clearPlayer();

  phone.hidden = true;
  summary.hidden = true;
  memoryPanel.hidden = true;

  resultTitle.textContent = isCorrect
    ? "맞혔어요!"
    : `세 번째 콘텐츠는 ‘${answer.label}’이었습니다.`;

  const answerNumber = String(answerIndex + 1).padStart(2, "0");

  resultIcon.textContent = answer.icon;
  resultContentLabel.textContent =
    `CONTENT ${answerNumber} / ${answer.key.toUpperCase()}`;
  resultContentTitle.textContent = `${answer.label} 영상`;

  const total = String(contents.length).padStart(2, "0");
  historyCount.textContent = `${total} / ${total}`;

  historyItems.forEach((item, itemIndex) => {
    const content = contents[itemIndex];
    const isAnswer = itemIndex === answerIndex;

    item.classList.remove("is-viewed");
    item.classList.toggle("is-answer", isAnswer);

    const label = document.createElement("span");

    label.textContent =
      `${String(itemIndex + 1).padStart(2, "0")} ` +
      `${content.icon} ${content.label}`;

   // 기존 VIEWED 문구를 남기지 않고 새 내용으로 교체합니다.
    item.replaceChildren(label);

    if (isAnswer) {
      const tag = document.createElement("span");
      tag.className = "scene03a-answer-tag";
      tag.textContent = "ANSWER";
      item.append(tag);
    }
  });

  resultArea.hidden = false;
  resultTitle.focus({ preventScroll: true });

  // 추후 다음 장면이 준비되면 #scene03a-result-next의
  // disabled를 해제하고, 장면 전환 이벤트를 연결하세요.
  // 이번 단계에서는 이동 이벤트를 등록하지 않습니다.
}
function goNext() {
  if (!isContentActive() || locked) return;

  if (index === contents.length - 1) {
    showMemoryCheck();
    return;
  }

  locked = true;
  wheelGestureUsed = true;
  lastWheelTime = performance.now();
  wheelTotal = 0;

  index += 1;
  updateContent();

  window.clearTimeout(lockTimer);

  lockTimer = window.setTimeout(() => {
    locked = false;
    lockTimer = null;
  }, 800);
}

// 플레이어 바깥의 카드 영역에서 스크롤을 받습니다.
phone.addEventListener("wheel", (event) => {
  if (!isContentActive() || event.ctrlKey) return;

  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return;
  }

  if (event.deltaY === 0) return;

  const now = performance.now();

  // 관성 입력이 끊긴 다음에만 새 넘김 동작을 받습니다.
  if (now - lastWheelTime > 300) {
    wheelTotal = 0;
    wheelGestureUsed = false;
  }

  lastWheelTime = now;

  if (event.deltaY < 0) {
    wheelTotal = 0;
    return;
  }

  event.preventDefault();

  if (locked || wheelGestureUsed) return;

  const multiplier =
    event.deltaMode === 1 ? 16 :
    event.deltaMode === 2 ? phone.clientHeight : 1;

  wheelTotal += event.deltaY * multiplier;

  if (wheelTotal >= 100) {
    goNext();
  }
}, { passive: false });

phone.addEventListener("keydown", (event) => {
  if (
    !isContentActive() ||
    document.activeElement !== phone ||
    event.key !== "ArrowDown"
  ) {
    return;
  }

  event.preventDefault();

  if (!event.repeat) {
    goNext();
  }
});

// 스와이프는 iframe 바깥 카드 영역에서 받습니다.
phone.addEventListener("touchstart", (event) => {
  if (!isContentActive() || event.touches.length !== 1) {
    touchStart = null;
    return;
  }

  touchStart = {
    x: event.touches[0].clientX,
    y: event.touches[0].clientY,
  };
}, { passive: true });

phone.addEventListener("touchend", (event) => {
  if (!touchStart || !isContentActive()) return;

  const touch = event.changedTouches[0];

  if (!touch) {
    touchStart = null;
    return;
  }

  const upward = touchStart.y - touch.clientY;
  const sideways = Math.abs(touchStart.x - touch.clientX);

  touchStart = null;

  if (upward >= 60 && upward > sideways) {
    goNext();
  }
}, { passive: true });

phone.addEventListener("touchcancel", () => {
  touchStart = null;
});

nextButton.addEventListener("click", goNext);

// 라디오 입력의 기본 키보드 조작을 그대로 사용합니다.
memoryPanel.addEventListener("change", (event) => {
  if (
    !active ||
    scene.hidden ||
    scene.dataset.state !== "memory-check"
  ) {
    return;
  }

  if (
    !event.target.matches(
      'input[name="scene03a-memory-answer"]'
    )
  ) {
    return;
  }

  selectedMemoryAnswer = event.target.value;
  memorySubmit.disabled = false;

  // 답변 선택만으로 결과 화면을 열지 않습니다.
});

// 네이티브 버튼이므로 Enter·Space도 click으로 처리됩니다.
memorySubmit.addEventListener("click", showMemoryResult);
// SCENE 3-A 결과 ↔ SCENE 3-B 초기 화면
const scene03b = document.querySelector("#scene-03-b");
const toScene03bButton = scene.querySelector(
  "#scene03a-result-next"
);
const scene03bBackButton = scene03b?.querySelector(
  "#scene03b-back"
);

function updateScene03Header() {
  const sceneNumber = document.querySelector("#scene-number");

  if (sceneNumber) {
    sceneNumber.textContent = "SCENE 03 / 05";
  }
}

function focusScene03Title(element) {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });

  element?.focus({ preventScroll: true });
}

if (scene03b && toScene03bButton && scene03bBackButton) {
  toScene03bButton.addEventListener("click", () => {
    if (
      scene.hidden ||
      scene.dataset.state !== "memory-result"
    ) {
      return;
    }

    // 숨기기 전에 결과 보존 표시를 설정합니다.
    scene.dataset.preserveResult = "true";

    ++renderVersion;
    resetInput();
    clearPlayer();

    scene03b.dataset.state = "initial";
    scene.hidden = true;
    scene03b.hidden = false;

    updateScene03Header();

    focusScene03Title(
      scene03b.querySelector("#scene03b-title")
    );
  });

  scene03bBackButton.addEventListener("click", () => {
    if (scene03b.hidden) return;

    // SCENE 3-A의 결과를 초기화하지 않고 다시 표시합니다.
    scene.dataset.preserveResult = "true";

    scene03b.hidden = true;
    scene.hidden = false;

    updateScene03Header();

    focusScene03Title(
      scene.querySelector("#scene03a-result-title")
    );
  });
} else {
  console.warn(
    "SCENE 3-B: 장면 영역과 이전·다음 버튼의 ID를 확인해주세요."
  );
}
function syncVisibility() {
  const visible = !scene.hidden;

  if (visible && !active) {
    active = true;

    const keepResult =
      scene.dataset.preserveResult === "true" &&
      scene.dataset.state === "memory-result";

    delete scene.dataset.preserveResult;

    // SCENE 3-B에서 돌아왔다면 결과와 답변을 그대로 유지합니다.
    if (keepResult) {
      resetInput();
      return;
    }

    // SCENE 2에서 새로 들어오면 기존처럼 처음부터 시작합니다.
    index = 0;

    resetInput();
    resetMemory();
    updateContent();
    return;
  }

  if (!visible) {
    active = false;
    ++renderVersion;

    // 숨겨진 동안에는 입력과 영상 재생을 정리합니다.
    resetInput();
    clearPlayer();
    lastCanEmbed = null;

    const keepResult =
      scene.dataset.preserveResult === "true" &&
      scene.dataset.state === "memory-result";

    // SCENE 3-B로 이동하는 경우에만 결과를 보존합니다.
    if (keepResult) return;

    delete scene.dataset.preserveResult;
    resetMemory();
  }
}

new MutationObserver(syncVisibility).observe(scene, {
  attributes: true,
  attributeFilter: ["hidden"],
});

new ResizeObserver(() => {
  // 질문 중에는 화면 크기를 바꿔도 영상을 다시 만들지 않습니다.
  if (!isContentActive()) return;

  const canEmbed = host.parentElement.clientWidth >= 200;

  if (canEmbed !== lastCanEmbed) {
    renderVideo();
  }
}).observe(host.parentElement);

window.addEventListener("pagehide", () => {
  active = false;
  ++renderVersion;

  resetInput();
  clearPlayer();
  resetMemory();
});

window.addEventListener("pageshow", syncVisibility);

syncVisibility();
})();
// SCENE 3-B / STATE 01~02
(() => {
  const scene = document.querySelector("#scene-03-b");
  if (!scene) return;

  const startButton = scene.querySelector("#scene03b-start");
  const appGrid = scene.querySelector("#scene03b-app-grid");
  const messageApp = scene.querySelector(
    '.scene03b-app[data-app="message"]'
  );
  const apps = scene.querySelectorAll(".scene03b-app");

  const phoneLabel = scene.querySelector("#scene03b-phone-label");
  const messagePanel = scene.querySelector("#scene03b-message");
  const messageTitle = scene.querySelector("#scene03b-message-title");
  const appCount = scene.querySelector("#scene03b-app-count");
  const currentGoal = scene.querySelector("#scene03b-current-goal");
  const activityLog = scene.querySelector("#scene03b-activity-log");

  if (
    !startButton ||
    !appGrid ||
    !messageApp ||
    !phoneLabel ||
    !messagePanel ||
    !messageTitle ||
    !appCount ||
    !currentGoal ||
    !activityLog
  ) {
    console.warn(
      "SCENE 3-B: 메시지 화면과 활동 기록 HTML의 ID를 확인해주세요."
    );
    return;
  }

  let sceneIsActive = false;

  function setStartText(text) {
    const label = startButton.querySelector("span");
    if (label) label.textContent = text;
  }

  function resetScene03b() {
    scene.dataset.state = "initial";

    appGrid.hidden = false;
    messagePanel.hidden = true;
    activityLog.hidden = true;

    phoneLabel.textContent = "YOUR PHONE / HOME";
    appCount.textContent = "00";
    appCount.setAttribute("aria-label", "열어 본 앱 0개");
    currentGoal.textContent = "CHECK MESSAGE";

    apps.forEach((app) => {
      app.disabled = true;
    });

    startButton.disabled = false;
    startButton.removeAttribute("aria-disabled");
    startButton.removeAttribute("title");
    setStartText("START CHECKING");
  }

  // 시작 버튼을 누른 뒤 MESSAGE 앱을 선택할 수 있습니다.
  startButton.addEventListener("click", () => {
    if (
      scene.hidden ||
      !sceneIsActive ||
      scene.dataset.state !== "initial"
    ) {
      return;
    }

    scene.dataset.state = "checking";

    startButton.disabled = true;
    setStartText("CHECKING...");

    messageApp.disabled = false;
    messageApp.focus({ preventScroll: true });
  });

  // MESSAGE 앱을 열면 STATE 02로 전환합니다.
  messageApp.addEventListener("click", () => {
    if (
      scene.hidden ||
      !sceneIsActive ||
      scene.dataset.state !== "checking"
    ) {
      return;
    }

    scene.dataset.state = "message";

    appGrid.hidden = true;
    messagePanel.hidden = false;
    activityLog.hidden = false;

    phoneLabel.textContent = "YOUR PHONE / MESSAGE";
    appCount.textContent = "01";
    appCount.setAttribute("aria-label", "열어 본 앱 1개");
    currentGoal.textContent = "CHECK MESSAGE";

    messageApp.disabled = true;
    messageTitle.focus({ preventScroll: true });

    // 홈으로 돌아가기는 다음 STATE에서 연결합니다.
  });

  function syncScene03bVisibility() {
    const visible = !scene.hidden;

    if (visible && !sceneIsActive) {
      sceneIsActive = true;
      resetScene03b();
      return;
    }

    if (!visible) {
      sceneIsActive = false;
      resetScene03b();
    }
  }

  new MutationObserver(syncScene03bVisibility).observe(scene, {
    attributes: true,
    attributeFilter: ["hidden"],
  });

  window.addEventListener("pagehide", () => {
    sceneIsActive = false;
    resetScene03b();
  });

  window.addEventListener("pageshow", syncScene03bVisibility);

  syncScene03bVisibility();
})();