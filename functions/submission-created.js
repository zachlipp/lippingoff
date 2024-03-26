/* https://css-tricks.com/using-netlify-forms-and-netlify-functions-to-build-an-email-sign-up-widget/ */
require('dotenv').config()
const fetch = require('node-fetch')
const { BUTTONDOWN_KEY } = process.env
exports.handler = async event => {
  const email = JSON.parse(event.body).payload.email
  console.log(`Recieved a submission: ${email}`)
  return fetch('https://api.buttondown.email/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${BUTTONDOWN_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(`Submitted to Buttondown:\n ${data}`)
    })
    .catch(error => ({ statusCode: 422, body: String(error) }))
}
