/**
 * loads and decorates the contact-us-form block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Extract optional intro content (heading + description) from authored rows
  const rows = [...block.children];
  const introRow = rows[0];
  let introContent = null;

  if (introRow) {
    const cell = introRow.firstElementChild;
    if (cell && cell.textContent.trim()) {
      introContent = cell.cloneNode(true);
    }
  }

  // Build form
  const form = document.createElement('form');
  form.className = 'contact-us-form-form';
  form.noValidate = true;

  const fields = [
    {
      id: 'contact-name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe',
    },
    {
      id: 'contact-email', label: 'Email Address', type: 'email', required: true, placeholder: 'jane@example.com',
    },
    {
      id: 'contact-subject', label: 'Subject', type: 'text', required: true, placeholder: 'How can we help?',
    },
  ];

  fields.forEach(({
    id, label, type, required, placeholder,
  }) => {
    const group = document.createElement('div');
    group.className = 'contact-us-form-group';

    const lbl = document.createElement('label');
    lbl.htmlFor = id;
    lbl.textContent = label;
    if (required) {
      const mark = document.createElement('span');
      mark.className = 'contact-us-form-required';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = ' *';
      lbl.append(mark);
    }

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    input.placeholder = placeholder;
    input.autocomplete = type === 'email' ? 'email' : 'on';
    if (required) input.required = true;

    group.append(lbl, input);
    form.append(group);
  });

  // Message textarea
  const msgGroup = document.createElement('div');
  msgGroup.className = 'contact-us-form-group';

  const msgLabel = document.createElement('label');
  msgLabel.htmlFor = 'contact-message';
  msgLabel.innerHTML = 'Message <span class="contact-us-form-required" aria-hidden="true">*</span>';

  const textarea = document.createElement('textarea');
  textarea.id = 'contact-message';
  textarea.name = 'contact-message';
  textarea.rows = 6;
  textarea.placeholder = 'Tell us more about your inquiry…';
  textarea.required = true;

  msgGroup.append(msgLabel, textarea);
  form.append(msgGroup);

  // Status message (success / error)
  const status = document.createElement('p');
  status.className = 'contact-us-form-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('role', 'status');
  status.hidden = true;

  // Submit button
  const btnGroup = document.createElement('div');
  btnGroup.className = 'contact-us-form-group contact-us-form-submit-group';
  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'button primary';
  btn.textContent = 'Send Message';
  btnGroup.append(btn);
  form.append(btnGroup);

  // Inline validation helper
  function showError(input, message) {
    let err = input.parentElement.querySelector('.contact-us-form-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'contact-us-form-error';
      err.setAttribute('role', 'alert');
      input.parentElement.append(err);
    }
    err.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', err.id || (err.id = `${input.id}-error`));
  }

  function clearError(input) {
    const err = input.parentElement.querySelector('.contact-us-form-error');
    if (err) err.remove();
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.required && !field.value.trim()) {
        showError(field, `${field.previousElementSibling.textContent.replace(' *', '').trim()} is required.`);
      } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        showError(field, 'Please enter a valid email address.');
      } else {
        clearError(field);
      }
    });

    field.addEventListener('input', () => clearError(field));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach((field) => {
      if (!field.value.trim()) {
        showError(field, `${field.previousElementSibling.textContent.replace(' *', '').trim()} is required.`);
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        showError(field, 'Please enter a valid email address.');
        valid = false;
      }
    });

    if (!valid) return;

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.hidden = true;

    try {
      // Replace with your actual form endpoint
      const endpoint = form.dataset.endpoint || '/api/contact';
      const payload = Object.fromEntries(new FormData(form));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        form.reset();
        status.textContent = "Thank you! Your message has been sent. We'll be in touch soon.";
        status.className = 'contact-us-form-status contact-us-form-status-success';
      } else {
        throw new Error('Server error');
      }
    } catch {
      status.textContent = 'Something went wrong. Please try again or email us directly.';
      status.className = 'contact-us-form-status contact-us-form-status-error';
    } finally {
      status.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });

  // Assemble block
  block.innerHTML = '';
  if (introContent) block.append(introContent);
  block.append(status, form);
}
