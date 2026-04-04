import bcrypt from 'bcryptjs';
import { getPrismaClient } from '../config/database.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = getPrismaClient();

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = generateTokens(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        onboardingComplete: user.profile?.onboardingComplete || false,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { username, password, nickname, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new AppError('Username already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        nickname: nickname || username,
        role: role || 'VIP_HOST',
        profile: {
          create: {
            onboardingComplete: false,
          },
        },
      },
      include: { profile: true },
    });

    const tokens = generateTokens(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        onboardingComplete: false,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = await verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
        nickname: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tokens = generateTokens(user.id);

    res.json({
      user,
      ...tokens,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid refresh token', 401));
    } else {
      next(error);
    }
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
      select: {
        id: true,
        username: true,
        role: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        profile: {
          select: {
            personalityType: true,
            preferences: true,
            onboardingComplete: true,
          },
        },
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { nickname, avatar, personalityType, preferences, onboardingComplete } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        nickname: nickname !== undefined ? nickname : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        profile: {
          update: {
            personalityType: personalityType !== undefined ? personalityType : undefined,
            preferences: preferences !== undefined ? preferences : undefined,
            onboardingComplete: onboardingComplete !== undefined ? onboardingComplete : undefined,
          },
        },
      },
      include: { profile: true },
    });

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      nickname: user.nickname,
      avatar: user.avatar,
      onboardingComplete: user.profile?.onboardingComplete || false,
    });
  } catch (error) {
    next(error);
  }
}

export async function initDefaultAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SYSTEM_ADMIN' },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(config.admin.defaultAdminPassword, 12);

      await prisma.user.create({
        data: {
          username: config.admin.defaultAdminUsername,
          passwordHash,
          role: 'SYSTEM_ADMIN',
          nickname: 'System Admin',
          profile: {
            create: {
              onboardingComplete: true,
            },
          },
        },
      });

      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}
