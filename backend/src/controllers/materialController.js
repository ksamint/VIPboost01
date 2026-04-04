import { getPrismaClient } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { maskingService } from '../services/maskingService.js';

const prisma = getPrismaClient();

export async function getTodayMaterials(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const materials = await prisma.material.findMany({
      where: {
        publishDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { publishDate: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        mediaUrl: true,
        thumbnailUrl: true,
        publishDate: true,
      },
    });

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id },
    });

    const greeting = generateGreeting(req.user.nickname, userProfile?.personalityType);

    res.json({
      greeting,
      materials,
      date: today.toISOString().split('T')[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function getMaterialsByDateRange(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('startDate and endDate are required', 400);
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const materials = await prisma.material.findMany({
      where: {
        publishDate: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { publishDate: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        mediaUrl: true,
        thumbnailUrl: true,
        publishDate: true,
      },
    });

    res.json(materials);
  } catch (error) {
    next(error);
  }
}

export async function getMaterialsByDate(req, res, next) {
  try {
    const { date } = req.params;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const materials = await prisma.material.findMany({
      where: {
        publishDate: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      orderBy: { publishDate: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        mediaUrl: true,
        thumbnailUrl: true,
        publishDate: true,
      },
    });

    res.json(materials);
  } catch (error) {
    next(error);
  }
}

export async function createMaterial(req, res, next) {
  try {
    const { type, title, content, mediaUrl, thumbnailUrl, publishDate, targetUsers } = req.body;

    const material = await prisma.material.create({
      data: {
        type,
        title,
        content,
        mediaUrl,
        thumbnailUrl,
        publishDate: new Date(publishDate),
        createdById: req.user.id,
      },
    });

    if (targetUsers && targetUsers.length > 0) {
      await prisma.pushLog.create({
        data: {
          materialId: material.id,
          targetUsers: JSON.stringify(targetUsers),
          status: 'pending',
          createdById: req.user.id,
        },
      });
    }

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
}

export async function getCalendarMaterials(req, res, next) {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      throw new AppError('year and month are required', 400);
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const materials = await prisma.material.findMany({
      where: {
        publishDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        type: true,
        title: true,
        publishDate: true,
      },
    });

    const calendarData = {};
    for (const material of materials) {
      const dateKey = material.publishDate.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push({
        id: material.id,
        type: material.type,
        title: material.title,
      });
    }

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      data: calendarData,
    });
  } catch (error) {
    next(error);
  }
}

function generateGreeting(nickname, personalityType) {
  const hour = new Date().getHours();
  let timeGreeting;

  if (hour < 6) {
    timeGreeting = '凌晨好';
  } else if (hour < 9) {
    timeGreeting = '早上好';
  } else if (hour < 12) {
    timeGreeting = '上午好';
  } else if (hour < 14) {
    timeGreeting = '中午好';
  } else if (hour < 18) {
    timeGreeting = '下午好';
  } else if (hour < 22) {
    timeGreeting = '晚上好';
  } else {
    timeGreeting = '夜深了';
  }

  const displayName = nickname || '贵宾专员';

  const personalityGreetings = {
    'TYPE_A': '期待您今日的精彩表现！',
    'TYPE_B': '保持节奏，稳中求胜！',
    'TYPE_C': '轻松应对，优雅从容！',
    'TYPE_D': '今日必定收获满满！',
    'TYPE_E': '用心服务，创造不凡！',
  };

  const suffix = personalityType
    ? personalityGreetings[personalityType] || '祝您工作顺利！'
    : '祝您工作顺利！';

  return `${timeGreeting}，${displayName}。${suffix}`;
}
