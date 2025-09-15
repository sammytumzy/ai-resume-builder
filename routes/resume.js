const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Lazily initialize LLM client (OpenAI, Grok, or Groq via OpenAI-compatible endpoints)
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

// Extract text from uploaded file
async function extractTextFromFile(filePath, fileType) {
  try {
    switch (fileType) {
      case '.pdf':
        const pdfData = await pdfParse(fs.readFileSync(filePath));
        return pdfData.text;
      
      case '.docx':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;
      
      case '.doc':
        const docResult = await mammoth.extractRawText({ path: filePath });
        return docResult.value;
      
      case '.txt':
        return fs.readFileSync(filePath, 'utf8');
      
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Error extracting text: ${error.message}`);
  }
}

// Generate optimized resume
async function generateOptimizedResume(userInput, jobDescription = '') {
  const prompt = `
    You are an expert resume writer and career coach. Please analyze the following resume information and create an optimized, professional resume.

    User's Resume Information:
    ${userInput}

    ${jobDescription ? `Target Job Description: ${jobDescription}` : ''}

    Please create a well-structured resume that includes:
    1. Professional Summary/Objective
    2. Skills section (organized by category)
    3. Work Experience (with quantified achievements)
    4. Education
    5. Certifications (if any)
    6. Additional sections as relevant

    Format the response as a clean, professional resume. Use action verbs, quantify achievements where possible, and ensure ATS compatibility.
    Keep each line under 80 characters for better readability.
  `;

  try {
    const client = getLLMClient();
    const model = process.env.LLM_MODEL || (process.env.GROK_API_KEY ? 'grok-2-latest' : 'gpt-4');
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer and career coach with 15+ years of experience helping professionals land their dream jobs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error generating resume: ${error.message}`);
  }
}

// Upload and process resume file
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    
    const extractedText = await extractTextFromFile(filePath, fileType);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({ 
      success: true, 
      extractedText: extractedText,
      message: 'File processed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'File processing failed',
      message: error.message 
    });
  }
});

// Generate resume from text input
router.post('/generate', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const optimizedResume = await generateOptimizedResume(resumeText, jobDescription);
    
    res.json({ 
      success: true, 
      optimizedResume: optimizedResume,
      message: 'Resume generated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Resume generation failed',
      message: error.message 
    });
  }
});

// Generate cover letter
router.post('/cover-letter', async (req, res) => {
  try {
    const { resumeText, jobDescription, companyName, positionTitle } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ 
        error: 'Resume text and job description are required' 
      });
    }

    const prompt = `
      Create a compelling, personalized cover letter based on the following information:

      Resume Information:
      ${resumeText}

      Job Description:
      ${jobDescription}

      ${companyName ? `Company: ${companyName}` : ''}
      ${positionTitle ? `Position: ${positionTitle}` : ''}

      The cover letter should:
      1. Be professional and engaging
      2. Highlight relevant experience and skills
      3. Show enthusiasm for the role
      4. Be 3-4 paragraphs long
      5. Include specific examples from the resume
      6. Be tailored to the job requirements

      Format as a proper business letter with appropriate greeting and closing.
    `;

    const client = getLLMClient();
    const model = process.env.LLM_MODEL || (process.env.GROK_API_KEY ? 'grok-2-latest' : 'gpt-4');
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are an expert career coach and professional writer specializing in cover letters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    res.json({ 
      success: true, 
      coverLetter: completion.choices[0].message.content,
      message: 'Cover letter generated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Cover letter generation failed',
      message: error.message 
    });
  }
});

module.exports = router;

