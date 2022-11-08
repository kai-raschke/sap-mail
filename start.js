const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const xsenv = require('@sap/xsenv');
const JWTStrategy = require('@sap/xssec').JWTStrategy;

const { sendMail, MailConfig } = require('@sap-cloud-sdk/mail-client');
const { getDestination } = require('@sap-cloud-sdk/connectivity');
const emailTemplates = require('email-templates');
const emailRenderer = require('./email-renderer');

const app = express();

const services = xsenv.getServices({ uaa:'nodeuaa' });

passport.use(new JWTStrategy(services.uaa));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.get('/', function (req, res, next) {
    res.send('Application user: ' + req.user.id);
});

app.post('/sendmail', async function (req, res, next) {
    const body = req.body;
    const mailConfig = new MailConfig({
        from: body.from,
        to: body.to,
        subject: body.subject,
        text: body.text
    });

    let mailTemplate = "mailtemplate";
    let mailVariables = {
        "name": "John",
        "age": 30,
        "city": "New York"
    };

    if(mailTemplate) {
        try {
            let emailRender = new emailTemplates({
                render: emailRenderer.render
            });

            template = await emailRender.renderAll(mailTemplate, mailVariables);
            // log.debug(`Render file templates done: ${JSON.stringify(template.subject)} from ${mailTemplate}`);
        } catch(ex) {
            await taskService.handleFailure(task, "An error occured while rendering the templates");
        }
    }
    else {
        template.subject = subject;
        template.text = text;
        template.html = html;
        // log.debug('Render file from fixed variables');
    }

    let mail = Object.assign(mailConfig,{
        from:   envelope.from,
        to:     envelope.to,
        cc:     envelope.cc,
        bcc:    envelope.bcc,
        replyTo:envelope.replyTo,
        subject:template.subject,
        text:   template.text,
        html:   template.html
    });

    sendMail(
        { destinationName: 'my-mail-destination' },
        [mail]
    ).then(() => {
        res.send('Mail sent');
    }).catch((error) => {
        res.send(error);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('myapp listening on port ' + port);
});