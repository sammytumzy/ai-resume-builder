const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

// Lazy LLM client (OpenAI, Grok, or Groq)
let llmClient = null;
function getLLMClient() {
  if (llmClient) return llmClient;
  const grokKey = process.env.GROK_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const usingGrok = Boolean(grokKey && grokKey.trim().length > 0);
  const usingGroq = !usingGrok && Boolean(groqKey && groqKey.trim().length > 0);
  const apiKey = usingGrok ? grokKey : usingGroq ? groqKey : openaiKey;
  if (!apiKey) {
    throw new Error('Missing API key. Set GROK_API_KEY, GROQ_API_KEY or OPENAI_API_KEY in .env');
  }
  const baseURL = usingGrok
    ? (process.env.GROK_BASE_URL || 'https://api.x.ai/v1')
    : usingGroq
      ? (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1')
      : undefined;
  llmClient = new OpenAI({ apiKey, baseURL });
  return llmClient;
}

// Generate LinkedIn summary
router.post('/linkedin-summary', async (req, res) => {
  try {
    const { resumeText, industry, experienceLevel } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const prompt = `
      Create a compelling LinkedIn summary based on the following resume information:

      Resume Information:
      ${resumeText}

      ${industry ? `Industry: ${industry}` : ''}
      ${experienceLevel ? `Experience Level: ${experienceLevel}` : ''}

      The LinkedIn summary should:
      1. Be 2-3 paragraphs (150-300 words)
      2. Start with a strong hook
      3. Highlight key achievements and skills
      4. Include relevant keywords for the industry
      5. Show personality and passion
      6. End with a call-to-action
      7. Be professional yet engaging

      Format it as a LinkedIn summary with proper line breaks.
    `;

    const client = getLLMClient();
    const model = process.env.LLM_MODEL || (process.env.GROK_API_KEY ? 'grok-2-latest' : 'gpt-4');
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a LinkedIn expert and personal branding specialist."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    res.json({ 
      success: true, 
      linkedinSummary: completion.choices[0].message.content,
      message: 'LinkedIn summary generated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'LinkedIn summary generation failed',
      message: error.message 
    });
  }
});

// Generate mock interview questions
router.post('/interview-prep', async (req, res) => {
  try {
    const { resumeText, jobDescription, positionTitle, industry } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const prompt = `
      Generate comprehensive mock interview questions and preparation guidance based on:

      Resume Information:
      ${resumeText}

      ${jobDescription ? `Job Description: ${jobDescription}` : ''}
      ${positionTitle ? `Position: ${positionTitle}` : ''}
      ${industry ? `Industry: ${industry}` : ''}

      Please provide:
      1. 10-15 behavioral questions (STAR method)
      2. 5-8 technical questions (if applicable)
      3. 3-5 situational questions
      4. 2-3 questions about the candidate's background
      5. Sample answers for 3 key questions
      6. Interview tips and strategies
      7. Questions the candidate should ask the interviewer

      Format as a comprehensive interview preparation guide.
    `;

    const client = getLLMClient();
    const model = process.env.LLM_MODEL || (process.env.GROK_API_KEY ? 'grok-2-latest' : 'gpt-4');
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert career coach and interview preparation specialist with extensive experience in various industries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2500,
      temperature: 0.7
    });

    res.json({ 
      success: true, 
      interviewPrep: completion.choices[0].message.content,
      message: 'Interview preparation guide generated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Interview preparation generation failed',
      message: error.message 
    });
  }
});

// Generate career advice
router.post('/career-advice', async (req, res) => {
  try {
    const { resumeText, careerGoals, currentChallenges, industry } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const prompt = `
      Provide personalized career advice based on the following information:

      Current Resume/Background:
      ${resumeText}

      ${careerGoals ? `Career Goals: ${careerGoals}` : ''}
      ${currentChallenges ? `Current Challenges: ${currentChallenges}` : ''}
      ${industry ? `Industry: ${industry}` : ''}

      Please provide:
      1. Analysis of current strengths and areas for improvement
      2. Specific recommendations for career advancement
      3. Skill development suggestions
      4. Networking strategies
      5. Industry insights and trends
      6. Actionable next steps
      7. Timeline recommendations

      Format as a comprehensive career development plan.
    `;

    const client = getLLMClient();
    const model = process.env.LLM_MODEL || (process.env.GROK_API_KEY ? 'grok-2-latest' : 'gpt-4');
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert career coach and professional development specialist with deep knowledge across multiple industries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    res.json({ 
      success: true, 
      careerAdvice: completion.choices[0].message.content,
      message: 'Career advice generated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Career advice generation failed',
      message: error.message 
    });
  }
});

module.exports = router;

