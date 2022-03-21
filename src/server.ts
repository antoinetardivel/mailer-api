import sgMail from "@sendgrid/mail";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { body, validationResult } from "express-validator";
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
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
sgMail.setApiKey(process.env.SG_APIKEY);
app.post(
  "/",
  cors(corsOptions),
  body("email").isEmail(),
  body("phone").isString(),
  body("message").isString(),
  body("message").isLength({ min: 30 }),
  body("name").isString(),
  body("company").isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const body: StringMap = req.body as StringMap;
    console.log(body);
    const msg = {
      to: process.env.EMAIL_TO,
      from: process.env.EMAIL_FROM,
      subject: process.env.SUBJECT,
      html: contactMail(
        body.email,
        body.phone,
        body.message,
        body.name,
        body.company
      ),
    };
    sgMail
      .send(msg)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        res.send(new Error("Email not sent").message);
      });
  }
);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
