/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { ExcelToJsonFormula } from './afb-transformrules.js';
import Formula from './json-formula.js';

const PROPERTY = 'property';
const PROPERTY_RULES = 'rules.properties';

/**
 * @param {string} formPath
 */
const getForm = async function getForm(formPath) {
  if (!formPath) {
    throw new Error('formPath is required');
  }
  const resp = await fetch(formPath);
  const json = await resp.json();
  return json;
};

const initFormDef = function initFormDef(formPath) {
  return {
    adaptiveform: '0.10.0',
    metadata: {
      grammar: 'json-formula-1.0.0',
      version: '1.0.0',
    },
    properties: {},
    rules: {},
    items: [],
    action: formPath?.split('.json')[0],
  };
};

export default class ExcelToFormModel {
  rowNumberFieldMap = new Map();

  panelMap = new Map();

  interpreter = new ExcelToJsonFormula(this.rowNumberFieldMap);

  errors = [];

  fieldPropertyMapping = {
    Default: 'default',
    MaxLength: 'maxLength',
    MinLength: 'minLength',
    Maximum: 'maximum',
    Minimum: 'minimum',
    Step: 'step',
    Pattern: 'pattern',
    Value: 'value',
    Placeholder: 'placeholder',
    Field: 'name',
    ReadOnly: 'readOnly',
    Description: 'description',
    Type: 'fieldType',
    Label: 'label.value',
    Mandatory: 'required',
    Options: 'enum',
  };

  static fieldMapping = new Map([
    ['text-input', 'text'],
    ['number-input', 'number'],
    ['date-input', 'datetime-local'],
    ['file-input', 'file'],
    ['drop-down', 'select'],
    ['radio-group', 'radio-group'],
    ['checkbox-group', 'checkbox-group'],
    ['plain-text', 'plain-text'],
    ['checkbox', 'checkbox'],
    ['multiline-input', 'textarea'],
    ['panel', 'panel'],
    ['submit', 'button'],
  ]);

