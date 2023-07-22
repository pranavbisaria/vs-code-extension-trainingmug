import * as vscode from 'vscode';
import { Panel } from './Panel';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "trainingmug" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand('trainingmug.main', () => {;
			Panel.createOrShow(context.extensionUri);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("trainingmug.askQuestion", async () => {
			const answer = await vscode.window.showInformationMessage('How was your day?', 'good', 'bad');

			if(answer === 'bad'){
				vscode.window.showInformationMessage('Sorry to hear that!');
			}
			else{
				console.log({answer});
				vscode.window.showInformationMessage('That great!');
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
