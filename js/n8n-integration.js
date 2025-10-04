/**
 * N8N Integration for Cindie Language Learning Platform
 * Handles quiz results → AI lesson generation → dynamic display
 */

class N8NIntegration {
  constructor() {
    this.webhookUrl = 'https://cindie-ai109.app.n8n.cloud/webhook/generate-ai-lesson';
    this.userId = this.getUserId();
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Get or generate user ID for tracking
   */
  getUserId() {
    let userId = localStorage.getItem('cindie_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cindie_user_id', userId);
    }
    return userId;
  }

  /**
   * Send quiz results to n8n and get AI-generated lesson
   */
  async generateLesson(quizResults) {
    const userData = {
      userId: this.userId,
      placementScore: this.calculateOverallScore(quizResults),
      skillScores: {
        grammar: {
          correct: quizResults.sectionScores.grammar || 0,
          attempted: quizResults.sectionMax.grammar || 0,
          accuracy: this.calculateAccuracy(quizResults.sectionScores.grammar, quizResults.sectionMax.grammar),
          finalLevel: quizResults.difficultyBySkill.grammar || 2
        },
        reading: {
          correct: quizResults.sectionScores.reading || 0,
          attempted: quizResults.sectionMax.reading || 0,
          accuracy: this.calculateAccuracy(quizResults.sectionScores.reading, quizResults.sectionMax.reading),
          finalLevel: quizResults.difficultyBySkill.reading || 2
        },
        listening: {
          correct: quizResults.sectionScores.listening || 0,
          attempted: quizResults.sectionMax.listening || 0,
          accuracy: this.calculateAccuracy(quizResults.sectionScores.listening, quizResults.sectionMax.listening),
          finalLevel: quizResults.difficultyBySkill.listening || 2
        }
      },
      totalTime: quizResults.durationMs || 0,
      completionDate: new Date().toISOString(),
      strengths: this.identifyStrengths(quizResults.sectionScores),
      weaknesses: this.identifyWeaknesses(quizResults.sectionScores)
    };

    console.log('Sending to n8n:', userData);

    try {
      const response = await this.fetchWithRetry(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const lesson = await response.json();
      console.log('Received lesson from n8n:', lesson);
      
      // Store the lesson for the course page
      localStorage.setItem('cindie_ai_lesson', JSON.stringify(lesson));
      
      return lesson;
    } catch (error) {
      console.error('N8N integration failed:', error);
      return this.generateFallbackLesson(userData);
    }
  }

  /**
   * Fetch with retry logic
   */
  async fetchWithRetry(url, options, attempt = 1) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate overall score percentage
   */
  calculateOverallScore(quizResults) {
    const total = quizResults.total || 0;
    const max = quizResults.max || 1;
    return Math.round((total / max) * 100);
  }

  /**
   * Calculate accuracy percentage
   */
  calculateAccuracy(correct, attempted) {
    if (attempted === 0) return 0;
    return Math.round((correct / attempted) * 100);
  }

  /**
   * Identify user strengths (top 2 skills)
   */
  identifyStrengths(sectionScores) {
    return Object.entries(sectionScores)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, 2)
      .map(([skill]) => skill);
  }

  /**
   * Identify user weaknesses (bottom skills)
   */
  identifyWeaknesses(sectionScores) {
    return Object.entries(sectionScores)
      .sort((a, b) => (a[1] || 0) - (b[1] || 0))
      .slice(0, 2)
      .map(([skill]) => skill);
  }

  /**
   * Generate fallback lesson when n8n fails
   */
  generateFallbackLesson(userData) {
    const level = this.determineLevel(userData.placementScore);
    const focusSkill = userData.weaknesses[0] || 'grammar';
    
    const fallbackLesson = {
      title: `${focusSkill.charAt(0).toUpperCase() + focusSkill.slice(1)} Practice - Level ${level}`,
      level: level,
      focusSkill: focusSkill,
      modules: [
        {
          id: 'fallback_1',
          title: `Basic ${focusSkill} Concepts`,
          description: `Practice fundamental ${focusSkill} concepts at your level`,
          activities: [
            {
              type: 'exercise',
              title: 'Practice Exercise 1',
              content: `Work on your ${focusSkill} skills with guided exercises`
            }
          ]
        },
        {
          id: 'fallback_2',
          title: `Applied ${focusSkill}`,
          description: `Apply your ${focusSkill} knowledge in real contexts`,
          activities: [
            {
              type: 'exercise',
              title: 'Practice Exercise 2',
              content: `Advanced ${focusSkill} practice`
            }
          ]
        }
      ],
      estimatedTime: '15-20 minutes',
      isFallback: true,
      error: 'N8N service unavailable, showing fallback content'
    };

    localStorage.setItem('cindie_ai_lesson', JSON.stringify(fallbackLesson));
    return fallbackLesson;
  }

