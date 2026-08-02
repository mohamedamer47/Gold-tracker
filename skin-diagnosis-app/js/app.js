/*
 * app.js
 * محرك الاستبيان: يبني قائمة الأسئلة ديناميكيًا حسب الإجابات، يعرضها خطوة بخطوة،
 * ثم يبني تقرير النتيجة النهائي بالاعتماد على knowledge.js
 */

(function () {
  const screens = {
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    loading: document.getElementById("screen-loading"),
    result: document.getElementById("screen-result"),
  };

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
    // تخطي الأسئلة غير المرئية (شرطية)
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

    let html = `<div class="q-title">${q.title}</div>`;
    if (q.sub) html += `<div class="q-sub">${q.sub}</div>`;
    html += `<div class="options">`;

    q.options.forEach((opt) => {
      const selected =
        q.type === "multi"
          ? (answers[q.id] || []).includes(opt.value)
          : answers[q.id] === opt.value;
      html += `
        <label class="option ${selected ? "selected" : ""}" data-value="${opt.value}">
          <input type="${q.type === "multi" ? "checkbox" : "radio"}" name="${q.id}" ${selected ? "checked" : ""} />
          <span class="option-text">${opt.label}</span>
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
      currentIndex === questionQueue.length - 1 ? "عرض النتيجة" : "التالي";
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
    const skinInfo = SKIN_TYPE_INFO[answers.skinFeel] || SKIN_TYPE_INFO.normal;
    const selectedConcerns = (answers.concerns || []).filter((v) => v !== "none");

    const analyses = selectedConcerns
      .filter((c) => CONCERN_KB[c])
      .map((c) => ({ key: c, info: CONCERN_KB[c], result: CONCERN_KB[c].analyze(answers) }));

    const urgentItems = analyses.filter((a) => a.result.urgent);

    // فحوصات عامة تستدعي تنبيهًا حتى لو لم تُذكر ضمن مشكلة معينة
    const generalAlerts = [];
    if (answers.pregnancy === "yes") {
      generalAlerts.push(
        "أنتِ حامل/مرضعة: بعض المكونات الفعالة (مثل الريتينويدات وبعض الأحماض بتركيز عالٍ) غير مناسبة الآن. يُرجى استشارة الصيدلي أو الطبيب قبل استخدام أي منتج جديد."
      );
    }
    if (answers.medication === "yes") {
      generalAlerts.push(
        "أنت تحت علاج طبي حاليًا: يُرجى مراجعة الصيدلي أو الطبيب المعالج قبل إضافة أي منتج جديد لتجنب أي تعارض."
      );
    }
    if (answers.allergyIngredients === "yes") {
      generalAlerts.push(
        "لديك حساسية معروفة تجاه بعض المكونات: تأكد دائمًا من قراءة قائمة المكونات وعمل اختبار حساسية خلف الأذن قبل الاستخدام."
      );
    }

    // تجميع المكونات الفعالة المقترحة (بدون تكرار) لبناء روتين
    const allIngredients = new Set();
    analyses.forEach((a) => a.result.ingredients.forEach((i) => allIngredients.add(i)));

    const needsSunProtection =
      selectedConcerns.some((c) => ["wrinkles", "pigmentation", "dullness"].includes(c)) || true;
    const needsExfoliation = selectedConcerns.some((c) =>
      ["blackheads", "pores", "dullness"].includes(c)
    );
    const needsActiveTreatment = selectedConcerns.some((c) =>
      ["acne", "wrinkles", "pigmentation"].includes(c)
    );

    let html = "";

    html += `
      <div class="result-header">
        <h1>تقرير تحليل البشرة الخاص بك</h1>
        <div class="skin-type-badge">نوع بشرتك: ${skinInfo.label}</div>
        <p class="q-sub" style="margin-top:10px;">${skinInfo.tip}</p>
      </div>`;

    if (urgentItems.length > 0 || generalAlerts.length > 0) {
      html += `<div class="alert-box"><strong>⚠️ نوصي بمتابعة طبية / صيدلانية قريبًا بخصوص:</strong><ul style="margin:6px 0;padding-inline-start:20px;">`;
      urgentItems.forEach((a) => {
        html += `<li>${a.info.label}: ${a.result.urgentReason}</li>`;
      });
      generalAlerts.forEach((g) => {
        html += `<li>${g}</li>`;
      });
      html += `</ul></div>`;
    }

    if (analyses.length > 0) {
      html += `<div class="section-title">تحليل مشاكل بشرتك</div>`;
      analyses.forEach((a) => {
        const r = a.result;
        html += `
          <div class="concern-block">
            <h3>${a.info.icon} ${a.info.label} <span class="severity-pill severity-${r.severity}">${severityLabel(r.severity)}</span></h3>
            <h4>الأسباب المحتملة</h4>
            <ul>${r.causes.map((c) => `<li>${c}</li>`).join("")}</ul>
            <h4>مكونات فعالة يُنصح بالبحث عنها في المنتجات</h4>
            <ul>${r.ingredients.map((i) => `<li>${i}</li>`).join("")}</ul>
            <h4>وصفات ونصائح طبيعية عامة</h4>
            <ul>${r.natural.map((n) => `<li>${n}</li>`).join("")}</ul>
            <h4>نصائح إضافية</h4>
            <ul>${r.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
          </div>`;
      });
    } else {
      html += `<div class="section-title">حالة بشرتك</div>
        <p>لم تذكر مشاكل واضحة، لذا التركيز سيكون على روتين وقائي للحفاظ على صحة ونضارة بشرتك.</p>`;
    }

    html += `<div class="section-title">روتين العناية المقترح</div>`;

    html += `
      <div class="routine-block">
        <h3>🌞 الروتين الصباحي</h3>
        <ol>
          <li>غسول لطيف مناسب لنوع بشرتك (${skinInfo.label})</li>
          ${allIngredients.has("فيتامين C لتفتيح البقع ومضاد أكسدة") || allIngredients.has("فيتامين C صباحًا لإشراقة فورية") || allIngredients.has("فيتامين C كمضاد أكسدة وتفتيح صباحي") ? "<li>سيروم فيتامين C (مضاد أكسدة وتفتيح)</li>" : ""}
          <li>مرطب مناسب لنوع بشرتك</li>
          <li>واقي شمس بعامل حماية SPF 30 فأكثر - خطوة أساسية لا يمكن تجاهلها</li>
        </ol>
      </div>
      <div class="routine-block">
        <h3>🌙 الروتين المسائي</h3>
        <ol>
          <li>تنظيف مزدوج إذا كنتِ تستخدمين مكياج/واقي شمس (زيت أو منظف زيتي ثم غسول عادي)</li>
          ${needsActiveTreatment ? "<li>سيروم أو علاج موضعي يحتوي المكون الفعال المناسب لمشكلتك (راجع قسم التحليل أعلاه) - يُدخل تدريجيًا 2-3 مرات أسبوعيًا في البداية</li>" : ""}
          <li>مرطب ليلي</li>
        </ol>
      </div>
      <div class="routine-block">
        <h3>📅 روتين أسبوعي إضافي</h3>
        <ol>
          ${needsExfoliation ? "<li>تقشير لطيف (كيميائي أو طبيعي خفيف) 1-2 مرة أسبوعيًا</li>" : "<li>تقشير لطيف مرة أسبوعيًا للحفاظ على النضارة</li>"}
          <li>ماسك ترطيب أو تهدئة حسب احتياج بشرتك (راجع الوصفات الطبيعية في قسم التحليل)</li>
        </ol>
      </div>`;

    html += `
      <div class="section-title">الخطوة التالية</div>
      <p>هذا التقرير التحليلي المفصل يمثل <strong>خدمتنا الرقمية (٢٠$)</strong> ويمكنك الاحتفاظ به أو طباعته كمرجع لروتين عنايتك.
      للحالات التي تحتاج تقييمًا دقيقًا أو علاجًا موصوفًا (كما هو موضح في التنبيهات أعلاه إن وجدت)، ننصح بحجز
      <strong>كشف مباشر مع أخصائي جلدية أو صيدلي (١٠٠$)</strong> لمتابعة حالتك عن قرب.</p>

      <div class="cta-section">
        <button class="btn btn-outline btn-block" id="btnPrint">🖨️ حفظ / طباعة التقرير (٢٠$)</button>
        <button class="btn btn-primary btn-block" id="btnBook">📅 احجز كشف مع أخصائي (١٠٠$)</button>
      </div>

      <form class="contact-form" id="contactForm">
        <p class="form-note">اترك بياناتك وسنتواصل معك لتحديد موعد الكشف (١٠٠$).</p>
        <input type="text" placeholder="الاسم الكامل" id="cf_name" required />
        <input type="text" placeholder="رقم الهاتف أو البريد الإلكتروني" id="cf_contact" required />
        <textarea placeholder="أي تفاصيل إضافية تود ذكرها (اختياري)" id="cf_notes" rows="3"></textarea>
        <button type="submit" class="btn btn-primary btn-block">إرسال طلب الحجز</button>
      </form>

      <div class="result-footer">
        <button class="restart-link" id="btnRestart">إعادة الاختبار من البداية</button>
      </div>`;

    resultContainer.innerHTML = html;

    document.getElementById("btnPrint").addEventListener("click", () => window.print());
    document.getElementById("btnBook").addEventListener("click", () => {
      document.getElementById("contactForm").classList.toggle("open");
    });
    document.getElementById("contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      form.innerHTML = `<p style="color:var(--success);font-weight:700;">
        تم استلام طلبك بنجاح! سنتواصل معك قريبًا لتأكيد موعد الكشف (١٠٠$).
      </p>`;
    });
    document.getElementById("btnRestart").addEventListener("click", () => {
      showScreen("intro");
    });
  }
})();
