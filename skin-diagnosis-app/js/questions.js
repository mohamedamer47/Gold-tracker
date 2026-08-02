/*
 * questions.js
 * يحتوي على شجرة الأسئلة الكاملة: الأسئلة الأساسية، سؤال المشاكل المتعددة،
 * أسئلة المتابعة الخاصة بكل مشكلة، وأسئلة نمط الحياة العامة.
 * Contains the full question tree: base questions, the multi-select concerns
 * question, per-concern follow-up questions, and general lifestyle questions.
 *
 * كل نص هنا ثنائي اللغة بالشكل { ar: "...", en: "..." } ليختار app.js اللغة الحالية.
 * Every text field is bilingual: { ar: "...", en: "..." } — app.js picks the active language.
 *
 * كل سؤال: { id, type: 'single'|'multi', title, sub, options, condition(answers) }
 */

const BASE_QUESTIONS = [
  {
    id: "gender",
    type: "single",
    title: { ar: "قبل ما نبدأ، ما هو جنسك؟", en: "Before we start, what's your gender?" },
    sub: { ar: "يساعدنا هذا في تخصيص بعض الأسئلة لاحقًا.", en: "This helps us tailor a couple of later questions." },
    options: [
      { value: "female", label: { ar: "أنثى", en: "Female" } },
      { value: "male", label: { ar: "ذكر", en: "Male" } },
      { value: "prefer_not", label: { ar: "أفضل عدم التحديد", en: "Prefer not to say" } },
    ],
  },
  {
    id: "ageRange",
    type: "single",
    title: { ar: "ما هي فئتك العمرية؟", en: "What's your age range?" },
    options: [
      { value: "teen", label: { ar: "أقل من 18", en: "Under 18" } },
      { value: "18_25", label: { ar: "18 - 25", en: "18 - 25" } },
      { value: "26_35", label: { ar: "26 - 35", en: "26 - 35" } },
      { value: "36_45", label: { ar: "36 - 45", en: "36 - 45" } },
      { value: "46_plus", label: { ar: "46 فأكثر", en: "46 and above" } },
    ],
  },
  {
    id: "skinFeel",
    type: "single",
    title: {
      ar: "كيف تشعر بشرتك بعد غسلها بساعتين إلى ثلاث ساعات (بدون وضع أي منتج)؟",
      en: "How does your skin feel 2-3 hours after washing it (with no product applied)?",
    },
    options: [
      { value: "very_oily", label: { ar: "لامعة جدًا ودهنية في كل الوجه", en: "Very shiny and oily all over the face" } },
      { value: "combination", label: { ar: "دهنية في منطقة T (الجبهة والأنف والذقن) فقط", en: "Oily only in the T-zone (forehead, nose, chin)" } },
      { value: "normal", label: { ar: "مرتاحة ومتوازنة، لا دهنية ولا جفاف", en: "Comfortable and balanced, neither oily nor dry" } },
      { value: "dry", label: { ar: "تشعر بشد خفيف أو جفاف", en: "Feels slightly tight or dry" } },
      { value: "very_dry", label: { ar: "شد شديد وتقشر ملحوظ", en: "Very tight with noticeable flaking" } },
    ],
  },
  {
    id: "sensitivity",
    type: "single",
    title: {
      ar: "هل بشرتك تتهيج أو تحمر أو تلسع بسهولة عند استخدام منتج جديد أو التعرض للشمس/الطقس؟",
      en: "Does your skin easily get irritated, red, or sting with new products or sun/weather exposure?",
    },
    options: [
      { value: "yes", label: { ar: "نعم، غالبًا", en: "Yes, often" } },
      { value: "sometimes", label: { ar: "أحيانًا", en: "Sometimes" } },
      { value: "no", label: { ar: "لا، بشرتي تتحمل معظم المنتجات", en: "No, my skin tolerates most products" } },
    ],
  },
  {
    id: "concerns",
    type: "multi",
    title: { ar: "ما هي أكثر مشاكل البشرة التي تزعجك حاليًا؟", en: "What skin concerns bother you the most right now?" },
    sub: { ar: "يمكنك اختيار أكثر من مشكلة.", en: "You can select more than one." },
    options: [
      { value: "acne", label: { ar: "حب الشباب (بثور/حبوب)", en: "Acne (pimples/breakouts)" } },
      { value: "blackheads", label: { ar: "الرؤوس السوداء", en: "Blackheads" } },
      { value: "darkCircles", label: { ar: "الهالات السوداء تحت العين", en: "Dark circles under the eyes" } },
      { value: "pores", label: { ar: "المسام الواسعة", en: "Enlarged pores" } },
      { value: "wrinkles", label: { ar: "التجاعيد وخطوط الشيخوخة", en: "Wrinkles and fine lines" } },
      { value: "pigmentation", label: { ar: "البقع الداكنة / التصبغات", en: "Dark spots / pigmentation" } },
      { value: "dryness", label: { ar: "الجفاف والتقشر", en: "Dryness and flaking" } },
      { value: "redness", label: { ar: "الاحمرار والتهيج المستمر", en: "Persistent redness and irritation" } },
      { value: "dullness", label: { ar: "بهتان لون البشرة وعدم النضارة", en: "Dull skin, lacking radiance" } },
      { value: "none", label: { ar: "لا شيء من هذا، فقط أريد روتين وقائي", en: "None of these, I just want a preventive routine" } },
    ],
  },
];

