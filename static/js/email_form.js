/* All love to Matthew Ström
 * https://css-tricks.com/using-netlify-forms-and-netlify-functions-to-build-an-email-sign-up-widget/
*/
var processForm = form => {
  const data = new FormData(form)
  data.append('form-name', 'newsletter');
  fetch('/', {
    method: 'POST',
    body: data,
  })
  .then(() => {
    form.innerHTML = `<div class="form--success">Thank you! Check your inbox for a confirmation email.</div>`;
  })
  .catch(error => {
    form.innerHTML = `<div class="form--error">Error: ${error}</div>`;
  })
}

var emailForm = document.querySelector('.email-form')
if (emailForm) {
  emailForm.addEventListener('submit', e => {
    e.preventDefault();
    processForm(emailForm);
  })
}
