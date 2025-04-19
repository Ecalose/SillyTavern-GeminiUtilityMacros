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
    // --- ADDED Log ---
    console.log(`[GeminiUtilityMacros DEBUG] getSentences called with text (first 50 chars): "${text?.substring(0, 50)}..."`);
    if (!text) {
        return [];
    }
    // ... (rest of getSentences function remains the same)
    const sentences = text.match(/(.+?)(?:[.!?](?!\s*[a-z])["')\]]*[*_~]*|\n|$)(?=\s|$)/g);
    const result = sentences
        ? sentences.map(s => s.trim().replace(/^[*_~]+/, '').replace(/[*_~]+$/, '').trim()).filter(s => s.length > 0)
        : [];
    // --- ADDED Log ---
    console.log(`[GeminiUtilityMacros DEBUG] getSentences returning ${result.length} sentences.`);
    return result;
}

/**
 * Removes OOC blocks like [OOC: ...] or (OOC: ...) from text and trims whitespace.
 * @param {string} text The input text.
 * @returns {string} The processed text.
 */
function preprocessMessageText(text) {
    // --- ADDED Log ---
    console.log(`[GeminiUtilityMacros DEBUG] preprocessMessageText called with text (first 50 chars): "${text?.substring(0, 50)}..."`);
    if (!text) return '';

    let processedText = text.trim();

    // ... (rest of preprocessMessageText function remains the same)

    // Final trim to clean up any whitespace left by replacements
    processedText = processedText.trim();
    // --- ADDED Log ---
    console.log(`[GeminiUtilityMacros DEBUG] preprocessMessageText returning text (first 50 chars): "${processedText?.substring(0, 50)}..."`);
    return processedText;
}

/**
 * Finds the raw text of the last user message, handling swipes, and preprocesses it.
 * @returns {string} The preprocessed text of the last user message, or empty string if none found.
 */
function getLastUserMessageText() {
    console.log("[GeminiUtilityMacros] getLastUserMessageText called"); // Log entry
    const context = getContext();
    console.log("[GeminiUtilityMacros] Context:", context ? 'Available' : 'Not Available'); // Log context availability
    if (!context) {
        console.warn("[GeminiUtilityMacros] Context is NULL or undefined in getLastUserMessageText.");
        return ''; // Early exit if context is missing
    }
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
            // --- MODIFIED Log ---
            console.log(`[GeminiUtilityMacros] Raw user text before preprocessing (first 50 chars): "${textToReturn?.substring(0, 50)}..."`);
            const preprocessedText = preprocessMessageText(textToReturn); // Preprocess before returning
            console.log(`[GeminiUtilityMacros] Preprocessed user text length: ${preprocessedText.length}`);
            return preprocessedText;
            // No need for break, return exits the loop and function
        }
    }
    console.log("[GeminiUtilityMacros] No user message found."); // Log if no message found
    return ''; // No user message found
}
function getLastCharMessageText() {
    console.log("[GeminiUtilityMacros] getLastCharMessageText called"); // Log entry
    const context = getContext();
    console.log("[GeminiUtilityMacros] Context:", context ? 'Available' : 'Not Available'); // Log context availability
     if (!context) {
        console.warn("[GeminiUtilityMacros] Context is NULL or undefined in getLastCharMessageText.");
        return ''; // Early exit if context is missing
    }
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
        // Ensure message exists and is a Char message (not system/scenario etc.)
        // --- ADDED Log ---
        console.log(`[GeminiUtilityMacros DEBUG] Checking message at index ${i}: is_user=${message?.is_user}, is_system=${message?.is_system}`);
        if (message && !message.is_user && !message.is_system) { // Find non-user, non-system message
            // --- MODIFIED Log ---
            console.log(`[GeminiUtilityMacros] Found char message at index ${i}`); // Log found message
            let textToReturn = '';
            // Check if there are swipes and get the currently displayed swipe text
            if (message.swipes && message.swipes.length > 0 && message.swipe_id !== undefined && message.swipe_id < message.swipes.length) {
                 // Ensure the swipe text exists before returning
                 textToReturn = message.swipes[message.swipe_id] || '';
                 console.log(`[GeminiUtilityMacros] Using char swipe text (length ${textToReturn.length})`); // Log swipe text found
            } else {
                // Return the base message text, ensuring it exists
                textToReturn = message.mes || '';
                console.log(`[GeminiUtilityMacros] Using char base message text (length ${textToReturn.length})`); // Log base text found
            }
             // --- MODIFIED Log ---
            console.log(`[GeminiUtilityMacros] Raw char text before preprocessing (first 50 chars): "${textToReturn?.substring(0, 50)}..."`);
            const preprocessedText = preprocessMessageText(textToReturn); // Preprocess before returning
            console.log(`[GeminiUtilityMacros] Preprocessed char text length: ${preprocessedText.length}`);
            return preprocessedText;
            // No need for break, return exits the loop and function
        }
    }
    console.log("[GeminiUtilityMacros] No char message found."); // Log if no message found
    return ''; // No char message found
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
    // return sentences.length > 0 ? sentences[0] : ''; // Removed duplicate return
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
    // return sentences.length > 0 ? sentences[sentences.length - 1] : ''; // Removed duplicate return
}

