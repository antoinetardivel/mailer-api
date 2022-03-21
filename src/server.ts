import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import * as mailjet from "node-mailjet";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/", (req, res) => {
  const request = mailjet
    .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: "hello@studiowawww.com",
            Name: "New contact from the website",
          },
          To: [
            {
              Email: "passenger1@gmail.com",
              Name: "passenger 1",
            },
          ],
          TemplateID: 3786116,
          TemplateLanguage: true,
          Subject: "New contact from the website",
          Variables: {
            name: "Antoine Tardivel",
            email: "passenger1@example.com",
            message: "No message content.",
          },
        },
      ],
    });
  request
    .then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.log(err.statusCode);
    });
  res.send("Mail sent!");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
