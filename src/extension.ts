import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import WebhookReceiver from './WebhookReceiver';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	const webhook = new WebhookReceiver(context, sidebarProvider);

	//Status Bar Button Run Button
	const statusBarRunButton = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		-1000
	);
	statusBarRunButton.text = "$(play) Run Code";
	statusBarRunButton.tooltip = "Click to Run";
	statusBarRunButton.color = "white";
	statusBarRunButton.command = "trainingmug.run";
	statusBarRunButton.show();

	//Status Bar Button
	const statusBarTestButton = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		-900
	);
	statusBarTestButton.text = "$(debug) Run Test";
	statusBarTestButton.tooltip = "Click to Test";
	statusBarTestButton.color = "white";
	statusBarTestButton.command = "trainingmug.test";
	statusBarTestButton.show();


	//Ask Question
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

	//Siderbar
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
		  "trainingmug-sidebar",
		  sidebarProvider
		)
	);
		  
	//Run Command
	context.subscriptions.push(
		vscode.commands.registerCommand('trainingmug.run', async () => {
			vscode.commands.executeCommand('workbench.view.extension.trainingmug-sidebar-view');
			const files = await vscode.workspace.findFiles('**/trainingmug.json');
		
			if (files.length === 0) {
			vscode.window.showErrorMessage('Could not find trainingmug.json file');
			return;
			}
		
			const contents = await vscode.workspace.fs.readFile(files[0]);
		
			try {
				const data = JSON.parse(contents.toString());
				let terminal = vscode.window.activeTerminal;
				if(!terminal){
					terminal = vscode.window.createTerminal();
				}
				terminal.show();
				terminal.sendText(data.run);
			} catch (error) {
				vscode.window.showErrorMessage(`${error}`);
			}
		})
	);

	//Test Command
	context.subscriptions.push(
		vscode.commands.registerCommand('trainingmug.test', async () => {
			vscode.commands.executeCommand('workbench.view.extension.trainingmug-sidebar-view');
			const files = await vscode.workspace.findFiles('**/trainingmug.json');
		
			if (files.length === 0) {
			vscode.window.showErrorMessage('Could not find trainingmug.json file');
			return;
			}
		
			const contents = await vscode.workspace.fs.readFile(files[0]);
		
			try {
				const data = JSON.parse(contents.toString());
				let terminal = vscode.window.activeTerminal;
				if(!terminal){
					terminal = vscode.window.createTerminal();
				}
				terminal.show();
				terminal.sendText(data.test);
			} catch (error) {
				vscode.window.showErrorMessage(`${error}`);
			}
			})
	);

	context.subscriptions.push(
		
	);

	console.log('TrainingMug is now active!');
}

export function deactivate() {}
