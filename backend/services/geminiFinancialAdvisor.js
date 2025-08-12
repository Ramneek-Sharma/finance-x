// backend/services/geminiFinancialAdvisor.js
class GeminiFinancialAdvisor {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-2.0-flash';
  }

  async generatePersonalizedAdvice(user, expenses, intelligenceScore, cityData) {
    const prompt = `
You are a personal financial advisor. Analyze this user's financial data and provide personalized advice:

User Profile:
- Name: ${user.profile.name}
- City: ${user.profile.city}
- Status: ${user.profile.status}
- Monthly Income: ₹${user.profile.monthlyIncome.toLocaleString()}
- Intelligence Score: ${intelligenceScore.totalScore}/100

Recent Expenses Summary:
${this.formatExpensesForPrompt(expenses)}

City Benchmarks for ${user.profile.city}:
${this.formatCityDataForPrompt(cityData)}

Please provide:
1. 3 specific areas for improvement
2. 5 actionable money-saving tips for ${user.profile.city}
3. Budget allocation recommendations
4. Motivational message based on their current score

Respond in JSON format with clear, practical advice.
`;

    try {
      const response = await fetch(`${this.baseURL}/${this.model}:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);

    } catch (error) {
      console.error('❌ Error generating advice:', error);
      return this.getDefaultAdvice();
    }
  }

  formatExpensesForPrompt(expenses) {
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => `${category}: ₹${amount.toLocaleString()}`)
      .join(', ');
  }
}
