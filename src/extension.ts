// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import OpenAI from 'openai';

const apiKey = 'Your_Token here';
const openai = new OpenAI({
	apiKey: apiKey,
});


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const extensionName = 'commit-message-generator';
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-extension" is now active!');

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

            // // Retrieve API key from configuration
            // const apiKey = getConfigValue('openaiApiKey');
            // if (!apiKey) {
            //     vscode.window.showInformationMessage('OpenAI API key is not set. Please set the API key in the settings.');
            //     return;
            // }

            // // Get current working directory
            // const cwd = getCwd();

            // // Get keywords from workspace configuration
            // const keywords = getConfigValue('keywords');

            // // Get git diff for staged files
            // const diff = await getGitDiff(cwd);
            // if (!diff) {
            //     vscode.window.showInformationMessage('No staged files found for committing.');
            //     return;
            // }

            // // Get user input for commit message
            // const commitMessage = await getUserInput('Enter a commit message');
            // if (!commitMessage) {
            //     vscode.window.showInformationMessage('Commit aborted. Please provide a commit message.');
            //     return;
            // }

            // // Initialize OpenAI configuration
            // // const openaiConfig = new Configuration({ apiKey });
            // // const openaiClient = new OpenAI(openaiConfig);

            // // Generate AI-powered commit message
            const aiCommitMessage = await generateAiCommitMessage(openai, "", "", "");
			vscode.window.showErrorMessage(aiCommitMessage);

            // // Commit with the generated message
            // await commitWithMessage(cwd, aiCommitMessage);

            // // Refresh git view
            // vscode.commands.executeCommand('git.refresh');
        }
		catch (error: any) {
            console.error('Error generating commit message:', error);
            vscode.window.showErrorMessage('Error generating commit message: ' + error.message);
        }
    });	


	context.subscriptions.push(commitCommand);
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
 * Get a value from the extension's configuration.
 * @param key The configuration key.
 */
function getConfigValue(key: string): any {
    return vscode.workspace.getConfiguration(extensionName).get(key);
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
 * Get user input using VSCode input box.
 * @param prompt The prompt message for the input box.
 */
function getUserInput(prompt: string): Thenable<string | undefined> {
    return vscode.window.showInputBox({ prompt });
}

/**
 * Generate AI-powered commit message using OpenAI.
 * @param client The OpenAI API client.
 * @param keywords Keywords for AI prompt.
 * @param subject Subject for AI prompt.
 * @param diff Git diff for AI prompt.
 */
async function generateAiCommitMessage(client: OpenAI, keywords: string | undefined, subject: string, diff: string): Promise<string> {
    // // Construct prompt for OpenAI
    // const systemPrompt = 'Generate a commit message for the following changes:\n' + diff;
    // let userPrompt = `Keywords: ${keywords}\nSubject: ${subject}\n`;

    // // Replace newlines in prompts
    // userPrompt = userPrompt.replace(/\n/g, '\\n');

    // // Call OpenAI to generate completion
    // const chatCompletion = await openai.chat.completions.create({
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //         { role: 'system', content: systemPrompt },
    //         { role: 'user', content: userPrompt }
    //     ]
    // });

    // // Return the AI-generated commit message
    // return chatCompletion.data.choices[0].message.content;
	const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'こんにちは' }],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content??"";
}

/**
 * Commit changes with a specified message.
 * @param cwd The current working directory.
 * @param message The commit message.
 */
function commitWithMessage(cwd: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const commitCommand = `git commit -e -m "${message}"`;
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