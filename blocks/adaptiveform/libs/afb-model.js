/**
 * @param {any} state FieldJson
 *
 * @return {boolean}
 */
export const isArrayType = (state) => state.type === 'array' || state?.type?.includes('[]') || false;

/**
 * @param {any} state FieldJson
 *
 * @return {boolean}
 */
export const isLabelVisible = (state) => (state?.label?.visible === true
  || state?.label?.visible === undefined);
/**
 * @param {any} state FieldJson
 *
 * @return {string}
 */
export const getLabelValue = (state) => state?.label?.value || '';

/**
 * @param {any} state FieldJson
 *
 * @return {string}
 */
export const getTooltipValue = (state) => state?.tooltip;

/**
 * @param {any} state FieldJson
 *
 * @return {boolean}
 */
export const isTooltipVisible = (state) => (!!getTooltipValue(state));

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock
 *
 * @return {string}
 */
export const getViewId = (state, bemBlock) => `${bemBlock}-${state?.id}`;

/**
 * @param {any} state FieldJson
 *
 * @return {any}
 */
export const getLayoutProperties = (state) => {
  let layoutProperties = {};
  if (state && state.properties && state.properties['afs:layout']) {
    layoutProperties = state.properties['afs:layout'];
  }
  return layoutProperties;
};
