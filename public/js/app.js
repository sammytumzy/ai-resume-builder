// Global state
let currentResumeText = '';
let currentJobDescription = '';

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const navLinksContainer = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const fileInput = document.getElementById('resumeFile');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const loadingModal = document.getElementById('loadingModal');
const successToast = document.getElementById('successToast');
const errorToast = document.getElementById('errorToast');
let errorToastTimeoutId = null;

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Scroll to section
        document.getElementById(targetId).scrollIntoView({
            behavior: 'smooth'
        });
        // Close mobile menu on navigation
        if (navLinksContainer) navLinksContainer.classList.remove('show');
    });
});

// Mobile nav toggle
if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
    });
}

// Tab switching
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
    });
});

// File upload handling
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayFileInfo(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        fileInput.files = e.dataTransfer.files;
        displayFileInfo(file);
    }
}

function displayFileInfo(file) {
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    
    document.querySelector('.file-name').textContent = fileName;
    document.querySelector('.file-size').textContent = fileSize;
    
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Process file
document.getElementById('processFile').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    const file = fileInput.files[0];
    if (!file) return;
    
    showLoading();
    setButtonLoading(button, true);
    
    try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/api/resume/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentResumeText = data.extractedText;
            document.getElementById('resumeText').value = data.extractedText;
            
            // Switch to manual tab to show the extracted text
            document.querySelector('[data-tab="manual"]').click();
            
            showSuccess('File processed successfully!');
        } else {
            showError(data.message || 'File processing failed');
        }
    } catch (error) {
        showError('Error processing file: ' + error.message);
    } finally {
        hideLoading();
        setButtonLoading(button, false);
    }
});

// Generate resume
document.getElementById('generateResume').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    const resumeText = document.getElementById('resumeText').value;
    const jobDescription = document.getElementById('jobDescription').value;
    
    if (!resumeText.trim()) {
        showError('Please enter your resume content');
        return;
    }
    
    showLoading();
    setButtonLoading(button, true);
    
    try {
        const response = await fetch('/api/resume/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: resumeText,
                jobDescription: jobDescription
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderMarkdownToHtml('resumeOutput', data.optimizedResume);
            showSuccess('Resume generated successfully!');
        } else {
            showError(data.message || 'Resume generation failed');
        }
    } catch (error) {
        showError('Error generating resume: ' + error.message);
    } finally {
        hideLoading();
        setButtonLoading(button, false);
    }
});

// Generate cover letter
document.getElementById('generateCoverLetter').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    const resumeText = document.getElementById('clResumeText').value;
    const jobDescription = document.getElementById('clJobDescription').value;
    const companyName = document.getElementById('companyName').value;
    const positionTitle = document.getElementById('positionTitle').value;
    
    if (!resumeText.trim() || !jobDescription.trim()) {
        showError('Please enter both resume content and job description');
        return;
    }
    
    showLoading();
    setButtonLoading(button, true);
    
    try {
        const response = await fetch('/api/resume/cover-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: resumeText,
                jobDescription: jobDescription,
                companyName: companyName,
                positionTitle: positionTitle
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderMarkdownToHtml('coverLetterOutput', data.coverLetter);
            showSuccess('Cover letter generated successfully!');
        } else {
            showError(data.message || 'Cover letter generation failed');
        }
    } catch (error) {
        showError('Error generating cover letter: ' + error.message);
    } finally {
        hideLoading();
        setButtonLoading(button, false);
    }
});

// Generate LinkedIn summary
document.getElementById('generateLinkedIn').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    const resumeText = document.getElementById('liResumeText').value;
    const industry = document.getElementById('industry').value;
    const experienceLevel = document.getElementById('experienceLevel').value;
    
    if (!resumeText.trim()) {
        showError('Please enter your resume content');
        return;
    }
    
    showLoading();
    setButtonLoading(button, true);
    
    try {
        const response = await fetch('/api/career/linkedin-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: resumeText,
                industry: industry,
                experienceLevel: experienceLevel
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderMarkdownToHtml('linkedinOutput', data.linkedinSummary);
            showSuccess('LinkedIn summary generated successfully!');
        } else {
            showError(data.message || 'LinkedIn summary generation failed');
        }
    } catch (error) {
        showError('Error generating LinkedIn summary: ' + error.message);
    } finally {
        hideLoading();
        setButtonLoading(button, false);
    }
});

// Generate interview prep
document.getElementById('generateInterviewPrep').addEventListener('click', async (e) => {
    const button = e.currentTarget;
    const resumeText = document.getElementById('intResumeText').value;
    const jobDescription = document.getElementById('intJobDescription').value;
    const positionTitle = document.getElementById('intPositionTitle').value;
    const industry = document.getElementById('intIndustry').value;
    
    if (!resumeText.trim()) {
        showError('Please enter your resume content');
        return;
    }
    
    showLoading();
    setButtonLoading(button, true);
    
    try {
        const response = await fetch('/api/career/interview-prep', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: resumeText,
                jobDescription: jobDescription,
                positionTitle: positionTitle,
                industry: industry
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderMarkdownToHtml('interviewPrepOutput', data.interviewPrep);
            showSuccess('Interview prep generated successfully!');
        } else {
            showError(data.message || 'Interview prep generation failed');
        }
    } catch (error) {
        showError('Error generating interview prep: ' + error.message);
    } finally {
        hideLoading();
        setButtonLoading(button, false);
    }
});

