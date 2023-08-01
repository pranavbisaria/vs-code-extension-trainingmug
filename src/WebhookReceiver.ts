import { ExtensionContext } from 'vscode';
import express from 'express';
import bodyParser from 'body-parser';
import { SidebarProvider } from './SidebarProvider';
import cors from 'cors';


export default class WebhookReceiver {
  server: any;
  port=3000;

  constructor(context: ExtensionContext, sidebarProvider: SidebarProvider) {
    const app = express();
    app.use(bodyParser.json());
    app.use(cors());
    app.post('/webhook', (req, res) => {
      const data = req.body;

      sidebarProvider.updateSidebar(data);

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