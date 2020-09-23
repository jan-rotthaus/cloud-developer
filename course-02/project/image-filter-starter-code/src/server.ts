import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url
  app.get("/filteredimage", async (req: express.Request, res: express.Response) => {
    const { image_url } = req.query;
    if (!image_url) {
      return res.status(422).send({ msg: "Query param image_url must be provided." });
    }
    filterImageFromURL(image_url).then(
      (filteredpath: string) => {
        res.status(200).sendFile(filteredpath);
        res.on("finish", () => {
          deleteLocalFiles([filteredpath]);
        });
      }
    ).catch((err: any) => {
      res.status(500).send({ msg: err });
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
