/* eslint-disable import/no-cycle */
import { Constants } from './constants.js';
import {
  getLabelValue, getTooltipValue, getViewId, isLabelVisible, isTooltipVisible,
} from './afb-model.js';
import * as builder from './afb-builder.js';
import defaultInput from '../components/defaultInput.js';

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 *
 * @return {HTMLInputElement}
 */
export const defaultInputRender = (state, bemBlock, tag = 'input') => {
  const input = document.createElement(tag);
  input.className = `${bemBlock}__widget`;
  input.title = isTooltipVisible(state) ? getTooltipValue(state) : '';
  input.name = state?.name || '';
  input.value = (state?.displayFormat ? state?.displayValue : state?.value) || '';
  input.placeholder = state?.placeholder || '';
  input.required = state?.required === true;
  input.setAttribute('aria-label', isLabelVisible(state) ? getLabelValue(state) : '');
  builder?.default?.setDisabledAttribute(state, input);
  builder?.default?.setReadonlyAttribute(state, input);
  builder?.default?.setStringContraints(state, input);
  builder?.default?.setNumberConstraints(state, input);

  if (input instanceof HTMLInputElement) {
    input.type = state?.fieldType || 'text';
  }
  return input;
};

/**
 *
 * @param {any} model FieldJson
 * @param {string} bemBlock
 * @param {Function} renderInput
 *
 * @return {HTMLDivElement}
 */
export const renderField = (model, bemBlock, renderInp) => {
  const renderInput = renderInp || builder?.default?.defaultInputRender;
  const state = model?.getState();

  const element = builder?.default?.createWidgetWrapper(state, bemBlock);
  const label = builder?.default?.createLabel(state, bemBlock);
  const inputs = renderInput(state, bemBlock);
  const longDesc = builder?.default?.createLongDescHTML(state, bemBlock);
  const help = builder?.default?.createQuestionMarkHTML(state, bemBlock);
  const error = builder?.default?.createErrorHTML(state, bemBlock);

  if (label) { element.appendChild(label); }
  if (inputs) { element.appendChild(inputs); }
  if (longDesc) { element.appendChild(longDesc); }
  if (help) { element.appendChild(help); }
  if (error) { element.appendChild(error); }

  return element;
};

