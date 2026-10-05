/* ====================================================================
   ASCEND — Pure state/logic layer (no DOM touched in this section)
   ==================================================================== */

var STUDY_TEMPLATES = [
  { id: 'study30', label: '30 min padhai karo', subject: 'General', difficulty: 'Easy', minutes: 30, xp: 20 },
  { id: 'chapter', label: 'Ek chapter complete karo', subject: 'General', difficulty: 'Medium', minutes: 45, xp: 30 },
  { id: 'revision', label: 'Purana topic revise karo', subject: 'Revision', difficulty: 'Easy', minutes: 20, xp: 15 },
  { id: 'practice', label: 'Practice questions solve karo', subject: 'Practice', difficulty: 'Medium', minutes: 30, xp: 25 },
  { id: 'newtopic', label: 'Ek naya topic seekho', subject: 'New Learning', difficulty: 'Hard', minutes: 40, xp: 35 },
  { id: 'notes', label: 'Notes banao ya organize karo', subject: 'Organization', difficulty: 'Easy', minutes: 15, xp: 12 }
];

var FITNESS_TEMPLATES = [
  { id: 'pushups', label: 'Push-ups', detail: '15 reps', xp: 15 },
  { id: 'squats', label: 'Squats', detail: '20 reps', xp: 15 },
  { id: 'plank', label: 'Plank', detail: '30 seconds hold', xp: 15 },
  { id: 'stretch', label: 'Stretching', detail: '5 minutes', xp: 10 },
  { id: 'walk', label: 'Walking', detail: '15 minutes', xp: 15 }
];

var MISSION_TEMPLATES = [
  { id: 'm_study30', label: 'Study for 30 minutes', difficulty: 'Easy', xp: 20 },
  { id: 'm_chapter', label: 'Complete one chapter', difficulty: 'Medium', xp: 25 },
  { id: 'm_workout', label: 'Complete a workout', difficulty: 'Easy', xp: 20 },
  { id: 'm_water', label: 'Drink enough water', difficulty: 'Easy', xp: 10 },
  { id: 'm_read', label: 'Read for 15 minutes', difficulty: 'Easy', xp: 15 }
];

var ACHIEVEMENTS = [
  { id: 'first_step', label: 'First Step', desc: 'Apna pehla task complete karo', check: function (s) { return s.totalTasksCompletedEver >= 1; } },
  { id: 'streak3', label: '3 Day Streak', desc: '3 din lagatar active raho', check: function (s) { return s.streaks.overall.best >= 3; } },
  { id: 'streak7', label: '7 Day Streak', desc: '7 din lagatar active raho', check: function (s) { return s.streaks.overall.best >= 7; } },
  { id: 'study_warrior', label: 'Study Warrior', desc: '25 study tasks complete karo', check: function (s) { return s.studyTasksCompletedEver >= 25; } },
  { id: 'fitness_starter', label: 'Fitness Starter', desc: '10 fitness tasks complete karo', check: function (s) { return s.fitnessTasksCompletedEver >= 10; } },
  { id: 'xp100', label: '100 XP', desc: '100 total XP ikattha karo', check: function (s) { return s.xp >= 100; } },
  { id: 'xp500', label: '500 XP', desc: '500 total XP ikattha karo', check: function (s) { return s.xp >= 500; } },
  { id: 'consistency', label: 'Consistency Master', desc: '14 din lagatar streak banao', check: function (s) { return s.streaks.overall.best >= 14; } }
];

