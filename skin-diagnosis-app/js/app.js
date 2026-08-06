/*
 * app.js
 * محرك الاستبيان: يبني قائمة الأسئلة ديناميكيًا حسب الإجابات، يعرضها خطوة بخطوة،
 * يدير تبديل اللغة (عربي/إنجليزي)، ثم يبني تقرير النتيجة النهائي بالاعتماد على knowledge.js
 * Quiz engine: builds the question list dynamically based on answers, renders it
 * step by step, manages the Arabic/English language toggle, then builds the final
 * result report using knowledge.js.
 */

(function () {
  const screens = {
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    loading: document.getElementById("screen-loading"),
    result: document.getElementById("screen-result"),
  };

  const htmlRoot = document.getElementById("htmlRoot");
  const progressWrap = document.getElementById("progressWrap");
  const progressFill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");
  const questionContainer = document.getElementById("questionContainer");
  const btnBack = document.getElementById("btnBack");
  const btnNext = document.getElementById("btnNext");
  const resultContainer = document.getElementById("resultContainer");

  let answers = {};
  let questionQueue = BASE_QUESTIONS.slice();
  let currentIndex = 0;
  let currentLang = localStorage.getItem("skinAppLang") === "en" ? "en" : "ar";

  function ui() {
    return UI_STRINGS[currentLang];
  }

  function applyLangToDocument() {
    htmlRoot.setAttribute("lang", currentLang);
    htmlRoot.setAttribute("dir", currentLang === "en" ? "ltr" : "rtl");
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === currentLang);
    });
  }

  function renderStaticText() {
    const s = ui();
    document.getElementById("brandName").textContent = s.brandName;
    document.getElementById("introTitle").textContent = s.introTitle;
    document.getElementById("introLead").textContent = s.introLead;
    document.getElementById("priceServiceTitle").textContent = s.priceServiceTitle;
    document.getElementById("priceServiceDesc").textContent = s.priceServiceDesc;
    document.getElementById("priceConsultTitle").textContent = s.priceConsultTitle;
    document.getElementById("priceConsultDesc").textContent = s.priceConsultDesc;
    document.getElementById("disclaimerIntro").textContent = s.disclaimerIntro;
    document.getElementById("btnStart").textContent = s.btnStart;
    document.getElementById("btnBack").textContent = s.btnBack;
    document.getElementById("loadingText").textContent = s.loadingText;
    document.getElementById("footerText").textContent = s.footerText;
    document.title = currentLang === "en" ? "Smart Skin Diagnosis" : "تشخيص البشرة الذكي";
  }

  function setLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("skinAppLang", lang);
    applyLangToDocument();
    renderStaticText();
    if (screens.quiz.classList.contains("active")) renderQuestion();
    if (screens.result.classList.contains("active")) buildReport();
  }

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang")));
  });

  applyLangToDocument();
  renderStaticText();

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  document.getElementById("btnStart").addEventListener("click", () => {
    answers = {};
    questionQueue = BASE_QUESTIONS.slice();
    currentIndex = 0;
    progressWrap.hidden = false;
    showScreen("quiz");
    renderQuestion();
  });

  function rebuildTailAfterConcerns() {
    const concernsIdx = questionQueue.findIndex((q) => q.id === "concerns");
    if (concernsIdx === -1) return;
    const head = questionQueue.slice(0, concernsIdx + 1);
    const selected = (answers.concerns || []).filter((v) => v !== "none");
    let tail = [];
    selected.forEach((c) => {
      if (FOLLOWUPS[c]) tail = tail.concat(FOLLOWUPS[c]);
    });
    tail = tail.concat(LIFESTYLE_QUESTIONS);
    questionQueue = head.concat(tail);
  }

  function isVisible(q) {
    return !q.condition || q.condition(answers);
  }

  function currentQuestion() {
    return questionQueue[currentIndex];
  }

  function isAnswered(q) {
    const v = answers[q.id];
    if (q.type === "multi") return Array.isArray(v) && v.length > 0;
    return v !== undefined && v !== null && v !== "";
  }

  function updateProgress() {
    const pct = Math.min(
      100,
      Math.round((currentIndex / Math.max(questionQueue.length, 1)) * 100)
    );
    progressFill.style.width = pct + "%";
    progressLabel.textContent = pct + "%";
  }

  function renderQuestion() {
    // تخطي الأسئلة غير المرئية (شرطية) / skip conditional questions that don't apply
    while (currentIndex < questionQueue.length && !isVisible(currentQuestion())) {
      currentIndex++;
    }

    if (currentIndex >= questionQueue.length) {
      finishQuiz();
      return;
    }

    const q = currentQuestion();
    updateProgress();
    btnBack.disabled = currentIndex === 0;

    let html = `<div class="q-title">${q.title[currentLang]}</div>`;
    if (q.sub) html += `<div class="q-sub">${q.sub[currentLang]}</div>`;
    html += `<div class="options">`;

    q.options.forEach((opt) => {
      const selected =
        q.type === "multi"
          ? (answers[q.id] || []).includes(opt.value)
          : answers[q.id] === opt.value;
      html += `
        <label class="option ${selected ? "selected" : ""}" data-value="${opt.value}">
          <input type="${q.type === "multi" ? "checkbox" : "radio"}" name="${q.id}" ${selected ? "checked" : ""} />
          <span class="option-text">${opt.label[currentLang]}</span>
        </label>`;
    });
    html += `</div>`;
    questionContainer.innerHTML = html;

    questionContainer.querySelectorAll(".option").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const value = el.getAttribute("data-value");
        if (q.type === "multi") {
          const arr = answers[q.id] ? answers[q.id].slice() : [];
          if (value === "none") {
            answers[q.id] = arr.includes("none") ? [] : ["none"];
          } else {
            const idx = arr.indexOf(value);
            if (idx > -1) arr.splice(idx, 1);
            else arr.push(value);
            answers[q.id] = arr.filter((v) => v !== "none");
          }
        } else {
          answers[q.id] = value;
        }
        renderQuestion();
      });
    });

    btnNext.disabled = !isAnswered(q);
    btnNext.textContent =
      currentIndex === questionQueue.length - 1 ? ui().btnShowResult : ui().btnNext;
  }

  btnNext.addEventListener("click", () => {
    const q = currentQuestion();
    if (!isAnswered(q)) return;
    if (q.id === "concerns") rebuildTailAfterConcerns();
    currentIndex++;
    renderQuestion();
  });

  btnBack.addEventListener("click", () => {
    currentIndex--;
    while (currentIndex > 0 && !isVisible(questionQueue[currentIndex])) {
      currentIndex--;
    }
    renderQuestion();
  });

  function finishQuiz() {
    progressWrap.hidden = true;
    showScreen("loading");
    setTimeout(() => {
      buildReport();
      showScreen("result");
    }, 900);
  }

  function buildReport() {
    const s = ui();
    const skinInfo = SKIN_TYPE_INFO[answers.skinFeel] || SKIN_TYPE_INFO.normal;
    const selectedConcerns = (answers.concerns || []).filter((v) => v !== "none");

    const analyses = selectedConcerns
      .filter((c) => CONCERN_KB[c])
      .map((c) => ({ key: c, info: CONCERN_KB[c], result: CONCERN_KB[c].analyze(answers, currentLang) }));

    const urgentItems = analyses.filter((a) => a.result.urgent);

    // فحوصات عامة تستدعي تنبيهًا حتى لو لم تُذكر ضمن مشكلة معينة
    // General alerts that apply regardless of which concerns were selected
    const generalAlerts = [];
    if (answers.pregnancy === "yes") generalAlerts.push(s.alertPregnancy);
    if (answers.medication === "yes") generalAlerts.push(s.alertMedication);
    if (answers.allergyIngredients === "yes") generalAlerts.push(s.alertAllergy);

    const needsSunProtection = true;
    const needsExfoliation = selectedConcerns.some((c) => ["blackheads", "pores", "dullness"].includes(c));
    const needsActiveTreatment = selectedConcerns.some((c) => ["acne", "wrinkles", "pigmentation"].includes(c));
    const needsVitaminC = selectedConcerns.some((c) => ["wrinkles", "pigmentation", "dullness"].includes(c));

    let html = "";

    html += `
      <div class="result-header">
        <h1>${s.resultTitle}</h1>
        <div class="skin-type-badge">${s.resultSkinTypePrefix} ${skinInfo.label[currentLang]}</div>
        <p class="q-sub" style="margin-top:10px;">${skinInfo.tip[currentLang]}</p>
      </div>`;

    if (urgentItems.length > 0 || generalAlerts.length > 0) {
      html += `<div class="alert-box"><strong>${s.alertBoxTitle}</strong><ul style="margin:6px 0;padding-inline-start:20px;">`;
      urgentItems.forEach((a) => {
        html += `<li>${a.info.label[currentLang]}: ${a.result.urgentReason}</li>`;
      });
      generalAlerts.forEach((g) => {
        html += `<li>${g}</li>`;
      });
      html += `</ul></div>`;
    }

    if (analyses.length > 0) {
      html += `<div class="section-title">${s.sectionAnalysis}</div>`;
      analyses.forEach((a) => {
        const r = a.result;
        html += `
          <div class="concern-block">
            <h3>${a.info.icon} ${a.info.label[currentLang]} <span class="severity-pill severity-${r.severity}">${severityLabel(r.severity, currentLang)}</span></h3>
            <h4>${s.causesLabel}</h4>
            <ul>${r.causes.map((c) => `<li>${c}</li>`).join("")}</ul>
            <h4>${s.ingredientsLabel}</h4>
            <ul>${r.ingredients.map((i) => `<li>${i}</li>`).join("")}</ul>
            <h4>${s.naturalLabel}</h4>
            <ul>${r.natural.map((n) => `<li>${n}</li>`).join("")}</ul>
            <h4>${s.tipsLabel}</h4>
            <ul>${r.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
          </div>`;
      });
    } else {
      html += `<div class="section-title">${s.noConcernsTitle}</div><p>${s.noConcernsText}</p>`;
    }

    html += `<div class="section-title">${s.sectionRoutine}</div>`;

    html += `
      <div class="routine-block">
        <h3>${s.routineMorningTitle}</h3>
        <ol>
          <li>${s.stepCleanser(skinInfo.label[currentLang])}</li>
          ${needsVitaminC ? `<li>${s.stepVitaminC}</li>` : ""}
          <li>${s.stepMoisturizer}</li>
          <li>${s.stepSpf}</li>
        </ol>
      </div>
      <div class="routine-block">
        <h3>${s.routineEveningTitle}</h3>
        <ol>
          <li>${s.stepDoubleCleanse}</li>
          ${needsActiveTreatment ? `<li>${s.stepActiveTreatment}</li>` : ""}
          <li>${s.stepNightMoisturizer}</li>
        </ol>
      </div>
      <div class="routine-block">
        <h3>${s.routineWeeklyTitle}</h3>
        <ol>
          <li>${needsExfoliation ? s.stepExfoliationTargeted : s.stepExfoliationGeneral}</li>
          <li>${s.stepWeeklyMask}</li>
        </ol>
      </div>`;

    html += `
      <div class="section-title">${s.nextStepsTitle}</div>
      <p>${s.nextStepsText}</p>

      <div class="cta-section">
        <button class="btn btn-outline btn-block" id="btnPrint">${s.btnPrint}</button>
        <button class="btn btn-primary btn-block" id="btnBook">${s.btnBook}</button>
      </div>

      <form class="contact-form" id="contactForm">
        <p class="form-note">${s.contactFormNote}</p>
        <input type="text" placeholder="${s.contactFormName}" id="cf_name" required />
        <input type="text" placeholder="${s.contactFormContact}" id="cf_contact" required />
        <textarea placeholder="${s.contactFormNotes}" id="cf_notes" rows="3"></textarea>
        <button type="submit" class="btn btn-primary btn-block">${s.contactFormSubmit}</button>
      </form>

      <div class="result-footer">
        <button class="restart-link" id="btnRestart">${s.restartLink}</button>
      </div>`;

    resultContainer.innerHTML = html;

    document.getElementById("btnPrint").addEventListener("click", () => window.print());
    document.getElementById("btnBook").addEventListener("click", () => {
      document.getElementById("contactForm").classList.toggle("open");
    });
    document.getElementById("contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      form.innerHTML = `<p style="color:var(--success);font-weight:700;">${ui().contactFormThanks}</p>`;
    });
    document.getElementById("btnRestart").addEventListener("click", () => {
      showScreen("intro");
    });
  }
})();
