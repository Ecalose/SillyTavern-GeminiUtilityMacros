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
    const sentences = text.match(/[^.!?\n]+([.!?](?!\s*[a-z])|\n|$)+/g);
    // Trim common markdown characters (*, _, ~) from the start and end of each sentence after splitting
    return sentences
        ? sentences.map(s => s.trim().replace(/^[*_~]+/, '').replace(/[*_~]+$/, '').trim()).filter(s => s.length > 0)
        : [];
}

/**
 * Removes OOC blocks like [OOC: ...] or (OOC: ...) from text and trims whitespace.
 * @param {string} text The input text.
 * @returns {string} The processed text.
 */
function preprocessMessageText(text) {
    if (!text) return '';

    let processedText = text.trim();

    // --- Handle Edge Cases (Incomplete brackets at absolute start/end) ---

    // Case 1: First line ends with OOC:] or OOC:) but no opener on that line
    const firstNewlineIndex = processedText.indexOf('\n');
    const firstLine = firstNewlineIndex === -1 ? processedText : processedText.substring(0, firstNewlineIndex);

    // Check if the first line contains the pattern AND lacks an opening bracket
    if (/\s*OOC\s*:.*?[\)\]]\s*$/i.test(firstLine) && !/[\[\(]/.test(firstLine)) {
        // If it's the only line, clear it. Otherwise, remove the first line.
        processedText = firstNewlineIndex === -1 ? '' : processedText.substring(firstNewlineIndex + 1);
        processedText = processedText.trim(); // Re-trim after removal
    }

    // Case 2: Last line starts with [OOC: or (OOC: but no closer on that line
    // Need to re-check processedText in case the start was removed
    if (processedText) {
        const lastNewlineIndex = processedText.lastIndexOf('\n');
        const lastLine = lastNewlineIndex === -1 ? processedText : processedText.substring(lastNewlineIndex + 1);

        // Check if the last line contains the pattern AND lacks a closing bracket
        if (/^\s*[\(\[]\s*OOC\s*:/i.test(lastLine) && !/[\)\]]/.test(lastLine)) {
             // If it's the only line, clear it. Otherwise, remove the last line.
            processedText = lastNewlineIndex === -1 ? '' : processedText.substring(0, lastNewlineIndex);
            processedText = processedText.trim(); // Re-trim after removal
        }
    }

    // --- Handle Well-Formed Blocks (on their own lines) ---
    // Use the stricter regex now on the potentially modified text
    const strictOocRegex = /^\s*[\(\[]\s*OOC\s*:\s*.*?[\)\]]\s*$/gim;
    processedText = processedText.replace(strictOocRegex, '');

    // Final trim to clean up any whitespace left by replacements
    return processedText.trim();
}

/**
 * Finds the raw text of the last user message, handling swipes, and preprocesses it.
 * @returns {string} The preprocessed text of the last user message, or empty string if none found.
 */
function getLastUserMessageText() {
    console.log("[GeminiUtilityMacros] getLastUserMessageText called"); // Log entry
    const context = getContext();
    console.log("[GeminiUtilityMacros] Context:", context ? 'Available' : 'Not Available'); // Log context availability
    // Access chat directly like built-in macros often do
    const chat = context?.chat;
    console.log("[GeminiUtilityMacros] Chat:", chat ? `Length ${chat.length}` : 'Not available'); // Log chat status
    if (!chat) {
        // console.warn("[GeminiUtilityMacros] Chat not available for macro evaluation.");
        return '';
    }

    // Iterate backwards through the chat history
    for (let i = chat.length - 1; i >= 0; i--) {
        const message = chat[i];
        // Ensure message exists and is a user message (not system/scenario etc.)
        if (message && message.is_user && !message.is_system) { // Changed isUser to is_user
            console.log(`[GeminiUtilityMacros] Found user message at index ${i}`); // Log found message
            let textToReturn = '';
            // Check if there are swipes and get the currently displayed swipe text
            if (message.swipes && message.swipes.length > 0 && message.swipe_id !== undefined && message.swipe_id < message.swipes.length) {
                 // Ensure the swipe text exists before returning
                 textToReturn = message.swipes[message.swipe_id] || '';
                 console.log(`[GeminiUtilityMacros] Using swipe text (length ${textToReturn.length})`); // Log swipe text found
            } else {
                // Return the base message text, ensuring it exists
                textToReturn = message.mes || '';
                console.log(`[GeminiUtilityMacros] Using base message text (length ${textToReturn.length})`); // Log base text found
            }
            const preprocessedText = preprocessMessageText(textToReturn); // Preprocess before returning
            console.log(`[GeminiUtilityMacros] Preprocessed text length: ${preprocessedText.length}`);
            return preprocessedText;
            // No need for break, return exits the loop and function
        }
    }
    console.log("[GeminiUtilityMacros] No user message found."); // Log if no message found
    return ''; // No user message found
}

/**
 * Gets the first sentence from the provided text.
 * @param {string} text
 * @returns {string}
 */
function getFirstSentenceFromText(text) {
    console.log(`[GeminiUtilityMacros] getFirstSentenceFromText called with text length: ${text?.length || 0}`); // Log input text length
    if (!text) return ''; // Handle empty input directly
    const sentences = getSentences(text);
    const result = sentences.length > 0 ? sentences[0] : '';
    console.log(`[GeminiUtilityMacros] First sentence result (length ${result.length})`); // Log result length
    return result;
    return sentences.length > 0 ? sentences[0] : '';
}

/**
 * Gets the last sentence from the provided text.
 * @param {string} text
 * @returns {string}
 */
function getLastSentenceFromText(text) {
    console.log(`[GeminiUtilityMacros] getLastSentenceFromText called with text length: ${text?.length || 0}`); // Log input text length
    if (!text) return ''; // Handle empty input directly
    const sentences = getSentences(text);
    const result = sentences.length > 0 ? sentences[sentences.length - 1] : '';
    console.log(`[GeminiUtilityMacros] Last sentence result (length ${result.length})`); // Log result length
    return result;
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