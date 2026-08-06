/*
 * knowledge.js
 * قاعدة معرفة إرشادية عامة (وليست بديلاً عن استشارة طبية) تربط إجابات الأسئلة
 * بتحليل كل مشكلة: الأسباب المحتملة، المكونات الفعالة المقترحة، وصفات طبيعية عامة،
 * درجة الشدة، وعلامات تستدعي زيارة أخصائي/صيدلي.
 * General guidance knowledge base (not a substitute for medical advice) — maps
 * answers to an analysis per concern in both Arabic and English.
 */

const SKIN_TYPE_INFO = {
  very_oily: {
    label: { ar: "دهنية", en: "Oily" },
    tip: {
      ar: "بشرتك تفرز زيوتًا بكثرة؛ تحتاج لتنظيف لطيف متكرر ومنتجات خفيفة القوام غير مسدودة للمسام (Non-comedogenic).",
      en: "Your skin produces excess oil; it needs frequent gentle cleansing and lightweight, non-comedogenic products.",
    },
  },
  combination: {
    label: { ar: "مختلطة", en: "Combination" },
    tip: {
      ar: "منطقة T دهنية بينما باقي الوجه أقرب للطبيعي أو الجاف؛ قد تحتاجين لمنتجين مختلفين لمناطق مختلفة.",
      en: "The T-zone is oily while the rest of the face is closer to normal or dry; you may need two different products for different areas.",
    },
  },
  normal: {
    label: { ar: "عادية متوازنة", en: "Normal / balanced" },
    tip: {
      ar: "بشرتك متوازنة نسبيًا؛ التركيز الأساسي هو الحفاظ على التوازن والوقاية.",
      en: "Your skin is fairly balanced; the main focus is maintaining that balance and prevention.",
    },
  },
  dry: {
    label: { ar: "جافة", en: "Dry" },
    tip: {
      ar: "بشرتك تفتقر للترطيب الكافي؛ تحتاج لمنتجات غنية ومرطبة تحتوي مكونات حابسة للرطوبة.",
      en: "Your skin lacks enough moisture; it needs rich, hydrating products with moisture-locking ingredients.",
    },
  },
  very_dry: {
    label: { ar: "جافة جدًا وحساسة", en: "Very dry and sensitive" },
    tip: {
      ar: "بشرتك تحتاج لعناية إضافية بمرطبات غنية وتجنب المكونات القاسية أو المعطرة.",
      en: "Your skin needs extra care with rich moisturizers, avoiding harsh or fragranced ingredients.",
    },
  },
};

function severityLabel(s, lang) {
  const map = {
    mild: { ar: "بسيطة", en: "Mild" },
    moderate: { ar: "متوسطة", en: "Moderate" },
    severe: { ar: "شديدة", en: "Severe" },
  };
  const entry = map[s];
  if (!entry) return lang === "en" ? "Unspecified" : "غير محددة";
  return entry[lang] || entry.ar;
}

