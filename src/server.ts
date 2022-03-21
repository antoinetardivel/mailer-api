import sgMail from "@sendgrid/mail";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import contactMail from "./contactMail";

interface StringMap {
  [key: string]: string;
}
const isDevMode = process.env.NODE_ENV === "development";
const whitelist = process.env.WHITELIST.split(",");
const corsOptions = {
  origin: (origin, callback) => {
    if (isDevMode) {
      callback(null, true);
    } else {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS").message);
      }
    }
  },
};

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
sgMail.setApiKey(process.env.SG_APIKEY);
app.post("/", cors(corsOptions), (req, res) => {
  const query: StringMap = req.query as StringMap;
  const msg = {
    to: process.env.EMAIL_TO,
    from: process.env.EMAIL_FROM,
    subject: process.env.SUBJECT,
    html: contactMail(
      query.email,
      query.phone,
      query.message,
      query.name,
      query.company
    ),
  };
  sgMail
    .send(msg)
    .then(() => {
      res.send("Email sent");
    })
    .catch(() => {
      res.send(new Error("Email not sent").message);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
