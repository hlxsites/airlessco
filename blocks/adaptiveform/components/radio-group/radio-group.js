import { getLayoutProperties, getTooltipValue, getViewId } from '../../libs/afb-model.js';
import { subscribe } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import * as builder from '../../libs/afb-builder.js';

import { DefaultField } from '../defaultInput.js';

export class RadioGroup extends DefaultField {
  blockName = Constants.RADIO;

  addListener() {
    const widgets = this.element?.querySelectorAll(`[class$='${Constants.WIDGET}']`);
    widgets?.forEach((widget) => {
      widget.addEventListener('change', (e) => {
        this.model.value = e.target.value;
      });
    });
  }

  createInputHTML = (state) => {
    const fragments = document.createDocumentFragment();
    state?.enum?.forEach((enumVal, index) => {
      const rb = this.createRadioButton(state, enumVal, state?.enumNames?.[index], index);
      fragments.appendChild(rb);
    });
    return fragments;
  };

  createRadioButton = (state, enumValue, enumDisplayName, index) => {
    const div = document.createElement('div');
    div.className = `${this.blockName}__option`;

    const orientation = getLayoutProperties(state)?.orientation;
    div.className += (orientation ? ` ${orientation}` : '');

    const label = document.createElement('label');
    label.className = `${this.blockName}__option__label`;
    label.title = getTooltipValue(state);
    label.setAttribute('aria-label', enumDisplayName || enumValue);
    label.setAttribute('aria-describedby', '_desc');

    const input = builder?.default?.defaultInputRender(state, this.blockName);
    input.type = 'radio';
    input.className = `${this.blockName}__option__widget`;
    input.id = `${getViewId(state, this.blockName)}__${index}__widget`;
    input.value = enumValue;
    input.checked = enumValue === state.value;

    const span = document.createElement('span');
    span.textContent = enumDisplayName || enumValue;

    label.appendChild(input);
    label.appendChild(span);
    div.appendChild(label);

    return div;
  };

  updateEnum = (element, Enum) => {
    // todo: remove extra options, fallback to enum if enumNames are not updated.
    const widgets = this.element?.querySelectorAll(`[class$='${Constants.WIDGET}']`);
    widgets?.forEach((widget, i) => {
      widget.value = Enum[i];
    });
  };

  updateEnumNames = (element, enumNames) => {
    // todo: remove extra options, fallback to enum if enumNames are not updated.
    const widgets = this.element?.querySelectorAll('[class$=\'option__label\']');
    widgets?.forEach((widget, i) => {
      widget.querySelector('span').innerHTML = enumNames[i];
    });
  };

  updateValue = (element, value) => {
    const widgets = element.querySelectorAll(`[class$='${Constants.WIDGET}']`);
    widgets?.forEach((widget) => {
      if (widget.value != null && value?.toString() === widget.value.toString()) {
        widget.checked = true;
        widget.setAttribute(Constants.HTML_ATTRS.CHECKED, Constants.HTML_ATTRS.CHECKED);
        widget.setAttribute(Constants.ARIA_CHECKED, `${true}`);
      } else {
        widget.checked = false;
        widget.removeAttribute(Constants.HTML_ATTRS.CHECKED);
        widget.setAttribute(Constants.ARIA_CHECKED, `${false}`);
      }
    }, this);
  };

  render() {
    this.element = builder?.default?.renderField(this.model, this.blockName, this.createInputHTML);
    this.block.appendChild(this.element);
    this.addListener();
    subscribe(
      this.model,
      this.element,
      {
        value: this.updateValue,
        enum: this.updateEnum,
        enumNames: this.updateEnumNames,
      },
    );
  }
}

export default async function decorate(block, model) {
  const radio = new RadioGroup(block, model);
  radio.render();
}
