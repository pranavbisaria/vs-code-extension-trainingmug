import * as vscode from "vscode";
import { getNonce } from "./Nonce";
import { Panel } from "./Panel";

const MAX_SUBMISSIONS = 10;

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  private submissionArray: Submission[] = [];
  private submissionIdCounter = 1;


  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };



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
              
              terminal.sendText('cd .. && IPADDRESS=$(curl -s https://api.ipify.org) && sed "s|IPADDRESS=.*$|IPADDRESS=${IPADDRESS}|" .gitlab-ci.yml > .gitlab-ci.yml.tmp && mv .gitlab-ci.yml.tmp .gitlab-ci.yml && rm -f .gitlab-ci.yml.tmp && git add . && git commit -m "Code Submission" && git push --force origin main && cd trainingmug && echo "Submission Successfull..."');
              
              try {
                await onDataPromise;
                vscode.window.showInformationMessage(
                  "Please wait while test are executed..."
                );
              } catch (error) {
                vscode.window.showErrorMessage(
                  "Error executing the shell script: " + error
                );
              }
              vscode.commands.executeCommand('workbench.view.extension.trainingmug-sidebar-view');
            }
          break;
        }
        case "test": {
          vscode.commands.executeCommand(
            "trainingmug.test"
          );
          break;
        }
        case "run": {
          vscode.commands.executeCommand(
            "trainingmug.run"
          );
          break;
        }
        case "openPanel": {
          Panel.kill();
          Panel.createOrShow(this._extensionUri, data.value);
          break;
        }
        case "openSidebar": {
          this._view?.show(true);
          break;
        }
      }
    });

    const html = this._getHtmlForWebview(webviewView.webview, { submittedAt: "", testCases: [] });
    webviewView.webview.html = html;
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  public updateSidebar(data: SidebarData) {
    if (this._view) {
      vscode.window.showInformationMessage("Response received from TrainingMug");

      const submissionId = this.submissionIdCounter++;
      const submissionTitle = `Submission #${submissionId}`;

      const submission: Submission = {
        submissionId: submissionId.toString(),
        submissionTitle: submissionTitle,
        submittedAt: data.submittedAt,
        testCases: data.testCases,
      };

      this.submissionArray.unshift(submission);

      if (this.submissionArray.length > MAX_SUBMISSIONS) {
        this.submissionArray.pop();
      }

      const html = this._getHtmlForWebview(this._view.webview, submission);
      this._view.webview.html = html;
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview, data: SidebarData) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const imageLogo = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "trainingmug.svg")
    );
    const myScript = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "script.js")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
		        <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <script nonce="${nonce}">
                  var submissions = ${JSON.stringify(this.submissionArray)};
                </script>
              </head>
              <body>
                <div class="imgBlock">
                    <img id="logo" src="${imageLogo}" alt="image">
                </div>
                <div id="button-container">
                  <button id="run-button">Run</button>
                  <button id="test-button">Test</button>
                  <button id="submit-button">Commit For Review</button>
                </div>
                <div class="popup">
                  <div class="popup-content">
                  </div>
                </div>
                <div class="main-container"></div>
                </div>
              </body>
              <script nonce="${nonce}" src="${myScript}"></script>
              <script nonce="${nonce}">
                const tsvscode = acquireVsCodeApi();
                const submitButton = document.getElementById('submit-button');
                const testButton = document.getElementById('test-button');
                const runButton = document.getElementById('run-button');

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

                testButton.addEventListener('click', () => {
                  try {
                    tsvscode.postMessage({ type: 'test' });
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

interface TestCase {
  caseTitle: string;
  success: boolean;
  more: {
      input: number;
      expectedOutput: number;
      yourOutput: string;
  };
}

interface Submission {
  submissionId: string;
  submissionTitle: string;
  submittedAt: string;
  testCases: TestCase[];
}

interface SidebarData {
  submittedAt: string;
  testCases: TestCase[];
}