/* أسئلة المتابعة لكل مشكلة مختارة / Follow-up questions for each selected concern */
const FOLLOWUPS = {
  acne: [
    {
      id: "acne_severity",
      type: "single",
      title: { ar: "كيف تصف شدة حب الشباب لديك؟", en: "How would you describe the severity of your acne?" },
      options: [
        { value: "mild", label: { ar: "بسيط: بعض الرؤوس البيضاء/السوداء وحبوب قليلة متفرقة", en: "Mild: a few whiteheads/blackheads and scattered pimples" } },
        { value: "moderate", label: { ar: "متوسط: حبوب ملتهبة متكررة في مناطق معينة", en: "Moderate: recurring inflamed pimples in certain areas" } },
        { value: "severe", label: { ar: "شديد: حبوب كبيرة مؤلمة أو كيسية (Cystic) وتترك آثارًا", en: "Severe: large, painful or cystic acne that leaves marks" } },
      ],
    },
    {
      id: "acne_location",
      type: "single",
      title: { ar: "أين تظهر الحبوب بشكل أساسي؟", en: "Where does the acne mainly appear?" },
      options: [
        { value: "face", label: { ar: "الوجه فقط", en: "Face only" } },
        { value: "face_body", label: { ar: "الوجه والظهر/الصدر", en: "Face and back/chest" } },
        { value: "jawline", label: { ar: "خط الفك والذقن غالبًا (قد يرتبط بالهرمونات)", en: "Mostly jawline and chin (may be hormonal)" } },
      ],
    },
    {
      id: "acne_treatment",
      type: "single",
      title: { ar: "هل تستخدم/تستخدمين حاليًا أي علاج لحب الشباب؟", en: "Are you currently using any acne treatment?" },
      options: [
        { value: "none", label: { ar: "لا شيء حاليًا", en: "Nothing currently" } },
        { value: "otc", label: { ar: "منتجات تجميلية عادية (غسول/كريم)", en: "Regular OTC products (cleanser/cream)" } },
        { value: "prescribed", label: { ar: "علاج طبي موصوف من طبيب", en: "A doctor-prescribed treatment" } },
      ],
    },
  ],
  blackheads: [
    {
      id: "bh_area",
      type: "single",
      title: { ar: "أين تتركز الرؤوس السوداء أكثر؟", en: "Where are blackheads most concentrated?" },
      options: [
        { value: "nose", label: { ar: "الأنف فقط", en: "Nose only" } },
        { value: "t_zone", label: { ar: "منطقة T (الأنف والجبهة والذقن)", en: "T-zone (nose, forehead, chin)" } },
        { value: "wide", label: { ar: "منتشرة في أغلب الوجه", en: "Spread across most of the face" } },
      ],
    },
    {
      id: "bh_exfoliate",
      type: "single",
      title: { ar: "هل تقوم/تقومين بتقشير البشرة بانتظام؟", en: "Do you exfoliate your skin regularly?" },
      options: [
        { value: "regular", label: { ar: "نعم، أسبوعيًا أو أكثر", en: "Yes, weekly or more" } },
        { value: "rarely", label: { ar: "نادرًا", en: "Rarely" } },
        { value: "never", label: { ar: "لا أقشر بشرتي إطلاقًا", en: "I never exfoliate" } },
      ],
    },
  ],
  darkCircles: [
    {
      id: "dc_sleep",
      type: "single",
      title: { ar: "كم ساعة تنام/تنامين تقريبًا كل ليلة؟", en: "About how many hours do you sleep each night?" },
      options: [
        { value: "lt5", label: { ar: "أقل من 5 ساعات", en: "Less than 5 hours" } },
        { value: "5_7", label: { ar: "5 إلى 7 ساعات", en: "5 to 7 hours" } },
        { value: "gt7", label: { ar: "أكثر من 7 ساعات", en: "More than 7 hours" } },
      ],
    },
    {
      id: "dc_type",
      type: "single",
      title: { ar: "ما شكل الهالات لديك؟", en: "What do your dark circles look like?" },
      options: [
        { value: "brownish", label: { ar: "لون بني/داكن (تصبغ)", en: "Brownish/dark color (pigmentation)" } },
        { value: "bluish", label: { ar: "لون مائل للأزرق أو البنفسجي (أوعية دموية)", en: "Bluish or purplish tint (vascular)" } },
        { value: "hollow", label: { ar: "تجويف أو انخفاض تحت العين مع ظل", en: "A hollow/sunken area under the eye with a shadow" } },
        { value: "not_sure", label: { ar: "لست متأكدًا", en: "Not sure" } },
      ],
    },
    {
      id: "dc_allergy",
      type: "single",
      title: { ar: "هل تعاني من حساسية أنف/عين متكررة (احتقان، حكة، عطس)؟", en: "Do you have frequent nose/eye allergies (congestion, itching, sneezing)?" },
      options: [
        { value: "yes", label: { ar: "نعم بشكل متكرر", en: "Yes, frequently" } },
        { value: "no", label: { ar: "لا", en: "No" } },
      ],
    },
  ],
  pores: [
    {
      id: "pores_area",
      type: "single",
      title: { ar: "أين تلاحظ اتساع المسام أكثر؟", en: "Where do you notice enlarged pores the most?" },
      options: [
        { value: "nose_cheeks", label: { ar: "الأنف والخدين", en: "Nose and cheeks" } },
        { value: "whole_face", label: { ar: "معظم الوجه", en: "Most of the face" } },
      ],
    },
  ],
  wrinkles: [
    {
      id: "wr_area",
      type: "single",
      title: { ar: "أين تظهر التجاعيد أو خطوط الشيخوخة بشكل أوضح؟", en: "Where do wrinkles or fine lines show up most clearly?" },
      options: [
        { value: "forehead", label: { ar: "الجبهة", en: "Forehead" } },
        { value: "eyes", label: { ar: "حول العينين (خطوط الضحك)", en: "Around the eyes (laugh lines)" } },
        { value: "mouth", label: { ar: "حول الفم", en: "Around the mouth" } },
        { value: "general", label: { ar: "بشكل عام في الوجه", en: "Generally across the face" } },
      ],
    },
    {
      id: "wr_sun",
      type: "single",
      title: { ar: "هل تستخدم/تستخدمين واقي الشمس (SPF) يوميًا؟", en: "Do you use daily sunscreen (SPF)?" },
      options: [
        { value: "daily", label: { ar: "نعم يوميًا", en: "Yes, daily" } },
        { value: "sometimes", label: { ar: "أحيانًا فقط", en: "Sometimes only" } },
        { value: "never", label: { ar: "لا أستخدمه أبدًا", en: "Never use it" } },
      ],
    },
  ],
  pigmentation: [
    {
      id: "pig_cause",
      type: "single",
      title: { ar: "ما هو السبب الأرجح للبقع الداكنة برأيك؟", en: "What do you think is the most likely cause of the dark spots?" },
      options: [
        { value: "sun", label: { ar: "التعرض للشمس", en: "Sun exposure" } },
        { value: "acne_scars", label: { ar: "آثار حب شباب قديمة", en: "Old acne marks" } },
        { value: "hormonal", label: { ar: "تغيرات هرمونية (حمل/موانع حمل)", en: "Hormonal changes (pregnancy/contraceptives)" } },
        { value: "unsure", label: { ar: "غير متأكد", en: "Not sure" } },
      ],
    },
    {
      id: "pig_sun",
      type: "single",
      title: { ar: "هل تستخدم/تستخدمين واقي شمس يوميًا؟", en: "Do you use daily sunscreen?" },
      options: [
        { value: "daily", label: { ar: "نعم يوميًا", en: "Yes, daily" } },
        { value: "sometimes", label: { ar: "أحيانًا فقط", en: "Sometimes only" } },
        { value: "never", label: { ar: "لا أستخدمه أبدًا", en: "Never use it" } },
      ],
    },
  ],
  dryness: [
    {
      id: "dry_severity",
      type: "single",
      title: { ar: "ما مدى شدة الجفاف؟", en: "How severe is the dryness?" },
      options: [
        { value: "mild", label: { ar: "شد خفيف بعد الغسيل فقط", en: "Slight tightness only after washing" } },
        { value: "moderate", label: { ar: "جفاف ملحوظ طوال اليوم", en: "Noticeable dryness throughout the day" } },
        { value: "severe", label: { ar: "تقشر وتشقق وأحيانًا حكة", en: "Flaking, cracking, sometimes itching" } },
      ],
    },
    {
      id: "dry_moisturize",
      type: "single",
      title: { ar: "هل تستخدم/تستخدمين مرطبًا يوميًا؟", en: "Do you use a moisturizer daily?" },
      options: [
        { value: "yes", label: { ar: "نعم بانتظام", en: "Yes, regularly" } },
        { value: "no", label: { ar: "لا أو نادرًا", en: "No, or rarely" } },
      ],
    },
  ],
  redness: [
    {
      id: "red_trigger",
      type: "single",
      title: { ar: "متى يزداد الاحمرار عادة؟", en: "When does the redness usually get worse?" },
      options: [
        { value: "products", label: { ar: "بعد استخدام منتجات معينة", en: "After using certain products" } },
        { value: "heat_sun", label: { ar: "مع الحرارة/الشمس/الرياضة", en: "With heat/sun/exercise" } },
        { value: "food", label: { ar: "بعد أطعمة أو مشروبات معينة (حارة/ساخنة)", en: "After certain foods/drinks (spicy/hot)" } },
        { value: "always", label: { ar: "شبه دائم بدون سبب واضح", en: "Almost constant, with no clear trigger" } },
      ],
    },
    {
      id: "red_condition",
      type: "single",
      title: { ar: "هل تم تشخيصك سابقًا بأي من هذه الحالات؟", en: "Have you been previously diagnosed with any of these conditions?" },
      options: [
        { value: "rosacea", label: { ar: "الوردية (Rosacea)", en: "Rosacea" } },
        { value: "eczema", label: { ar: "الإكزيما", en: "Eczema" } },
        { value: "none", label: { ar: "لا، لم يتم تشخيصي بأي حالة", en: "No, I haven't been diagnosed with anything" } },
      ],
    },
  ],
  dullness: [
    {
      id: "dull_cause",
      type: "single",
      title: { ar: "ما الذي تعتقد أنه سبب بهتان بشرتك؟", en: "What do you think is causing your skin's dullness?" },
      options: [
        { value: "dead_skin", label: { ar: "تراكم خلايا جلدية ميتة (قلة تقشير)", en: "Dead skin cell buildup (not exfoliating enough)" } },
        { value: "dehydration", label: { ar: "قلة شرب الماء", en: "Not drinking enough water" } },
        { value: "fatigue", label: { ar: "قلة النوم والإجهاد", en: "Lack of sleep and fatigue" } },
        { value: "unsure", label: { ar: "غير متأكد", en: "Not sure" } },
      ],
    },
  ],
};

