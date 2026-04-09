// storyGenerator.js

function generateStoryAI(data) {
    // 🔹 Clean all messages first
    const cleanedData = {
        feature: (data.feature || []).map(cleanMessage),
        bugfix: (data.bugfix || []).map(cleanMessage),
        refactor: (data.refactor || []).map(cleanMessage),
        others: (data.others || []).map(cleanMessage)
    };

    const story = buildStory(cleanedData);
    const insights = generateInsights(cleanedData);
    const releaseNotes = generateReleaseNotes(cleanedData);
    const projectType = detectProjectType(cleanedData);

    return {
        story,
        summary: insights.summary,
        impact: insights.impact,
        projectType,
        releaseNotes
    };
}

//
// 🧠 1. CLEAN MESSAGE (VERY IMPORTANT)
//
function cleanMessage(msg) {
    return msg
        .replace(/\(.*?\)/g, "")       // remove (#123)
        .replace(/\[.*?\]/g, "")       // remove [tags]
        .replace(/feat:|fix:|docs:|chore:/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

//
// ✨ 2. STORY GENERATION (SMART + CLEAN)
//
function buildStory(data) {
    let parts = [];

    if (data.feature.length > 0) {
        parts.push("implemented new features and enhancements");
    }

    if (data.bugfix.length > 0) {
        parts.push("resolved multiple bugs and stability issues");
    }

    if (data.refactor.length > 0) {
        parts.push("refactored code to improve maintainability and performance");
    }

    if (data.others.length > 0) {
        parts.push("performed additional optimizations and updates");
    }

    if (parts.length === 0) {
        return "No significant development activity detected.";
    }

    let story = parts.join(", and ") + ".";
    return story.charAt(0).toUpperCase() + story.slice(1);
}

//
// ⚡ 3. SUMMARY + IMPACT
//
function generateInsights(data) {
    let summary = "A software project involving feature development, bug fixes, and performance improvements.";
    let impact = "Improved system reliability, reduced bugs, and enhanced overall performance.";

    if (data.feature.length > 0) {
        summary = "A project focused on enhancing functionality and developer experience.";
    }

    if (data.bugfix.length > 0) {
        impact = "Significantly improved stability and reduced critical issues.";
    }

    return { summary, impact };
}

//
// 📄 4. RELEASE NOTES (CLEAN + LIMITED)
//
function generateReleaseNotes(data) {
    return {
        features: limitList(data.feature),
        fixes: limitList(data.bugfix),
        improvements: limitList([...data.refactor, ...data.others])
    };
}

//
// 🧩 5. PROJECT TYPE DETECTOR
//
function detectProjectType(data) {
    const text = [
        ...data.feature,
        ...data.bugfix
    ].join(" ").toLowerCase();

    if (text.includes("react") || text.includes("ui") || text.includes("component")) {
        return "Frontend Framework / Developer Tooling";
    } else if (text.includes("api") || text.includes("server")) {
        return "Backend/API Project";
    } else if (text.includes("model") || text.includes("train")) {
        return "AI/ML Project";
    } else {
        return "Software Application";
    }
}

//
// 🔧 6. LIMIT OUTPUT (VERY IMPORTANT FOR DEMO)
//
function limitList(arr) {
    return arr.slice(0, 12);
}

module.exports = generateStoryAI;