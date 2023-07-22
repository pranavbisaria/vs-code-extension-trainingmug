import * as vscode from 'vscode';
import { Panel } from './Panel';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {

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
			// setTimeout(() =>{
			// 	vscode.commands.executeCommand("workbench.action.toggleDevTools");
			// },500);
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
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  "trainingmug-sidebar",
		  sidebarProvider
		)
	  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
