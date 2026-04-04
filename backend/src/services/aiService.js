import { config } from '../config/index.js';

const SCENARIO_PROMPTS = {
  VIP_COMPLAINT: `You are roleplaying as a high-value VIP casino client who is ANGRY about a recent experience. You lost a significant amount and feel the service was lacking. You are frustrated, emotional, and may use strong language, but you are not violent. Your goal is to test the host's ability to:
1. Remain calm and empathetic
2. Acknowledge the client's feelings without being defensive
3. Offer appropriate compensation or solutions
4. Maintain professional dignity while showing genuine care

Stay in character and respond realistically. Start the conversation expressing your frustration.`,
  
  HIGH_ROLLER_CONVERSION: `You are roleplaying as a wealthy potential VIP client who is considering becoming a regular high-roller at the casino. You are sophisticated, demanding, and have high expectations. You want to be wooed but also need to trust the host. You will ask probing questions about services, privacy, and exclusive benefits. Be impressive but skeptical.`,
  
  LOYALTY_RECOVERY: `You are roleplaying as a former VIP client who has been inactive for 6 months. You had a good relationship before but something pushed you away. You are cautious but open to returning if properly handled. You miss the experience but fear being forgotten. Express both longing and hesitation.`,
  
  EMOTIONAL_SUPPORT: `You are roleplaying as a VIP client who has experienced personal hardship (family issues, stress) and has been gambling more heavily as a coping mechanism. You are vulnerable and may need empathetic support beyond typical host duties. Show signs of emotional distress while still being a valuable client.`,
  
  CROSS_SELL: `You are roleplaying as a regular VIP client who primarily plays one game (e.g., baccarat). You are curious but skeptical about exploring new offerings (e.g., high-limit slots, private poker room, non-gaming amenities). Balance curiosity with your established habits.`,
};

const FEEDBACK_PROMPT = `Analyze the host's performance in this conversation. Provide a structured JSON response with the following format:
{
  "emotionalScore": <number 0-100, how well the host managed emotional rapport>,
  "professionalScore": <number 0-100, professionalism, service knowledge, protocol adherence>,
  "resolutionScore": <number 0-100, how effectively the situation was addressed>,
  "overallScore": <number 0-100, weighted average>,
  "strengths": [<array of 2-3 specific positive behaviors>],
  "improvements": [<array of 2-3 specific improvement areas>],
  "suggestedResponse": "<example of ideal response for most critical moment>"
}`;

export class AIService {
  constructor() {
    this.provider = config.ai.provider;
    this.apiKey = config.ai.apiKey;
    this.baseUrl = config.ai.baseUrl;
    this.defaultModel = config.ai.defaultModel;
    this.maxTokens = config.ai.maxTokens;
    this.timeout = config.ai.timeout;
  }

  async chat(messages, model = null) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages,
        max_tokens: this.maxTokens,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  getSystemPrompt(scenario) {
    return SCENARIO_PROMPTS[scenario] || SCENARIO_PROMPTS.VIP_COMPLAINT;
  }

  getFeedbackPrompt() {
    return FEEDBACK_PROMPT;
  }

  buildSimulationMessages(scenario, customerProfile, conversationHistory = []) {
    const systemPrompt = this.getSystemPrompt(scenario);

    const profileContext = customerProfile
      ? `\n\nCustomer profile (for your reference only, do not reveal): Age ${customerProfile.age || 'unknown'}, ${customerProfile.gender || 'unknown'}, spending level: ${customerProfile.spendingLevel || 'unknown'}.`
      : '';

    const messages = [
      { role: 'system', content: systemPrompt + profileContext },
      ...conversationHistory.map((msg) => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.message,
      })),
    ];

    return messages;
  }

  async startSimulation(scenario, customerProfile) {
    const messages = this.buildSimulationMessages(scenario, customerProfile, []);
    const firstResponse = await this.chat(messages);

    return {
      scenario,
      messages: [
        { sender: 'ai', message: firstResponse, timestamp: new Date().toISOString() },
      ],
    };
  }

  async continueSimulation(scenario, customerProfile, conversationHistory, userMessage) {
    const messages = this.buildSimulationMessages(
      scenario,
      customerProfile,
      [...conversationHistory, { sender: 'user', message: userMessage }]
    );

    const response = await this.chat(messages);

    return {
      sender: 'ai',
      message: response,
      timestamp: new Date().toISOString(),
    };
  }

  async generateFeedback(conversationHistory) {
    const feedbackMessages = [
      { role: 'system', content: FEEDBACK_PROMPT },
      {
        role: 'user',
        content: `Please analyze this conversation and provide feedback:\n\n${
          conversationHistory
            .map((m) => `${m.sender === 'ai' ? 'Customer' : 'Host'}: ${m.message}`)
            .join('\n\n')
        }`,
      },
    ];

    const response = await this.chat(feedbackMessages);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse feedback JSON:', e);
    }

    return {
      emotionalScore: 0,
      professionalScore: 0,
      resolutionScore: 0,
      overallScore: 0,
      strengths: ['Unable to parse structured feedback'],
      improvements: ['Unable to parse structured feedback'],
      suggestedResponse: response.substring(0, 200),
    };
  }

  async generateInsights(customerProfile, query) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert VIP casino host consultant with deep knowledge of customer psychology, casino operations, and high-net-worth client management. Provide insightful, actionable advice based on the customer profile provided. Always maintain confidentiality and professionalism.`,
      },
      {
        role: 'user',
        content: `Customer Profile: ${JSON.stringify(customerProfile)}\n\nQuery: ${query}`,
      },
    ];

    return await this.chat(messages);
  }
}

export const aiService = new AIService();
