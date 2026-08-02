/*
 * knowledge.js
 * قاعدة معرفة إرشادية عامة (وليست بديلاً عن استشارة طبية) تربط إجابات الأسئلة
 * بتحليل كل مشكلة: الأسباب المحتملة، المكونات الفعالة المقترحة، وصفات طبيعية عامة،
 * درجة الشدة، وعلامات تستدعي زيارة أخصائي/صيدلي.
 */

const SKIN_TYPE_INFO = {
  very_oily: { label: "دهنية", tip: "بشرتك تفرز زيوتًا بكثرة؛ تحتاج لتنظيف لطيف متكرر ومنتجات خفيفة القوام غير مسدودة للمسام (Non-comedogenic)." },
  combination: { label: "مختلطة", tip: "منطقة T دهنية بينما باقي الوجه أقرب للطبيعي أو الجاف؛ قد تحتاجين لمنتجين مختلفين لمناطق مختلفة." },
  normal: { label: "عادية متوازنة", tip: "بشرتك متوازنة نسبيًا؛ التركيز الأساسي هو الحفاظ على التوازن والوقاية." },
  dry: { label: "جافة", tip: "بشرتك تفتقر للترطيب الكافي؛ تحتاج لمنتجات غنية ومرطبة تحتوي مكونات حابسة للرطوبة." },
  very_dry: { label: "جافة جدًا وحساسة", tip: "بشرتك تحتاج لعناية إضافية بمرطبات غنية وتجنب المكونات القاسية أو المعطرة." },
};

function severityLabel(s) {
  return { mild: "بسيطة", moderate: "متوسطة", severe: "شديدة" }[s] || "غير محددة";
}

