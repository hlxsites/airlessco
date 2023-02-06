import { Click } from '../../libs/afb-events.js';
import { getLabelValue, getTooltipValue, getViewId } from '../../libs/afb-model.js';
import { subscribe } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import * as builder from '../../libs/afb-builder.js';

export class Button {
  blockName = Constants.BUTTON;

  block;

  element;

  model;

  constructor(block, model) {
    this.block = block;
    this.model = model;
  }

  addListener() {
    this.element?.addEventListener('click', () => {
      this.model.dispatch(new Click());
    });
  }

  renderField = () => {
    const state = this.model.getState();
    const button = document.createElement('button');
    button.type = 'button';
    button.id = getViewId(state, this.blockName);
    button.className = this.blockName;
    button.title = getTooltipValue(state);
    button.dataset.cmpVisible = `${state?.visible === true}`;
    button.dataset.cmpEnabled = `${state?.enabled === true}`;
    button.dataset.cmpIs = this.blockName;
    button.setAttribute('aria-label', getLabelValue(state));

    builder.default.addStyle(button, state);

    const span = document.createElement('span');
    span.className = `${this.blockName}__text`;
    span.textContent = getLabelValue(state);

    button.appendChild(span);
    return button;
  };

  render() {
    this.element = this.renderField();
    this.block.appendChild(this.element);
    this.addListener();
    subscribe(this.model, this.element);
  }
}

export default async function decorate(block, model) {
  const button = new Button(block, model);
  button.render();
}
