import ExcelToFormModel from './libs/afb-transform.js';
import { createFormInstance, registerFunctions } from './libs/afb-runtime.js';
import * as builder from './libs/afb-builder.js';
import { customFunctions } from './customization/custom-functions.js';
import { Constants } from './libs/constants.js';

export class AdaptiveForm {
  model;

  #form;

  element;

  /**
   * @param {HTMLLinkElement} element
   * @param {any} formJson
   */
  constructor(element, formJson) {
    this.element = element;
    this.model = createFormInstance(formJson, undefined);
    this.model?.subscribe(this.submitSucess, Constants.SUBMIT_SUCCESS);
    this.model?.subscribe(this.submitFailure, Constants.SUBMIT_FAILURE);
    registerFunctions(customFunctions);
  }

  submitSucess = async () => {
    const redirect = this.metadata?.redirect || 'thankyou';
    window.open(redirect, '_self');
  };

  static submitFailure = async (args) => {
    console.log('Arg', args);
    alert('Submit failed');
  };

  /**
   * @param {string} id
   */
  getModel(id) {
    return this.model?.getElement(id);
  }

  render = async () => {
    const form = document.createElement('form');
    form.className = 'cmp-adaptiveform-container cmp-container';
    this.#form = form;

    const state = this.model?.getState();
    await this.renderChildren(form, state);
    return form;
  };

  /**
   * @param {HTMLFormElement}  form
   * @param {import("afcore").State<import("afcore").FormJson>} state
   * */
  renderChildren = async (form, state) => {
    const fields = state?.items;
    if (fields && fields.length > 0) {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const index in fields) {
        const field = fields[index];
        const fieldModel = this.getModel(field.id);
        // eslint-disable-next-line no-await-in-loop
        const element = await builder?.default?.getRender(fieldModel);
        form.append(element);
      }
    }
  };
}

/**
  * @param {HTMLLinkElement} formLink
  * */
const createFormContainer = async (placeholder, url) => {
  const transform = new ExcelToFormModel();
  const convertedData = await transform.getFormModel(url);
  const adaptiveform = new AdaptiveForm(placeholder, convertedData?.formDef);
  window.adaptiveform = adaptiveform;
  const form = await adaptiveform.render();
  placeholder?.replaceWith(form);
  return adaptiveform;
};

/**
   * @param {{ querySelector: (arg0: string) => HTMLLinkElement | null; }} block
   */
export default async function decorate(block) {
  const formLink = block?.querySelector('a[href$=".json"]');
  const formLinkWrapper = formLink?.parentElement;

  if (!formLink || !formLink.href) {
    throw new Error("No formdata action is provided, can't render adaptiveformblock");
  }

  // eslint-disable-next-line no-return-await
  return await createFormContainer(formLinkWrapper || formLink, formLink.href);
}
