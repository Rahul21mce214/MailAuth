import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTemples.js"

import { mailtrapClient, sender } from "./mailtrap_config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email : "21mce214@nith.ac.in"}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email sent", response)
    } catch (error) {
        console.log("Error sending email",{error});
        throw new Error("Error sending verification email: ${error.message}")
    }
}
export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email : "21mce214@nith.ac.in"}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "ea1ef688-f761-48d5-8daa-449924e0eed3",
            template_variables: {
                                "name": name,
                                 "company_info_name": "MailAuth"},

        })

        console.log("Welcome Email sent", response)
    } catch (error) {
        console.log("Error sending email",{error});
        throw new Error("Error sending welcome email: ${error.message}")
    }
}
export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{email : "21mce214@nith.ac.in"}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        })

        console.log("Password Reset Email sent", response)
    } catch (error) {
        console.log("Error sending email",{error});
        throw new Error("Error sending password reset email: ${error.message}")
    }
}
export const sendPasswordChangedEmail = async (email, resetURL) => {
    const recipient = [{email : "21mce214@nith.ac.in"}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Changed",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Changed"
        })

        console.log("Password Changed Email sent", response)
    } catch (error) {
        console.log("Error sending email",{error});
        throw new Error("Error sending password changed email: ${error.message}")
    }
}