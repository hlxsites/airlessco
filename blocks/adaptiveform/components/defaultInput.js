/* eslint-disable import/no-cycle */
import { setActive, subscribe } from '../libs/afb-interaction.js';
import * as builder from '../libs/afb-builder.js';
import { Constants } from '../libs/constants.js';

export class DefaultField {
  blockName = 'cmp-adaptiveform-textinput';

  block;

  element;

  model;

  constructor(block, model) {
    this.block = block;
    this.model = model;
  }

  addListener() {
    if (this.element) {
      const widget = builder?.default?.getWidget(this.block);
      widget?.addEventListener('blur', (e) => {
        this.model.value = e.target.value;
        if (this.element) setActive(this.element, false);
      });
      widget?.addEventListener('focus', () => {
        if (this.element) setActive(this.element, true);
      });
    }
  }

  renderField() {
    if (this.model.fieldType === 'hidden') {
      const state = this.model.getState();
      return builder?.default?.defaultInputRender(state, this.blockName);
    }
    return builder?.default?.renderField(this.model, this.blockName);
  }

  render() {
    this.element = this.renderField();
    this.block.classList.add(`${Constants.ADAPTIVE_FORM}-${this.model?.fieldType}`);
    this.block.appendChild(this.element);
    if (this.model.fieldType !== 'hidden') {
      this.addListener();
      subscribe(this.model, this.element);
    }
  }
}

export default async function decorate(block, model) {
  const textinput = new DefaultField(block, model);
  textinput.render();
}
