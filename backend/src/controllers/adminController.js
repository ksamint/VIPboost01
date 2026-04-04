import { getPrismaClient } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = getPrismaClient();

export async function getTeamStats(req, res, next) {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { managerId: req.user.id },
      include: {
        member: {
          include: {
            profile: true,
            dailyTasks: {
              where: {
                date: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = teamMembers.map((tm) => {
      const member = tm.member;
      const completedTasks = member.dailyTasks.filter((t) => t.completed).length;
      const totalTasks = member.dailyTasks.length;

      return {
        id: member.id,
        nickname: member.nickname,
        avatar: member.avatar,
        lastLogin: member.updatedAt,
        personalityComplete: member.profile?.onboardingComplete || false,
        dailyTasks: {
          completed: completedTasks,
          total: totalTasks,
        },
      };
    });

    const totalMembers = teamMembers.length;
    const activeToday = stats.filter(
      (s) => new Date(s.lastLogin) >= today
    ).length;
    const avgSimulationsPerWeek = await calculateAvgSimulations(req.user.id);

    res.json({
      summary: {
        totalMembers,
        activeToday,
        activeRate: totalMembers > 0 ? (activeToday / totalMembers) * 100 : 0,
        avgSimulationsPerWeek,
      },
      members: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeamMembers(req, res, next) {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { managerId: req.user.id },
      include: {
        member: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    const members = teamMembers.map((tm) => ({
      id: tm.member.id,
      nickname: tm.member.nickname,
      avatar: tm.member.avatar,
      role: tm.member.role,
      joinedAt: tm.member.createdAt,
    }));

    res.json(members);
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
          status: 'created',
          createdById: req.user.id,
        },
      });
    }

    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
}

export async function getPushLogs(req, res, next) {
  try {
    const logs = await prisma.pushLog.findMany({
      where: { createdById: req.user.id },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'VIP_HOST',
      },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        profile: {
          select: {
            personalityType: true,
            onboardingComplete: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function assignTeamMember(req, res, next) {
  try {
    const { memberId } = req.body;

    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new AppError('User not found', 404);
    }

    if (member.role !== 'VIP_HOST') {
      throw new AppError('Can only assign VIP Hosts to teams', 400);
    }

    const existing = await prisma.teamMember.findFirst({
      where: { memberId },
    });

    if (existing) {
      throw new AppError('User already assigned to a team', 409);
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        managerId: req.user.id,
        memberId,
      },
    });

    res.status(201).json(teamMember);
  } catch (error) {
    next(error);
  }
}

async function calculateAvgSimulations(managerId) {
  const teamMembers = await prisma.teamMember.findMany({
    where: { managerId },
    select: { memberId: true },
  });

  const memberIds = teamMembers.map((tm) => tm.memberId);

  if (memberIds.length === 0) return 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const simulations = await prisma.simulationSession.count({
    where: {
      userId: { in: memberIds },
      createdAt: { gte: weekAgo },
    },
  });

  return simulations / memberIds.length;
}
