# Commit Message Generator Extension for VS Code

Welcome to the Commit Message Generator extension! This extension helps you generate AI-powered commit messages based on the changes in your staged files using OpenAI's GPT-3.5 model.

## Features

- Automatically generates commit messages using AI.
- Integrates seamlessly with VS Code's Git interface.
- Requires an OpenAI API key for operation.

## Installation

1. Ensure you have an OpenAI API key. If not, obtain one from [OpenAI](https://www.openai.com/).
2. Install it in [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=martina328.commit-message-generator).
3. Run the `generate-message.commit` command to generate a commit message for your staged changes.

## Usage

- **Generating a Commit Message:**
    1. Ensure you have staged changes in your Git repository.
    2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
    3. Type and select `Generate Commit Message`.
    4. Follow the prompts to enter your OpenAI API key if not already stored.
    5. The extension will generate and apply a commit message based on your changes.

## Configuration

- The extension will prompt you to enter your OpenAI API key on first use. This key will be securely stored in VS Code's secrets storage.

## Support

For any issues or feature requests, please submit an issue on GitHub.

---

Developed by martina328
