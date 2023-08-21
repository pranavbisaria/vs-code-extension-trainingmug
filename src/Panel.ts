import * as vscode from "vscode";
import { getNonce } from "./Nonce";

export class Panel {
  private static globalData: any = {
    title: "PLease select a case",
    inputData: "PLease select a case",
    expectedOutput: "PLease select a case",
    yourOutput: "PLease select a case",
  };

  public static currentPanel: Panel | undefined;

  public static readonly viewType = "Panel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, data: any) {

    if (data) {
      Panel.globalData.title = data.title;
      Panel.globalData.inputData = data.more.input;
      Panel.globalData.expectedOutput = data.more.expectedOutput;
      Panel.globalData.yourOutput = data.more.yourOutput;
    }

    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (Panel.currentPanel) {
      Panel.currentPanel._panel.reveal(column);
      Panel.currentPanel._update();
      return;
    }
    
    const panel = vscode.window.createWebviewPanel(
      Panel.viewType,
      "TrainingMug - " + Panel.globalData.title,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media")
        ]
      }
    );


    Panel.currentPanel = new Panel(panel, extensionUri);
  }

  public static kill() {
    Panel.currentPanel?.dispose();
    Panel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    Panel.currentPanel = new Panel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.iconPath = vscode.Uri.joinPath(extensionUri, "media", "icon.svg");

  }

  public dispose() {
    Panel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
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
        case "closePanel": {
          Panel.kill();
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
        <style>
            body{
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .caseTitle{
              margin-bottom: 20px;
            }
            .moreInfo {
                width: 330px;
                height: 70px;
                padding: 25px;
                border-radius: 10px;
                margin: 10px auto;
                background-color: #000000;
                color: #FFFFFF;
                overflow-y: scroll;
            }
            p{
                font-size: 18px;
                color: #FFFFFF;
                text-align: center;
            }

            .mainMoreInfo {
                width: 556px;
                margin: 0px 25px;
            }
            .moreContainer {
                width: 430px;
                border-radius: 20px;
                background-color: #161B22;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px 0px 10px;
            }
            button {
                width: 120px;
                height: 46px;
                padding: 10px 20px;
                border-radius: 10px;
                margin: 10px auto;
                color: #000000;
                background: #FA7970;
            }
        </style>
			</head>
      <body>
      <div class="moreContainer">
        <div class="caseTitle">${Panel.globalData.title}</div>
        <div class="mainMoreInfo">
          <p>Input</p>
          <div class="moreInfo">${Panel.globalData.inputData}</div>
        </div>
        <div class="mainMoreInfo">
          <p>Expected Output</p>
          <div class="moreInfo">${Panel.globalData.expectedOutput}</div>
        </div>
        <div class="mainMoreInfo">
          <p>Your Output</p>
          <div class="moreInfo">${Panel.globalData.yourOutput}</div>
        </div>
        <button button id="close-button">Close</button>
      </div>
			</body>
      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const closeButton = document.getElementById("close-button");
        
        closeButton.addEventListener("click", () => {
          vscode.postMessage({ type: "closePanel" });
        });
      </script>
			</html>`;
  }
}
