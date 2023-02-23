const validityKeyMsgMap = {
  badInput: "ErrorMessageRequired",
  patternMismatch: "ErrorMessagePattern",
  rangeOverflow: "ErrorMessageMax",
  rangeUnderflow: "ErrorMessageMin",
  tooLong: "ErrorMessageMax",
  tooShort: "ErrorMessageMin",
  valueMissing: "ErrorMessageRequired"
}

function createSelect(fd) {
  const select = document.createElement('select');
  select.id = fd.Name;
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.value = "";
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  setConstraints(fd, select);
  setErrorMessage(fd, select);
  return select;
}

function valdiateElement(el) {
  const errorSpan = el.parentNode.querySelector('span.error');
  let valid = el?.checkValidity();
  if(valid) {
    el?.classList.remove('invalid');
    errorSpan ? errorSpan.textContent = '' : null;
  } else {
    el?.classList.add('invalid');
    Object.keys(validityKeyMsgMap)?.every((key) => {
      if(el.validity[key] && errorSpan) {
        errorSpan.textContent = el?.dataset[validityKeyMsgMap[key]] || el.validationMessage
        return false
      }
      return true;
    });
  }
  return valid;
}

function constructPayload(form) {
  let invalid = false;
  const payload = {};
  [...form.elements].forEach((fe) => {
    if(valdiateElement(fe)) {
      if (fe.type === 'checkbox') {
        if (fe.checked) payload[fe.id] = fe.value;
      } else if (fe.id) {
        payload[fe.id] = fe.value;
      }
    } else {
      invalid = true;
    }
  });
  return invalid ? false : payload;
}

async function submitForm(form, payload, redirectTo) {
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  window.location.href = redirectTo;
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      event.preventDefault();
      button.setAttribute('disabled', '');
      const payload = constructPayload(form);
      if(payload) {
        await submitForm(form, payload, fd.Extra);
      } else {
        button.removeAttribute('disabled');
      }
    });
  }
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Name;
  input.name = fd.Name;
  input.setAttribute('placeholder', fd.Placeholder);
  setConstraints(fd, input);
  setErrorMessage(fd, input);
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.id = fd.Name;
  input.setAttribute('placeholder', fd.Placeholder);
  setConstraints(fd, input);
  setErrorMessage(fd, input);
  return input;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Name);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'true') {
    label.classList.add('required');
  }
  return label;
}

function setElementProps(element, key, value) {
  if(value) {
    element.setAttribute(key, value);
  }
}

function setErrorMessage(fd, element) {
  Object.keys(fd).forEach((key) => {
    if(key?.startsWith("Error Message") && fd[key]) {
      element.dataset[key?.replaceAll(" ","")] = fd[key]
    }
  });
}

function setConstraints(fd, element) {
  if (fd.Mandatory === 'true') {
    element.setAttribute('required', true);
  }
  setElementProps(element, "pattern", fd.pattern);
  if(element.type == 'number') {
    setElementProps(element, "max", fd.Max);
    setElementProps(element, "min", fd.Min);
  } else {
    setElementProps(element, "maxlength", fd.Max);
    setElementProps(element, "minlength", fd.Min);
  }
}

function createFieldWrapper(fd) {
  const fieldWrapper = document.createElement('div');
  const style = fd.Style ? ` form-${fd.Style}` : '';
  const nameStyle = fd.Name ? ` form-${fd.Name}` : '';
  const fieldId = `form-${fd.Type}-wrapper${style}${nameStyle}`;
  fieldWrapper.className = fieldId;
  fieldWrapper.classList.add('field-wrapper');
  fieldWrapper.append(createLabel(fd));
  return fieldWrapper;
}

function createErrorWrapper(fd) {
  const span = document.createElement('span');
  span.classList = 'error';
  return span;
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = createFieldWrapper(fd);
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createSelect(fd));
        fieldWrapper.append(createErrorWrapper());
        break;
      case 'label': 
        break;
      case 'heading':
        fieldWrapper.replaceChildren(createHeading(fd));
        break;
      case 'radio':
      case 'checkbox':
        fieldWrapper.insertAdjacentElement('afterbegin', createInput(fd));
        fieldWrapper.append(createErrorWrapper());
        break;
      case 'text-area':
        fieldWrapper.append(createTextArea(fd));
        fieldWrapper.append(createErrorWrapper());
        break;
      case 'submit':
        let button = createButton(fd);
        button.type = "submit";
        fieldWrapper.replaceChildren(button);
        break;
      default:
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createErrorWrapper());
    }

    form.append(fieldWrapper);
    form.addEventListener("change", (event) => valdiateElement(event.target))
  });

  return (form);
}

export default async function decorate(block) {
  const form = block.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
