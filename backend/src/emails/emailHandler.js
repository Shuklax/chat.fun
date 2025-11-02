import { sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (sendWelcomeEmail, name, clientURL) => {
  const { data, error } = await resend.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to chat.fun",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if(error){
    console.error("Error sending welcome emails");
    throw new Error("Error sending welcome emails");
  }

  console.log("Welcome email sent successfully", data);
};
