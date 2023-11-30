const express = require('express');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const OAuth2 = google.auth.OAuth2;

const constants = require('./constants');

require('dotenv').config();

const app = express();

// Creating an OAuth2 client object based on the credentials that we have
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Initializing the gmail API
const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

// Getting the access token
let access_token;

async function add_label(message) {

    const label_name = "Automated_Response";

    const labels_list = await gmail.users.labels.list({
        userId: 'me',
    });

    // Checking if the label exists
    const label_exists = labels_list.data.labels.some((label) => label.name === label_name);

    if (!label_exists) {
        // Create the label
        await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: label_name,
                messageListVisibility: 'show',
                labelListVisibility: 'labelShow',
            },
        });
    }

    // Getting the label id
    const label = labels_list.data.labels.find((l) => l.name === label_name);

    // Modifying the message
    await gmail.users.messages.modify({
        userId: 'me',
        id: message.id,
        requestBody: {
            addLabelIds: [label.id],
        },
    });
}

async function send_mail(email_id, subject, message_id) {
    // Creating a transporter object using nodemailer to send emails
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            ...constants.auth,
            accessToken: access_token,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Sending the mail
    await transporter.sendMail({
        to: email_id,
        from: 'babisoumyanildas@gmail.com',
        subject: 'Re: ' + subject,
        headers: {                      // Adding headers so that the mail is sent as a reply to that particular message
            'References': message_id,
            'In-Reply-To': message_id,
        },
        text: 'This is an auto-generated vacation response. I am currently out of the office and will respond to your email as soon as possible.',
    });
}

function check_previous_replies(messages) {
    // What I do here is, I check for a specific header in all these messages and if it equals the value provided by me then I return true else I return false
    for (const message of messages) {
        for (const header of message.payload.headers) {
            if (header.name === 'From') {
                if (header.value === 'Soumyanil Das <babisoumyanildas@gmail.com>') {
                    console.log(header);
                    return true;
                }
            }
        }
    }
    return false;
}

async function main_logic() {
    try {

        // Getting the access token
        access_token = (await oauth2Client.getAccessToken()).token;
        console.log(access_token);

        // Getting list of messages that are unread
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
        });

        const unread_messages = response.data.messages;

        // Checking if message is already part of any thread
        if (unread_messages.length > 0) {
            for (const message of unread_messages) {
                // Getting the thread ID
                const thread_id = message.threadId;

                const thread = await gmail.users.threads.get({
                    userId: 'me',
                    id: thread_id,
                });

                console.log(check_previous_replies(thread.data.messages));
                if (!check_previous_replies(thread.data.messages)) {
                    // If no prior replies, send a reply
                    let email_id, subject, message_id;
                    for (const thread_message of thread.data.messages) {
                        for (const header of thread_message.payload.headers) {
                            if (header.name === 'From') {
                                email_id = header.value;
                            }

                            if (header.name === 'Subject') {
                                subject = header.value;
                            }

                            if (header.name === 'Message-ID') {
                                message_id = header.value;
                            }
                        }
                    }

                    await send_mail(email_id, subject, message_id);
                    await add_label(message);
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Set up a timer to check for new emails every 45 to 120 seconds
setInterval(main_logic, Math.random() * (120 - 45) + 45000);


app.get('/', async (req, res) => {
    res.send('Welcome to Gmail API with NodeJS');
});


app.listen(process.env.PORT, () => {
    console.log(`Listening on PORT ${process.env.PORT} `)
});