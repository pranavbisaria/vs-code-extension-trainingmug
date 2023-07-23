import * as vscode from "vscode";
import { getNonce } from "./Nonce";
import { Panel } from "./Panel";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

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
          const terminal = vscode.window.createTerminal({
            name: "Trainingmug Review",
          });
          terminal.sendText(data.value);
          vscode.commands.executeCommand(
            "code-runner.run"
          );
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

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const mainScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const scriptGenUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.js")
    );
    const cssGenUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.css")
    );
    const imageLogo = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "media", "trainingmug.svg")
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
                  <link href="${cssGenUri}" rel="stylesheet">
                  <script nonce="${nonce}">
                    const tsvscode = acquireVsCodeApi();
                    const trainingmuglogo = imageLogo;
                  </script>
                </head>
                <body>
                  <div class="imgBlock">
                      <img id="logo" src="${imageLogo}" alt="image">
                  <div>
                </body>
                <script nonce="${nonce}" src="${scriptGenUri}"></script>
			</html>`;
  }
}