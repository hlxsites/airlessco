import { subscribe } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import * as builder from '../../libs/afb-builder.js';

const renderChildren = async function renderChildren(parent, state) {
  const fields = state?.items;
  const length = fields ? fields.length : 0;

  for (let i = 0; i < length; i += 1) {
    const field = fields[i];
    // eslint-disable-next-line no-undef
    const fieldModel = adaptiveform.model?.getElement(field.id);
    // eslint-disable-next-line no-await-in-loop
    const element = await builder?.default?.getRender(fieldModel);

    parent.append(element);
    // @todo trigger add event
  }
};

export class Panel {
  blockName = Constants.PANEL;

  block;

  element;

  model;

  constructor(block, model) {
    this.block = block;
    this.model = model;
  }

  renderField = (state) => {
    const element = builder?.default?.createWidgetWrapper(state, this.blockName);

    const label = builder?.default?.createLabel(state, this.blockName);
    label.tabIndex = label.textContent ? 0 : -1;

    const longDesc = builder?.default?.createLongDescHTML(state, this.blockName);
    const help = builder?.default?.createQuestionMarkHTML(state, this.blockName);

    if (label) { element.appendChild(label); }
    if (longDesc) { element.appendChild(longDesc); }
    if (help) { element.appendChild(help); }

    if (state?.name) {
      element.setAttribute('name', state.name);
    }

    return element;
  };

  async render() {
    const state = this.model.getState();

    this.element = this.renderField(state);
    await renderChildren(this.element, state);
    if (state.name || state.dataName) {
      this.block.classList.add(state.name || state.dataName);
    }
    this.block.appendChild(this.element);
    subscribe(this.model, this.element);
  }
}

export default async function decorate(block, model) {
  const panel = new Panel(block, model);
  await panel.render();
}
