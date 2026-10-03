/*
 * i18n.js
 * نصوص الواجهة الثابتة بالعربية والإنجليزية (غير أسئلة الاستبيان وقاعدة المعرفة،
 * الموجودة في questions.js و knowledge.js).
 * Static UI chrome text in Arabic and English (question/knowledge text lives in
 * questions.js and knowledge.js).
 */

const UI_STRINGS = {
  ar: {
    brandName: "تشخيص البشرة الذكي",
    introTitle: "اكتشفي / اكتشف مشاكل بشرتك في دقائق",
    introLead:
      "سلسلة أسئلة مباشرة وبسيطة تحدد نوع بشرتك ومشاكلها (حب الشباب، الهالات، الرؤوس السوداء، " +
      "التجاعيد، التصبغات وغيرها)، وفي النهاية تحصل/تحصلين على تحليل تفصيلي مع روتين عناية " +
      "كامل ومنتجات مقترحة — طبية وطبيعية.",
    priceServiceTitle: "التحليل الرقمي الشامل",
    priceServiceDesc: "تقرير تفصيلي بمشاكل بشرتك، أسبابها المحتملة، روتين يومي وأسبوعي، ومنتجات مقترحة (طبية وطبيعية).",
    priceConsultTitle: "الكشف مع أخصائي / صيدلي",
    priceConsultDesc: "متابعة طبية مباشرة مع أخصائي جلدية أو صيدلي مختص لمراجعة حالتك وتخصيص علاج دقيق.",
    disclaimerIntro:
      "⚠️ هذا التطبيق أداة إرشادية لا تُغني عن الاستشارة الطبية المتخصصة، خصوصًا في الحالات الشديدة " +
      "أو المزمنة أو أثناء الحمل والرضاعة.",
    btnStart: "ابدأ التحليل الآن",
    btnNext: "التالي",
    btnBack: "رجوع",
    btnShowResult: "عرض النتيجة",
    loadingText: "جاري تحليل إجاباتك...",
    resultTitle: "تقرير تحليل البشرة الخاص بك",
    resultSkinTypePrefix: "نوع بشرتك:",
    alertBoxTitle: "⚠️ نوصي بمتابعة طبية / صيدلانية قريبًا بخصوص:",
    alertPregnancy:
      "أنتِ حامل/مرضعة: بعض المكونات الفعالة (مثل الريتينويدات وبعض الأحماض بتركيز عالٍ) غير مناسبة الآن. " +
      "يُرجى استشارة الصيدلي أو الطبيب قبل استخدام أي منتج جديد.",
    alertMedication:
      "أنت تحت علاج طبي حاليًا: يُرجى مراجعة الصيدلي أو الطبيب المعالج قبل إضافة أي منتج جديد لتجنب أي تعارض.",
    alertAllergy:
      "لديك حساسية معروفة تجاه بعض المكونات: تأكد دائمًا من قراءة قائمة المكونات وعمل اختبار حساسية خلف الأذن قبل الاستخدام.",
    sectionAnalysis: "تحليل مشاكل بشرتك",
    causesLabel: "الأسباب المحتملة",
    ingredientsLabel: "مكونات فعالة يُنصح بالبحث عنها في المنتجات",
    naturalLabel: "وصفات ونصائح طبيعية عامة",
    tipsLabel: "نصائح إضافية",
    noConcernsTitle: "حالة بشرتك",
    noConcernsText: "لم تذكر مشاكل واضحة، لذا التركيز سيكون على روتين وقائي للحفاظ على صحة ونضارة بشرتك.",
    sectionRoutine: "روتين العناية المقترح",
    routineMorningTitle: "🌞 الروتين الصباحي",
    routineEveningTitle: "🌙 الروتين المسائي",
    routineWeeklyTitle: "📅 روتين أسبوعي إضافي",
    stepCleanser: (skinType) => `غسول لطيف مناسب لنوع بشرتك (${skinType})`,
    stepVitaminC: "سيروم فيتامين C (مضاد أكسدة وتفتيح)",
    stepMoisturizer: "مرطب مناسب لنوع بشرتك",
    stepSpf: "واقي شمس بعامل حماية SPF 30 فأكثر - خطوة أساسية لا يمكن تجاهلها",
    stepDoubleCleanse: "تنظيف مزدوج إذا كنتِ تستخدمين مكياج/واقي شمس (زيت أو منظف زيتي ثم غسول عادي)",
    stepActiveTreatment: "سيروم أو علاج موضعي يحتوي المكون الفعال المناسب لمشكلتك (راجع قسم التحليل أعلاه) - يُدخل تدريجيًا 2-3 مرات أسبوعيًا في البداية",
    stepNightMoisturizer: "مرطب ليلي",
    stepExfoliationTargeted: "تقشير لطيف (كيميائي أو طبيعي خفيف) 1-2 مرة أسبوعيًا",
    stepExfoliationGeneral: "تقشير لطيف مرة أسبوعيًا للحفاظ على النضارة",
    stepWeeklyMask: "ماسك ترطيب أو تهدئة حسب احتياج بشرتك (راجع الوصفات الطبيعية في قسم التحليل)",
    nextStepsTitle: "الخطوة التالية",
    nextStepsText:
      "هذا التقرير التحليلي المفصل يمثل <strong>خدمتنا الرقمية (٢٠$)</strong> ويمكنك الاحتفاظ به أو طباعته " +
      "كمرجع لروتين عنايتك. للحالات التي تحتاج تقييمًا دقيقًا أو علاجًا موصوفًا (كما هو موضح في التنبيهات " +
      "أعلاه إن وجدت)، ننصح بحجز <strong>كشف مباشر مع أخصائي جلدية أو صيدلي (١٠٠$)</strong> لمتابعة حالتك عن قرب.",
    btnPrint: "🖨️ حفظ / طباعة التقرير (٢٠$)",
    btnBook: "📅 احجز كشف مع أخصائي (١٠٠$)",
    contactFormNote: "اترك بياناتك وسنتواصل معك لتحديد موعد الكشف (١٠٠$).",
    contactFormName: "الاسم الكامل",
    contactFormContact: "رقم الهاتف أو البريد الإلكتروني",
    contactFormNotes: "أي تفاصيل إضافية تود ذكرها (اختياري)",
    contactFormSubmit: "إرسال طلب الحجز",
    contactFormThanks: "تم استلام طلبك بنجاح! سنتواصل معك قريبًا لتأكيد موعد الكشف (١٠٠$).",
    restartLink: "إعادة الاختبار من البداية",
    footerText: "هذه الأداة لأغراض إرشادية وتجميلية عامة وليست بديلاً عن التشخيص الطبي.",
  },

  en: {
    brandName: "Smart Skin Diagnosis",
    introTitle: "Discover your skin concerns in minutes",
    introLead:
      "A short, direct set of questions to identify your skin type and concerns (acne, dark circles, " +
      "blackheads, wrinkles, pigmentation, and more). At the end you get a detailed analysis with a full " +
      "skincare routine and suggested products — cosmetic and natural.",
    priceServiceTitle: "Full Digital Analysis",
    priceServiceDesc: "A detailed report on your skin concerns, likely causes, a daily/weekly routine, and suggested products (cosmetic and natural).",
    priceConsultTitle: "Specialist / Pharmacist Consult",
    priceConsultDesc: "A direct medical follow-up with a dermatology specialist or pharmacist to review your case and tailor precise treatment.",
    disclaimerIntro:
      "⚠️ This app is a guidance tool and not a substitute for specialized medical advice, especially for " +
      "severe or chronic conditions, or during pregnancy and breastfeeding.",
    btnStart: "Start the Analysis",
    btnNext: "Next",
    btnBack: "Back",
    btnShowResult: "Show Result",
    loadingText: "Analyzing your answers...",
    resultTitle: "Your Skin Analysis Report",
    resultSkinTypePrefix: "Your skin type:",
    alertBoxTitle: "⚠️ We recommend medical / pharmacist follow-up soon regarding:",
    alertPregnancy:
      "You're pregnant/breastfeeding: some active ingredients (like retinoids and certain high-strength " +
      "acids) aren't suitable right now. Please consult a pharmacist or doctor before using any new product.",
    alertMedication:
      "You're currently on medical treatment: please check with your pharmacist or treating doctor before " +
      "adding any new product to avoid interactions.",
    alertAllergy:
      "You have a known allergy to certain ingredients: always check the ingredient list and patch-test " +
      "behind the ear before use.",
    sectionAnalysis: "Analysis of Your Skin Concerns",
    causesLabel: "Likely Causes",
    ingredientsLabel: "Active Ingredients to Look For in Products",
    naturalLabel: "General Natural Remedies & Tips",
    tipsLabel: "Additional Tips",
    noConcernsTitle: "Your Skin Status",
    noConcernsText: "No specific concerns were mentioned, so the focus will be a preventive routine to maintain your skin's health and glow.",
    sectionRoutine: "Suggested Skincare Routine",
    routineMorningTitle: "🌞 Morning Routine",
    routineEveningTitle: "🌙 Evening Routine",
    routineWeeklyTitle: "📅 Extra Weekly Routine",
    stepCleanser: (skinType) => `A gentle cleanser suited to your skin type (${skinType})`,
    stepVitaminC: "Vitamin C serum (antioxidant and brightening)",
    stepMoisturizer: "A moisturizer suited to your skin type",
    stepSpf: "Sunscreen SPF 30+ - an essential step that can't be skipped",
    stepDoubleCleanse: "Double cleanse if you wear makeup/sunscreen (oil or balm cleanser, then a regular cleanser)",
    stepActiveTreatment: "A serum or spot treatment with the active ingredient suited to your concern (see the analysis section above) - introduce it gradually, 2-3 times a week at first",
    stepNightMoisturizer: "Night moisturizer",
    stepExfoliationTargeted: "Gentle exfoliation (chemical or light physical) 1-2 times a week",
    stepExfoliationGeneral: "Gentle exfoliation once a week to maintain radiance",
    stepWeeklyMask: "A hydrating or soothing mask based on your skin's needs (see the natural remedies in the analysis section)",
    nextStepsTitle: "Next Step",
    nextStepsText:
      "This detailed analytical report represents our <strong>digital service ($20)</strong>, and you can keep " +
      "or print it as a reference for your skincare routine. For cases that need precise evaluation or " +
      "prescribed treatment (as noted in the alerts above, if any), we recommend booking a " +
      "<strong>direct consult with a dermatology specialist or pharmacist ($100)</strong> to follow up on your case closely.",
    btnPrint: "🖨️ Save / Print Report ($20)",
    btnBook: "📅 Book a Specialist Consult ($100)",
    contactFormNote: "Leave your details and we'll contact you to schedule the consult ($100).",
    contactFormName: "Full name",
    contactFormContact: "Phone number or email",
    contactFormNotes: "Any additional details you'd like to share (optional)",
    contactFormSubmit: "Send Booking Request",
    contactFormThanks: "Your request was received! We'll contact you soon to confirm the consult appointment ($100).",
    restartLink: "Retake the assessment from the start",
    footerText: "This tool is for general guidance and cosmetic purposes only and is not a substitute for medical diagnosis.",
  },
};
