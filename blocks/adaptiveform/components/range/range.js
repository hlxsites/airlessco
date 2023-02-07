import { getWidget, setActive } from '../../libs/afb-interaction.js';
import { DefaultField } from '../defaultInput.js';
import * as builder from '../../libs/afb-builder.js';
import { format } from '../../libs/afb-formatters.js';

export class Range extends DefaultField {
  blockName = 'cmp-adaptiveform-textinput';

  addListener() {
    if (this.element) {
      const widget = getWidget(this.block);

      widget?.addEventListener('change', (e) => {
        const hover = this.element.querySelector(`.${this.blockName}__widget-value`);

        this.model.value = e.target.value;
        const state = this.model?.getState();
        if (this.element) {
          setActive(this.element, false);
        }
        this.#updateView(state, hover, e.target);
      });

      widget?.addEventListener('focus', () => {
        if (this.element) {
          setActive(this.element, true);
        }
      });
    }
  }

  /**
     * updates the hover as per widget value and style the hover accordingly.
     * @param {*} state
     * @param {HTMLSpanElement} hover
     * @param {HTMLInputElement} widget
     */
  // eslint-disable-next-line class-methods-use-this
  #updateView(state, hover, widget) {
    try {
      const min = Number(state.minimum) || 0;
      const max = Number(state.maximum) || 1;
      const value = Number(state.value) || 0;
      const step = Number(state.step) || 1;

      const totalSteps = Math.ceil((max - min) / step);
      const currStep = Math.ceil((value - min) / step);

      if (hover) {
        hover.textContent = state.displayValue;
        hover.style.left = `calc(${currStep}*(100%/${totalSteps + 1}))`;
      }
      widget.setAttribute('style', `background-image: linear-gradient(to right, #78be20 ${100 * (currStep / totalSteps)}%, #C5C5C5 ${100 * (currStep / totalSteps)}%)`);
    } catch (err) {
      console.error(err);
    }
  }

  renderInput(state, bemBlock) {
    const input = builder?.default?.defaultInputRender(state, bemBlock);
    input.value = state.value;
    input.step = state.step;
    const div = document.createElement('div');
    div.className = `${bemBlock}__widget-wrapper`;

    const hover = document.createElement('span');
    hover.className = `${bemBlock}__widget-value`;
    this.#updateView(state, hover, input);

    const min = document.createElement('span');
    min.className = `${bemBlock}__widget-min`;
    try {
      min.textContent = format(state.minimum, 'en-US', state.displayFormat);
    } catch (e) {
      console.error(e);
      min.textContent = state.minimum;
    }
    const max = document.createElement('span');
    max.className = `${bemBlock}__widget-max`;
    try {
      max.textContent = format(state.maximum, 'en-US', state.displayFormat);
    } catch (e) {
      console.error(e);
      max.textContent = state.maximum;
    }
    div.append(hover, input, min, max);
    return div;
  }

  renderField() {
    return builder?.default?.renderField(this.model, this.blockName, this.renderInput.bind(this));
  }
}

export default async function decorate(block, model) {
  const range = new Range(block, model);
  range.render();
}
