(function () {
  "use strict";

  const STORE_KEY = "pulse-board-entries-v3";
  const LEGACY_KEYS = ["pulse-board-entries-v2", "pulse-board-entries-v1"];
  const SETTINGS_KEY = "pulse-board-settings-v3";
  const LEGACY_SETTINGS_KEYS = ["pulse-board-settings-v2", "pulse-board-settings-v1"];
  const TODAY = toISODate(new Date());

  const SLOTS = [
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "evening", label: "Evening" },
    { id: "night", label: "Night" }
  ];

  const ENERGY_LEVELS = [
    { id: "low", label: "Low", score: 35, color: "#cf5b4e" },
    { id: "normal", label: "Normal", score: 70, color: "#c2922e" },
    { id: "high", label: "High", score: 92, color: "#4f8c58" }
  ];

  const HABITS = [
    { id: "sunlight", label: "Sunlight 15+ mins", type: "support" },
    { id: "selfCritical", label: "Self critical", type: "load" },
    { id: "news", label: "News 15+ mins", type: "load" },
    { id: "periods", label: "Periods", type: "neutral" },
    { id: "crying", label: "Crying", type: "load" },
    { id: "music", label: "Listening music", type: "support" },
    { id: "exerciseGym", label: "Exercise / gym", type: "support" },
    { id: "walks", label: "Walks", type: "support" }
  ];

  const MOOD_GROUPS = [
    { id: "general", label: "General", color: "#6b7479", quadrant: "general" },
    { id: "joy", label: "Joy", color: "#e6a93d", quadrant: "positive" },
    { id: "trust", label: "Trust", color: "#4f8c58", quadrant: "positive" },
    { id: "fear", label: "Fear", color: "#6e65a8", quadrant: "difficult" },
    { id: "sadness", label: "Sadness", color: "#356fb4", quadrant: "difficult" },
    { id: "anger", label: "Anger", color: "#cf5b4e", quadrant: "difficult" },
    { id: "disgust", label: "Disgust", color: "#758b42", quadrant: "difficult" },
    { id: "surprise", label: "Surprise", color: "#c2922e", quadrant: "neutral" },
    { id: "anticipation", label: "Anticipation", color: "#1d91b8", quadrant: "neutral" }
  ];

  const QUADRANTS = {
    positive: { x: 0.62, y: 0.62, label: "Positive" },
    neutral: { x: -0.58, y: 0.56, label: "Neutral / mixed" },
    difficult: { x: -0.62, y: -0.58, label: "Difficult" },
    general: { x: 0.56, y: -0.54, label: "General state" }
  };

  const MOODS = [
    mood("normal", "General", "Normal", "😐", 6),
    mood("calm", "General", "Calm", "🙂", 8),
    mood("sleepy", "General", "Sleepy", "😴", 5),
    mood("focused", "General", "Focused", "🤓", 8),
    mood("confident", "General", "Confident", "😎", 8),
    mood("pensive", "General", "Pensive", "🤔", 6),
    mood("indifferent", "General", "Indifferent", "😶", 5, "neutral"),
    mood("exhausted", "General", "Exhausted", "😵", 3),

    mood("happy", "Joy", "Happy", "😄", 9),
    mood("excited", "Joy", "Excited", "🤩", 9),
    mood("hopeful", "Joy", "Hopeful", "😊", 8),
    mood("peaceful", "Joy", "Peaceful", "😇", 9),
    mood("playful", "Joy", "Playful", "😉", 8),
    mood("proud", "Joy", "Proud", "😌", 8),
    mood("relaxed", "Joy", "Relaxed", "☺️", 9),
    mood("satisfied", "Joy", "Satisfied", "🙂", 8),
    mood("grateful", "Joy", "Grateful", "🙏", 9),
    mood("in_love", "Joy", "In love", "😍", 9),

    mood("safe", "Trust", "Safe", "🫶", 9),
    mood("accepted", "Trust", "Accepted", "🤝", 8),
    mood("admiring", "Trust", "Admiring", "🤗", 8),
    mood("caring", "Trust", "Caring", "🥰", 8),
    mood("supported", "Trust", "Supported", "🤲", 8),
    mood("connected", "Trust", "Connected", "💛", 8),

    mood("worried", "Fear", "Worried", "😰", 4),
    mood("anxious", "Fear", "Anxious", "😟", 3),
    mood("nervous", "Fear", "Nervous", "😬", 4),
    mood("scared", "Fear", "Scared", "😨", 3),
    mood("overwhelmed", "Fear", "Overwhelmed", "🫨", 3),
    mood("insecure", "Fear", "Insecure", "🫣", 4),

    mood("sad", "Sadness", "Sad", "😔", 3),
    mood("lonely", "Sadness", "Lonely", "😞", 3),
    mood("tired", "Sadness", "Tired", "😪", 4),
    mood("disappointed", "Sadness", "Disappointed", "😕", 4),
    mood("grieving", "Sadness", "Grieving", "😢", 2),
    mood("empty", "Sadness", "Empty", "😶", 3),

    mood("angry", "Anger", "Angry", "😠", 3),
    mood("frustrated", "Anger", "Frustrated", "😤", 4),
    mood("irritated", "Anger", "Irritated", "😒", 5),
    mood("tense", "Anger", "Tense", "😣", 4),
    mood("resentful", "Anger", "Resentful", "😑", 3),
    mood("furious", "Anger", "Furious", "😡", 2),

    mood("disgusted", "Disgust", "Disgusted", "🤢", 3),
    mood("uncomfortable", "Disgust", "Uncomfortable", "😖", 4),
    mood("judgmental", "Disgust", "Judgmental", "🙄", 4),
    mood("withdrawn", "Disgust", "Withdrawn", "😶‍🌫️", 3),
    mood("suspicious", "Disgust", "Suspicious", "🧐", 4),

    mood("surprised", "Surprise", "Surprised", "😮", 7),
    mood("amazed", "Surprise", "Amazed", "😲", 8),
    mood("confused", "Surprise", "Confused", "😵‍💫", 4),
    mood("stunned", "Surprise", "Stunned", "😯", 5),
    mood("wondering", "Surprise", "Wondering", "🤨", 6),

    mood("curious", "Anticipation", "Curious", "🧐", 8),
    mood("interested", "Anticipation", "Interested", "👀", 8),
    mood("motivated", "Anticipation", "Motivated", "💪", 9),
    mood("alert", "Anticipation", "Alert", "👁️", 7),
    mood("optimistic", "Anticipation", "Optimistic", "🌤️", 9),
    mood("impatient", "Anticipation", "Impatient", "😬", 5)
  ];

  const DEFAULT_SETTINGS = {
    sleepTarget: 8,
    waterTarget: 8,
    mindfulTarget: 10,
    stepsTarget: 8000,
    pinnedMoods: ["normal", "happy", "calm", "hopeful", "worried", "sad", "angry", "tired", "focused", "grateful"]
  };

  const state = {
    entries: sanitizeEntries(readStoredEntries()),
    settings: normalizeSettings(readStoredSettings()),
    selectedDate: TODAY,
    calendarMonth: TODAY.slice(0, 7),
    analyticsMode: "month",
    activeView: "entry",
    activeSlot: "morning",
    activeGroup: "general",
    lastSelectedMood: "",
    workingSlots: emptySlots(),
    installPrompt: null
  };

  const els = {
    form: document.getElementById("trackerForm"),
    entryTabBtn: document.getElementById("entryTabBtn"),
    statsTabBtn: document.getElementById("statsTabBtn"),
    entryView: document.getElementById("entryView"),
    statsView: document.getElementById("statsView"),
    entryDate: document.getElementById("entryDate"),
    saveBtn: document.getElementById("saveBtn"),
    saveEntryBtn: document.getElementById("saveEntryBtn"),
    backupBtn: document.getElementById("backupBtn"),
    restoreInput: document.getElementById("restoreInput"),
    csvBtn: document.getElementById("csvBtn"),
    installBtn: document.getElementById("installBtn"),
    scoreRing: document.getElementById("scoreRing"),
    scoreValue: document.getElementById("scoreValue"),
    scoreTitle: document.getElementById("scoreTitle"),
    scoreCopy: document.getElementById("scoreCopy"),
    streakValue: document.getElementById("streakValue"),
    avgValue: document.getElementById("avgValue"),
    monthValue: document.getElementById("monthValue"),
    leverValue: document.getElementById("leverValue"),
    leverHint: document.getElementById("leverHint"),
    clusterChart: document.getElementById("clusterChart"),
    patternChart: document.getElementById("patternChart"),
    slotGrid: document.getElementById("slotGrid"),
    selectedMoodRow: document.getElementById("selectedMoodRow"),
    quickMoodRow: document.getElementById("quickMoodRow"),
    groupTabs: document.getElementById("groupTabs"),
    moodGrid: document.getElementById("moodGrid"),
    slotNote: document.getElementById("slotNote"),
    slotNoteLabel: document.getElementById("slotNoteLabel"),
    pinMoodBtn: document.getElementById("pinMoodBtn"),
    moodBars: document.getElementById("moodBars"),
    energyBars: document.getElementById("energyBars"),
    metricBars: document.getElementById("metricBars"),
    weekModeBtn: document.getElementById("weekModeBtn"),
    monthModeBtn: document.getElementById("monthModeBtn"),
    yearModeBtn: document.getElementById("yearModeBtn"),
    calendarTitle: document.getElementById("calendarTitle"),
    monthCalendar: document.getElementById("monthCalendar"),
    prevMonthBtn: document.getElementById("prevMonthBtn"),
    nextMonthBtn: document.getElementById("nextMonthBtn"),
    feedList: document.getElementById("feedList"),
    insightList: document.getElementById("insightList"),
    toast: document.getElementById("toast")
  };

  const fields = {
    energyLevel: document.getElementById("energyLevel"),
    energyLevelValue: document.getElementById("energyLevelValue"),
    stress: document.getElementById("stress"),
    stressValue: document.getElementById("stressValue"),
    sleep: document.getElementById("sleep"),
    water: document.getElementById("water"),
    mindful: document.getElementById("mindful"),
    steps: document.getElementById("steps"),
    notes: document.getElementById("notes")
  };

  init();

  function init() {
    writeJSON(STORE_KEY, state.entries);
    writeJSON(SETTINGS_KEY, state.settings);
    els.entryDate.value = state.selectedDate;
    loadEntry(state.selectedDate);
    bindEvents();
    renderAll();
    registerServiceWorker();
  }

  function bindEvents() {
    els.entryTabBtn.addEventListener("click", () => setView("entry"));
    els.statsTabBtn.addEventListener("click", () => setView("stats"));

    els.form.addEventListener("input", (event) => {
      if (event.target === els.slotNote) {
        state.workingSlots[state.activeSlot].note = els.slotNote.value;
      }
      updateLiveLabels();
      renderLiveScore();
    });

    els.entryDate.addEventListener("change", () => {
      state.selectedDate = els.entryDate.value || TODAY;
      state.calendarMonth = state.selectedDate.slice(0, 7);
      loadEntry(state.selectedDate);
      renderAll();
    });

    els.saveBtn.addEventListener("click", saveAndConfirm);
    els.saveEntryBtn.addEventListener("click", saveAndConfirm);
    els.backupBtn.addEventListener("click", createBackup);
    els.csvBtn.addEventListener("click", exportCSV);
    els.restoreInput.addEventListener("change", restoreBackup);
    els.pinMoodBtn.addEventListener("click", togglePinnedMood);

    els.weekModeBtn.addEventListener("click", () => setAnalyticsMode("week"));
    els.monthModeBtn.addEventListener("click", () => setAnalyticsMode("month"));
    els.yearModeBtn.addEventListener("click", () => setAnalyticsMode("year"));

    els.prevMonthBtn.addEventListener("click", () => shiftCalendarMonth(-1));
    els.nextMonthBtn.addEventListener("click", () => shiftCalendarMonth(1));

    window.addEventListener("resize", () => {
      drawClusterChart();
      drawPatternChart();
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.installPrompt = event;
      els.installBtn.hidden = false;
    });

    els.installBtn.addEventListener("click", async () => {
      if (!state.installPrompt) return;
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      els.installBtn.hidden = true;
    });
  }

  function setView(view) {
    state.activeView = view;
    els.entryTabBtn.dataset.active = view === "entry";
    els.statsTabBtn.dataset.active = view === "stats";
    els.entryView.hidden = view !== "entry";
    els.statsView.hidden = view !== "stats";
    if (view === "stats") {
      drawClusterChart();
      drawPatternChart();
    }
  }

  function loadEntry(date) {
    const entry = normalizeEntry(state.entries[date], date);
    fields.energyLevel.value = energyIndex(entry.energyLevel);
    fields.stress.value = entry.stress;
    fields.sleep.value = entry.sleep;
    fields.water.value = entry.water;
    fields.mindful.value = entry.mindful;
    fields.steps.value = entry.steps;
    fields.notes.value = entry.notes || "";
    state.workingSlots = cloneSlots(entry.slots);
    state.lastSelectedMood = firstSelectedMood(state.workingSlots[state.activeSlot]);

    document.querySelectorAll('input[name="habit"]').forEach((input) => {
      input.checked = (entry.habits || []).includes(input.value);
    });

    updateLiveLabels();
    renderMoodSection();
  }

  function collectEntry() {
    state.workingSlots[state.activeSlot].note = els.slotNote.value.trim();
    const habits = Array.from(document.querySelectorAll('input[name="habit"]:checked'))
      .map((input) => input.value);
    const legacy = state.entries[state.selectedDate] || {};

    return normalizeEntry({
      ...legacy,
      date: state.selectedDate,
      energyLevel: ENERGY_LEVELS[Number(fields.energyLevel.value)].id,
      stress: clampNumber(fields.stress.value, 1, 10),
      sleep: clampNumber(fields.sleep.value, 0, 24),
      water: clampNumber(fields.water.value, 0, 30),
      mindful: clampNumber(fields.mindful.value, 0, 180),
      steps: clampNumber(fields.steps.value, 0, 100000),
      slots: cloneSlots(state.workingSlots),
      habits,
      notes: fields.notes.value.trim(),
      updatedAt: new Date().toISOString()
    }, state.selectedDate);
  }

  function saveAndConfirm() {
    const entry = saveCurrentEntry();
    showToast(`Saved ${formatDate(entry.date)}`);
  }

  function saveCurrentEntry() {
    const entry = collectEntry();
    state.entries[entry.date] = entry;
    writeJSON(STORE_KEY, state.entries);
    state.calendarMonth = entry.date.slice(0, 7);
    renderAll();
    return entry;
  }

  function renderAll() {
    renderMoodSection();
    renderLiveScore();
    renderSummary();
    renderMoodBars();
    renderEnergyBars();
    renderMetricBars();
    renderCalendar();
    renderFeed();
    renderInsights();
    drawClusterChart();
    drawPatternChart();
  }

  function renderMoodSection() {
    renderSlotGrid();
    renderSelectedMoodRow();
    renderQuickMoodRow();
    renderGroupTabs();
    renderMoodGrid();
    updateSlotNote();
    updatePinButton();
  }

  function renderSlotGrid() {
    els.slotGrid.innerHTML = "";
    SLOTS.forEach((slot) => {
      const slotData = state.workingSlots[slot.id] || { emotions: [] };
      const selectedMoods = slotData.emotions.map(getMood).filter(Boolean);
      const emojiMarkup = selectedMoods.length
        ? selectedMoods.slice(0, 4).map((item) => `<span class="emoji">${item.emoji}</span>`).join("")
        : `<span class="emoji">＋</span>`;
      const label = selectedMoods.length
        ? selectedMoods.map((item) => item.label).join(", ")
        : "Choose mood";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot-card";
      button.dataset.active = slot.id === state.activeSlot;
      button.innerHTML = [
        `<span class="emoji-stack">${emojiMarkup}</span>`,
        `<strong>${escapeHTML(slot.label)}</strong>`,
        `<small>${escapeHTML(label)}</small>`
      ].join("");
      button.addEventListener("click", () => {
        state.workingSlots[state.activeSlot].note = els.slotNote.value.trim();
        state.activeSlot = slot.id;
        state.lastSelectedMood = firstSelectedMood(state.workingSlots[slot.id]);
        renderMoodSection();
      });
      els.slotGrid.appendChild(button);
    });
  }

  function renderSelectedMoodRow() {
    const emotions = state.workingSlots[state.activeSlot].emotions || [];
    if (!emotions.length) {
      els.selectedMoodRow.innerHTML = `<button class="selected-chip" type="button">No mood selected</button>`;
      return;
    }

    els.selectedMoodRow.innerHTML = "";
    emotions.map(getMood).filter(Boolean).forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "selected-chip";
      button.textContent = `${item.emoji} ${item.label} ×`;
      button.addEventListener("click", () => toggleMood(item.id));
      els.selectedMoodRow.appendChild(button);
    });
  }

  function renderQuickMoodRow() {
    const selected = state.workingSlots[state.activeSlot].emotions || [];
    els.quickMoodRow.innerHTML = "";
    state.settings.pinnedMoods.map(getMood).filter(Boolean).forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-chip";
      button.dataset.active = selected.includes(item.id);
      button.textContent = `${item.emoji} ${item.label}`;
      button.addEventListener("click", () => toggleMood(item.id));
      els.quickMoodRow.appendChild(button);
    });
  }

  function renderGroupTabs() {
    els.groupTabs.innerHTML = "";
    MOOD_GROUPS.forEach((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "group-tab";
      button.dataset.active = group.id === state.activeGroup;
      button.textContent = group.label;
      button.addEventListener("click", () => {
        state.activeGroup = group.id;
        renderMoodSection();
      });
      els.groupTabs.appendChild(button);
    });
  }

  function renderMoodGrid() {
    const groupLabel = getGroup(state.activeGroup).label;
    const selected = state.workingSlots[state.activeSlot].emotions || [];
    const moods = MOODS.filter((item) => item.group === groupLabel);
    els.moodGrid.innerHTML = "";

    moods.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mood-choice";
      button.dataset.selected = selected.includes(item.id);
      button.innerHTML = [
        `<span class="emoji">${item.emoji}</span>`,
        `<span>${escapeHTML(item.label)}</span>`
      ].join("");
      button.addEventListener("click", () => toggleMood(item.id));
      els.moodGrid.appendChild(button);
    });
  }

  function updateSlotNote() {
    const slot = SLOTS.find((item) => item.id === state.activeSlot) || SLOTS[0];
    const slotData = state.workingSlots[state.activeSlot] || {};
    els.slotNoteLabel.textContent = `${slot.label} note`;
    els.slotNote.value = slotData.note || "";
  }

  function toggleMood(moodId) {
    const slot = state.workingSlots[state.activeSlot];
    const existing = slot.emotions.indexOf(moodId);
    if (existing >= 0) {
      slot.emotions.splice(existing, 1);
      if (state.lastSelectedMood === moodId) {
        state.lastSelectedMood = firstSelectedMood(slot);
      }
    } else {
      slot.emotions.push(moodId);
      state.lastSelectedMood = moodId;
    }
    renderMoodSection();
    renderLiveScore();
  }

  function updatePinButton() {
    const moodId = state.lastSelectedMood || firstSelectedMood(state.workingSlots[state.activeSlot]);
    if (!moodId) {
      els.pinMoodBtn.textContent = "Pin mood";
      return;
    }
    els.pinMoodBtn.textContent = state.settings.pinnedMoods.includes(moodId) ? "Unpin mood" : "Pin mood";
  }

  function togglePinnedMood() {
    const moodId = state.lastSelectedMood || firstSelectedMood(state.workingSlots[state.activeSlot]);
    if (!moodId) {
      showToast("Choose a mood first");
      return;
    }

    const pinned = state.settings.pinnedMoods.slice();
    const index = pinned.indexOf(moodId);
    if (index >= 0) {
      pinned.splice(index, 1);
      showToast("Mood unpinned");
    } else if (pinned.length >= 10) {
      showToast("You can pin up to 10 moods");
      return;
    } else {
      pinned.push(moodId);
      showToast("Mood pinned");
    }

    state.settings.pinnedMoods = pinned;
    writeJSON(SETTINGS_KEY, state.settings);
    renderMoodSection();
  }

  function updateLiveLabels() {
    fields.stressValue.textContent = fields.stress.value;
    fields.energyLevelValue.textContent = ENERGY_LEVELS[Number(fields.energyLevel.value)].label;
  }

  function renderLiveScore() {
    const entry = collectEntry();
    const score = calculateScore(entry);
    els.scoreRing.style.setProperty("--score", score);
    els.scoreValue.textContent = score;

    if (score >= 82) {
      els.scoreTitle.textContent = "Strong day";
      els.scoreCopy.textContent = "Your recovery, emotions, and daily anchors are lining up well.";
    } else if (score >= 65) {
      els.scoreTitle.textContent = "Balanced day";
      els.scoreCopy.textContent = "Your current inputs are trending steady.";
    } else if (score >= 45) {
      els.scoreTitle.textContent = "Tender day";
      els.scoreCopy.textContent = "A small support action may move the day back toward center.";
    } else {
      els.scoreTitle.textContent = "Low reserve";
      els.scoreCopy.textContent = "Reduce load where you can and choose one recovery anchor.";
    }
  }

  function renderSummary() {
    const entries = sortedEntries();
    const scores = entries.map((entry) => calculateScore(entry));
    const recentScores = entries
      .filter((entry) => daysBetween(entry.date, TODAY) < 7)
      .map((entry) => calculateScore(entry));
    const monthCount = entries.filter((entry) => entry.date.slice(0, 7) === TODAY.slice(0, 7)).length;
    const avg = recentScores.length ? Math.round(avgOf(recentScores)) : 0;
    const lever = getBestLever(collectEntry());

    els.streakValue.textContent = getStreak();
    els.avgValue.textContent = avg || (scores.length ? Math.round(avgOf(scores)) : 0);
    els.monthValue.textContent = monthCount;
    els.leverValue.textContent = lever.label;
    els.leverHint.textContent = lever.hint;
  }

  function setAnalyticsMode(mode) {
    state.analyticsMode = mode;
    els.weekModeBtn.dataset.active = mode === "week";
    els.monthModeBtn.dataset.active = mode === "month";
    els.yearModeBtn.dataset.active = mode === "year";
    renderMoodBars();
    renderEnergyBars();
    renderMetricBars();
    drawClusterChart();
    drawPatternChart();
  }

  function renderMoodBars() {
    const counts = getMoodCountsForPeriod(state.analyticsMode);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (!total) {
      els.moodBars.innerHTML = `<div class="insight-item">No mood slots saved for this period yet.</div>`;
      return;
    }

    const rows = MOOD_GROUPS
      .map((group) => ({
        group,
        count: counts[group.label] || 0,
        percent: Math.round(((counts[group.label] || 0) / total) * 100)
      }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);

    els.moodBars.innerHTML = rows.map((row) => barMarkup(row.group.label, `${row.percent}%`, row.percent, row.group.color)).join("");
  }

  function renderEnergyBars() {
    const entries = entriesForPeriod(state.analyticsMode);
    if (!entries.length) {
      els.energyBars.innerHTML = `<div class="insight-item">No energy levels saved for this period yet.</div>`;
      return;
    }

    const counts = ENERGY_LEVELS.reduce((acc, level) => ({ ...acc, [level.id]: 0 }), {});
    entries.forEach((entry) => {
      counts[entry.energyLevel] = (counts[entry.energyLevel] || 0) + 1;
    });

    els.energyBars.innerHTML = ENERGY_LEVELS
      .map((level) => {
        const percent = Math.round(((counts[level.id] || 0) / entries.length) * 100);
        return barMarkup(level.label, `${percent}%`, percent, level.color);
      })
      .join("");
  }

  function renderMetricBars() {
    const entries = entriesForPeriod(state.analyticsMode);
    if (!entries.length) {
      els.metricBars.innerHTML = "";
      return;
    }

    const averages = {
      Sleep: normalize(avgOf(entries.map((entry) => Number(entry.sleep || 0))), state.settings.sleepTarget),
      Water: normalize(avgOf(entries.map((entry) => Number(entry.water || 0))), state.settings.waterTarget),
      Mindful: normalize(avgOf(entries.map((entry) => Number(entry.mindful || 0))), state.settings.mindfulTarget),
      Steps: normalize(avgOf(entries.map((entry) => Number(entry.steps || 0))), state.settings.stepsTarget)
    };

    els.metricBars.innerHTML = Object.keys(averages)
      .map((label) => barMarkup(label, `${Math.round(averages[label])}%`, Math.round(averages[label]), "#167a7f"))
      .join("");
  }

  function barMarkup(label, value, width, color) {
    return [
      `<div class="mood-bar">`,
      `<div class="mood-bar-head"><span>${escapeHTML(label)}</span><span>${escapeHTML(value)}</span></div>`,
      `<div class="bar-track"><div class="bar-fill" style="--width: ${Math.max(0, Math.min(100, width))}%; --bar-color: ${color}"></div></div>`,
      `</div>`
    ].join("");
  }

  function renderCalendar() {
    const [year, month] = state.calendarMonth.split("-").map(Number);
    const monthDate = new Date(year, month - 1, 1);
    const monthLabel = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const startOffset = (monthDate.getDay() + 6) % 7;
    const start = new Date(year, month - 1, 1 - startOffset);
    const labels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    els.calendarTitle.textContent = monthLabel;
    els.monthCalendar.innerHTML = labels
      .map((label) => `<div class="calendar-label">${label}</div>`)
      .join("");

    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = toISODate(date);
      const entry = state.entries[iso];
      const dominant = entry ? getDominantMood(entry) : null;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.dataset.outside = iso.slice(0, 7) !== state.calendarMonth;
      button.dataset.selected = iso === state.selectedDate;
      button.innerHTML = [
        `<span class="date-num">${date.getDate()}</span>`,
        `<span class="day-emoji">${dominant ? dominant.emoji : ""}</span>`
      ].join("");
      button.addEventListener("click", () => {
        state.selectedDate = iso;
        state.calendarMonth = iso.slice(0, 7);
        els.entryDate.value = iso;
        loadEntry(iso);
        setView("entry");
        renderAll();
      });
      els.monthCalendar.appendChild(button);
    }
  }

  function shiftCalendarMonth(direction) {
    const [year, month] = state.calendarMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + direction, 1);
    state.calendarMonth = toISODate(next).slice(0, 7);
    renderCalendar();
    renderMoodBars();
    drawClusterChart();
    drawPatternChart();
  }

  function renderFeed() {
    const entries = sortedEntries().slice(-8).reverse();
    if (!entries.length) {
      els.feedList.innerHTML = `<div class="feed-item"><strong>No saved logs yet</strong><span>Save your first check-in to start the feed.</span></div>`;
      return;
    }

    els.feedList.innerHTML = entries.map((entry) => {
      const pills = SLOTS.map((slot) => {
        const moods = entry.slots[slot.id].emotions.map(getMood).filter(Boolean);
        const icons = moods.length ? moods.slice(0, 3).map((item) => item.emoji).join(" ") : "＋";
        return `<span class="feed-pill">${icons} ${escapeHTML(slot.label)}</span>`;
      }).join("");
      return [
        `<article class="feed-item">`,
        `<strong>${formatDate(entry.date)} · Score ${calculateScore(entry)} · ${getEnergy(entry.energyLevel).label}</strong>`,
        `<div class="feed-slots">${pills}</div>`,
        `</article>`
      ].join("");
    }).join("");
  }

  function renderInsights() {
    const entries = sortedEntries();
    const insights = [];

    if (!entries.length) {
      insights.push("First saved entry will set your baseline.");
      insights.push("Pinned moods make quick check-ins easier.");
      insights.push("The cluster map will fill as you save emotions across slots.");
    } else {
      const periodEntries = entriesForPeriod(state.analyticsMode);
      const best = entries.reduce((winner, entry) => calculateScore(entry) > calculateScore(winner) ? entry : winner, entries[0]);
      const currentCounts = getMoodCountsForPeriod(state.analyticsMode);
      const topMoodGroup = getTopCountLabel(currentCounts);
      const difficultCount = ["Fear", "Sadness", "Anger", "Disgust"].reduce((sum, label) => sum + (currentCounts[label] || 0), 0);
      const totalMoods = Object.values(currentCounts).reduce((sum, count) => sum + count, 0);
      const difficultShare = totalMoods ? Math.round((difficultCount / totalMoods) * 100) : 0;
      const lowEnergyDays = periodEntries.filter((entry) => entry.energyLevel === "low").length;
      const selfCriticalDays = periodEntries.filter((entry) => entry.habits.includes("selfCritical")).length;
      const musicDays = periodEntries.filter((entry) => entry.habits.includes("music")).length;
      const avgSteps = periodEntries.length ? Math.round(avgOf(periodEntries.map((entry) => Number(entry.steps || 0)))) : 0;

      insights.push(`Best saved day: ${formatDate(best.date)} with a score of ${calculateScore(best)}.`);
      insights.push(topMoodGroup ? `Top mood theme in this view: ${topMoodGroup}.` : "Mood themes will appear after slot entries.");
      insights.push(`Difficult emotion share: ${difficultShare}% across saved mood slots.`);
      insights.push(`Low energy appeared on ${lowEnergyDays} saved day${lowEnergyDays === 1 ? "" : "s"} in this view.`);
      if (selfCriticalDays || musicDays) {
        insights.push(`Self-critical signal: ${selfCriticalDays} day${selfCriticalDays === 1 ? "" : "s"}; music support: ${musicDays} day${musicDays === 1 ? "" : "s"}.`);
      } else {
        insights.push(`Average steps in this view: ${avgSteps}.`);
      }
    }

    els.insightList.innerHTML = insights
      .slice(0, 5)
      .map((text) => `<div class="insight-item">${escapeHTML(text)}</div>`)
      .join("");
  }

  function drawClusterChart() {
    if (!els.clusterChart) return;
    const canvas = els.clusterChart;
    const ctx = setupCanvas(canvas, 420);
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const centerX = width / 2;
    const centerY = height / 2;
    const pad = 46;
    const xRadius = centerX - pad;
    const yRadius = centerY - pad;
    const points = getClusterPoints(state.analyticsMode);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fbfcfa";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#dce3df";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, centerY);
    ctx.lineTo(width - pad, centerY);
    ctx.moveTo(centerX, pad);
    ctx.lineTo(centerX, height - pad);
    ctx.stroke();

    drawQuadrant(ctx, centerX, centerY, xRadius, yRadius, "positive", 1, 1);
    drawQuadrant(ctx, centerX, centerY, xRadius, yRadius, "neutral", -1, 1);
    drawQuadrant(ctx, centerX, centerY, xRadius, yRadius, "difficult", -1, -1);
    drawQuadrant(ctx, centerX, centerY, xRadius, yRadius, "general", 1, -1);

    ctx.fillStyle = "#6b7479";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("X-", pad, centerY - 8);
    ctx.fillText("X+", width - pad - 18, centerY - 8);
    ctx.fillText("Y+", centerX + 8, pad + 10);
    ctx.fillText("Y-", centerX + 8, height - pad);

    if (!points.length) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#6b7479";
      ctx.fillText("Save entries to see monthly, weekly, and yearly emotion clusters", centerX, centerY + 6);
      ctx.textAlign = "start";
      return;
    }

    points.forEach((point, index) => {
      const group = getGroupByLabel(point.mood.group);
      const base = QUADRANTS[point.mood.quadrant || group.quadrant] || QUADRANTS.general;
      const jitter = seededJitter(`${point.date}-${point.slot}-${point.mood.id}-${index}`);
      const x = centerX + (base.x + jitter.x * 0.18) * xRadius;
      const y = centerY - (base.y + jitter.y * 0.18) * yRadius;
      const energy = getEnergy(point.energyLevel);
      const radius = point.energyLevel === "high" ? 13 : point.energyLevel === "low" ? 9 : 11;

      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.strokeStyle = energy.color;
      ctx.lineWidth = 3;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = "16px system-ui, sans-serif";
      ctx.fillStyle = group.color;
      ctx.textAlign = "center";
      ctx.fillText(point.mood.emoji, x, y + 6);
    });
    ctx.textAlign = "start";
  }

  function drawQuadrant(ctx, centerX, centerY, xRadius, yRadius, key, xSign, ySign) {
    const quadrant = QUADRANTS[key];
    const x = centerX + xSign * xRadius * 0.52;
    const y = centerY - ySign * yRadius * 0.78;
    ctx.fillStyle = "#6b7479";
    ctx.font = "700 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(quadrant.label, x, y);
    ctx.textAlign = "start";
  }

  function drawPatternChart() {
    if (!els.patternChart) return;
    const canvas = els.patternChart;
    const ctx = setupCanvas(canvas, 240);
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const counts = getMoodCountsForPeriod(state.analyticsMode);
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.36;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fbfcfa";
    ctx.fillRect(0, 0, width, height);

    if (!total) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#6b7479";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText("No mood mix yet", centerX, centerY);
      ctx.textAlign = "start";
      return;
    }

    let angle = -Math.PI / 2;
    MOOD_GROUPS.forEach((group) => {
      const count = counts[group.label] || 0;
      if (!count) return;
      const slice = (count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.fillStyle = group.color;
      ctx.arc(centerX, centerY, radius, angle, angle + slice);
      ctx.closePath();
      ctx.fill();
      angle += slice;
    });

    ctx.beginPath();
    ctx.fillStyle = "#fbfcfa";
    ctx.arc(centerX, centerY, radius * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#20252a";
    ctx.font = "800 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(total), centerX, centerY - 2);
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#6b7479";
    ctx.fillText("moods", centerX, centerY + 18);
    ctx.textAlign = "start";
  }

  function setupCanvas(canvas, cssHeight) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(360, Math.floor(rect.width * dpr));
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  async function createBackup() {
    const payload = {
      app: "Pulse Board",
      version: 3,
      exportedAt: new Date().toISOString(),
      entries: state.entries,
      settings: state.settings
    };
    const fileName = `pulse-board-backup-${TODAY}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: "JSON backup", accept: { "application/json": [".json"] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        showToast("Backup saved");
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    downloadBlob(blob, fileName);
    showToast("Backup downloaded");
  }

  function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        const entries = payload.entries || payload;
        if (!entries || typeof entries !== "object") {
          throw new Error("Backup does not contain entries.");
        }

        state.entries = sanitizeEntries({ ...state.entries, ...entries });
        state.settings = normalizeSettings({ ...state.settings, ...(payload.settings || {}) });
        writeJSON(STORE_KEY, state.entries);
        writeJSON(SETTINGS_KEY, state.settings);
        loadEntry(state.selectedDate);
        renderAll();
        showToast("Backup restored");
      } catch (error) {
        showToast("Restore failed");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function exportCSV() {
    const rows = [
      [
        "date",
        "score",
        "energy_level",
        "stress",
        "sleep",
        "water",
        "mindful",
        "steps",
        "morning_moods",
        "morning_note",
        "afternoon_moods",
        "afternoon_note",
        "evening_moods",
        "evening_note",
        "night_moods",
        "night_note",
        "habits",
        "daily_note"
      ]
    ];

    sortedEntries().forEach((entry) => {
      rows.push([
        entry.date,
        calculateScore(entry),
        entry.energyLevel,
        entry.stress,
        entry.sleep,
        entry.water,
        entry.mindful,
        entry.steps,
        moodLabels(entry.slots.morning.emotions),
        entry.slots.morning.note || "",
        moodLabels(entry.slots.afternoon.emotions),
        entry.slots.afternoon.note || "",
        moodLabels(entry.slots.evening.emotions),
        entry.slots.evening.note || "",
        moodLabels(entry.slots.night.emotions),
        entry.slots.night.note || "",
        (entry.habits || []).join("|"),
        entry.notes || ""
      ]);
    });

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv" }), `pulse-board-${TODAY}.csv`);
    showToast("CSV downloaded");
  }

  function calculateScore(entry) {
    const emotionScore = estimateMoodScore(entry.slots) || 6;
    const energyScore = getEnergy(entry.energyLevel).score;
    const habitScore = calculateHabitScore(entry);
    const normalized = [
      normalize(emotionScore, 10),
      energyScore,
      normalize(11 - Number(entry.stress || 0), 10),
      normalize(Number(entry.sleep || 0), state.settings.sleepTarget),
      normalize(Number(entry.water || 0), state.settings.waterTarget),
      normalize(Number(entry.mindful || 0), state.settings.mindfulTarget),
      normalize(Number(entry.steps || 0), state.settings.stepsTarget),
      habitScore
    ];

    const weights = [1.45, 1.05, 1.1, 1.05, 0.75, 0.75, 0.7, 0.85];
    const weighted = normalized.reduce((sum, value, index) => sum + value * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    return Math.round(weighted / totalWeight);
  }

  function calculateHabitScore(entry) {
    const habits = entry.habits || [];
    const supportTotal = HABITS.filter((habit) => habit.type === "support").length;
    const supportCount = habits.filter((id) => getHabit(id).type === "support").length;
    const loadCount = habits.filter((id) => getHabit(id).type === "load").length;
    const base = normalize(supportCount, supportTotal);
    return Math.max(0, Math.min(100, base - loadCount * 8));
  }

  function estimateMoodScore(slots) {
    const scores = SLOTS
      .flatMap((slot) => (slots[slot.id] && slots[slot.id].emotions) || [])
      .map(getMood)
      .filter(Boolean)
      .map((item) => item.score);
    if (!scores.length) return 0;
    return avgOf(scores);
  }

  function getMoodCountsForPeriod(mode) {
    const counts = {};
    entriesForPeriod(mode).forEach((entry) => {
      SLOTS.forEach((slot) => {
        entry.slots[slot.id].emotions.map(getMood).filter(Boolean).forEach((item) => {
          counts[item.group] = (counts[item.group] || 0) + 1;
        });
      });
    });
    return counts;
  }

  function getClusterPoints(mode) {
    const points = [];
    entriesForPeriod(mode).forEach((entry) => {
      SLOTS.forEach((slot) => {
        entry.slots[slot.id].emotions.map(getMood).filter(Boolean).forEach((moodItem) => {
          points.push({
            date: entry.date,
            slot: slot.id,
            mood: moodItem,
            energyLevel: entry.energyLevel
          });
        });
      });
    });
    return points;
  }

  function entriesForPeriod(mode) {
    return sortedEntries().filter((entry) => {
      if (mode === "week") {
        return daysBetween(entry.date, state.selectedDate) < 7;
      }
      if (mode === "month") {
        return entry.date.slice(0, 7) === state.calendarMonth;
      }
      return entry.date.slice(0, 4) === state.calendarMonth.slice(0, 4);
    });
  }

  function getTopCountLabel(counts) {
    const keys = Object.keys(counts);
    if (!keys.length) return "";
    return keys.sort((a, b) => counts[b] - counts[a])[0];
  }

  function getDominantMood(entry) {
    const counts = {};
    SLOTS.forEach((slot) => {
      entry.slots[slot.id].emotions.forEach((emotion) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
      });
    });

    const top = getTopCountLabel(counts);
    if (top) return getMood(top);

    const score = estimateMoodScore(entry.slots);
    if (score >= 8) return getMood("happy");
    if (score >= 6) return getMood("normal");
    if (score >= 4) return getMood("tired");
    return getMood("sad");
  }

  function normalize(value, target) {
    if (!target) return 0;
    return Math.max(0, Math.min(100, (value / target) * 100));
  }

  function getBestLever(entry) {
    const emotion = estimateMoodScore(entry.slots) || 6;
    const support = calculateHabitScore(entry);
    const gaps = [
      { label: "Mood", hint: "Name the feeling", gap: 8 - emotion },
      { label: "Energy", hint: "Notice your reserve", gap: entry.energyLevel === "low" ? 4 : entry.energyLevel === "normal" ? 1 : 0 },
      { label: "Stress", hint: "Reduce one pressure", gap: Number(entry.stress || 0) - 4 },
      { label: "Sleep", hint: "Build a rhythm", gap: state.settings.sleepTarget - Number(entry.sleep || 0) },
      { label: "Water", hint: "Refill early", gap: state.settings.waterTarget - Number(entry.water || 0) },
      { label: "Mindful", hint: "Take ten quiet minutes", gap: (state.settings.mindfulTarget - Number(entry.mindful || 0)) / 2 },
      { label: "Steps", hint: "Add a short walk", gap: (state.settings.stepsTarget - Number(entry.steps || 0)) / 1600 },
      { label: "Support habits", hint: "Choose one anchor", gap: (70 - support) / 18 }
    ];

    const best = gaps.sort((a, b) => b.gap - a.gap)[0];
    return best.gap > 0 ? best : { label: "Keep steady", hint: "Basics are covered" };
  }

  function getStreak() {
    let streak = 0;
    let cursor = new Date(`${TODAY}T00:00:00`);
    while (state.entries[toISODate(cursor)]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function sortedEntries() {
    return Object.values(state.entries)
      .map((entry) => normalizeEntry(entry, entry.date))
      .filter((entry) => entry && entry.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function getDateRange(daysBack, anchorDate) {
    const dates = [];
    const anchor = new Date(`${anchorDate}T00:00:00`);
    for (let index = daysBack; index >= 0; index -= 1) {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() - index);
      dates.push(toISODate(date));
    }
    return dates;
  }

  function daysBetween(dateA, dateB) {
    const a = new Date(`${dateA}T00:00:00`);
    const b = new Date(`${dateB}T00:00:00`);
    return Math.abs(Math.round((b - a) / 86400000));
  }

  function avgOf(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function toISODate(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function clampNumber(value, min, max) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return min;
    return Math.max(min, Math.min(max, parsed));
  }

  function mood(id, group, label, emoji, score, quadrantOverride) {
    return { id, group, label, emoji, score, quadrant: quadrantOverride || getGroupByLabel(group).quadrant };
  }

  function getMood(id) {
    return MOODS.find((item) => item.id === id);
  }

  function getGroup(id) {
    return MOOD_GROUPS.find((item) => item.id === id) || MOOD_GROUPS[0];
  }

  function getGroupByLabel(label) {
    return MOOD_GROUPS.find((item) => item.label === label) || MOOD_GROUPS[0];
  }

  function getEnergy(id) {
    return ENERGY_LEVELS.find((item) => item.id === id) || ENERGY_LEVELS[1];
  }

  function energyIndex(id) {
    return Math.max(0, ENERGY_LEVELS.findIndex((item) => item.id === id));
  }

  function getHabit(id) {
    return HABITS.find((item) => item.id === id) || { id, label: id, type: "neutral" };
  }

  function emptySlots() {
    return SLOTS.reduce((slots, slot) => {
      slots[slot.id] = { emotions: [], note: "" };
      return slots;
    }, {});
  }

  function cloneSlots(slots) {
    const clone = emptySlots();
    SLOTS.forEach((slot) => {
      const value = slots && slots[slot.id] ? slots[slot.id] : {};
      const emotions = Array.isArray(value.emotions)
        ? value.emotions
        : value.emotion
          ? [value.emotion]
          : [];
      clone[slot.id] = {
        emotions: Array.from(new Set(emotions.filter((id) => Boolean(getMood(id))))),
        note: String(value.note || "")
      };
    });
    return clone;
  }

  function firstSelectedMood(slot) {
    return slot && slot.emotions && slot.emotions.length ? slot.emotions[0] : "";
  }

  function createDefaultEntry(date) {
    return {
      date,
      energyLevel: "normal",
      stress: 4,
      sleep: 7.5,
      water: 7,
      mindful: 10,
      steps: 0,
      slots: emptySlots(),
      habits: [],
      notes: "",
      updatedAt: ""
    };
  }

  function normalizeEntry(entry, date) {
    const base = createDefaultEntry(date || TODAY);
    if (!entry || typeof entry !== "object") return base;

    const energyLevel = entry.energyLevel
      ? getEnergy(entry.energyLevel).id
      : Number(entry.energy || 6) >= 8
        ? "high"
        : Number(entry.energy || 6) <= 4
          ? "low"
          : "normal";

    const normalized = {
      ...entry,
      ...base,
      date: date || entry.date || base.date,
      energyLevel,
      stress: clampNumber(entry.stress ?? base.stress, 1, 10),
      sleep: clampNumber(entry.sleep ?? base.sleep, 0, 24),
      water: clampNumber(entry.water ?? base.water, 0, 30),
      mindful: clampNumber(entry.mindful ?? base.mindful, 0, 180),
      steps: clampNumber(entry.steps ?? entry.walkSteps ?? base.steps, 0, 100000),
      habits: normalizeHabits(Array.isArray(entry.habits) ? entry.habits : []),
      notes: String(entry.notes || ""),
      updatedAt: entry.updatedAt || ""
    };
    normalized.slots = cloneSlots(entry.slots);
    return normalized;
  }

  function normalizeHabits(habits) {
    const map = {
      stretch: "",
      meal: "",
      connect: "",
      journal: "",
      screenBreak: "",
      exercise: "exerciseGym",
      gym: "exerciseGym",
      walk: "walks"
    };
    return Array.from(new Set(habits.map((id) => map[id] ?? id).filter((id) => HABITS.some((habit) => habit.id === id))));
  }

  function sanitizeEntries(entries) {
    const cleaned = {};
    if (!entries || typeof entries !== "object") return cleaned;
    Object.keys(entries).forEach((date) => {
      const value = entries[date];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== "object") return;
      cleaned[date] = normalizeEntry(value, date);
    });
    return cleaned;
  }

  function normalizeSettings(settings) {
    const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    merged.pinnedMoods = Array.isArray(merged.pinnedMoods)
      ? merged.pinnedMoods.filter((id) => Boolean(getMood(id))).slice(0, 10)
      : DEFAULT_SETTINGS.pinnedMoods.slice();
    if (!merged.pinnedMoods.length) {
      merged.pinnedMoods = DEFAULT_SETTINGS.pinnedMoods.slice();
    }
    return merged;
  }

  function moodLabels(ids) {
    return (ids || []).map(getMood).filter(Boolean).map((item) => item.label).join("|");
  }

  function readStoredEntries() {
    return readJSON(STORE_KEY, null) || LEGACY_KEYS.map((key) => readJSON(key, null)).find(Boolean) || {};
  }

  function readStoredSettings() {
    return readJSON(SETTINGS_KEY, null) || LEGACY_SETTINGS_KEYS.map((key) => readJSON(key, null)).find(Boolean) || DEFAULT_SETTINGS;
  }

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function csvCell(value) {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function escapeHTML(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function seededJitter(seed) {
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(index);
      hash |= 0;
    }
    const x = ((Math.sin(hash) + 1) / 2) * 2 - 1;
    const y = ((Math.cos(hash * 1.7) + 1) / 2) * 2 - 1;
    return { x, y };
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.dataset.show = "true";
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.dataset.show = "false";
    }, 2200);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