// --- Initialization ---
console.log("[GeminiUtilityMacros] Initializing...");

// Removed event listener logic as calculation is now on-demand

// --- Macro Registration ---
// Register the macros using the imported parser.
// The value is a function that returns the current state of our global variables.

// --- DEBUG: Check if MacrosParser exists ---
if (typeof MacrosParser === 'undefined') {
    console.error("[GeminiUtilityMacros FATAL] MacrosParser is undefined! Macros cannot be registered.");
} else {
    console.log("[GeminiUtilityMacros DEBUG] MacrosParser seems available. Proceeding with registration.");

    MacrosParser.registerMacro(
        'firstsentence',
        () => {
            // --- ADDED Log & Try/Catch ---
            console.log("[GeminiUtilityMacros DEBUG] Callback for 'firstsentence' INVOKED.");
            try {
                const userText = getLastUserMessageText();
                const result = getFirstSentenceFromText(userText);
                console.log(`[GeminiUtilityMacros DEBUG] 'firstsentence' callback returning: "${result}"`);
                return result;
            } catch (error) {
                console.error("[GeminiUtilityMacros ERROR] Error in 'firstsentence' callback:", error);
                return "[Error processing firstsentence]"; // Return an error message instead of failing silently
            }
        },
        'The first sentence of the last user message.'
    );
    // --- ADDED Log ---
    console.log("[GeminiUtilityMacros DEBUG] 'firstsentence' macro registration attempted.");

    MacrosParser.registerMacro(
        'lastcharline',
        () => {
             // --- ADDED Log & Try/Catch ---
            console.log("[GeminiUtilityMacros DEBUG] Callback for 'lastsentence' INVOKED.");
            try {
                const userText = getLastUserMessageText();
                const result = getLastSentenceFromText(userText);
                console.log(`[GeminiUtilityMacros DEBUG] 'lastsentence' callback returning: "${result}"`);
                return result;
            } catch (error) {
                console.error("[GeminiUtilityMacros ERROR] Error in 'lastsentence' callback:", error);
                return "[Error processing lastsentence]";
            }
        },
        'The last sentence of the last user message.'
    );
     // --- ADDED Log ---
    console.log("[GeminiUtilityMacros DEBUG] 'lastsentence' macro registration attempted.");

    MacrosParser.registerMacro(
        'lastcharsentence',
        () => {
            // --- ADDED Log & Try/Catch ---
            console.log("[GeminiUtilityMacros DEBUG] Callback for 'lastcharsentence' INVOKED."); // <<< MOST IMPORTANT LOG
            try {
                const charText = getLastCharMessageText();
                // --- ADDED Log ---
                console.log(`[GeminiUtilityMacros DEBUG] 'lastcharsentence' callback received charText (length ${charText?.length}): "${charText?.substring(0, 100)}..."`);
                const result = getLastSentenceFromText(charText);
                // --- ADDED Log ---
                console.log(`[GeminiUtilityMacros DEBUG] 'lastcharsentence' callback returning final result: "${result}"`);
                return result;
            } catch (error) {
                console.error("[GeminiUtilityMacros ERROR] Error in 'lastcharsentence' callback:", error);
                return "[Error processing lastcharsentence]"; // Return an error message
            }
        },
        'The last sentence of the last char message.'
    );
    // --- ADDED Log ---
    console.log("[GeminiUtilityMacros DEBUG] 'lastcharsentence' macro registration attempted."); // <<< CONFIRM REGISTRATION

    console.log("[GeminiUtilityMacros] Macros registered.");

} // End of check for MacrosParser

console.log("[GeminiUtilityMacros] Initialization complete.");
