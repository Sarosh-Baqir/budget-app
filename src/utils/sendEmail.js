import nodemailer from "nodemailer";
import { EMAIL_NAME, EMAIL_USER, EMAIL_PASS } from "./constants.js";
const transporter = nodemailer.createTransport({
  service: "gmail",
  // host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // logger: true,
  // debug: true,
  // secureConnection:300000,
  // socketTimeout:false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnAuthorized: true,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(subject, text, html, to) {
  console.log("to in send email file: ", to);
  // send mail with defined transport object
  const info = await transporter.sendMail({
    // from: '"Ahsan Anees 👻" <ahsananees709@gmail.com>', // sender address
    from: {
      name: EMAIL_NAME,
      address: EMAIL_USER,
    },
    to: to || "ahsan.flower1@gmail.com", // list of receivers
    subject: subject || "Hello ✔", // Subject line
    text: text || "Hello world?", // plain text body
    html: html || "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

export default sendEmail;
