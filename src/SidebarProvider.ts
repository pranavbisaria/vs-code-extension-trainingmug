import * as vscode from "vscode";
import { getNonce } from "./Nonce";
import { Panel } from "./Panel";
import { resolve } from "path";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  private tableRows = "";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, {});

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "executeGitCommit": {
            const answer = await vscode.window.showInformationMessage('Are you sure, you want to submit?', 'Submit', 'Discard');
      
            if(answer === 'Submit'){
              const terminal = vscode.window.createTerminal({
                name: "Trainingmug Review",
              });
            
              const onDataPromise = new Promise<void>((resolve) => {
                vscode.window.onDidChangeTerminalState((terminal) => {
                  if (terminal.name === "Trainingmug Review") {
                    setTimeout(() =>{
                    resolve();
                  },3000);
                  }
                });
              });
              
              terminal.sendText("cd .. && git add . && git commit -m 'Code Submission' && git push --force origin main && cd trainingmug");
              
              try {
                await onDataPromise;
                vscode.window.showInformationMessage(
                  "Execution finished"
                );
              } catch (error) {
                vscode.window.showErrorMessage(
                  "Error executing the shell script: " + error
                );
              } finally {
                terminal.dispose();
              }
              vscode.commands.executeCommand(
                "code-runner.run"
              );
            }
          break;
        }
        case "stop": {
          vscode.commands.executeCommand(
            "code-runner.stop"
          );
          break;
        }
        case "run": {
          vscode.commands.executeCommand(
            "code-runner.run"
          );
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  public updateSidebar(data: { [key: string]: any }) {
    if (this._view) {
      vscode.window.showInformationMessage(
        "Response received from TrainingMug"
      );
      const html = this._getHtmlForWebview(this._view.webview, data);
      this._view.webview.html = html;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview, data: { [key: string]: any }) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const imageLogo = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "trainingmug.svg")
    );

    if(data !== null && Object.keys(data).length > 0){
      this.tableRows = '<tbody>' + Object.entries(data)
      .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
      .join('') + '</tbody>' + this.tableRows;
    }
    
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link href="${styleResetUri}" rel="stylesheet">
                  <link href="${styleVSCodeUri}" rel="stylesheet">
                </head>
                <body>
                  <div class="imgBlock">
                      <img id="logo" src="https://raw.githubusercontent.com/pranavbisaria/Webhook-Event/master/media/trainingmug.svg" alt="image">
                  </div>
                  <button id="submit-button">Commit For Review</button>
                  <button id="test-button">Test</button>
                  <button id="stop-button">Stop</button>
                  <div class="table-container">
                    <table class="grouped-table">
                      <thead>
                        <tr>
                          <th>KEY</th>
                          <th>VALUE</th>
                        </tr>
                      </thead>
                      ${this.tableRows}
                    </table>
                  </div>
                      </body>
                      <script nonce="${nonce}">
                      const tsvscode = acquireVsCodeApi();
                  const submitButton = document.getElementById('submit-button');
                  const runButton = document.getElementById('test-button');
                  const stopButton = document.getElementById('stop-button');
        
                  submitButton.addEventListener('click', () => {
                    tsvscode.postMessage({ type: 'executeGitCommit' });
                  });
        
                  runButton.addEventListener('click', () => {
                    try {
                      tsvscode.postMessage({ type: 'run' });
                    } catch (error) {
                      console.log(error);
                      tsvscode.postMessage({
                        type: 'onError',
                        value: error
                      });
                    }
                  });
        
                  stopButton.addEventListener('click', () => {
                    try {
                      tsvscode.postMessage({ type: 'stop' });
                    } catch (error) {
                      console.log(error);
                      tsvscode.postMessage({
                        type: 'onError',
                        value: error
                      });
                    }
                  });
                </script>
			</html>`;
  }
}