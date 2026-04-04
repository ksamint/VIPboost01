import { MaskingService } from '../services/maskingService';

describe('MaskingService', () => {
  let service;

  beforeEach(() => {
    service = new MaskingService();
  });

  describe('maskPII', () => {
    it('should mask phone numbers', () => {
      const input = '联系电话: 13812345678';
      const result = service.maskPII(input);
      expect(result).toContain('[PHONE]');
      expect(result).not.toContain('13812345678');
    });

    it('should mask email addresses', () => {
      const input = '邮箱: john.doe@example.com';
      const result = service.maskPII(input);
      expect(result).toContain('[EMAIL]');
      expect(result).not.toContain('john.doe@example.com');
    });

    it('should mask Chinese names', () => {
      const input = '客户姓名：张三';
      const result = service.maskPII(input);
      expect(result).toContain('[NAME]');
      expect(result).not.toContain('张三');
    });

    it('should mask ID numbers', () => {
      const input = '身份证号: 110101199001011234';
      const result = service.maskPII(input);
      expect(result).toContain('[ID]');
      expect(result).not.toContain('110101199001011234');
    });

    it('should mask card numbers', () => {
      const input = '银行卡: 6222021234567890123';
      const result = service.maskPII(input);
      expect(result).toContain('[CARD]');
      expect(result).not.toContain('6222021234567890123');
    });

    it('should mask usernames', () => {
      const input = '社交账号: @vip_host_123';
      const result = service.maskPII(input);
      expect(result).toContain('[USER]');
      expect(result).not.toContain('vip_host_123');
    });

    it('should return null/undefined unchanged', () => {
      expect(service.maskPII(null)).toBeNull();
      expect(service.maskPII(undefined)).toBeUndefined();
    });

    it('should return non-strings unchanged', () => {
      expect(service.maskPII(123)).toBe(123);
      expect(service.maskPII({})).toEqual({});
    });
  });

  describe('maskObject', () => {
    it('should mask all PII in objects', () => {
      const input = {
        name: '李四',
        phone: '13900001111',
        email: 'li@example.com',
        message: '我是李四，联系我 13900001111',
      };

      const result = service.maskObject(input);

      expect(result.name).toBe('[NAME]');
      expect(result.phone).toBe('[PHONE]');
      expect(result.email).toBe('[EMAIL]');
      expect(result.message).toBe('[NAME]，联系我 [PHONE]');
    });

    it('should handle arrays', () => {
      const input = [
        { name: '王五', phone: '13700002222' },
        { name: '赵六', phone: '13600003333' },
      ];

      const result = service.maskObject(input);

      expect(result[0].name).toBe('[NAME]');
      expect(result[0].phone).toBe('[PHONE]');
      expect(result[1].name).toBe('[NAME]');
      expect(result[1].phone).toBe('[PHONE]');
    });

    it('should handle nested objects', () => {
      const input = {
        customer: {
          name: '孙七',
          contact: {
            phone: '13500004444',
          },
        },
      };

      const result = service.maskObject(input);

      expect(result.customer.name).toBe('[NAME]');
      expect(result.customer.contact.phone).toBe('[PHONE]');
    });
  });

  describe('sanitizeCustomerProfile', () => {
    it('should only keep allowed fields', () => {
      const input = {
        name: '周八',
        age: 45,
        gender: 'male',
        secretField: 'should be removed',
        phone: '13400005555',
        gamePreferences: ['baccarat', 'poker'],
        spendingLevel: 'HIGH',
      };

      const result = service.sanitizeCustomerProfile(input);

      expect(result.age).toBe(45);
      expect(result.gender).toBe('male');
      expect(result.gamePreferences).toEqual(['baccarat', 'poker']);
      expect(result.spendingLevel).toBe('HIGH');
      expect(result.secretField).toBeUndefined();
      expect(result.phone).toBeUndefined();
    });

    it('should partially mask the name', () => {
      const input = {
        name: '吴九',
        age: 50,
      };

      const result = service.sanitizeCustomerProfile(input);

      expect(result.displayName).toBe('吴***');
    });

    it('should handle null/undefined input', () => {
      expect(service.sanitizeCustomerProfile(null)).toBeNull();
      expect(service.sanitizeCustomerProfile(undefined)).toBeUndefined();
    });
  });

  describe('maskConversationHistory', () => {
    it('should mask messages in conversation', () => {
      const input = [
        { sender: 'user', message: '我是张三，电话 13800006666' },
        { sender: 'ai', message: '您好张先生，我们会联系您' },
      ];

      const result = service.maskConversationHistory(input);

      expect(result[0].message).toContain('[NAME]');
      expect(result[0].message).toContain('[PHONE]');
      expect(result[1].message).toContain('[NAME]');
    });
  });
});
