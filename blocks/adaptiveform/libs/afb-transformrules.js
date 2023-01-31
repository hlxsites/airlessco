const TOK_EQ = 'EQ';
const TOK_GT = 'GT';
const TOK_LT = 'LT';
const TOK_GTE = 'GTE';
const TOK_LTE = 'LTE';
const TOK_NE = 'NE';

// eslint-disable-next-line import/prefer-default-export
export class ExcelToJsonFormula {
  numberRegEx = /\d+/;

  constructor(rowNumberFieldMap, globals) {
    this.rowNumberFieldMap = rowNumberFieldMap;
    this.globals = globals;
  }

  transform(node, value) {
    this.expression = '';
    return this.visit(node, value);
  }

  visit(n, v) {
    const visitFunctions = {
      Field: (node) => {
        const name = node?.name;
        const match = this.numberRegEx.exec(name);
        const rowNo = match?.[0];
        const field = this.rowNumberFieldMap?.get(rowNo * 1);
        if (!field) throw new Error(`Unknown column used in excel formula ${node.name}`);
        return field?.name;
      },

      Subexpression: (node) => {
        let result = this.visit(node.children[0]);
        for (let i = 1; i < node.children.length; i += 1) {
          result = this.visit(node.children[1]);
          if (result === null) return null;
        }
        return result;
      },

      IndexExpression: (node) => {
        const left = this.visit(node.children[0]);
        return this.visit(node.children[1], left);
      },

      Comparator: (node, value) => {
        const first = this.visit(node.children[0], value);
        const second = this.visit(node.children[1], value);

        if (node.name === TOK_EQ) return `(${first} == ${second})`;
        if (node.name === TOK_NE) return `(${first} != ${second})`;
        if (node.name === TOK_GT) return `(${first} > ${second})`;
        if (node.name === TOK_GTE) return `(${first} >= ${second})`;
        if (node.name === TOK_LT) return `(${first} < ${second})`;
        if (node.name === TOK_LTE) return `(${first} <= ${second})`;
        throw new Error(`Unknown comparator: ${node.name}`);
      },

      // eslint-disable-next-line arrow-body-style
      MultiSelectList: (node) => {
        // if (value === null) return null;
        return node.children.map((child) => this.visit(child));
      },

      MultiSelectHash: (node) => {
        // if (value === null) return null;
        const collected = {};
        node.children.forEach((child) => {
          collected[child.name] = this.visit(child.value);
        });
        return collected;
      },

      OrExpression: (node) => {
        const matched = this.visit(node.children[0]);
        // if (isFalse(matched)) matched = this.visit(node.children[1]);
        return matched;
      },

      AndExpression: (node) => {
        // eslint-disable-next-line no-unused-vars
        const first = this.visit(node.children[0]);

        // if (isFalse(first) === true) return first;
        return this.visit(node.children[1]);
      },

      AddExpression: (node) => {
        const first = this.visit(node.children[0]);
        const second = this.visit(node.children[1]);
        return this.applyOperator(first, second, '+');
      },

      ConcatenateExpression: (node) => {
        const first = this.visit(node.children[0]);
        const second = this.visit(node.children[1]);
        return this.applyOperator(first, second, '&');
      },

      SubtractExpression: (node, value) => {
        const first = this.visit(node.children[0], value);
        const second = this.visit(node.children[1], value);
        return this.applyOperator(first, second, '-');
      },

      MultiplyExpression: (node, value) => {
        const first = this.visit(node.children[0], value);
        const second = this.visit(node.children[1], value);
        return this.applyOperator(first, second, '*');
      },

      DivideExpression: (node, value) => {
        const first = this.visit(node.children[0], value);
        const second = this.visit(node.children[1], value);
        return this.applyOperator(first, second, '/');
      },

      PowerExpression: (node, value) => {
        const first = this.visit(node.children[0], value);
        const second = this.visit(node.children[1], value);
        return this.applyOperator(first, second, '^');
      },

      UnaryMinusExpression: (node, value) => {
        const first = this.visit(node.children[0], value);
        return first * -1;
      },

      Literal: (node) => `'${node.value}'`,

      Number: (node) => node.value,

      Function: (node) => {
        const resolvedArgs = node.children.map((child) => this.visit(child));
        return this.transformFunction(node, resolvedArgs);
      },
    };
    const fn = n && visitFunctions[n.type];
    if (!fn) throw new Error(`Unknown/missing node type ${(n && n.type) || ''}`);
    return fn(n, v);
  }

  // eslint-disable-next-line class-methods-use-this
  applyOperator(first, second, operator) {
    return `(${first} ${operator} ${second})`;
  }

  // eslint-disable-next-line class-methods-use-this
  transformFunction(node, resolvedArgs) {
    if (node.name === 'min') {
      return `${node.name}([${resolvedArgs}])`;
    }
    return `${node.name}(${resolvedArgs})`;
  }
}
