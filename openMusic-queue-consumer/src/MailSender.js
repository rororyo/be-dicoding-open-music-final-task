import nodemailer from "nodemailer";
import env from 'dotenv'
env.config("../.env")
class MailSender{
  constructor(){
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
  }
  sendEmail(targetEmail,content){
    const message = {
      from: 'OpenMusic',
      to: targetEmail,
      subject: 'Ekspor Playlist',
      text: 'Terlampir hasilan dari playlist yang anda ekspor',
      attachments: [
        {
          filename: 'playlist.json',
          content
        }
      ]
    }
    return this._transporter.sendMail(message)
  }
}

export default MailSender