export function addStyle(element, state) {
  // add support for comma separated styles.
  element.className += state?.style ? ` ${state?.style}` : '';
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 */
export const createWidgetWrapper = (state, bemBlock) => {
  const element = document.createElement('div');
  element.id = getViewId(state, bemBlock);
  element.className = bemBlock;
  element.dataset.cmpVisible = `${state?.visible === true}`;
  element.dataset.cmpEnabled = `${state?.enabled === true}`;
  element.dataset.cmpIs = bemBlock;
  // element.dataset.cmpAdaptiveformcontainerPath = getFormContainerPath();

  addStyle(element, state);

  return element;
};

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 */
// eslint-disable-next-line consistent-return
export const createLabel = (state, bemBlock) => {
  if (isLabelVisible(state)) {
    const label = document.createElement('label');
    label.id = `${getViewId(state, bemBlock)}-label`;
    label.htmlFor = getViewId(state, bemBlock);
    label.className = `${bemBlock}__label`;
    label.textContent = getLabelValue(state);
    return label;
  }
};

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 */
export function createTooltipHTML(state, bemBlock) {
  const tooltip = document.createElement('div');
  tooltip.className = `${bemBlock}__${Constants.TOOLTIP} ${Constants.ADAPTIVE_FORM_TOOLTIP}`;
  tooltip.textContent = state?.tooltip;
  return tooltip;
}

export function renderTooltip(target, tooltip) {
  tooltip.style.visibility = 'hidden';
  document.body.append(tooltip);

  const targetPos = target.getBoundingClientRect();
  const tooltipPos = tooltip.getBoundingClientRect();

  let left = targetPos.left + (targetPos.width / 2) + window.scrollX - (tooltipPos.width / 2);
  let top = targetPos.top + window.scrollY - (tooltipPos.height + 10);
  let placement = 'top';

  if (left < 0) {
    placement = 'right';
    left = targetPos.left + targetPos.width + window.scrollX + 10;
    top = targetPos.top + (targetPos.height / 2) + window.scrollY - (tooltipPos.height / 2);
  }

  if (left + tooltipPos.width > document.documentElement.clientWidth) {
    placement = 'left';
    left = targetPos.left + window.scrollX - (tooltipPos.width + 10);
    top = targetPos.top + (targetPos.height / 2) + window.scrollY - (tooltipPos.height / 2);
  }

  if (top < 0) {
    placement = 'bottom';
    left = targetPos.left + (targetPos.width / 2) + window.scrollX - (tooltipPos.width / 2);
    top = targetPos.top + targetPos.height + window.scrollY + 10;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.className += ` ${Constants.ADAPTIVE_FORM_TOOLTIP}-${placement}`;
  tooltip.style.visibility = 'visible';
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 */
// eslint-disable-next-line consistent-return
export const createQuestionMarkHTML = (state, bemBlock) => {
  if (state?.tooltip) {
    const button = document.createElement('button');
    button.dataset.text = state?.tooltip;
    button.setAttribute('aria-label', 'Help Text');
    button.className = `${bemBlock}__${Constants.QM} ${Constants.ADAPTIVE_FORM_QM}`;

    const tooltip = createTooltipHTML(state, bemBlock);

    button.addEventListener('mouseenter', (event) => {
      renderTooltip(event.target, tooltip, bemBlock);
      event.stopPropagation();
    });

    button.addEventListener('mouseleave', (event) => {
      tooltip.remove();
      event.stopPropagation();
    });

    return button;
  }
};

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 */
// eslint-disable-next-line consistent-return
export const createLongDescHTML = (state, /** @type {string} */ bemBlock) => {
  if (state?.description) {
    const div = document.createElement('div');
    div.setAttribute('aria-live', 'polite');
    div.id = `${getViewId(state, bemBlock)}-${Constants.LONG_DESC}`;
    div.className = `${bemBlock}__${Constants.LONG_DESC} ${Constants.ADAPTIVE_FORM_LONG_DESC}`;

    const p = document.createElement('p');
    p.innerHTML = state?.description || '';
    div.append(p);
    return div;
  }
};

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 */
export const createErrorHTML = (state, /** @type {string} */ bemBlock) => {
  const div = document.createElement('div');
  div.id = `${getViewId(state, bemBlock)}-${Constants.ERROR_MESSAGE}`;
  div.className = `${bemBlock}__${Constants.ERROR_MESSAGE}`;
  return div;
};

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} element
 */
export const setDisabledAttribute = (state, element) => {
  element.disabled = state?.enabled === false;
};

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement | HTMLTextAreaElement} element
 */
export const setReadonlyAttribute = (state, element) => {
  element.readOnly = state?.readOnly === true;
};

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement | HTMLTextAreaElement} element
 */
export const setStringContraints = (state, element) => {
  const maxLength = state?.maxLength || 0;
  const minLength = state?.minLength || 0;
  if (minLength > 0) element.minLength = minLength;
  if (maxLength > 0) element.maxLength = maxLength;
  if (element instanceof HTMLInputElement && state?.pattern) element.pattern = state?.pattern;
};

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement} element
 */
export const setNumberConstraints = (state, element) => {
  const max = state?.maximum || 0;
  const min = state?.minimum || 0;
  if (max > 0) element.max = max?.toString();
  if (min > 0) element.min = min?.toString();
};

/**
 *
 * @param {HTMLDivElement} element
 * @returns
 */
export const getWidget = (element) => element?.querySelector(`[class$='${Constants.WIDGET}']`);

/**
 * @param {string} componentName
 * @return {Promise<any>} component
 */
export const loadComponent = async (componentName) => {
  try {
    return await import(`../components/${componentName}/${componentName}.js`);
  } catch (error) {
    console.error(`Unable to find module ${componentName}`, error);
  }
  return undefined;
};

/**
 * @param field
 * */
export const getRender = async (fieldModel) => {
  const block = document.createElement('div');
  try {
    let component; const
      fieldType = fieldModel?.fieldType || '';
    const widgetType = Constants.fieldTypeMappings[fieldType] || fieldType;
    if (!Constants.DEFAULT_INPUT_TYPES.includes(widgetType) && widgetType) {
      component = await loadComponent(widgetType);
    }
    if (component && component.default) {
      await component?.default(block, fieldModel);
    } else {
      defaultInput(block, fieldModel);
    }
  } catch (error) {
    console.error('Unexpected error ', error);
  }
  if (typeof fieldModel.name === 'string') {
    block.classList.add(fieldModel.name);
  }
  return block;
};
