import { getPrismaClient } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = getPrismaClient();

export async function getDailyTasks(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let tasks = await prisma.dailyTask.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (tasks.length === 0) {
      tasks = await prisma.dailyTask.createMany({
        data: [
          { userId: req.user.id, taskType: 'PERSONALITY_TEST' },
          { userId: req.user.id, taskType: 'SIMULATION' },
          { userId: req.user.id, taskType: 'MATERIAL_VIEW' },
        ],
      });

      tasks = await prisma.dailyTask.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id },
    });

    const taskProgress = tasks.map((task) => ({
      id: task.id,
      type: task.taskType,
      completed: task.completed,
      completedAt: task.completedAt,
    }));

    const taskDescriptions = {
      PERSONALITY_TEST: { title: '心理测评', description: '完成性格画像分析', target: 1 },
      SIMULATION: { title: 'AI对练', description: '完成一次模拟演练', target: 1 },
      MATERIAL_VIEW: { title: '素材浏览', description: '查看今日推送素材', target: 3 },
    };

    const detailedTasks = taskProgress.map((task) => ({
      ...task,
      ...taskDescriptions[task.type],
    }));

    res.json({
      date: today.toISOString().split('T')[0],
      onboardingComplete: userProfile?.onboardingComplete || false,
      tasks: detailedTasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeTask(req, res, next) {
  try {
    const { taskType } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const task = await prisma.dailyTask.findFirst({
      where: {
        userId: req.user.id,
        taskType,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.completed) {
      throw new AppError('Task already completed', 400);
    }

    const updatedTask = await prisma.dailyTask.update({
      where: { id: task.id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    res.json({
      id: updatedTask.id,
      type: updatedTask.taskType,
      completed: updatedTask.completed,
      completedAt: updatedTask.completedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskHistory(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await prisma.dailyTask.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.dailyTask.count({
      where: { userId: req.user.id },
    });

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}