// Copy functions
document.getElementById('copyResume').addEventListener('click', () => {
    copyToClipboard('resumeOutput', 'Resume copied to clipboard!');
});

document.getElementById('copyCoverLetter').addEventListener('click', () => {
    copyToClipboard('coverLetterOutput', 'Cover letter copied to clipboard!');
});

document.getElementById('copyLinkedIn').addEventListener('click', () => {
    copyToClipboard('linkedinOutput', 'LinkedIn summary copied to clipboard!');
});

document.getElementById('copyInterviewPrep').addEventListener('click', () => {
    copyToClipboard('interviewPrepOutput', 'Interview prep copied to clipboard!');
});

function copyToClipboard(elementId, successMessage) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    if (text.includes('will appear here') || text.includes('placeholder')) {
        showError('No content to copy');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showSuccess(successMessage);
    }).catch(() => {
        showError('Failed to copy to clipboard');
    });
}

// Download functions
document.getElementById('downloadResume').addEventListener('click', () => {
    downloadContent('resumeOutput', 'resume.txt', 'Resume downloaded!');
});

document.getElementById('downloadCoverLetter').addEventListener('click', () => {
    downloadContent('coverLetterOutput', 'cover-letter.txt', 'Cover letter downloaded!');
});

function downloadContent(elementId, filename, successMessage) {
    const element = document.getElementById(elementId);
    const hasPlaceholder = element.querySelector('.placeholder');
    if (hasPlaceholder) {
        showError('No content to download');
        return;
    }
    // Export as Word .doc by wrapping HTML with minimal Word-compatible markup
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${element.innerHTML}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.txt$/i, '.doc').replace(/\.docx$/i, '.doc');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showSuccess(successMessage.replace('downloaded!', 'downloaded as .doc!'));
}

// Utility functions
function showLoading() {
    loadingModal.classList.add('show');
}

function hideLoading() {
    loadingModal.classList.remove('show');
}

function showSuccess(message) {
    successToast.querySelector('span').textContent = message;
    successToast.classList.add('show');
    setTimeout(() => {
        successToast.classList.remove('show');
    }, 3000);
}

function showError(message) {
    errorToast.querySelector('span').textContent = message;
    errorToast.classList.add('show');
    if (errorToastTimeoutId) {
        clearTimeout(errorToastTimeoutId);
    }
    errorToastTimeoutId = setTimeout(() => {
        errorToast.classList.remove('show');
        errorToastTimeoutId = null;
    }, 5000);
}

// Allow user to dismiss error toast immediately on click
if (errorToast) {
    errorToast.addEventListener('click', () => {
        errorToast.classList.remove('show');
        if (errorToastTimeoutId) {
            clearTimeout(errorToastTimeoutId);
            errorToastTimeoutId = null;
        }
    });
}

// Button loading helper
function setButtonLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="spinner"></span> Processing...';
        button.disabled = true;
    } else {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
        button.disabled = false;
    }
}

// Auto-sync resume text across sections
document.getElementById('resumeText').addEventListener('input', (e) => {
    currentResumeText = e.target.value;
    // Sync with other resume text areas
    document.getElementById('clResumeText').value = currentResumeText;
    document.getElementById('liResumeText').value = currentResumeText;
    document.getElementById('intResumeText').value = currentResumeText;
});

// Sync job description
document.getElementById('jobDescription').addEventListener('input', (e) => {
    currentJobDescription = e.target.value;
    document.getElementById('clJobDescription').value = currentJobDescription;
    document.getElementById('intJobDescription').value = currentJobDescription;
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Resume Builder initialized');
});

// Minimal markdown renderer for bold, headings, bullets, and line breaks
function renderMarkdownToHtml(targetId, md) {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (!md || !md.trim()) {
        el.innerHTML = '<p class="placeholder">No content</p>';
        return;
    }
    let html = md
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // basic markdown: bold **text** and __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
               .replace(/__(.+?)__/g, '<strong>$1</strong>');
    // headings like ###, ##, # at line start
    html = html.replace(/^(######)\s*(.+)$/gm, '<h6>$2</h6>')
               .replace(/^(#####)\s*(.+)$/gm, '<h5>$2</h5>')
               .replace(/^(####)\s*(.+)$/gm, '<h4>$2</h4>')
               .replace(/^(###)\s*(.+)$/gm, '<h3>$2</h3>')
               .replace(/^(##)\s*(.+)$/gm, '<h2>$2</h2>')
               .replace(/^(#)\s*(.+)$/gm, '<h1>$2</h1>');
    // bullet lists: lines starting with - or *
    html = html.replace(/^(?:\s*[-*]\s.+(?:\n|$))+?/gm, (block) => {
        const items = block.trim().split(/\n/).map(l => l.replace(/^\s*[-*]\s*/, '').trim());
        return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
    });
    // numbered lists: 1. 2. etc
    html = html.replace(/^(?:\s*\d+\.\s.+(?:\n|$))+?/gm, (block) => {
        const items = block.trim().split(/\n/).map(l => l.replace(/^\s*\d+\.\s*/, '').trim());
        return '<ol>' + items.map(i => `<li>${i}</li>`).join('') + '</ol>';
    });
    // line breaks for remaining newlines
    html = html.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
    el.innerHTML = `<p>${html}</p>`;
}

