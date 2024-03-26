/* https://css-tricks.com/using-netlify-forms-and-netlify-functions-to-build-an-email-sign-up-widget/ */
export const handler = async event => {
  const email = JSON.parse(event.body).payload.email
  return fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${ process.env.BUTTONDOWN_KEY }`,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
    },
    body: JSON.stringify({ email }),
  })
    .then(response => {
      if (!response.ok) {
            throw new Error('Network response was not ok');
         }
      return response.json()
    })
    .then(data => {
      console.log(data)
      return { statusCode: 200 }
    })
    //.then({statusCode: response.status, body: response.text()})
    .catch(error => ({ statusCode: 422, body: String(error) }))
}