var WORLD_STAGES = [
  { minLevel: 1, name: 'Misty Valley', desc: 'Safar yahin se shuru hota hai...' },
  { minLevel: 3, name: 'Dark Forest', desc: 'Raaste thode mushkil ho rahe hain.' },
  { minLevel: 5, name: 'Mountain Pass', desc: 'Unchaiyan dikhne lagi hain.' },
  { minLevel: 8, name: 'Starlit Peak', desc: 'Taare bahut paas lagte hain.' },
  { minLevel: 12, name: 'The Ascension', desc: 'Tum badal chuke ho.' }
];

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function pickRandom(arr, n) {
  var copy = arr.slice();
  var out = [];
  while (out.length < n && copy.length) {
    var i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function levelReq(level) { return level * 100; }

function computeLevel(xp) {
  var level = 1, used = 0, req = levelReq(level);
  while (xp - used >= req) {
    used += req;
    level++;
    req = levelReq(level);
  }
  return { level: level, xpIntoLevel: xp - used, xpForNext: req };
}

function currentStageIndex(level) {
  var idx = 0;
  WORLD_STAGES.forEach(function (s, i) { if (level >= s.minLevel) idx = i; });
  return idx;
}

function freshStudyTasks() {
  return pickRandom(STUDY_TEMPLATES, 3).map(function (t) {
    return { id: t.id, label: t.label, subject: t.subject, difficulty: t.difficulty, minutes: t.minutes, xp: t.xp, done: false };
  });
}
function freshFitnessTasks() {
  return FITNESS_TEMPLATES.map(function (t) {
    return { id: t.id, label: t.label, detail: t.detail, xp: t.xp, done: false };
  });
}
function freshMissions() {
  return pickRandom(MISSION_TEMPLATES, 3).map(function (m) {
    return { id: m.id, label: m.label, difficulty: m.difficulty, xp: m.xp, done: false };
  });
}

function freshState(user) {
  return {
    onboarded: true,
    user: user,
    xp: 0,
    date: todayStr(),
    streaks: {
      study: { current: 0, best: 0 },
      fitness: { current: 0, best: 0 },
      overall: { current: 0, best: 0 }
    },
    todayProgress: { studyDone: false, fitnessDone: false },
    studyTasks: freshStudyTasks(),
    fitnessTasks: freshFitnessTasks(),
    missions: freshMissions(),
    studyBonusGiven: false,
    fitnessBonusGiven: false,
    missionsBonusGiven: false,
    studyTasksCompletedEver: 0,
    fitnessTasksCompletedEver: 0,
    totalTasksCompletedEver: 0,
    achievements: { unlocked: [] }
  };
}

function loadState() {
  var raw = null;
  try { raw = localStorage.getItem('ascendState'); } catch (e) {}
  if (raw) { try { return JSON.parse(raw); } catch (e) {} }
  return null;
}
function saveState(state) {
  try { localStorage.setItem('ascendState', JSON.stringify(state)); } catch (e) {}
}

// Naya din aane pe: streaks update karo, daily content refresh karo.
// Date-transition pe hi chalta hai, isliye refresh se double-count nahi hota.
function ensureToday(state) {
  var today = todayStr();
  if (state.date !== today) {
    if (state.todayProgress.studyDone) state.streaks.study.current++; else state.streaks.study.current = 0;
    state.streaks.study.best = Math.max(state.streaks.study.best, state.streaks.study.current);

    if (state.todayProgress.fitnessDone) state.streaks.fitness.current++; else state.streaks.fitness.current = 0;
    state.streaks.fitness.best = Math.max(state.streaks.fitness.best, state.streaks.fitness.current);

    if (state.todayProgress.studyDone && state.todayProgress.fitnessDone) state.streaks.overall.current++; else state.streaks.overall.current = 0;
    state.streaks.overall.best = Math.max(state.streaks.overall.best, state.streaks.overall.current);

    state.date = today;
    state.todayProgress = { studyDone: false, fitnessDone: false };
    state.studyTasks = freshStudyTasks();
    state.fitnessTasks = freshFitnessTasks();
    state.missions = freshMissions();
    state.studyBonusGiven = false;
    state.fitnessBonusGiven = false;
    state.missionsBonusGiven = false;

    checkAchievements(state);
  }
  return state;
}

function checkDailyBonuses(state) {
  if (!state.studyBonusGiven && state.studyTasks.length && state.studyTasks.every(function (t) { return t.done; })) {
    state.xp += 30; state.studyBonusGiven = true;
  }
  if (!state.fitnessBonusGiven && state.fitnessTasks.length && state.fitnessTasks.every(function (t) { return t.done; })) {
    state.xp += 30; state.fitnessBonusGiven = true;
  }
  if (!state.missionsBonusGiven && state.missions.length && state.missions.every(function (m) { return m.done; })) {
    state.xp += 40; state.missionsBonusGiven = true;
  }
}

function completeStudyTask(state, id) {
  var t = state.studyTasks.filter(function (x) { return x.id === id; })[0];
  if (!t || t.done) return false;
  t.done = true;
  state.xp += t.xp;
  state.studyTasksCompletedEver++;
  state.totalTasksCompletedEver++;
  state.todayProgress.studyDone = true;
  checkDailyBonuses(state);
  return true;
}

function completeFitnessTask(state, id) {
  var t = state.fitnessTasks.filter(function (x) { return x.id === id; })[0];
  if (!t || t.done) return false;
  t.done = true;
  state.xp += t.xp;
  state.fitnessTasksCompletedEver++;
  state.totalTasksCompletedEver++;
  state.todayProgress.fitnessDone = true;
  checkDailyBonuses(state);
  return true;
}

function completeMission(state, id) {
  var m = state.missions.filter(function (x) { return x.id === id; })[0];
  if (!m || m.done) return false;
  m.done = true;
  state.xp += m.xp;
  state.totalTasksCompletedEver++;
  checkDailyBonuses(state);
  return true;
}

function checkAchievements(state) {
  var newly = [];
  ACHIEVEMENTS.forEach(function (a) {
    if (state.achievements.unlocked.indexOf(a.id) === -1 && a.check(state)) {
      state.achievements.unlocked.push(a.id);
      newly.push(a.id);
    }
  });
  return newly;
}

function validateOnboarding(d) {
  var errors = {};
  if (!d.name || !d.name.trim()) errors.name = 'Naam likhna zaroori hai';
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.email = 'Sahi email daalo';
  if (!d.phone || !/^\d{7,15}$/.test(String(d.phone).replace(/\s+/g, ''))) errors.phone = 'Sahi phone number daalo';
  var age = Number(d.age);
  if (!d.age || isNaN(age) || age < 8 || age > 100) errors.age = 'Sahi age daalo (8-100)';
  if (!d.studyGoal || !d.studyGoal.trim()) errors.studyGoal = 'Study goal likho';
  if (!d.fitnessGoal || !d.fitnessGoal.trim()) errors.fitnessGoal = 'Fitness goal likho';
  var st = Number(d.studyTime);
  if (!d.studyTime || isNaN(st) || st <= 0) errors.studyTime = 'Sahi study time daalo';
  var wt = Number(d.workoutTime);
  if (!d.workoutTime || isNaN(wt) || wt <= 0) errors.workoutTime = 'Sahi workout time daalo';
  return { valid: Object.keys(errors).length === 0, errors: errors };
}

/* ====================================================================
   DOM / Rendering layer (sirf yahan se neeche document use hota hai)
   ==================================================================== */

var APP_STATE = null;

var SCREEN_IDS = { landing: 'screen-landing', onboarding: 'screen-onboarding', 'app-shell': 'app-shell' };
function showScreen(name) {
  Object.keys(SCREEN_IDS).forEach(function (key) {
    var el = document.getElementById(SCREEN_IDS[key]);
    if (el) el.classList.toggle('active', key === name);
  });
}

function showView(name) {
  ['home', 'study', 'fitness', 'missions', 'achievements', 'profile'].forEach(function (v) {
    var el = document.getElementById('view-' + v);
    if (el) el.classList.toggle('active', v === name);
  });
  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-view') === name);
  });
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () { toast.classList.add('hidden'); }, 300);
  }, 2000);
}