const CONCERN_KB = {
  acne: {
    label: "حب الشباب",
    icon: "🔴",
    analyze(a) {
      const severity = a.acne_severity || "mild";
      const causes = ["زيادة إفراز الدهون وانسداد المسام", "تراكم بكتيريا وخلايا جلدية ميتة"];
      if (a.acne_location === "jawline") causes.push("احتمال وجود عامل هرموني (حبوب متكررة على خط الفك)");
      if (a.acne_location === "face_body") causes.push("انتشار الحبوب في الجسم قد يرتبط بالتعرق أو الاحتكاك أو عوامل هرمونية");
      const ingredients = ["حمض الساليسيليك (Salicylic Acid) لتنظيف المسام", "نياسيناميد لتهدئة الالتهاب وتقليل الدهون", "بنزويل بيروكسايد بتركيز منخفض للحبوب الملتهبة"];
      const natural = ["كمادات شاي أخضر باردة لتهدئة الاحمرار", "جل الصبار النقي كمرطب خفيف مضاد للالتهاب", "غسول بالعسل الخام (للبشرة غير الحساسة) خصائصه المضادة للبكتيريا"];
      const tips = ["تجنب لمس الوجه والعصر اليدوي للحبوب لتقليل الالتهاب والندبات", "غيّر مخدة النوم بانتظام", "استخدم مستحضرات غير مسدودة للمسام (Non-comedogenic)"];
      let urgent = false, urgentReason = "";
      if (severity === "severe" || a.acne_location === "face_body") {
        urgent = true;
        urgentReason = "حب شباب شديد أو كيسي أو منتشر بالجسم قد يحتاج علاجًا طبيًا موصوفًا لتفادي الندبات.";
      }
      if (a.acne_treatment === "prescribed") {
        urgent = true;
        urgentReason = urgentReason || "أنت بالفعل تحت متابعة علاج طبي، يُفضل الاستمرار بالتنسيق مع طبيبك قبل إضافة منتجات جديدة.";
      }
      return { severity, causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  blackheads: {
    label: "الرؤوس السوداء",
    icon: "⚫",
    analyze(a) {
      const severity = a.bh_area === "wide" ? "moderate" : "mild";
      const causes = ["تراكم الزيوت والخلايا الميتة داخل المسام وتأكسدها بالهواء"];
      if (a.bh_exfoliate === "never") causes.push("قلة التقشير المنتظم تزيد من تراكم الرؤوس السوداء");
      const ingredients = ["حمض الساليسيليك (BHA) لتنظيف عمق المسام", "الريتينول بتركيز مناسب لتسريع تجدد الخلايا", "طين (كلاي) لامتصاص الزيوت الزائدة أسبوعيًا"];
      const natural = ["ماسك أبيض البيض والمناديل الورقية كشريط تنظيف تقليدي (استخدام خفيف وغير متكرر)", "بخار دافئ للوجه قبل التنظيف لفتح المسام", "سكراب طبيعي خفيف بالشوفان المطحون"];
      const tips = ["لا تستخدم أدوات ضغط الرؤوس السوداء بقوة لتفادي الالتهاب", "قشّري البشرة 1-2 مرة أسبوعيًا فقط لتجنب التهيج"];
      return { severity, causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  darkCircles: {
    label: "الهالات السوداء",
    icon: "🌘",
    analyze(a) {
      const causes = [];
      if (a.dc_sleep === "lt5") causes.push("قلة النوم (أقل من 5 ساعات) من أكبر أسباب الهالات");
      if (a.dc_type === "bluish") causes.push("احتمال كون الهالات وعائية (دم راكد تحت جلد رقيق) وتظهر أكثر مع التعب والسهر");
      if (a.dc_type === "brownish") causes.push("احتمال كونها تصبغات ناتجة عن الوراثة أو فرك العين أو التعرض للشمس");
      if (a.dc_type === "hollow") causes.push("فقدان حجم/دهون تحت العين مع التقدم بالعمر يعطي مظهر تجويف وظل داكن");
      if (a.dc_allergy === "yes") causes.push("الحساسية المزمنة (احتقان الأنف) تزيد من ركود الدم حول العينين");
      if (causes.length === 0) causes.push("عوامل وراثية أو إجهاد عام");
      const severity = a.dc_sleep === "lt5" || a.dc_type === "hollow" ? "moderate" : "mild";
      const ingredients = ["كافيين لتنشيط الدورة الدموية الموضعية", "فيتامين K وريتينول موضعي للهالات الوعائية", "حمض الهيالورونيك لملء التجويف السطحي وترطيب المنطقة", "فيتامين C لتفتيح التصبغ البني"];
      const natural = ["كمادات شاي أخضر أو أكياس شاي مبردة على العينين 10 دقائق", "شرائح خيار باردة لتهدئة الانتفاخ", "النوم لساعات كافية ورفع الرأس قليلاً أثناء النوم"];
      const tips = ["تجنب فرك العين بشكل متكرر", "استخدم كريم شمس حول العين أيضًا فهي منطقة حساسة للتصبغ"];
      return { severity, causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  pores: {
    label: "المسام الواسعة",
    icon: "🕳️",
    analyze(a) {
      const causes = ["زيادة إفراز الدهون تُظهر المسام بشكل أوضح", "فقدان مرونة الجلد حول المسام مع الوقت"];
      const ingredients = ["نياسيناميد لتقليل مظهر المسام وتنظيم الدهون", "حمض الساليسيليك لتنظيف المسام من الداخل", "ريتينول لتحسين مرونة الجلد تدريجيًا"];
      const natural = ["ماء الورد كتونر لطيف يشد المسام مؤقتًا", "ماسك الطين مرة أسبوعيًا لامتصاص الزيوت"];
      const tips = ["لا تفرطي في التقشير القاسي فهذا يزيد التهيج ويجعل المسام أوضح", "استخدمي برايمر خفيف قبل المكياج إن رغبتِ بتقليل المظهر مؤقتًا"];
      return { severity: "mild", causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  wrinkles: {
    label: "التجاعيد وخطوط الشيخوخة",
    icon: "〰️",
    analyze(a) {
      const causes = ["تراجع طبيعي في إنتاج الكولاجين مع التقدم بالعمر"];
      if (a.wr_sun !== "daily") causes.push("عدم الانتظام في استخدام واقي الشمس يسرّع ظهور التجاعيد وعلامات الشيخوخة");
      const severity = a.wr_sun === "never" ? "moderate" : "mild";
      const ingredients = ["ريتينول/ريتينويد لتحفيز تجدد الخلايا والكولاجين", "فيتامين C كمضاد أكسدة وتفتيح صباحي", "ببتيدات (Peptides) لدعم مرونة البشرة", "واقي شمس SPF 30+ يوميًا كخطوة أساسية للوقاية"];
      const natural = ["زيت جوز الهند أو زيت الأرغان كمرطب ليلي خفيف للبشرة الجافة", "ماسك العسل والألوفيرا للترطيب ودعم مرونة الجلد"];
      const tips = ["واقي الشمس يوميًا هو أهم خطوة وحيدة لإبطاء ظهور التجاعيد الجديدة", "تجنب التعرض المباشر للشمس في أوقات الذروة"];
      return { severity, causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  pigmentation: {
    label: "البقع الداكنة / التصبغات",
    icon: "🟤",
    analyze(a) {
      const causes = [];
      if (a.pig_cause === "sun") causes.push("التعرض للشمس بدون حماية كافية");
      if (a.pig_cause === "acne_scars") causes.push("آثار التهابات حب شباب سابقة (تصبغ ما بعد الالتهاب)");
      if (a.pig_cause === "hormonal") causes.push("تغيرات هرمونية قد تسبب الكلف (Melasma) وتحتاج متابعة متخصصة");
      if (causes.length === 0) causes.push("مزيج من عوامل وراثية وبيئية");
      const severity = a.pig_cause === "hormonal" ? "moderate" : "mild";
      const ingredients = ["فيتامين C لتفتيح البقع ومضاد أكسدة", "نياسيناميد لتوحيد لون البشرة", "حمض الأزيليك أو حمض الكوجيك للتصبغات العنيدة", "واقي شمس يومي إلزامي لمنع تفاقم البقع"];
      const natural = ["جل الصبار كمهدئ عام للبشرة", "استخدام واقي شمس حتى في الأيام الغائمة"];
      const tips = ["بدون واقي شمس يومي، أي علاج تفتيح لن يعطي نتيجة دائمة", "تجنب التعرض للشمس بعد استخدام المقشرات الحمضية"];
      let urgent = false, urgentReason = "";
      if (a.pig_cause === "hormonal") {
        urgent = true;
        urgentReason = "الكلف الهرموني يحتاج تقييم من أخصائي جلدية لاختيار العلاج المناسب والآمن.";
      }
      return { severity, causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  dryness: {
    label: "الجفاف والتقشر",
    icon: "🏜️",
    analyze(a) {
      const severity = a.dry_severity || "mild";
      const causes = ["ضعف حاجز البشرة وفقدان الرطوبة"];
      if (a.dry_moisturize === "no") causes.push("عدم استخدام مرطب بانتظام يزيد من جفاف البشرة");
      const ingredients = ["حمض الهيالورونيك لجذب وحبس الرطوبة", "السيراميدات (Ceramides) لتقوية حاجز البشرة", "الجليسرين والشيا بتر كمرطبات غنية"];
      const natural = ["زيت جوز الهند أو زيت اللوز الحلو كمرطب طبيعي مسائي", "ماسك العسل والزبادي للترطيب العميق مرة أسبوعيًا"];
      const tips = ["استخدمي منظف لطيف خالٍ من الكبريتات القاسية (Sulfate-free)", "ضعي المرطب على بشرة رطبة مباشرة بعد الغسيل لحبس الرطوبة"];
      let urgent = false, urgentReason = "";
      if (severity === "severe") {
        urgent = true;
        urgentReason = "التقشر والتشقق الشديد قد يشير لحالة جلدية تحتاج تقييم طبي (كالإكزيما).";
      }
      return { severity, causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  redness: {
    label: "الاحمرار والتهيج",
    icon: "🌡️",
    analyze(a) {
      const causes = [];
      if (a.red_trigger === "products") causes.push("تهيج ناتج عن منتج أو مكون معين لا يناسب بشرتك");
      if (a.red_trigger === "heat_sun") causes.push("حساسية تجاه الحرارة والتعرض للشمس");
      if (a.red_trigger === "food") causes.push("استجابة وعائية مؤقتة لبعض الأطعمة الساخنة/الحارة");
      if (a.red_trigger === "always") causes.push("احمرار شبه دائم قد يشير لحالة جلدية كامنة تحتاج تقييمًا متخصصًا");
      const ingredients = ["سينتيلا آسياتيكا (Centella Asiatica) لتهدئة الالتهاب", "نياسيناميد بتركيز منخفض لتقوية حاجز البشرة", "تجنب العطور والكحول في المنتجات"];
      const natural = ["جل الصبار النقي البارد لتهدئة فورية", "كمادات ماء بارد أو شاي البابونج"];
      const tips = ["أدخلي أي منتج جديد بشكل تدريجي (اختبار خلف الأذن أولًا)", "تجنبي المقشرات القوية والماء شديد السخونة"];
      let urgent = false, urgentReason = "";
      if (a.red_condition === "rosacea" || a.red_condition === "eczema" || a.red_trigger === "always") {
        urgent = true;
        urgentReason = "الاحمرار المزمن أو المرتبط بحالة مشخّصة مسبقًا (وردية/إكزيما) يحتاج متابعة طبيب جلدية لعلاج مناسب.";
      }
      return { severity: urgent ? "moderate" : "mild", causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  dullness: {
    label: "بهتان البشرة",
    icon: "🌥️",
    analyze(a) {
      const causes = [];
      if (a.dull_cause === "dead_skin") causes.push("تراكم خلايا جلدية ميتة يحجب النضارة");
      if (a.dull_cause === "dehydration") causes.push("قلة شرب الماء تؤثر على مظهر البشرة وحيويتها");
      if (a.dull_cause === "fatigue") causes.push("قلة النوم والإجهاد يقللان من إشراقة البشرة");
      if (causes.length === 0) causes.push("مزيج من عوامل نمط الحياة ونقص الترطيب");
      const ingredients = ["فيتامين C صباحًا لإشراقة فورية", "أحماض AHA لطيفة (مثل حمض اللاكتيك) للتقشير الخفيف المنتظم", "حمض الهيالورونيك للترطيب"];
      const natural = ["ماسك العسل والليمون بكمية قليلة جدًا للبشرة غير الحساسة (تجنب التعرض للشمس بعده مباشرة)", "شرب كمية كافية من الماء يوميًا"];
      const tips = ["التقشير اللطيف مرة أو مرتين أسبوعيًا يحدث فرقًا ملحوظًا", "النوم الكافي والماء أهم عامل غير مكلف لتحسين نضارة البشرة"];
      return { severity: "mild", causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },
};
