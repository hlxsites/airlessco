import { Constants } from './constants.js';

/**
 *
 * @param {HTMLDivElement} element
 * @returns {HTMLInputElement | null}
 */
export const getWidget = (element) => element.querySelector(`[class$='${Constants.WIDGET}']`);

export const getErrorWidget = (element) => element.querySelector(`[id$='${Constants.ERROR_MESSAGE}']`);

/**
 * @param {Element} element
 * @param {boolean} property
 * @param {string} dataAttribute
 * @param {string | boolean} value
 */
export const toggleAttribute = (element, property, dataAttribute, value) => {
  if (element) {
    if (property === false) {
      element.setAttribute(dataAttribute, `${value}`);
    } else {
      element.removeAttribute(dataAttribute);
    }
  }
};

/**
  *
  * @param {HTMLElement} element
  * @param {boolean} value
  */
export const setActive = (element, value) => {
  element?.setAttribute(Constants.DATA_ATTRIBUTE_ACTIVE, `${value}`);
};

/**
 * @param {HTMLDivElement} element
 * @param {string} value
 */
export const updateValue = (element, value) => {
  const widget = getWidget(element);
  if (widget) widget.value = value;
};

/**
 * @param {Element} element
 * @param {boolean} valid
 * @param {any} state
 */
export const updateValid = (element, valid, state) => {
  if (element) {
    toggleAttribute(element, valid, Constants.ARIA_INVALID, true);
    element.setAttribute(Constants.DATA_ATTRIBUTE_VALID, `${valid}`);
    if (typeof state.errorMessage !== 'string' || state.errorMessage === '') {
      const errMessage = valid === true ? '' : 'Please fill in this field.';
      const errorDiv = getErrorWidget(element);
      if (errorDiv) errorDiv.innerHTML = errMessage;
    }
  }
};

export const updateErrorMessage = (
  /** @type {{ querySelector: (arg0: string) => any; }} */ element,
  /** @type {any} */ errorMessage,
  /** @type {{ errorMessage: any; }} */ state,
) => {
  if (element) {
    const errorDiv = getErrorWidget(element);
    if (errorDiv) errorDiv.innerHTML = state.errorMessage;
  }
};

/**
 *
 * @param {Element} element
 * @param {boolean} visible
 */
export const updateVisible = (element, visible) => {
  toggleAttribute(element, visible, Constants.ARIA_HIDDEN, true);
  element?.setAttribute(Constants.DATA_ATTRIBUTE_VISIBLE, `${visible}`);
};

/**
 *
 * @param {HTMLDivElement} element
 * @param {boolean} enabled
 */
export const updateEnabled = (element, enabled) => {
  if (element) {
    const widget = getWidget(element);
    toggleAttribute(element, enabled, Constants.ARIA_DISABLED, true);
    element?.setAttribute(Constants.DATA_ATTRIBUTE_ENABLED, `${enabled}`);
    if (enabled === false) {
      widget?.setAttribute('disabled', 'true');
      widget?.setAttribute(Constants.ARIA_DISABLED, 'true');
    } else {
      widget?.removeAttribute('disabled');
      widget?.removeAttribute(Constants.ARIA_DISABLED);
    }
  }
};

/**
 * Default UI update handlers.
 * @returns object of key and functions
 */
const deafultHandlers = () => ({
  value: updateValue,
  valid: updateValid,
  visible: updateVisible,
  enabled: updateEnabled,
  errorMessage: updateErrorMessage,
});

/**
 * @param {any} model Field Model
 * @param {Element} element
 * @param {any | undefined} additionalHandlers
 */
export const subscribe = (model, element, additionalHandlers) => {
  const handlers = { ...deafultHandlers(), ...additionalHandlers };
  model?.subscribe((
    /** @type {{ target: { getState: () => any; }; payload: { changes: any; }; }} */ action,
  ) => {
    const state = action.target.getState();
    const { changes } = action.payload;
    changes.forEach((
      /** @type {{ propertyName: string; prevValue: any; currentValue: any; }} */ change,
    ) => {
      const handler = handlers[change.propertyName];
      if (handler && handler instanceof Function) {
        // items applicable for repeatable panel
        if (change.propertyName === 'items') {
          handler(element, change.prevValue, change.currentValue, state);
        } else {
          handler(element, change.currentValue, state);
        }
      } else {
        console.error(`changes to ${change.propertyName} are not supported. Please raise an issue`);
      }
    });
  });
};
