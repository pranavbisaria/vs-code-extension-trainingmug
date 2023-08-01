import * as vscode from 'vscode';
import { Panel } from './Panel';
import { SidebarProvider } from './SidebarProvider';
import WebhookReceiver from './WebhookReceiver';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	new WebhookReceiver(context, sidebarProvider);
	
	const item = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right
	);
	item.text = "$(file-code) Submit main";
	item.command = "trainingmug.submit";
	item.show();

	console.log('Congratulations, your extension "trainingmug" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand('trainingmug.main', () => {;
			Panel.createOrShow(context.extensionUri);
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('trainingmug.refresh', () => {;
			Panel.kill();
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
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  "trainingmug-sidebar",
		  sidebarProvider
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