function renderHeader(state) {
  var lv = computeLevel(state.xp);
  document.getElementById('welcome-text').textContent = 'Welcome back, ' + state.user.name + '.';
  document.getElementById('level-val').textContent = lv.level;
  document.getElementById('xp-val').textContent = lv.xpIntoLevel;
  document.getElementById('xp-next').textContent = lv.xpForNext;
  document.getElementById('xp-bar-fill').style.width = Math.round((lv.xpIntoLevel / lv.xpForNext) * 100) + '%';
  document.getElementById('overall-streak').textContent = state.streaks.overall.current;
}

function renderHome(state) {
  document.getElementById('study-streak-val').textContent = state.streaks.study.current;
  document.getElementById('fitness-streak-val').textContent = state.streaks.fitness.current;
  document.getElementById('overall-streak-val').textContent = state.streaks.overall.current;

  var studyDone = state.studyTasks.filter(function (t) { return t.done; }).length;
  var fitnessDone = state.fitnessTasks.filter(function (t) { return t.done; }).length;
  var missionsDone = state.missions.filter(function (m) { return m.done; }).length;
  document.getElementById('today-study-progress').textContent = studyDone + '/' + state.studyTasks.length;
  document.getElementById('today-fitness-progress').textContent = fitnessDone + '/' + state.fitnessTasks.length;
  document.getElementById('today-missions-progress').textContent = missionsDone + '/' + state.missions.length;

  var level = computeLevel(state.xp).level;
  var curIdx = currentStageIndex(level);
  var pathEl = document.getElementById('world-path');
  pathEl.innerHTML = '';
  WORLD_STAGES.forEach(function (stage, i) {
    var unlocked = level >= stage.minLevel;
    var div = document.createElement('div');
    div.className = 'stage-node' + (unlocked ? ' unlocked' : ' locked') + (i === curIdx ? ' current' : '');
    div.innerHTML = '<div class="stage-name">' + (unlocked ? stage.name : '🔒 ???') + '</div>' +
      '<div class="stage-desc">' + (unlocked ? stage.desc : 'Level ' + stage.minLevel + ' pe unlock hoga') + '</div>';
    pathEl.appendChild(div);
  });
}

