import { requireRole, requireMinRole } from '../middleware/rbac';

describe('RBAC Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('requireRole', () => {
    it('should allow user with matching role', () => {
      mockReq.user = { role: 'VIP_HOST' };

      const middleware = requireRole('VIP_HOST');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow user with any of the allowed roles', () => {
      mockReq.user = { role: 'TEAM_MANAGER' };

      const middleware = requireRole('VIP_HOST', 'TEAM_MANAGER');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny user without matching role', () => {
      mockReq.user = { role: 'VIP_HOST' };

      const middleware = requireRole('SYSTEM_ADMIN');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Insufficient permissions' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny unauthenticated user', () => {
      mockReq.user = undefined;

      const middleware = requireRole('VIP_HOST');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Authentication required' })
      );
    });
  });

  describe('requireMinRole', () => {
    it('should allow VIP_HOST for min VIP_HOST', () => {
      mockReq.user = { role: 'VIP_HOST' };

      const middleware = requireMinRole('VIP_HOST');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow TEAM_MANAGER for min VIP_HOST', () => {
      mockReq.user = { role: 'TEAM_MANAGER' };

      const middleware = requireMinRole('VIP_HOST');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow SYSTEM_ADMIN for min VIP_HOST', () => {
      mockReq.user = { role: 'SYSTEM_ADMIN' };

      const middleware = requireMinRole('VIP_HOST');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny VIP_HOST for min TEAM_MANAGER', () => {
      mockReq.user = { role: 'VIP_HOST' };

      const middleware = requireMinRole('TEAM_MANAGER');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny TEAM_MANAGER for min SYSTEM_ADMIN', () => {
      mockReq.user = { role: 'TEAM_MANAGER' };

      const middleware = requireMinRole('SYSTEM_ADMIN');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow SYSTEM_ADMIN for min SYSTEM_ADMIN', () => {
      mockReq.user = { role: 'SYSTEM_ADMIN' };

      const middleware = requireMinRole('SYSTEM_ADMIN');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny unauthenticated user', () => {
      mockReq.user = undefined;

      const middleware = requireMinRole('VIP_HOST');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
