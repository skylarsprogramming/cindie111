/**
 * N8N Webhook Configuration Example
 * Copy this file to webhookToCursor.js and add your real webhook URL
 */
async function getLesson(userData) {
    const response = await fetch('https://your-n8n-instance.app.n8n.cloud/webhook/generate-ai-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const lesson = await response.json();
    return lesson; // this is your AI lesson
}

// Example usage:
const lesson = await getLesson({ userId: '123', placementScore: 85 });
console.log(lesson);
