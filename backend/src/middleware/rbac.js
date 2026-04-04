const roleHierarchy = {
  VIP_HOST: 1,
  TEAM_MANAGER: 2,
  SYSTEM_ADMIN: 3,
};

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole,
      });
    }

    next();
  };
}

export function requireMinRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userRoleLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: minRole,
        current: req.user.role,
      });
    }

    next();
  };
}

export function isManagerOf(targetUserId) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    if (req.user.role === 'TEAM_MANAGER') {
      const prisma = req.prisma;
      const relationship = await prisma.teamMember.findFirst({
        where: {
          managerId: req.user.id,
          memberId: targetUserId,
        },
      });

      if (relationship) {
        return next();
      }
    }

    if (req.user.id === targetUserId) {
      return next();
    }

    return res.status(403).json({ error: 'Not authorized to access this resource' });
  };
}
