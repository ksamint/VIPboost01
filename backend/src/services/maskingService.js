export class MaskingService {
  constructor() {
    this.patterns = {
      phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      name: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
      idNumber: /\b\d{15,18}\b/g,
      cardNumber: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      username: /@[a-zA-Z0-9_]{3,20}/g,
    };

    this.replacements = {
      phone: '[PHONE]',
      email: '[EMAIL]',
      name: '[NAME]',
      idNumber: '[ID]',
      cardNumber: '[CARD]',
      username: '[USER]',
    };
  }

  maskPII(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let masked = text;

    for (const [type, pattern] of Object.entries(this.patterns)) {
      const replacement = this.replacements[type];
      masked = masked.replace(pattern, replacement);
    }

    return masked;
  }

  maskObject(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.maskPII(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.maskObject(item));
    }

    if (typeof obj === 'object') {
      const masked = {};
      for (const [key, value] of Object.entries(obj)) {
        masked[key] = this.maskObject(value);
      }
      return masked;
    }

    return obj;
  }

  maskConversationHistory(messages) {
    return messages.map((msg) => ({
      ...msg,
      message: this.maskPII(msg.message),
    }));
  }

  sanitizeCustomerProfile(profile) {
    if (!profile) return profile;

    const allowedFields = [
      'age',
      'gender',
      'gamePreferences',
      'spendingLevel',
      'riskTolerance',
      'personalityNotes',
      'customerId',
      'vipLevel',
    ];

    const sanitized = {};
    for (const key of allowedFields) {
      if (profile[key] !== undefined) {
        sanitized[key] = profile[key];
      }
    }

    if (profile.name) {
      sanitized.displayName = profile.name
        .split(' ')
        .map((n) => n[0] + '***')
        .join(' ');
    }

    return sanitized;
  }
}

export const maskingService = new MaskingService();
