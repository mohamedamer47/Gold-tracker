/*
 * questions.js
 * يحتوي على شجرة الأسئلة الكاملة: الأسئلة الأساسية، سؤال المشاكل المتعددة،
 * أسئلة المتابعة الخاصة بكل مشكلة، وأسئلة نمط الحياة العامة.
 * كل سؤال: { id, type: 'single'|'multi'|'text'|'number', title, sub, options, condition(answers) }
 */

const BASE_QUESTIONS = [
  {
    id: "gender",
    type: "single",
    title: "قبل ما نبدأ، ما هو جنسك؟",
    sub: "يساعدنا هذا في تخصيص بعض الأسئلة لاحقًا.",
    options: [
      { value: "female", label: "أنثى" },
      { value: "male", label: "ذكر" },
      { value: "prefer_not", label: "أفضل عدم التحديد" },
    ],
  },
  {
    id: "ageRange",
    type: "single",
    title: "ما هي فئتك العمرية؟",
    options: [
      { value: "teen", label: "أقل من 18" },
      { value: "18_25", label: "18 - 25" },
      { value: "26_35", label: "26 - 35" },
      { value: "36_45", label: "36 - 45" },
      { value: "46_plus", label: "46 فأكثر" },
    ],
  },
  {
    id: "skinFeel",
    type: "single",
    title: "كيف تشعر بشرتك بعد غسلها بساعتين إلى ثلاث ساعات (بدون وضع أي منتج)؟",
    options: [
      { value: "very_oily", label: "لامعة جدًا ودهنية في كل الوجه" },
      { value: "combination", label: "دهنية في منطقة T (الجبهة والأنف والذقن) فقط" },
      { value: "normal", label: "مرتاحة ومتوازنة، لا دهنية ولا جفاف" },
      { value: "dry", label: "تشعر بشد خفيف أو جفاف" },
      { value: "very_dry", label: "شد شديد وتقشر ملحوظ" },
    ],
  },
  {
    id: "sensitivity",
    type: "single",
    title: "هل بشرتك تتهيج أو تحمر أو تلسع بسهولة عند استخدام منتج جديد أو التعرض للشمس/الطقس؟",
    options: [
      { value: "yes", label: "نعم، غالبًا" },
      { value: "sometimes", label: "أحيانًا" },
      { value: "no", label: "لا، بشرتي تتحمل معظم المنتجات" },
    ],
  },
  {
    id: "concerns",
    type: "multi",
    title: "ما هي أكثر مشاكل البشرة التي تزعجك حاليًا؟",
    sub: "يمكنك اختيار أكثر من مشكلة.",
    options: [
      { value: "acne", label: "حب الشباب (بثور/حبوب)" },
      { value: "blackheads", label: "الرؤوس السوداء" },
      { value: "darkCircles", label: "الهالات السوداء تحت العين" },
      { value: "pores", label: "المسام الواسعة" },
      { value: "wrinkles", label: "التجاعيد وخطوط الشيخوخة" },
      { value: "pigmentation", label: "البقع الداكنة / التصبغات" },
      { value: "dryness", label: "الجفاف والتقشر" },
      { value: "redness", label: "الاحمرار والتهيج المستمر" },
      { value: "dullness", label: "بهتان لون البشرة وعدم النضارة" },
      { value: "none", label: "لا شيء من هذا، فقط أريد روتين وقائي" },
    ],
  },
];

