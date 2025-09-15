# AI Resume & Career Builder

A powerful AI-powered application that helps job seekers create professional resumes, cover letters, LinkedIn summaries, and prepare for interviews using advanced artificial intelligence.

## Features

### 🎯 Resume Builder
- **File Upload**: Support for PDF, DOCX, DOC, and TXT files
- **Manual Entry**: Type or paste your resume content directly
- **AI Optimization**: Generate ATS-friendly, professional resumes
- **Job-Specific**: Tailor resumes to specific job descriptions

### 📝 Cover Letter Generator
- **Personalized**: Create compelling, job-specific cover letters
- **Professional Format**: Proper business letter structure
- **Company-Specific**: Include company and position details

### 💼 LinkedIn Summary Generator
- **Industry-Focused**: Optimized for specific industries
- **Experience-Based**: Tailored to experience level
- **Keyword-Rich**: Includes relevant keywords for better visibility

### 🎓 Interview Preparation
- **Comprehensive Q&A**: Behavioral, technical, and situational questions
- **Sample Answers**: STAR method examples
- **Industry-Specific**: Questions relevant to your field
- **Strategy Tips**: Interview best practices and techniques

## Technology Stack

- **Backend**: Express.js with Node.js
- **AI Integration**: OpenAI GPT-4 API
- **File Processing**: PDF parsing, DOCX extraction
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Security**: Helmet.js, CORS, Rate limiting
- **Styling**: Modern CSS with responsive design

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### Resume Routes (`/api/resume`)

- `POST /upload` - Upload and process resume files
- `POST /generate` - Generate optimized resume from text
- `POST /cover-letter` - Generate personalized cover letter

### Career Routes (`/api/career`)

- `POST /linkedin-summary` - Generate LinkedIn summary
- `POST /interview-prep` - Generate interview preparation guide
- `POST /career-advice` - Get personalized career advice

## Usage

### Resume Builder
1. Choose between file upload or manual entry
2. Upload your existing resume or paste content
3. Optionally add a target job description
4. Click "Generate Optimized Resume"
5. Copy or download the result

### Cover Letter Generator
1. Enter your resume content
2. Paste the job description
3. Add company name and position title (optional)
4. Generate your personalized cover letter

### LinkedIn Summary
1. Input your resume content
2. Specify industry and experience level
3. Generate a professional LinkedIn summary

### Interview Preparation
1. Provide resume and job description
2. Add position title and industry
3. Get comprehensive interview prep guide

## File Support

- **PDF**: Extracted using pdf-parse
- **DOCX/DOC**: Processed with mammoth.js
- **TXT**: Direct text processing

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Validation**: Only allowed file types accepted
- **File Size Limits**: 5MB maximum file size
- **Security Headers**: Helmet.js protection
- **CORS**: Cross-origin resource sharing enabled

## Customization

### Styling
- Modify `public/css/styles.css` for custom styling
- Responsive design for all device sizes
- Modern gradient themes and animations

### AI Prompts
- Edit prompt templates in route files
- Customize AI behavior and output format
- Add industry-specific optimizations

## Deployment

### Environment Variables
- `OPENAI_API_KEY`: Required for AI functionality
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

### Production Considerations
- Use a process manager like PM2
- Set up reverse proxy with Nginx
- Enable HTTPS
- Configure proper logging
- Set up monitoring and alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the GitHub issues page
- Review the documentation
- Contact the development team

## Roadmap

- [ ] User authentication and profiles
- [ ] Resume templates and themes
- [ ] PDF generation and formatting
- [ ] Resume analytics and scoring
- [ ] Integration with job boards
- [ ] Mobile app development
- [ ] Advanced AI features
- [ ] Multi-language support

---

**Built with ❤️ for job seekers everywhere**