const CONCERN_KB = {
  acne: {
    label: { ar: "حب الشباب", en: "Acne" },
    icon: "🔴",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const severity = a.acne_severity || "mild";
      const causes = [
        t("زيادة إفراز الدهون وانسداد المسام", "Excess oil production and clogged pores"),
        t("تراكم بكتيريا وخلايا جلدية ميتة", "Buildup of bacteria and dead skin cells"),
      ];
      if (a.acne_location === "jawline") causes.push(t("احتمال وجود عامل هرموني (حبوب متكررة على خط الفك)", "Possible hormonal factor (recurring breakouts on the jawline)"));
      if (a.acne_location === "face_body") causes.push(t("انتشار الحبوب في الجسم قد يرتبط بالتعرق أو الاحتكاك أو عوامل هرمونية", "Body breakouts may be linked to sweat, friction, or hormonal factors"));
      const ingredients = [
        t("حمض الساليسيليك (Salicylic Acid) لتنظيف المسام", "Salicylic acid to clear out pores"),
        t("نياسيناميد لتهدئة الالتهاب وتقليل الدهون", "Niacinamide to calm inflammation and reduce oiliness"),
        t("بنزويل بيروكسايد بتركيز منخفض للحبوب الملتهبة", "Low-strength benzoyl peroxide for inflamed breakouts"),
      ];
      const natural = [
        t("كمادات شاي أخضر باردة لتهدئة الاحمرار", "Cold green tea compresses to soothe redness"),
        t("جل الصبار النقي كمرطب خفيف مضاد للالتهاب", "Pure aloe vera gel as a light anti-inflammatory moisturizer"),
        t("غسول بالعسل الخام (للبشرة غير الحساسة) خصائصه المضادة للبكتيريا", "Raw honey cleanser (for non-sensitive skin) for its antibacterial properties"),
      ];
      const tips = [
        t("تجنب لمس الوجه والعصر اليدوي للحبوب لتقليل الالتهاب والندبات", "Avoid touching your face or popping pimples to reduce inflammation and scarring"),
        t("غيّر مخدة النوم بانتظام", "Change your pillowcase regularly"),
        t("استخدم مستحضرات غير مسدودة للمسام (Non-comedogenic)", "Use non-comedogenic products"),
      ];
      let urgent = false, urgentReason = "";
      if (severity === "severe" || a.acne_location === "face_body") {
        urgent = true;
        urgentReason = t(
          "حب شباب شديد أو كيسي أو منتشر بالجسم قد يحتاج علاجًا طبيًا موصوفًا لتفادي الندبات.",
          "Severe, cystic, or body-wide acne may need a prescribed medical treatment to avoid scarring."
        );
      }
      if (a.acne_treatment === "prescribed") {
        urgent = true;
        urgentReason = urgentReason || t(
          "أنت بالفعل تحت متابعة علاج طبي، يُفضل الاستمرار بالتنسيق مع طبيبك قبل إضافة منتجات جديدة.",
          "You're already under medical treatment — keep coordinating with your doctor before adding new products."
        );
      }
      return { severity, causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  blackheads: {
    label: { ar: "الرؤوس السوداء", en: "Blackheads" },
    icon: "⚫",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const severity = a.bh_area === "wide" ? "moderate" : "mild";
      const causes = [t("تراكم الزيوت والخلايا الميتة داخل المسام وتأكسدها بالهواء", "Oil and dead cells building up inside pores and oxidizing on contact with air")];
      if (a.bh_exfoliate === "never") causes.push(t("قلة التقشير المنتظم تزيد من تراكم الرؤوس السوداء", "Lack of regular exfoliation increases blackhead buildup"));
      const ingredients = [
        t("حمض الساليسيليك (BHA) لتنظيف عمق المسام", "Salicylic acid (BHA) to clean deep inside pores"),
        t("الريتينول بتركيز مناسب لتسريع تجدد الخلايا", "Retinol at a suitable strength to speed up cell renewal"),
        t("طين (كلاي) لامتصاص الزيوت الزائدة أسبوعيًا", "Clay mask weekly to absorb excess oil"),
      ];
      const natural = [
        t("ماسك أبيض البيض والمناديل الورقية كشريط تنظيف تقليدي (استخدام خفيف وغير متكرر)", "Egg white and tissue peel-off mask (light, infrequent use)"),
        t("بخار دافئ للوجه قبل التنظيف لفتح المسام", "Warm facial steam before cleansing to open up pores"),
        t("سكراب طبيعي خفيف بالشوفان المطحون", "A light natural scrub with ground oatmeal"),
      ];
      const tips = [
        t("لا تستخدم أدوات ضغط الرؤوس السوداء بقوة لتفادي الالتهاب", "Don't use extraction tools forcefully to avoid inflammation"),
        t("قشّري البشرة 1-2 مرة أسبوعيًا فقط لتجنب التهيج", "Exfoliate only 1-2 times a week to avoid irritation"),
      ];
      return { severity, causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  darkCircles: {
    label: { ar: "الهالات السوداء", en: "Dark Circles" },
    icon: "🌘",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const causes = [];
      if (a.dc_sleep === "lt5") causes.push(t("قلة النوم (أقل من 5 ساعات) من أكبر أسباب الهالات", "Lack of sleep (under 5 hours) is a top cause of dark circles"));
      if (a.dc_type === "bluish") causes.push(t("احتمال كون الهالات وعائية (دم راكد تحت جلد رقيق) وتظهر أكثر مع التعب والسهر", "Likely vascular circles (pooled blood under thin skin), worsened by fatigue and staying up late"));
      if (a.dc_type === "brownish") causes.push(t("احتمال كونها تصبغات ناتجة عن الوراثة أو فرك العين أو التعرض للشمس", "Likely pigmentation from genetics, eye-rubbing, or sun exposure"));
      if (a.dc_type === "hollow") causes.push(t("فقدان حجم/دهون تحت العين مع التقدم بالعمر يعطي مظهر تجويف وظل داكن", "Loss of under-eye volume/fat with age creates a hollow look and shadow"));
      if (a.dc_allergy === "yes") causes.push(t("الحساسية المزمنة (احتقان الأنف) تزيد من ركود الدم حول العينين", "Chronic allergies (nasal congestion) increase blood pooling around the eyes"));
      if (causes.length === 0) causes.push(t("عوامل وراثية أو إجهاد عام", "Genetic factors or general fatigue"));
      const severity = a.dc_sleep === "lt5" || a.dc_type === "hollow" ? "moderate" : "mild";
      const ingredients = [
        t("كافيين لتنشيط الدورة الدموية الموضعية", "Caffeine to stimulate local blood circulation"),
        t("فيتامين K وريتينول موضعي للهالات الوعائية", "Vitamin K and topical retinol for vascular circles"),
        t("حمض الهيالورونيك لملء التجويف السطحي وترطيب المنطقة", "Hyaluronic acid to fill in surface hollowness and hydrate the area"),
        t("فيتامين C لتفتيح التصبغ البني", "Vitamin C to brighten brownish pigmentation"),
      ];
      const natural = [
        t("كمادات شاي أخضر أو أكياس شاي مبردة على العينين 10 دقائق", "Chilled green tea bag compresses on the eyes for 10 minutes"),
        t("شرائح خيار باردة لتهدئة الانتفاخ", "Cold cucumber slices to soothe puffiness"),
        t("النوم لساعات كافية ورفع الرأس قليلاً أثناء النوم", "Getting enough sleep and slightly elevating your head while sleeping"),
      ];
      const tips = [
        t("تجنب فرك العين بشكل متكرر", "Avoid rubbing your eyes frequently"),
        t("استخدم كريم شمس حول العين أيضًا فهي منطقة حساسة للتصبغ", "Use sunscreen around the eyes too — it's prone to pigmentation"),
      ];
      return { severity, causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  pores: {
    label: { ar: "المسام الواسعة", en: "Enlarged Pores" },
    icon: "🕳️",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const causes = [
        t("زيادة إفراز الدهون تُظهر المسام بشكل أوضح", "Excess oil makes pores more visible"),
        t("فقدان مرونة الجلد حول المسام مع الوقت", "Loss of skin elasticity around pores over time"),
      ];
      const ingredients = [
        t("نياسيناميد لتقليل مظهر المسام وتنظيم الدهون", "Niacinamide to minimize pore appearance and regulate oil"),
        t("حمض الساليسيليك لتنظيف المسام من الداخل", "Salicylic acid to clean pores from within"),
        t("ريتينول لتحسين مرونة الجلد تدريجيًا", "Retinol to gradually improve skin elasticity"),
      ];
      const natural = [
        t("ماء الورد كتونر لطيف يشد المسام مؤقتًا", "Rose water as a gentle toner that tightens pores temporarily"),
        t("ماسك الطين مرة أسبوعيًا لامتصاص الزيوت", "Clay mask once a week to absorb oil"),
      ];
      const tips = [
        t("لا تفرطي في التقشير القاسي فهذا يزيد التهيج ويجعل المسام أوضح", "Don't over-exfoliate harshly — it increases irritation and makes pores more visible"),
        t("استخدمي برايمر خفيف قبل المكياج إن رغبتِ بتقليل المظهر مؤقتًا", "Use a light primer before makeup for a temporary blurring effect"),
      ];
      return { severity: "mild", causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  wrinkles: {
    label: { ar: "التجاعيد وخطوط الشيخوخة", en: "Wrinkles & Fine Lines" },
    icon: "〰️",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const causes = [t("تراجع طبيعي في إنتاج الكولاجين مع التقدم بالعمر", "Natural decline in collagen production with age")];
      if (a.wr_sun !== "daily") causes.push(t("عدم الانتظام في استخدام واقي الشمس يسرّع ظهور التجاعيد وعلامات الشيخوخة", "Inconsistent sunscreen use speeds up wrinkles and aging signs"));
      const severity = a.wr_sun === "never" ? "moderate" : "mild";
      const ingredients = [
        t("ريتينول/ريتينويد لتحفيز تجدد الخلايا والكولاجين", "Retinol/retinoids to stimulate cell renewal and collagen"),
        t("فيتامين C كمضاد أكسدة وتفتيح صباحي", "Vitamin C as a morning antioxidant and brightener"),
        t("ببتيدات (Peptides) لدعم مرونة البشرة", "Peptides to support skin elasticity"),
        t("واقي شمس SPF 30+ يوميًا كخطوة أساسية للوقاية", "Daily SPF 30+ sunscreen as an essential preventive step"),
      ];
      const natural = [
        t("زيت جوز الهند أو زيت الأرغان كمرطب ليلي خفيف للبشرة الجافة", "Coconut or argan oil as a light night moisturizer for dry skin"),
        t("ماسك العسل والألوفيرا للترطيب ودعم مرونة الجلد", "Honey and aloe vera mask for hydration and elasticity support"),
      ];
      const tips = [
        t("واقي الشمس يوميًا هو أهم خطوة وحيدة لإبطاء ظهور التجاعيد الجديدة", "Daily sunscreen is the single most important step to slow new wrinkles"),
        t("تجنب التعرض المباشر للشمس في أوقات الذروة", "Avoid direct sun exposure during peak hours"),
      ];
      return { severity, causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },

  pigmentation: {
    label: { ar: "البقع الداكنة / التصبغات", en: "Dark Spots / Pigmentation" },
    icon: "🟤",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const causes = [];
      if (a.pig_cause === "sun") causes.push(t("التعرض للشمس بدون حماية كافية", "Sun exposure without adequate protection"));
      if (a.pig_cause === "acne_scars") causes.push(t("آثار التهابات حب شباب سابقة (تصبغ ما بعد الالتهاب)", "Marks from past acne inflammation (post-inflammatory hyperpigmentation)"));
      if (a.pig_cause === "hormonal") causes.push(t("تغيرات هرمونية قد تسبب الكلف (Melasma) وتحتاج متابعة متخصصة", "Hormonal changes may cause melasma, which needs specialist follow-up"));
      if (causes.length === 0) causes.push(t("مزيج من عوامل وراثية وبيئية", "A mix of genetic and environmental factors"));
      const severity = a.pig_cause === "hormonal" ? "moderate" : "mild";
      const ingredients = [
        t("فيتامين C لتفتيح البقع ومضاد أكسدة", "Vitamin C to brighten spots and act as an antioxidant"),
        t("نياسيناميد لتوحيد لون البشرة", "Niacinamide to even out skin tone"),
        t("حمض الأزيليك أو حمض الكوجيك للتصبغات العنيدة", "Azelaic acid or kojic acid for stubborn pigmentation"),
        t("واقي شمس يومي إلزامي لمنع تفاقم البقع", "Daily sunscreen is mandatory to prevent spots from worsening"),
      ];
      const natural = [
        t("جل الصبار كمهدئ عام للبشرة", "Aloe vera gel as a general skin soother"),
        t("استخدام واقي شمس حتى في الأيام الغائمة", "Using sunscreen even on cloudy days"),
      ];
      const tips = [
        t("بدون واقي شمس يومي، أي علاج تفتيح لن يعطي نتيجة دائمة", "Without daily sunscreen, no brightening treatment will give lasting results"),
        t("تجنب التعرض للشمس بعد استخدام المقشرات الحمضية", "Avoid sun exposure after using acid exfoliants"),
      ];
      let urgent = false, urgentReason = "";
      if (a.pig_cause === "hormonal") {
        urgent = true;
        urgentReason = t(
          "الكلف الهرموني يحتاج تقييم من أخصائي جلدية لاختيار العلاج المناسب والآمن.",
          "Hormonal melasma needs evaluation by a dermatologist to choose a safe, suitable treatment."
        );
      }
      return { severity, causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  dryness: {
    label: { ar: "الجفاف والتقشر", en: "Dryness & Flaking" },
    icon: "🏜️",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const severity = a.dry_severity || "mild";
      const causes = [t("ضعف حاجز البشرة وفقدان الرطوبة", "Weakened skin barrier and moisture loss")];
      if (a.dry_moisturize === "no") causes.push(t("عدم استخدام مرطب بانتظام يزيد من جفاف البشرة", "Not moisturizing regularly increases skin dryness"));
      const ingredients = [
        t("حمض الهيالورونيك لجذب وحبس الرطوبة", "Hyaluronic acid to attract and lock in moisture"),
        t("السيراميدات (Ceramides) لتقوية حاجز البشرة", "Ceramides to strengthen the skin barrier"),
        t("الجليسرين والشيا بتر كمرطبات غنية", "Glycerin and shea butter as rich moisturizers"),
      ];
      const natural = [
        t("زيت جوز الهند أو زيت اللوز الحلو كمرطب طبيعي مسائي", "Coconut or sweet almond oil as a natural evening moisturizer"),
        t("ماسك العسل والزبادي للترطيب العميق مرة أسبوعيًا", "Honey and yogurt mask for deep hydration once a week"),
      ];
      const tips = [
        t("استخدمي منظف لطيف خالٍ من الكبريتات القاسية (Sulfate-free)", "Use a gentle, sulfate-free cleanser"),
        t("ضعي المرطب على بشرة رطبة مباشرة بعد الغسيل لحبس الرطوبة", "Apply moisturizer to damp skin right after washing to lock in hydration"),
      ];
      let urgent = false, urgentReason = "";
      if (severity === "severe") {
        urgent = true;
        urgentReason = t(
          "التقشر والتشقق الشديد قد يشير لحالة جلدية تحتاج تقييم طبي (كالإكزيما).",
          "Severe flaking and cracking may indicate a skin condition needing medical evaluation (such as eczema)."
        );
      }
      return { severity, causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  redness: {
    label: { ar: "الاحمرار والتهيج", en: "Redness & Irritation" },
    icon: "🌡️",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const causes = [];
      if (a.red_trigger === "products") causes.push(t("تهيج ناتج عن منتج أو مكون معين لا يناسب بشرتك", "Irritation from a specific product or ingredient that doesn't suit your skin"));
      if (a.red_trigger === "heat_sun") causes.push(t("حساسية تجاه الحرارة والتعرض للشمس", "Sensitivity to heat and sun exposure"));
      if (a.red_trigger === "food") causes.push(t("استجابة وعائية مؤقتة لبعض الأطعمة الساخنة/الحارة", "A temporary vascular response to hot/spicy foods"));
      if (a.red_trigger === "always") causes.push(t("احمرار شبه دائم قد يشير لحالة جلدية كامنة تحتاج تقييمًا متخصصًا", "Near-constant redness may indicate an underlying skin condition needing specialist evaluation"));
      const ingredients = [
        t("سينتيلا آسياتيكا (Centella Asiatica) لتهدئة الالتهاب", "Centella Asiatica to calm inflammation"),
        t("نياسيناميد بتركيز منخفض لتقوية حاجز البشرة", "Low-strength niacinamide to strengthen the skin barrier"),
        t("تجنب العطور والكحول في المنتجات", "Avoid fragrance and alcohol in products"),
      ];
      const natural = [
        t("جل الصبار النقي البارد لتهدئة فورية", "Cold pure aloe vera gel for instant soothing"),
        t("كمادات ماء بارد أو شاي البابونج", "Cold water or chamomile tea compresses"),
      ];
      const tips = [
        t("أدخلي أي منتج جديد بشكل تدريجي (اختبار خلف الأذن أولًا)", "Introduce any new product gradually (patch test behind the ear first)"),
        t("تجنبي المقشرات القوية والماء شديد السخونة", "Avoid harsh exfoliants and very hot water"),
      ];
      let urgent = false, urgentReason = "";
      if (a.red_condition === "rosacea" || a.red_condition === "eczema" || a.red_trigger === "always") {
        urgent = true;
        urgentReason = t(
          "الاحمرار المزمن أو المرتبط بحالة مشخّصة مسبقًا (وردية/إكزيما) يحتاج متابعة طبيب جلدية لعلاج مناسب.",
          "Chronic redness, or redness linked to a pre-diagnosed condition (rosacea/eczema), needs a dermatologist's follow-up for proper treatment."
        );
      }
      return { severity: urgent ? "moderate" : "mild", causes, ingredients, natural, tips, urgent, urgentReason };
    },
  },

  dullness: {
    label: { ar: "بهتان البشرة", en: "Dull Skin" },
    icon: "🌥️",
    analyze(a, lang) {
      const t = (ar, en) => (lang === "en" ? en : ar);
      const causes = [];
      if (a.dull_cause === "dead_skin") causes.push(t("تراكم خلايا جلدية ميتة يحجب النضارة", "Dead skin cell buildup dulls radiance"));
      if (a.dull_cause === "dehydration") causes.push(t("قلة شرب الماء تؤثر على مظهر البشرة وحيويتها", "Not drinking enough water affects skin's appearance and vitality"));
      if (a.dull_cause === "fatigue") causes.push(t("قلة النوم والإجهاد يقللان من إشراقة البشرة", "Lack of sleep and fatigue reduce skin radiance"));
      if (causes.length === 0) causes.push(t("مزيج من عوامل نمط الحياة ونقص الترطيب", "A mix of lifestyle factors and insufficient hydration"));
      const ingredients = [
        t("فيتامين C صباحًا لإشراقة فورية", "Vitamin C in the morning for an instant glow"),
        t("أحماض AHA لطيفة (مثل حمض اللاكتيك) للتقشير الخفيف المنتظم", "Gentle AHAs (like lactic acid) for regular light exfoliation"),
        t("حمض الهيالورونيك للترطيب", "Hyaluronic acid for hydration"),
      ];
      const natural = [
        t("ماسك العسل والليمون بكمية قليلة جدًا للبشرة غير الحساسة (تجنب التعرض للشمس بعده مباشرة)", "A honey and small amount of lemon mask for non-sensitive skin (avoid sun exposure right after)"),
        t("شرب كمية كافية من الماء يوميًا", "Drinking enough water daily"),
      ];
      const tips = [
        t("التقشير اللطيف مرة أو مرتين أسبوعيًا يحدث فرقًا ملحوظًا", "Gentle exfoliation once or twice a week makes a noticeable difference"),
        t("النوم الكافي والماء أهم عامل غير مكلف لتحسين نضارة البشرة", "Adequate sleep and water are the most cost-free way to improve skin radiance"),
      ];
      return { severity: "mild", causes, ingredients, natural, tips, urgent: false, urgentReason: "" };
    },
  },
};