/* أسئلة المتابعة لكل مشكلة مختارة */
const FOLLOWUPS = {
  acne: [
    {
      id: "acne_severity",
      type: "single",
      title: "كيف تصف شدة حب الشباب لديك؟",
      options: [
        { value: "mild", label: "بسيط: بعض الرؤوس البيضاء/السوداء وحبوب قليلة متفرقة" },
        { value: "moderate", label: "متوسط: حبوب ملتهبة متكررة في مناطق معينة" },
        { value: "severe", label: "شديد: حبوب كبيرة مؤلمة أو كيسية (Cystic) وتترك آثارًا" },
      ],
    },
    {
      id: "acne_location",
      type: "single",
      title: "أين تظهر الحبوب بشكل أساسي؟",
      options: [
        { value: "face", label: "الوجه فقط" },
        { value: "face_body", label: "الوجه والظهر/الصدر" },
        { value: "jawline", label: "خط الفك والذقن غالبًا (قد يرتبط بالهرمونات)" },
      ],
    },
    {
      id: "acne_treatment",
      type: "single",
      title: "هل تستخدم/تستخدمين حاليًا أي علاج لحب الشباب؟",
      options: [
        { value: "none", label: "لا شيء حاليًا" },
        { value: "otc", label: "منتجات تجميلية عادية (غسول/كريم)" },
        { value: "prescribed", label: "علاج طبي موصوف من طبيب" },
      ],
    },
  ],
  blackheads: [
    {
      id: "bh_area",
      type: "single",
      title: "أين تتركز الرؤوس السوداء أكثر؟",
      options: [
        { value: "nose", label: "الأنف فقط" },
        { value: "t_zone", label: "منطقة T (الأنف والجبهة والذقن)" },
        { value: "wide", label: "منتشرة في أغلب الوجه" },
      ],
    },
    {
      id: "bh_exfoliate",
      type: "single",
      title: "هل تقوم/تقومين بتقشير البشرة بانتظام؟",
      options: [
        { value: "regular", label: "نعم، أسبوعيًا أو أكثر" },
        { value: "rarely", label: "نادرًا" },
        { value: "never", label: "لا أقشر بشرتي إطلاقًا" },
      ],
    },
  ],
  darkCircles: [
    {
      id: "dc_sleep",
      type: "single",
      title: "كم ساعة تنام/تنامين تقريبًا كل ليلة؟",
      options: [
        { value: "lt5", label: "أقل من 5 ساعات" },
        { value: "5_7", label: "5 إلى 7 ساعات" },
        { value: "gt7", label: "أكثر من 7 ساعات" },
      ],
    },
    {
      id: "dc_type",
      type: "single",
      title: "ما شكل الهالات لديك؟",
      options: [
        { value: "brownish", label: "لون بني/داكن (تصبغ)" },
        { value: "bluish", label: "لون مائل للأزرق أو البنفسجي (أوعية دموية)" },
        { value: "hollow", label: "تجويف أو انخفاض تحت العين مع ظل" },
        { value: "not_sure", label: "لست متأكدًا" },
      ],
    },
    {
      id: "dc_allergy",
      type: "single",
      title: "هل تعاني من حساسية أنف/عين متكررة (احتقان، حكة، عطس)؟",
      options: [
        { value: "yes", label: "نعم بشكل متكرر" },
        { value: "no", label: "لا" },
      ],
    },
  ],
  pores: [
    {
      id: "pores_area",
      type: "single",
      title: "أين تلاحظ اتساع المسام أكثر؟",
      options: [
        { value: "nose_cheeks", label: "الأنف والخدين" },
        { value: "whole_face", label: "معظم الوجه" },
      ],
    },
  ],
  wrinkles: [
    {
      id: "wr_area",
      type: "single",
      title: "أين تظهر التجاعيد أو خطوط الشيخوخة بشكل أوضح؟",
      options: [
        { value: "forehead", label: "الجبهة" },
        { value: "eyes", label: "حول العينين (خطوط الضحك)" },
        { value: "mouth", label: "حول الفم" },
        { value: "general", label: "بشكل عام في الوجه" },
      ],
    },
    {
      id: "wr_sun",
      type: "single",
      title: "هل تستخدم/تستخدمين واقي الشمس (SPF) يوميًا؟",
      options: [
        { value: "daily", label: "نعم يوميًا" },
        { value: "sometimes", label: "أحيانًا فقط" },
        { value: "never", label: "لا أستخدمه أبدًا" },
      ],
    },
  ],
  pigmentation: [
    {
      id: "pig_cause",
      type: "single",
      title: "ما هو السبب الأرجح للبقع الداكنة برأيك؟",
      options: [
        { value: "sun", label: "التعرض للشمس" },
        { value: "acne_scars", label: "آثار حب شباب قديمة" },
        { value: "hormonal", label: "تغيرات هرمونية (حمل/موانع حمل)" },
        { value: "unsure", label: "غير متأكد" },
      ],
    },
    {
      id: "pig_sun",
      type: "single",
      title: "هل تستخدم/تستخدمين واقي شمس يوميًا؟",
      options: [
        { value: "daily", label: "نعم يوميًا" },
        { value: "sometimes", label: "أحيانًا فقط" },
        { value: "never", label: "لا أستخدمه أبدًا" },
      ],
    },
  ],
  dryness: [
    {
      id: "dry_severity",
      type: "single",
      title: "ما مدى شدة الجفاف؟",
      options: [
        { value: "mild", label: "شد خفيف بعد الغسيل فقط" },
        { value: "moderate", label: "جفاف ملحوظ طوال اليوم" },
        { value: "severe", label: "تقشر وتشقق وأحيانًا حكة" },
      ],
    },
    {
      id: "dry_moisturize",
      type: "single",
      title: "هل تستخدم/تستخدمين مرطبًا يوميًا؟",
      options: [
        { value: "yes", label: "نعم بانتظام" },
        { value: "no", label: "لا أو نادرًا" },
      ],
    },
  ],
  redness: [
    {
      id: "red_trigger",
      type: "single",
      title: "متى يزداد الاحمرار عادة؟",
      options: [
        { value: "products", label: "بعد استخدام منتجات معينة" },
        { value: "heat_sun", label: "مع الحرارة/الشمس/الرياضة" },
        { value: "food", label: "بعد أطعمة أو مشروبات معينة (حارة/ساخنة)" },
        { value: "always", label: "شبه دائم بدون سبب واضح" },
      ],
    },
    {
      id: "red_condition",
      type: "single",
      title: "هل تم تشخيصك سابقًا بأي من هذه الحالات؟",
      options: [
        { value: "rosacea", label: "الوردية (Rosacea)" },
        { value: "eczema", label: "الإكزيما" },
        { value: "none", label: "لا، لم يتم تشخيصي بأي حالة" },
      ],
    },
  ],
  dullness: [
    {
      id: "dull_cause",
      type: "single",
      title: "ما الذي تعتقد أنه سبب بهتان بشرتك؟",
      options: [
        { value: "dead_skin", label: "تراكم خلايا جلدية ميتة (قلة تقشير)" },
        { value: "dehydration", label: "قلة شرب الماء" },
        { value: "fatigue", label: "قلة النوم والإجهاد" },
        { value: "unsure", label: "غير متأكد" },
      ],
    },
  ],
};

