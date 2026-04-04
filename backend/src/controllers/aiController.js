import { getPrismaClient } from '../config/database.js';
import { aiService } from '../services/aiService.js';
import { maskingService } from '../services/maskingService.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = getPrismaClient();

export async function generateInsights(req, res, next) {
  try {
    const { customerProfile, query } = req.body;

    const sanitizedProfile = maskingService.sanitizeCustomerProfile(customerProfile);

    const insights = await aiService.generateInsights(sanitizedProfile, query);

    res.json({
      insights,
      customerId: customerProfile?.customerId || 'anonymous',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function startSimulation(req, res, next) {
  try {
    const { scenario, customerProfile } = req.body;

    const sanitizedProfile = maskingService.sanitizeCustomerProfile(customerProfile);

    const session = await aiService.startSimulation(scenario, sanitizedProfile);

    const dbSession = await prisma.simulationSession.create({
      data: {
        userId: req.user.id,
        scenario,
        messages: JSON.stringify(session.messages),
        customerProfile: JSON.stringify(sanitizedProfile),
      },
    });

    res.status(201).json({
      sessionId: dbSession.id,
      scenario,
      messages: session.messages,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const maskedMessage = maskingService.maskPII(message);

    const session = await prisma.simulationSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Simulation session not found', 404);
    }

    if (session.userId !== req.user.id) {
      throw new AppError('Not authorized to access this session', 403);
    }

    if (session.endedAt) {
      throw new AppError('Simulation session has ended', 400);
    }

    const conversationHistory = typeof session.messages === 'string' ? JSON.parse(session.messages) : (session.messages || []);
    const customerProfile = typeof session.customerProfile === 'string' ? JSON.parse(session.customerProfile) : session.customerProfile;

    const aiResponse = await aiService.continueSimulation(
      session.scenario,
      customerProfile,
      conversationHistory,
      maskedMessage
    );

    const updatedMessages = [
      ...conversationHistory,
      { sender: 'user', message: maskedMessage, timestamp: new Date().toISOString() },
      aiResponse,
    ];

    await prisma.simulationSession.update({
      where: { id },
      data: {
        messages: JSON.stringify(updatedMessages),
        tokenUsed: session.tokenUsed + Math.ceil(maskedMessage.length / 4) + Math.ceil(aiResponse.message.length / 4),
      },
    });

    res.json({
      message: aiResponse,
    });
  } catch (error) {
    next(error);
  }
}

export async function endSimulation(req, res, next) {
  try {
    const { id } = req.params;

    const session = await prisma.simulationSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Simulation session not found', 404);
    }

    if (session.userId !== req.user.id) {
      throw new AppError('Not authorized to access this session', 403);
    }

    const messages = typeof session.messages === 'string' ? JSON.parse(session.messages) : (session.messages || []);
    const maskedHistory = maskingService.maskConversationHistory(messages);
    const feedback = await aiService.generateFeedback(maskedHistory);

    await prisma.simulationSession.update({
      where: { id },
      data: {
        endedAt: new Date(),
        feedback: JSON.stringify(feedback),
        score: feedback.overallScore,
      },
    });

    const userDailyTask = await prisma.dailyTask.findFirst({
      where: {
        userId: req.user.id,
        taskType: 'SIMULATION',
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });

    if (userDailyTask && !userDailyTask.completed) {
      await prisma.dailyTask.update({
        where: { id: userDailyTask.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    res.json({
      feedback,
      sessionId: id,
      endedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

export async function getSessionFeedback(req, res, next) {
  try {
    const { id } = req.params;

    const session = await prisma.simulationSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Simulation session not found', 404);
    }

    if (session.userId !== req.user.id) {
      throw new AppError('Not authorized to access this session', 403);
    }

    if (!session.endedAt) {
      throw new AppError('Simulation session has not ended', 400);
    }

    const feedback = typeof session.feedback === 'string' ? JSON.parse(session.feedback) : session.feedback;
    const messages = typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages;

    res.json({
      sessionId: id,
      scenario: session.scenario,
      feedback,
      score: session.score,
      messages,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSimulationHistory(req, res, next) {
  try {
    const sessions = await prisma.simulationSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        scenario: true,
        score: true,
        createdAt: true,
        endedAt: true,
        messages: true,
      },
    });

    const parsedSessions = sessions.map(s => ({
      ...s,
      messages: typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages
    }));

    res.json(parsedSessions);
  } catch (error) {
    next(error);
  }
}
