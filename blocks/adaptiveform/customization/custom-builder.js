/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/no-cycle
import { createLabel as cl } from '../libs/default-builder.js';

/**
 * Example of overriding to inlcude start
 * @param {*} state
 * @param {*} bemBlock
 * @returns
 */
export const createLabel = (state, bemBlock) => {
  const label = cl(state, bemBlock);
  if (label) {
    label.textContent = state?.required ? `${label?.textContent} *` : label?.textContent;
  }
  return label;
};