/* أسئلة نمط الحياة العامة، تُسأل دائمًا بعد أسئلة المتابعة */
const LIFESTYLE_QUESTIONS = [
  {
    id: "water",
    type: "single",
    title: "كم كوب ماء تشرب/تشربين تقريبًا يوميًا؟",
    options: [
      { value: "lt4", label: "أقل من 4 أكواب" },
      { value: "4_8", label: "4 إلى 8 أكواب" },
      { value: "gt8", label: "أكثر من 8 أكواب" },
    ],
  },
  {
    id: "currentRoutine",
    type: "single",
    title: "هل لديك حاليًا روتين عناية يومي بالبشرة (غسول + مرطب على الأقل)؟",
    options: [
      { value: "full", label: "نعم، روتين شبه كامل" },
      { value: "basic", label: "أستخدم غسول فقط أو بشكل غير منتظم" },
      { value: "none", label: "لا يوجد روتين حاليًا" },
    ],
  },
  {
    id: "allergyIngredients",
    type: "single",
    title: "هل تعرف/تعرفين وجود حساسية لديك تجاه مكونات تجميلية معينة (عطور، بارابين، إلخ)؟",
    options: [
      { value: "yes", label: "نعم" },
      { value: "no", label: "لا / غير متأكد" },
    ],
  },
  {
    id: "pregnancy",
    type: "single",
    title: "هل أنتِ حامل أو مرضعة حاليًا؟",
    condition: (answers) => answers.gender === "female",
    options: [
      { value: "yes", label: "نعم" },
      { value: "no", label: "لا" },
    ],
  },
  {
    id: "medication",
    type: "single",
    title: "هل تتناول/تتناولين حاليًا أدوية أو علاجات جلدية طبية (مثل الإيزوتريتينوين أو الريتينويدات الطبية)؟",
    options: [
      { value: "yes", label: "نعم" },
      { value: "no", label: "لا" },
    ],
  },
];