  #initField() {
    return {
      constraintMessages: {
        required: 'Please fill in this field.',
      },
    };
  }

  /**
     * @param {string} formPath
     */
  // eslint-disable-next-line consistent-return
  async getFormModel(formPath) {
    if (formPath) {
      console.time('Get Excel JSON');
      const exData = await getForm(formPath);
      console.timeEnd('Get Excel JSON');
      return this.transform(exData, formPath, false);
    }
  }

  /**
     * @param {{ total?: number; offset?: number; limit?: number; data: any; ":type"?: string; adaptiveform?: any; }} exData
     * @param {string} formPath
     *
     * @return {{formDef: any, excelData: any}} response
     */
  transform(exData, formPath, validateRules) {
    this.errors = [];
    // if its adaptive form json just return it.
    if (exData?.adaptiveform) {
      return { formDef: exData, excelData: null };
    }
    if (!exData || !exData.data) {
      throw new Error(`Unable to retrieve the form details from ${formPath}`);
    }
    const formDef = initFormDef(formPath);

    this.panelMap.set('root', formDef);

    const transformRules = [];
    let rowNo = 2;

    exData.data.forEach((/** @type {{ [s: string]: any; } | ArrayLike<any>} */ item) => {
      // eslint-disable-next-line no-unused-vars
      const source = Object.fromEntries(Object.entries(item).filter(([_, v]) => (v != null && v !== '')));
      let field = { ...source, ...this.#initField() };
      if (item.name || item.Field) {
        this.#transformFieldNames(field);

        if (this.#isProperty(field)) {
          this.#handleProperites(formDef, field);
        } else {
          if (field?.fieldType === 'panel') {
            this.panelMap.set(field?.name, field);
          }
          field = this.#handleField(field);
          this.#addToParent(field);
          if (field?.rules?.value && field?.rules?.value?.charAt(0) === '=') {
            transformRules.push(field);
          }
        }
      }
      // always add field to avoid difference in row number and excel number.
      this.rowNumberFieldMap.set(rowNo, field);
      rowNo += 1;
    });

    this.#transformExcelForumulaToRule(transformRules, validateRules);
    this.#transformPropertyRules(formDef);
    return { formDef, excelData: exData, errors: this.errors };
  }

  /**
     * @param {any} formDef Headless Form definition
     * @param {any} field
     */
  #handleProperites(formDef, field) {
    formDef.properties[field.name] = field.default;
    // eslint-disable-next-line no-prototype-builtins
    if (field.hasOwnProperty(PROPERTY_RULES)) {
      if (!formDef.rules.properties) {
        formDef.rules.properties = [];
      }
      formDef.rules.properties.push(`{${field.name}: ${field[PROPERTY_RULES]}}`);
    }
  }

  /**
     * @param {any} formDef Headless Form definition
     */
  #transformPropertyRules(formDef) {
    if (formDef.rules.properties) {
      let properites = 'merge($properties';
      formDef.rules.properties.forEach((/** @type {string} */ rule) => {
        properites = `${properites},${rule}`;
      });
      properites += ')';
      formDef.rules.properties = properites;
    }
  }

  /**
     * Transform flat field to Crispr Field
     * @param {any} field
     * @returns
     */
  #handleField(field) {
    this.#transformFieldType(field);
    this.#transformFlatToHierarchy(field);

    this.#handleMultiValues(field, 'enum');
    this.#handleMultiValues(field, 'enumNames');

    this.#handleFranklinSpecialCases(field);
    this.#handlePanel(field);
    return field;
  }

  /**
     * Transform CRISPR fieldType to HTML Input Type.
     * @param {any} field FieldJson
     */
  #transformFieldType(field) {
    if (ExcelToFormModel.fieldMapping.has(field?.fieldType)) {
      field.fieldType = ExcelToFormModel.fieldMapping.get(field?.fieldType);
    }
  }

  /**
     * Convert Field names from Franklin Form to crispr def.
     * @param {any} field Form Def received from excel
     */
  #transformFieldNames(field) {
    Object.keys(this.fieldPropertyMapping).forEach((key) => {
      if (field[key]) {
        field[this.fieldPropertyMapping[key]] = field[key];
        delete field[key];
      }
    });
  }

  /**
     * Convert flat field to hierarchy based on dot notation.
     * @param {any} item Flat field Definition
     * @returns
     */
  #transformFlatToHierarchy(item) {
    Object.keys(item).forEach((key) => {
      if (key.includes('.')) {
        let temp = item;
        key.split('.').forEach((k, i, values) => {
          // eslint-disable-next-line no-multi-assign, no-nested-ternary
          temp = (temp[k] = (i === values.length - 1 ? item[key] : (temp[k] != null ? temp[k] : {})));
        });
        delete item[key];
      }
    });
  }

  /**
     * handle multivalues field i.e. comma seprator to array.
     * @param {{ [x: string]: any; }} item
     * @param {string | number} key
     */
  #handleMultiValues(item, key) {
    let values;
    if (item && item[key]) {
      values = item[key].split(',').map((value) => value.trim());
      item[key] = values;
    }
  }

  /**
     * Handle special use cases of Franklin.
     * @param {{ required: string | boolean; }} item
     */
  #handleFranklinSpecialCases(item) {
    // Franklin Mandatory uses x for true.
    item.required = (item.required === 'x' || item.required === 'true');
  }

  /**
     * Handle Panel related transformation.
     * @param {*} field
     */
  #handlePanel(field) {
    if (field?.fieldType === 'panel') {
      // Ignore name if type is not defined on panel.
      if (typeof field?.type === 'undefined') {
        field.dataName = field.name;
        field.name = null;
      }
    }
  }

  /**
     * @param {any} field FieldJson
     */
  #isProperty(field) {
    return field && field.fieldType === PROPERTY;
  }

  /**
     * Add the field to its relevant parent items.
     * @param {Object} field
     */
  #addToParent(field) {
    const parent = field?.parent || 'root';
    const parentField = this.panelMap.get(this.panelMap.has(parent) ? parent : 'root');
    parentField.items = parentField.items || [];
    parentField.items.push(field);
    delete field?.parent;
  }

  /**
     * Transform excel formula to json formula
     * @param {*} fields
     */
  #transformExcelForumulaToRule(fields, validate) {
    fields?.forEach((field) => {
      const valueRule = field?.rules?.value;
      if (valueRule && valueRule.charAt(0) === '=') {
        try {
          const excelExpression = valueRule?.slice(1)?.replaceAll('"', "'")?.toLowerCase(); // better way to handle double to single quotes
          let formula = new Formula();
          const ast = formula.compile(excelExpression);
          const jsonExpression = this.interpreter.transform(ast);
          if (validate) {
            formula = new Formula();
            formula.search(jsonExpression, {});
          }
          field.rules.value = jsonExpression;
        } catch (e) {
          this.errors.push({ rule: valueRule, error: e.message });
        }
      }
    });
  }
}