function renderList(containerId, items, xpAttr, onComplete, metaFn) {
  var list = document.getElementById(containerId);
  list.innerHTML = '';
  items.forEach(function (item) {
    var row = document.createElement('div');
    row.className = 'task-card' + (item.done ? ' done' : '');
    row.innerHTML =
      '<div class="task-main">' +
        '<div class="task-label">' + item.label + '</div>' +
        '<div class="task-meta">' + metaFn(item) + '</div>' +
      '</div>' +
      '<div class="task-side">' +
        '<span class="xp-badge">+' + item[xpAttr] + ' XP</span>' +
        '<button class="task-btn"' + (item.done ? ' disabled' : '') + '>' + (item.done ? '✔' : 'Done') + '</button>' +
      '</div>';
    var btn = row.querySelector('.task-btn');
    if (!item.done && btn) {
      btn.addEventListener('click', function () { onComplete(item.id); });
    }
    list.appendChild(row);
  });
}

function renderStudy(state) {
  renderList('study-list', state.studyTasks, 'xp', completeStudyTaskUI, function (t) {
    return t.subject + ' · ' + t.difficulty + ' · ' + t.minutes + ' min';
  });
}
function renderFitness(state) {
  renderList('fitness-list', state.fitnessTasks, 'xp', completeFitnessTaskUI, function (t) {
    return t.detail;
  });
}
function renderMissions(state) {
  renderList('mission-list', state.missions, 'xp', completeMissionUI, function (m) {
    return m.difficulty;
  });
}

function renderAchievements(state) {
  var list = document.getElementById('achievement-list');
  list.innerHTML = '';
  ACHIEVEMENTS.forEach(function (a) {
    var unlocked = state.achievements.unlocked.indexOf(a.id) !== -1;
    var div = document.createElement('div');
    div.className = 'achievement-card' + (unlocked ? ' unlocked' : ' locked');
    div.innerHTML = '<div class="ach-icon">' + (unlocked ? '🏆' : '🔒') + '</div>' +
      '<div class="ach-label">' + a.label + '</div>' +
      '<div class="ach-desc">' + a.desc + '</div>';
    list.appendChild(div);
  });
}

