# OpenInApp Challenge
This is my submission for the the challenge provided by the good folks at OenInApp.

## Libraries used

### Express

This is the Javascript framework that I have used to create this Nodejs Application. More can be found [here](https://expressjs.com/)

### Google APIs/ Gmail API

I have used the Gmail API provided by google APIs. I have mainly used the **users.messages** and the **users.threads** endpoints in that API. 

While I had the option of using it as an URL API, I chose to use the library provided for Nodejs keeping in mind the sanity of the code.

### Nodemailer
It is the most preferred and most used library to send and check on emails for Nodejs.
I used it to send emails where I initialized a transporter constant, providing it with the Authentication provided by OAuth. I then, used various mailoptions such as **from**, **to**, **Subject** and **text** to send the reply. I even used **headers** to send the email as a reply to that very particular email message.

### Dotenv

I used **dotenv** to configure my environment variables. I stored the OAuth credentials as environment variables.
## How to use this

Clone this repository and run 
>npm install

to install all the dependencies. After that you need to create a file named **.env** and then store the following information there -
>PORT=<Your-desired-port-number\>
CLIENT_ID=<Your-client-id\>
CLIENT_SECRET=\<Your-client-secret>
REDIRECT_URI=\<Your-redirect-URI>
REFRESH_TOKEN=\<Your-refresh-token>

You can get these after you sign into google cloud console and then creating new credentials.

## Note

If you want to know more about me, click [here](https://dassicity.github.io/portfolio/)