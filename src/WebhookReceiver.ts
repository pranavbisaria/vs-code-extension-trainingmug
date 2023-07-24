import { ExtensionContext } from 'vscode';
import express from 'express';
import bodyParser from 'body-parser';
import { SidebarProvider } from './SidebarProvider';

export default class WebhookReceiver {
  server: any;
  port=3000;

  constructor(context: ExtensionContext, sidebarProvider: SidebarProvider) {
    const app = express();
    app.use(bodyParser.json());
    app.post('/webhook', (req, res) => {
      const data = req.body;

      // Update the sidebar html component.
      sidebarProvider._view?.webview.postMessage({
        type: 'update-sidebar',
        value: data
      });

      // console.log(data);
      res.status(200).send('OK');
    });

    this.server = app.listen(this.port, () => {
      console.log(`Webhook receiver listening on port ${this.port}`);
    });
  }

  dispose() {
    this.server.close();
  }
}