function renderProfile(state) {
  var u = state.user;
  var el = document.getElementById('profile-info');
  el.innerHTML =
    '<div class="profile-row"><span>Naam</span><b>' + u.name + '</b></div>' +
    '<div class="profile-row"><span>Email</span><b>' + u.email + '</b></div>' +
    '<div class="profile-row"><span>Phone</span><b>' + u.phone + '</b></div>' +
    '<div class="profile-row"><span>Age</span><b>' + u.age + '</b></div>' +
    '<div class="profile-row"><span>Study Goal</span><b>' + u.studyGoal + '</b></div>' +
    '<div class="profile-row"><span>Fitness Goal</span><b>' + u.fitnessGoal + '</b></div>' +
    '<div class="profile-row"><span>Daily Study Time</span><b>' + u.studyTime + ' min</b></div>' +
    '<div class="profile-row"><span>Daily Workout Time</span><b>' + u.workoutTime + ' min</b></div>';
}

function renderAll(state) {
  renderHeader(state);
  renderHome(state);
  renderStudy(state);
  renderFitness(state);
  renderMissions(state);
  renderAchievements(state);
  renderProfile(state);
}

function completeStudyTaskUI(id) {
  if (completeStudyTask(APP_STATE, id)) {
    var newly = checkAchievements(APP_STATE);
    saveState(APP_STATE);
    renderAll(APP_STATE);
    showToast('Task complete! +XP');
    newly.forEach(function (id) { showToast('🏆 Achievement: ' + id); });
  }
}
function completeFitnessTaskUI(id) {
  if (completeFitnessTask(APP_STATE, id)) {
    var newly = checkAchievements(APP_STATE);
    saveState(APP_STATE);
    renderAll(APP_STATE);
    showToast('Workout logged! +XP');
    newly.forEach(function (id) { showToast('🏆 Achievement: ' + id); });
  }
}
function completeMissionUI(id) {
  if (completeMission(APP_STATE, id)) {
    var newly = checkAchievements(APP_STATE);
    saveState(APP_STATE);
    renderAll(APP_STATE);
    showToast('Mission complete! +XP');
    newly.forEach(function (id) { showToast('🏆 Achievement: ' + id); });
  }
}

function wireNav() {
  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showView(btn.getAttribute('data-view'));
    });
  });
}

function wireOnboarding() {
  document.getElementById('begin-btn').addEventListener('click', function () {
    showScreen('onboarding');
  });

  document.getElementById('onboard-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      name: document.getElementById('f-name').value,
      email: document.getElementById('f-email').value,
      phone: document.getElementById('f-phone').value,
      age: document.getElementById('f-age').value,
      studyGoal: document.getElementById('f-studygoal').value,
      fitnessGoal: document.getElementById('f-fitnessgoal').value,
      studyTime: document.getElementById('f-studytime').value,
      workoutTime: document.getElementById('f-workouttime').value
    };
    var result = validateOnboarding(data);
    var errEl = document.getElementById('onboard-error');
    if (!result.valid) {
      errEl.textContent = Object.keys(result.errors).map(function (k) { return result.errors[k]; }).join(' · ');
      return;
    }
    errEl.textContent = '';
    APP_STATE = freshState(data);
    saveState(APP_STATE);
    showScreen('app-shell');
    renderAll(APP_STATE);
    showView('home');
  });
}

function wireProfile() {
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (confirm('Pura progress reset karna hai? Ye wapas nahi hoga.')) {
      localStorage.removeItem('ascendState');
      location.reload();
    }
  });
}

function init() {
  wireNav();
  wireOnboarding();
  wireProfile();

  var saved = loadState();
  if (saved && saved.onboarded) {
    APP_STATE = saved;
    ensureToday(APP_STATE);
    saveState(APP_STATE);
    showScreen('app-shell');
    renderAll(APP_STATE);
    showView('home');
  } else {
    showScreen('landing');
  }
}

document.addEventListener('DOMContentLoaded', init);