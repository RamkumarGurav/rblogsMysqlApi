const nodemailer = require("nodemailer");


// const emailBody = `
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Stylish Email Example</title>
// </head>
// <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
//   <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);">
//     <h1 style="color: #007bff;">Hello there!</h1>
//     <p style="color: #444;">This is an example email body with HTML content and inline CSS styles.</p>
//     <p style="color: #444;">Here are some styling examples:</p>
//     <ul style="list-style-type: square; color: #333;">
//       <li>Use <strong>bold</strong> text when you want to emphasize something.</li>
//       <li>Use <em>italic</em> text for additional emphasis or to highlight important points.</li>
//       <li>Use different heading levels (h1, h2, h3, etc.) for section headings.</li>
//     </ul>
//     <p style="color: #444;">You can also include images:</p>
//     <img src="https://example.com/logo.png" alt="Company Logo" style="max-width: 200px; border-radius: 5px;">
//     <p style="color: #444;">And links:</p>
//     <p style="color: #007bff;"><a href="https://example.com">Visit our website</a></p>
//     <p style="color: #444;">Thank you for reading!</p>
//     <p style="color: #444;">Best regards,</p>
//     <p style="color: #007bff;">Your Name</p>
//   </div>
// </body>
// </html>
// `;

module.exports = class Email {
  constructor(user, message) {
    this.to = user.email;
    this.from = `Ramkumar Gurav <${process.env.EMAIL_FROM}>`;
    this.message = message;
  }

  newTransport() {
    // //--------------------------------------------------------
    // return nodemailer.createTransport({
    //   host: process.env.MAILTRAP_EMAIL_HOST,
    //   port: process.env.MAILTRAP_EMAIL_PORT,
    //   auth: {
    //     user: process.env.MAILTRAP_EMAIL_USERNAME,
    //     pass: process.env.MAILTRAP_EMAIL_PASSWORD,
    //   },
    // });
    // //--------------------------------------------------------

    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async send(subject) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: subject,
      text: this.message,
    };

    //for stylish email
    // const mailOptions = {
    //   to: this.to,
    //   from: this.from,
    //   subject: subject,
    // html:emailBody
    // };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(`Welcome to the MyExams Family!`);
  }

  async sendResetPasswordUrl() {
    await this.send(`Password Recovery`);
  }

  async sendVillaReservationMsg() {
    await this.send(`Your Royal Villas Reservation is Successfull`);
  }
  async sendOrderPlacedMsg() {
    await this.send(`Thank You for Shopping at MyExams.com`);
  }
  async sendRoyalVillasBookingMsg() {
    await this.send(`Congratulations ,Your Booking is Successfull`);
  }
  async sendporfolioMessage() {
    await this.send(`Ram you have a Message from Portfolio`);
  }


};
