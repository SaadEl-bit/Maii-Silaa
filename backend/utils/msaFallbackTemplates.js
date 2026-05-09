// Hardcoded Arabic (MSA) fallback strings — used when the AI is down.
// These ensure the farmer ALWAYS gets a response, even without internet.
// All text is Modern Standard Arabic (الفصحى). Never Darija.

const msaFallbackTemplates = {

  // --- Irrigation (MAÏ) ---
  irrigation: {
    shouldWater: {
      recommendation: 'بناءً على بيانات الطقس، يُنصح بالري اليوم.',
      explanation: 'درجة الحرارة مرتفعة ولا يوجد هطول أمطار متوقع.',
      action_items: [
        'قم بالري في الصباح الباكر أو المساء لتقليل التبخر.',
        'تحقق من رطوبة التربة قبل الري.',
      ],
    },
    shouldNotWater: {
      recommendation: 'لا حاجة للري اليوم.',
      explanation: 'هناك هطول أمطار كافٍ أو رطوبة تربة مناسبة.',
      action_items: [
        'راقب حالة التربة غداً.',
        'تأكد من عدم وجود مياه راكدة حول النبات.',
      ],
    },
  },

  // --- Market (SILA) ---
  market: {
    sellNow: {
      recommendation: 'يُنصح بالبيع الآن.',
      explanation: 'الأسعار حالياً عند مستوى جيد وقد تنخفض قريباً.',
      action_items: [
        'تواصل مع المشترين المتاحين.',
        'جهّز المحصول للنقل والتسليم.',
      ],
    },
    holdAndWait: {
      recommendation: 'يُنصح بالانتظار قبل البيع.',
      explanation: 'الأسعار في ارتفاع ومن المتوقع أن تتحسن.',
      action_items: [
        'تأكد من ظروف التخزين المناسبة.',
        'راقب الأسعار يومياً.',
      ],
    },
    urgentSell: {
      recommendation: 'يجب البيع فوراً!',
      explanation: 'مدة صلاحية المحصول قصيرة. البيع الفوري ضروري لتجنب الخسارة.',
      action_items: [
        'اعرض بسعر تنافسي لضمان البيع السريع.',
        'تواصل مع أقرب سوق أو موزع.',
      ],
    },
  },

  // --- Detection (Photo Diagnosis) ---
  detection: {
    healthy: {
      recommendation: 'النبات يبدو بصحة جيدة.',
      explanation: 'لم يتم اكتشاف أي أمراض أو آفات واضحة.',
      action_items: [
        'استمر في برنامج الري والتسميد المعتاد.',
        'افحص النباتات بانتظام.',
      ],
    },
    diseaseDetected: {
      recommendation: 'تم اكتشاف مشكلة صحية في النبات.',
      explanation: 'يُرجى مراجعة مهندس زراعي محلي للتشخيص الدقيق.',
      action_items: [
        'اعزل النباتات المصابة عن البقية.',
        'التقط صوراً إضافية وأرسلها للمتابعة.',
      ],
    },
  },

  // --- Community Alerts ---
  alert: {
    pestAlert: 'تنبيه: تم الإبلاغ عن إصابة بآفات في منطقتك. يُرجى فحص محاصيلك.',
    diseaseAlert: 'تنبيه: تم اكتشاف مرض نباتي قريب من مزرعتك. اتخذ الاحتياطات اللازمة.',
    weatherAlert: 'تنبيه: ظروف طقس قاسية متوقعة. يُرجى حماية محاصيلك.',
  },

  // --- Generic Errors ---
  error: {
    aiUnavailable: 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يُرجى المحاولة لاحقاً.',
    networkError: 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.',
    invalidInput: 'البيانات المدخلة غير صحيحة. يُرجى التحقق والمحاولة مرة أخرى.',
  },

  // --- Retry Later (for AI failures) ---
  common: {
    systemError: 'عذراً، الخدمة غير متاحة الآن. يرجى المحاولة لاحقاً.',
    retryLater: 'يرجى المحاولة لاحقاً.',
  },

  // --- Irrigation Retry ---
  irrigationRetry: {
    retryLater: {
      recommendation: 'يرجى المحاولة لاحقاً.',
      explanation: 'عذراً، لم نتمكن من حساب التوصية الآن.',
      action_items: ['تحقق من الاتصال وحاول مرة أخرى.'],
    },
  },

  // --- Market Retry ---
  marketRetry: {
    retryLater: {
      recommendation: 'يرجى المحاولة لاحقاً.',
      explanation: 'عذراً، لم نتمكن من حساب التوصية الآن.',
      action_items: ['تحقق من الاتصال وحاول مرة أخرى.'],
    },
  },

  // --- Detection Retry ---
  detectionRetry: {
    retryLater: {
      diagnosis: 'يرجى المحاولة لاحقاً.',
      severity: 'unknown',
      treatment: 'عذراً، لم نتمكن من التشخيص الآن.',
      action_items: ['تحقق من الاتصال وحاول مرة أخرى.'],
    },
  },
};

module.exports = msaFallbackTemplates;
