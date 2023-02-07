import { getWidget, subscribe } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import * as builder from '../../libs/afb-builder.js';
import { getLabelValue } from '../../libs/afb-model.js';

export class Checkbox {
  blockName = Constants.CHECKBOX;

  block;

  element;

  model;

  constructor(block, model) {
    this.block = block;
    this.model = model;
  }

  addListener() {
    getWidget(this.element)?.addEventListener('change', () => {
      const widget = getWidget(this.element);
      if (widget?.checked) {
        this.model.value = this.model.enum?.[0] || true;
      } else {
        this.model.value = this.model.enum?.[1];
      }
    });
  }

  renderField = (model) => {
    const state = model?.getState();

    const element = builder?.default?.createWidgetWrapper(state, this.blockName);
    const label = builder?.default?.createLabel(state, this.blockName);
    const input = builder?.default?.defaultInputRender(state, this.blockName);
    const longDesc = builder?.default?.createLongDescHTML(state, this.blockName);
    const help = builder?.default?.createQuestionMarkHTML(state, this.blockName);
    const error = builder?.default?.createErrorHTML(state, this.blockName);

    const div = document.createElement('div');
    div.className = `${this.blockName}-item `;

    const span = document.createElement('span');
    span.textContent = getLabelValue(state);

    if (label) {
      label.textContent = '';
      div.appendChild(label);
    }
    if (input) {
      label.append(input);
    }
    if (span) {
      label.append(span);
    }
    if (div) {
      element.appendChild(div);
    }

    if (longDesc) { element.appendChild(longDesc); }
    if (help) { element.appendChild(help); }
    if (error) { element.appendChild(error); }

    return element;
  };

  updateValue = (element, value) => {
    const widget = getWidget(element);
    if (widget) {
      widget.checked = this.model.enum?.[0] === value || value === true;
    }
  };

  render() {
    this.element = this.renderField(this.model);
    this.block.appendChild(this.element);
    this.addListener();
    subscribe(this.model, this.element, { value: this.updateValue });
  }
}

export default async function decorate(block, model) {
  const checkbox = new Checkbox(block, model);
  checkbox.render();
}
