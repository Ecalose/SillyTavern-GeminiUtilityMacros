// Imports
import { getContext } from '../../../extensions.js';
import { MacrosParser } from '../../../macros.js';
// No eventSource or global variables needed for this logic anymore

/**
 * Splits text into sentences.
 * Basic implementation, might need refinement for edge cases (e.g., abbreviations).
 * @param {string} text The text to split.
 * @returns {string[]} An array of sentences.
 */
function getSentences(text) {
    if (!text) {
        return [];
    }
    // Match sentences ending with ., !, ?, or newline, handling potential whitespace.
    // This regex attempts to avoid splitting on abbreviations like Mr. or Mrs.
    // It looks for a period/question mark/exclamation mark followed by whitespace and an uppercase letter,
    // or the end of the string, or a newline.
    // (Does this regex also handle elipses and other punctuation?)
    const sentences = text.match(/[^.!?\n]+([.!?](?!\s*[a-z])|\n|$)+/g);
    return sentences ? sentences.map(s => s.trim()).filter(s => s.length > 0) : [];
}

/**
 * Finds the raw text of the last user message, handling swipes.
 * @returns {string} The text of the last user message, or empty string if none found.
 */
function getLastUserMessageText() {
    const context = getContext();
    // Access chat directly like built-in macros often do
    const chat = context?.chat;
    if (!chat) {
        // console.warn("[GeminiUtilityMacros] Chat not available for macro evaluation.");
        return '';
    }

    // Iterate backwards through the chat history
    for (let i = chat.length - 1; i >= 0; i--) {
        const message = chat[i];
        // Ensure message exists and is a user message (not system/scenario etc.)
        if (message && message.isUser && !message.is_system) {
            // Check if there are swipes and get the currently displayed swipe text
            if (message.swipes && message.swipes.length > 0 && message.swipe_id !== undefined && message.swipe_id < message.swipes.length) {
                 // Ensure the swipe text exists before returning
                 return message.swipes[message.swipe_id] || '';
            } else {
                // Return the base message text, ensuring it exists
                return message.mes || '';
            }
            // No need for break, return exits the loop and function
        }
    }
    return ''; // No user message found
}

/**
 * Gets the first sentence from the provided text.
 * @param {string} text
 * @returns {string}
 */
function getFirstSentenceFromText(text) {
    if (!text) return ''; // Handle empty input directly
    const sentences = getSentences(text);
    return sentences.length > 0 ? sentences[0] : '';
}

/**
 * Gets the last sentence from the provided text.
 * @param {string} text
 * @returns {string}
 */
function getLastSentenceFromText(text) {
    if (!text) return ''; // Handle empty input directly
    const sentences = getSentences(text);
    return sentences.length > 0 ? sentences[sentences.length - 1] : '';
}

// --- Initialization ---
console.log("[GeminiUtilityMacros] Initializing...");

// Removed event listener logic as calculation is now on-demand

// --- Macro Registration ---
// Register the macros using the imported parser.
// The value is a function that returns the current state of our global variables.
MacrosParser.registerMacro(
    'firstsentence',
    () => getFirstSentenceFromText(getLastUserMessageText()), // Calculate on demand
    'The first sentence of the last user message.'
);
MacrosParser.registerMacro(
    'lastsentence',
    () => getLastSentenceFromText(getLastUserMessageText()), // Calculate on demand
    'The last sentence of the last user message.'
);
console.log("[GeminiUtilityMacros] Macros registered.");


console.log("[GeminiUtilityMacros] Initialization complete.");