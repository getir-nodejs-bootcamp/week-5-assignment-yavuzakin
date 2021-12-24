const nodemailer = require("nodemailer");
const eventEmitter = require("./eventEmitter");

module.exports = () => {
    eventEmitter.on("send-email", (emailData) => {
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
              user: process.env.EMAIL_USER, 
              pass: process.env.EMAIL_PASSWORD, 
            },
        });

        let info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: emailData.to, // list of receivers
            subject: emailData.subject, // Subject line
            html: emailData.html, // html body
        });
    })
}