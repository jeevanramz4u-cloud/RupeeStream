import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TaskSuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedTitle?: string;
  suggestedDescription?: string;
  estimatedReward: number;
  estimatedTimeLimit: number;
}

export interface TaskOptimization {
  optimizedTitle: string;
  optimizedDescription: string;
  optimizedRequirements: string;
  seoKeywords: string[];
  engagementTips: string[];
}

/**
 * Analyze task content and suggest the most appropriate category
 */
export async function suggestTaskCategory(title: string, description: string): Promise<TaskSuggestion> {
  try {
    const prompt = `
Analyze the following task and suggest the most appropriate category from these options:
- app_download: Mobile app downloads and installations (₹15-25 range)
- business_review: Writing reviews for businesses on Google, Zomato etc (₹30-35 range)
- product_review: Product reviews on e-commerce platforms (₹25-40 range)
- channel_subscribe: YouTube channel subscriptions and social media follows (₹15-20 range)
- comment_like: Social media engagement, comments, likes (₹10-15 range)

Task Title: "${title}"
Task Description: "${description}"

Respond with JSON in this exact format:
{
  "category": "suggested_category_key",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this category fits",
  "estimatedReward": 25,
  "estimatedTimeLimit": 30
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert task categorization system for a task completion platform. Analyze tasks and suggest appropriate categories with high accuracy."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      category: result.category || "app_download",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || "Default categorization applied",
      estimatedReward: result.estimatedReward || 20,
      estimatedTimeLimit: result.estimatedTimeLimit || 60
    };
  } catch (error) {
    console.error("AI task categorization error:", error);
    // Fallback to default category with low confidence
    return {
      category: "app_download",
      confidence: 0.1,
      reasoning: "AI categorization failed, using default category",
      estimatedReward: 20,
      estimatedTimeLimit: 60
    };
  }
}

/**
 * Generate intelligent task suggestions based on existing tasks and trends
 */
export async function generateTaskSuggestions(existingTasks: any[], targetCategory?: string): Promise<TaskSuggestion[]> {
  try {
    const taskSummary = existingTasks.map(task => `${task.category}: ${task.title}`).join('\n');
    
    const prompt = `
Based on these existing tasks on our platform, suggest 3 new engaging tasks that would be popular with users:

Existing tasks:
${taskSummary}

${targetCategory ? `Focus on category: ${targetCategory}` : 'Suggest tasks across different categories'}

Available categories:
- app_download: Mobile app downloads (₹15-25)
- business_review: Business reviews on Google/Zomato (₹30-35)
- product_review: E-commerce product reviews (₹25-40)
- channel_subscribe: YouTube/social media follows (₹15-20)
- comment_like: Social media engagement (₹10-15)

Respond with JSON array in this format:
[
  {
    "category": "category_key",
    "confidence": 0.9,
    "reasoning": "Why this task would be popular",
    "suggestedTitle": "Engaging task title",
    "suggestedDescription": "Clear task description with specific instructions",
    "estimatedReward": 25,
    "estimatedTimeLimit": 30
  }
]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert task creation assistant. Generate engaging, popular, and profitable tasks for a task completion platform."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    const suggestions = Array.isArray(result) ? result : result.suggestions || [];
    
    return suggestions.slice(0, 3).map((suggestion: any) => ({
      category: suggestion.category || "app_download",
      confidence: Math.max(0, Math.min(1, suggestion.confidence || 0.7)),
      reasoning: suggestion.reasoning || "AI-generated suggestion",
      suggestedTitle: suggestion.suggestedTitle || "New Task",
      suggestedDescription: suggestion.suggestedDescription || "Complete this task to earn rewards",
      estimatedReward: suggestion.estimatedReward || 20,
      estimatedTimeLimit: suggestion.estimatedTimeLimit || 60
    }));
  } catch (error) {
    console.error("AI task generation error:", error);
    return [];
  }
}

/**
 * Optimize task content for better engagement and clarity
 */
export async function optimizeTaskContent(title: string, description: string, requirements: string): Promise<TaskOptimization> {
  try {
    const prompt = `
Optimize this task for maximum user engagement and clarity:

Title: "${title}"
Description: "${description}"
Requirements: "${requirements}"

Improve the content to be:
1. More engaging and motivating
2. Clearer with specific instructions
3. Professional and trustworthy
4. SEO-optimized with relevant keywords
5. Include engagement tips for better completion rates

Respond with JSON in this format:
{
  "optimizedTitle": "Improved engaging title",
  "optimizedDescription": "Clear, detailed description with specific steps",
  "optimizedRequirements": "Clear requirements and verification steps",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"],
  "engagementTips": ["tip1", "tip2", "tip3"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert content optimizer for task completion platforms. Improve task content for maximum engagement and clarity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      optimizedTitle: result.optimizedTitle || title,
      optimizedDescription: result.optimizedDescription || description,
      optimizedRequirements: result.optimizedRequirements || requirements,
      seoKeywords: result.seoKeywords || [],
      engagementTips: result.engagementTips || []
    };
  } catch (error) {
    console.error("AI content optimization error:", error);
    return {
      optimizedTitle: title,
      optimizedDescription: description,
      optimizedRequirements: requirements,
      seoKeywords: [],
      engagementTips: []
    };
  }
}

/**
 * Analyze task performance and suggest improvements
 */
export async function analyzeTaskPerformance(task: any, completionData: any[]): Promise<{
  performanceScore: number;
  insights: string[];
  suggestions: string[];
}> {
  try {
    const completionRate = completionData.length / (task.maxCompletions || 100);
    const approvalRate = completionData.filter(c => c.status === 'approved').length / Math.max(1, completionData.length);
    
    const prompt = `
Analyze this task performance and provide insights:

Task: "${task.title}"
Category: ${task.category}
Reward: ₹${task.reward}
Time Limit: ${task.timeLimit} minutes
Completion Rate: ${(completionRate * 100).toFixed(1)}%
Approval Rate: ${(approvalRate * 100).toFixed(1)}%
Total Completions: ${completionData.length}

Provide performance analysis and improvement suggestions.

Respond with JSON:
{
  "performanceScore": 0.85,
  "insights": ["insight1", "insight2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a task performance analyst. Analyze completion data and provide actionable insights for optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      performanceScore: Math.max(0, Math.min(1, result.performanceScore || 0.5)),
      insights: result.insights || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("AI performance analysis error:", error);
    return {
      performanceScore: 0.5,
      insights: ["Performance analysis unavailable"],
      suggestions: ["Review task manually for improvements"]
    };
  }
}