/* أسئلة نمط الحياة العامة، تُسأل دائمًا بعد أسئلة المتابعة */
/* General lifestyle questions, always asked after the follow-ups */
const LIFESTYLE_QUESTIONS = [
  {
    id: "water",
    type: "single",
    title: { ar: "كم كوب ماء تشرب/تشربين تقريبًا يوميًا؟", en: "About how many glasses of water do you drink daily?" },
    options: [
      { value: "lt4", label: { ar: "أقل من 4 أكواب", en: "Less than 4 glasses" } },
      { value: "4_8", label: { ar: "4 إلى 8 أكواب", en: "4 to 8 glasses" } },
      { value: "gt8", label: { ar: "أكثر من 8 أكواب", en: "More than 8 glasses" } },
    ],
  },
  {
    id: "currentRoutine",
    type: "single",
    title: { ar: "هل لديك حاليًا روتين عناية يومي بالبشرة (غسول + مرطب على الأقل)؟", en: "Do you currently have a daily skincare routine (at least cleanser + moisturizer)?" },
    options: [
      { value: "full", label: { ar: "نعم، روتين شبه كامل", en: "Yes, a fairly complete routine" } },
      { value: "basic", label: { ar: "أستخدم غسول فقط أو بشكل غير منتظم", en: "I use cleanser only, or irregularly" } },
      { value: "none", label: { ar: "لا يوجد روتين حاليًا", en: "No routine currently" } },
    ],
  },
  {
    id: "allergyIngredients",
    type: "single",
    title: { ar: "هل تعرف/تعرفين وجود حساسية لديك تجاه مكونات تجميلية معينة (عطور، بارابين، إلخ)؟", en: "Do you know of any allergy to specific cosmetic ingredients (fragrance, parabens, etc.)?" },
    options: [
      { value: "yes", label: { ar: "نعم", en: "Yes" } },
      { value: "no", label: { ar: "لا / غير متأكد", en: "No / not sure" } },
    ],
  },
  {
    id: "pregnancy",
    type: "single",
    title: { ar: "هل أنتِ حامل أو مرضعة حاليًا؟", en: "Are you currently pregnant or breastfeeding?" },
    condition: (answers) => answers.gender === "female",
    options: [
      { value: "yes", label: { ar: "نعم", en: "Yes" } },
      { value: "no", label: { ar: "لا", en: "No" } },
    ],
  },
  {
    id: "medication",
    type: "single",
    title: {
      ar: "هل تتناول/تتناولين حاليًا أدوية أو علاجات جلدية طبية (مثل الإيزوتريتينوين أو الريتينويدات الطبية)؟",
      en: "Are you currently taking any medication or medical skin treatment (e.g. isotretinoin or prescription retinoids)?",
    },
    options: [
      { value: "yes", label: { ar: "نعم", en: "Yes" } },
      { value: "no", label: { ar: "لا", en: "No" } },
    ],
  },
];
