/* eslint-disable import/no-cycle */
import * as defaultBuilder from './default-builder.js';
import * as customerBuilder from '../customization/custom-builder.js';

const result = { ...defaultBuilder, ...customerBuilder };
export default result;
