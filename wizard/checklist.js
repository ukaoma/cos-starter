// Browser copy of the email service’s lib/setup-checklist.ts. Keep its choice and link format in sync.
window.makeWizardChecklist = (function () {
const models = { opus: "Opus", fable: "Fable", sonnet: "Sonnet", "codex-frontier": "GPT Frontier", "codex-balanced": "GPT Balanced" };
const contexts = { calendar: "Calendar", email: "Email", slack: "Slack", meetingtools: "Meeting tools", vector: "Memory and Threads", mcp: "Custom MCPs" };
const contextChecks = {
    calendar: "Ask for the time and title of your next calendar event.",
    email: "Ask for the subject of the most recent email from a sender you know.",
    slack: "Ask for the latest message in a Slack channel you can read.",
    meetingtools: "Ask for the title of a recent meeting from your notes provider.",
    mcp: "Ask your AI to read one item from your custom MCP.",
};
const useCases = {
    meetings: ["Meetings", "Ask me to paste my last meeting notes, then help me prepare for the next meeting. What decision do we need, what is still open, and what should I ask first?"],
    capture: ["Quick capture", "Turn this rough note into one next action. Keep the original wording and flag any missing owner or due date."],
    assistant: ["Daily briefing", "Build my morning brief from the context you can read. List today’s commitments, what needs a decision, and who is waiting on me."],
    comms: ["Communications", "Use the thread below to draft a short reply. Put the decision first and end with the next step. Leave it as a draft."],
    dev: ["Development", "Read the project README and summarize how to run it locally. Flag one check I should run before changing code."],
    field: ["Field work", "Turn this field note into a handoff. Separate what I observed, what needs follow-up, and who should see it."],
};
const memory = {
    "files-new": "In Control, choose Create Folders. Add a Markdown note to the new memory folder and look for its heading in Memories.",
    "files-existing": "In Control, set Notes folder to the parent of your memory and threads folders. Open Memories and check for a note you recognize.",
    bridge: "Set Notes folder to your COS workspace or its operations/scripts folder. Wait for Control to validate the bridge, then open Memories and try a search.",
    none: "",
};
function keyOf(table, value) {
    return typeof value === "string" && Object.hasOwn(table, value);
}
function keysOf(table, values) {
    if (!Array.isArray(values) || values.length > Object.keys(table).length ||
        !values.every(v => keyOf(table, v)))
        throw new Error("Invalid wizard choices");
    return [...new Set(values)];
}
function makeChecklist(input) {
    const { model, memoryMode, voice, tier } = input;
    if (!keyOf(models, model) || !keyOf(memory, memoryMode) ||
        (voice !== "openai" && voice !== "local") || (tier !== "balanced" && tier !== "max"))
        throw new Error("Invalid wizard choices");
    const selected = keysOf(useCases, input.useCases);
    const sources = keysOf(contexts, input.context).filter(key => key !== "vector");
    const provider = model.startsWith("codex-") ? "Codex" : "Claude Code";
    const steps = [
        { title: "Install COS Control", body: "On an Apple silicon Mac running macOS 14 or later, download Control, unzip it, and move it to Applications." },
        { title: "Connect " + provider, body: "Open Control and choose Get started. Sign in to " + provider + " on your Mac, then choose Check again in Control. Set Default chat model to " + models[model] + "." },
    ];
    if (memory[memoryMode])
        steps.push({ title: "Set up memory", body: memory[memoryMode] });
    if (sources.length)
        steps.push({ title: "Connect your context", body: "Connect " + sources.map(key => contexts[key]).join(" and ") + " in the workspace your COS server uses. " + contextChecks[sources[0]] });
    steps.push({ title: "Set up voice when you need it", body: voice === "openai"
            ? "For OpenAI transcription fallback, enable COS_OPENAI_WHISPER_FALLBACK=1 and configure your own OPENAI_API_KEY on the Mac. Keep the key on your machine."
            : "In Control settings, search for Voice setup. Set Quality tier to " + (tier === "max" ? "Max" : "Balanced") + ", choose Set up and test voice, and dictate one sentence." });
    const tasks = selected.map(key => ({ label: useCases[key][0], prompt: useCases[key][1] }));
    if (!tasks.length)
        tasks.push({ label: "First session", prompt: "Help me plan my first week with COS. Ask me what I do and which recurring task I want to simplify first." });
    // Only enum choices go in a handoff link. Visitors enter their identity on their own Mac.
    const params = new URLSearchParams({ model, memory: memoryMode, voice, tier });
    for (const key of selected)
        params.append("use", key);
    for (const key of keysOf(contexts, input.context))
        params.append("source", key);
    const resumeUrl = "https://www.gotcos.com/wizard/#setup=" + params.toString();
    return { model: models[model], steps, tasks, resumeUrl };
}
  return makeChecklist;
})();
