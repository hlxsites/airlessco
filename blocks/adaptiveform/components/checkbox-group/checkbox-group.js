import { subscribe } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import * as builder from '../../libs/afb-builder.js';
import { getLayoutProperties, getViewId } from '../../libs/afb-model.js';

export class CheckboxGroup {
  blockName = Constants.CHECKBOX_GROUP;

  block;

  element;

  model;

  constructor(block, model) {
    this.block = block;
    this.model = model;
  }

  addListener() {
    const widgets = this.element?.querySelectorAll(`[class$='${Constants.WIDGET}']`);
    widgets?.forEach((widget) => {
      widget.addEventListener('change', () => {
        const value = [];
        widgets?.forEach((w) => {
          if (w.checked) {
            value.push(w.value);
          }
        }, this);
        this.model.value = value;
      });
    });
  }

  updateValue = (element, value) => {
    const widgets = element.querySelectorAll(`[class$='${Constants.WIDGET}']`);
    widgets?.forEach((widget) => {
      if (widget.value != null && value?.includes(widget.value)) {
        widget.checked = true;
      } else {
        widget.checked = false;
      }
    }, this);
  };

  createInputHTML = (state) => {
    const fragments = document.createDocumentFragment();
    state?.enum?.forEach((enumVal, index) => {
      fragments.appendChild(this.createCheckbox(state, enumVal, state?.enumNames?.[index], index));
    });
    return fragments;
  };

  createCheckbox = (state, enumValue, enumDisplayName, index) => {
    const div = document.createElement('div');
    div.className = `${this.blockName}-item ${getLayoutProperties(state)?.orientation}`;

    const label = document.createElement('label');
    label.htmlFor = `${getViewId(state, this.blockName)}__${index}__widget`;
    label.setAttribute('aria-label', enumDisplayName);

    const input = builder?.default?.defaultInputRender(state, this.blockName);
    input.type = 'checkbox';
    input.id = label.htmlFor;
    input.value = enumValue.toString();
    input.checked = state?.value?.includes(enumValue);

    const span = document.createElement('span');
    span.textContent = enumDisplayName || enumValue;

    label.appendChild(input);
    label.appendChild(span);

    div.appendChild(label);

    return div;
  };

  render() {
    this.element = builder?.default?.renderField(this.model, this.blockName, this.createInputHTML);
    this.block.appendChild(this.element);
    this.addListener();
    subscribe(this.model, this.element, { value: this.updateValue });
  }
}

export default async function decorate(block, model) {
  const checkbox = new CheckboxGroup(block, model);
  checkbox.render();
}