  /**
   * Determine level based on score
   */
  determineLevel(score) {
    if (score >= 90) return 'C1';
    if (score >= 80) return 'B2';
    if (score >= 70) return 'B1';
    if (score >= 60) return 'A2';
    return 'A1';
  }

  /**
   * Display lesson on course page
   */
  displayLesson(lesson) {
    const summaryEl = document.getElementById('summary');
    const modulesEl = document.getElementById('modules');
    const activityEl = document.getElementById('activity');

    if (!summaryEl || !modulesEl) {
      console.error('Course page elements not found');
      return;
    }

    // Display summary
    summaryEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0; color: var(--accent);">${lesson.title}</h2>
        ${lesson.isFallback ? '<span style="color: var(--muted); font-size: 12px;">⚠️ Offline Mode</span>' : '<span style="color: var(--accent); font-size: 12px;">🤖 AI Generated</span>'}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div>
          <strong>Level:</strong> ${lesson.level}
        </div>
        <div>
          <strong>Focus:</strong> ${lesson.focusSkill}
        </div>
        <div>
          <strong>Time:</strong> ${lesson.estimatedTime}
        </div>
        ${lesson.isFallback ? '<div><strong>Note:</strong> Using fallback content</div>' : ''}
      </div>
      ${lesson.error ? `<div style="color: var(--muted); font-size: 12px; margin-top: 8px;">${lesson.error}</div>` : ''}
    `;

    // Display modules
    modulesEl.innerHTML = lesson.modules.map(module => `
      <div class="mod" data-module-id="${module.id}" style="cursor: pointer;">
        <h3 style="margin: 0 0 8px 0; color: var(--text);">${module.title}</h3>
        <p style="margin: 0; color: var(--muted); font-size: 14px;">${module.description}</p>
        <div style="margin-top: 8px;">
          ${module.activities.map(activity => `
            <span class="activity">${activity.type}</span>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Add click handlers to modules
    modulesEl.querySelectorAll('.mod').forEach(mod => {
      mod.addEventListener('click', () => {
        const moduleId = mod.dataset.moduleId;
        const module = lesson.modules.find(m => m.id === moduleId);
        if (module) {
          this.showModuleActivity(module, activityEl);
        }
      });
    });

    // Track lesson display
    this.trackLessonDisplay(lesson);
  }

  /**
   * Show module activity details
   */
  showModuleActivity(module, activityEl) {
    if (!activityEl) return;

    activityEl.style.display = 'block';
    activityEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0;">${module.title}</h3>
        <button class="btn ghost" onclick="this.parentElement.parentElement.style.display='none'">Close</button>
      </div>
      <p style="margin: 0 0 16px 0; color: var(--muted);">${module.description}</p>
      <div>
        ${module.activities.map(activity => `
          <div style="border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <h4 style="margin: 0 0 8px 0;">${activity.title}</h4>
            <p style="margin: 0; color: var(--text);">${activity.content}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Track lesson display for analytics
   */
  trackLessonDisplay(lesson) {
    try {
      // Send to analytics if available
      if (window.gtag) {
        window.gtag('event', 'lesson_generated', {
          'lesson_level': lesson.level,
          'focus_skill': lesson.focusSkill,
          'is_ai_generated': !lesson.isFallback,
          'user_id': this.userId
        });
      }
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }

  /**
   * Load and display stored lesson
   */
  loadStoredLesson() {
    try {
      const stored = localStorage.getItem('cindie_ai_lesson');
      if (stored) {
        const lesson = JSON.parse(stored);
        this.displayLesson(lesson);
        return lesson;
      }
    } catch (error) {
      console.error('Failed to load stored lesson:', error);
    }
    return null;
  }

  /**
   * Clear stored lesson (for retakes)
   */
  clearStoredLesson() {
    localStorage.removeItem('cindie_ai_lesson');
  }
}

// Global instance
window.n8nIntegration = new N8NIntegration();

// Auto-load lesson on course page
if (window.location.pathname.includes('course.html') || window.location.pathname.includes('course')) {
  document.addEventListener('DOMContentLoaded', () => {
    window.n8nIntegration.loadStoredLesson();
  });
}
