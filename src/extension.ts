// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import OpenAI from 'openai';

// Initialize OpenAI client with an empty API key (will be set later)
let openai: OpenAI;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const extensionName = 'commit-message-generator';
export async function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "commit-message-generator" is now active!');

    try {
        // Display input box to get OpenAI API Key from user
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter OpenAI API Key',
            placeHolder: 'API Key'
        });
        // Check if API key is provided
        if (!apiKey) {
            vscode.window.showInformationMessage('OpenAI API key is required to use this extension.');
            return;
        }

        // Initialize OpenAI with the provided API key
        openai = new OpenAI({ apiKey });

        // The command has been defined in the package.json file
        // Now provide the implementation of the command with registerCommand
        // The commandId parameter must match the command field in package.json
        const commitCommand = vscode.commands.registerCommand('generate-message.commit', async () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            try {
                // Ensure the workspace is opened
                if (!isWorkspaceOpen()) {
                    vscode.window.showInformationMessage('You need to open a workspace before generating commit messages.');
                    return;
                }

                // Get current working directory
                const cwd = getCwd();

                // Get git diff for staged files
                const diff = await getGitDiff(cwd);
                if (!diff) {
                    vscode.window.showInformationMessage('No staged files found for committing.');
                    return;
                }

                // Generate AI-powered commit message
                const aiCommitMessage = await generateAiCommitMessage(openai, diff);
                // vscode.window.showErrorMessage(aiCommitMessage);

                // Commit with the generated message
                await commitWithMessage(cwd, aiCommitMessage);

                // Refresh git view
                vscode.commands.executeCommand('git.refresh');

            } catch (error: any) {
                console.error('Error generating commit message:', error);
                vscode.window.showErrorMessage('Error generating commit message: ' + error.message);
            }
        });

        context.subscriptions.push(commitCommand);

    } catch (error: any) {
        console.error('Error initializing OpenAI:', error);
        vscode.window.showErrorMessage('Error initializing OpenAI: ' + error.message);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Check if a workspace is currently open in VSCode.
 */
function isWorkspaceOpen(): boolean {
    return vscode.workspace.workspaceFolders !== undefined;
}

/**
 * Get the current working directory (first workspace folder path).
 */
function getCwd(): string {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
        return folders[0].uri.fsPath;
    }
    throw new Error('No workspace folder found.');
}

/**
 * Get git diff for staged files.
 * @param cwd The current working directory.
 */
function getGitDiff(cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const gitDiffCommand = 'git diff --cached --name-status';
        exec(gitDiffCommand, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(new Error(stderr));
            }
            resolve(stdout.trim());
        });
    });
}

/**
 * Generate AI-powered commit message using OpenAI.
 * @param client The OpenAI API client.
 * @param diff Git diff for AI prompt.
 */
async function generateAiCommitMessage(client: OpenAI, diff: string): Promise<string> {
    // Construct prompt for OpenAI
    const userPrompt = 'Generate a simple and clear commit message for the following changes:\n' + diff;

    // Call OpenAI to generate completion
    const chatCompletion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'user', content: userPrompt }
        ]
    });

    return chatCompletion.choices[0].message.content ?? '';
}

/**
 * Commit changes with a specified message.
 * @param cwd The current working directory.
 * @param message The commit message.
 */
function commitWithMessage(cwd: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const commitCommand = `git commit -m "${message}"`;
        exec(commitCommand, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error running "${commitCommand}": ${error.message}`));
            }
            if (stderr) {
                reject(new Error(`"${commitCommand}" returned error output: ${stderr}`));
            }
            resolve();
        });
    });
}