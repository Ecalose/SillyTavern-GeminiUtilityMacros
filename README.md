# SillyTavern Gemini Utility Macros

This SillyTavern UI Extension provides two simple macros derived from the user's most recent message.

## Features

*   **`{{firstsentence}}`**: Replaced with the first sentence of the last message sent by the user.
*   **`{{lastsentence}}`**: Replaced with the last sentence of the last message sent by the user.

## How it Works

The extension listens for chat updates, identifies the last user message (including the currently selected swipe), and extracts the first and last sentences. It then registers these as macros using SillyTavern's built-in `MacrosParser`.

Leading and trailing markdown characters (`*`, `_`, `~`) are automatically trimmed from the extracted sentences for cleaner output.

## Installation

1.  Paste this link into the Extension panel's Install extension popup field (link goes here)

## Usage

Simply include `{{firstsentence}}` or `{{lastsentence}}` in any text field where SillyTavern processes macros (e.g., Character Note, Author's Note, Persona Description, prompt templates). The extension will automatically replace them with the corresponding sentence during text generation.