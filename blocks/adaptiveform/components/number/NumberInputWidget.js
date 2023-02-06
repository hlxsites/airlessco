/**
 * This class is responsible for interacting with the numeric input widget.
 * It implements edit/display format for numeric input, along with the following features
 * - Convert's input type number to text to support display/edit format (for example `$` symbol)
 * - One cannot type or paste alphabets in the html input element
 */

// refer http://www.fileformat.info/info/unicode/block/halfwidth_and_fullwidth_forms/utf8test.htm
const toLatinForm = (halfOrFullWidthStr) => halfOrFullWidthStr.replace(
  /[\uff00-\uffef]/g,
  (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
);

const escape = (str) => str.replace('.', '\\.');

const getHTMLSupportedAttr = (domElement, attr) => {
  try {
    return domElement[attr];
  } catch (err) {
    return undefined;
  }
};

// In IE, event.key returns words instead of actual characters for some keys.
const isNonPrintableKey = (key) => (key
          && !['MozPrintableKey', 'Divide', 'Multiply', 'Subtract', 'Add', 'Enter', 'Decimal', 'Spacebar', 'Del'].includes(key)
          && key.length !== 1);

export default class NumericInputWidget {
  #widget = null;

  #model = null; // passed by reference

  #options = null;

  #defaultOptions = {
    value: null,
    curValue: null,
    pos: 0,
    lengthLimitVisible: true,
    zero: '0',
    decimal: '.',
    minus: '-',
  };

  // TODO: to support writing in different locales \d should be replaced by [0-9]
  // for different locales
  #matchArray = {
    integer: '^[+-]?{digits}*$',
    decimal: '^[+-]?{digits}{leading}({decimal}{digits}{fraction})?$',
    float: '^[+-]?{digits}*({decimal}{digits}*)?$',
  };

  #regex = null;

  #processedValue = null;

  #engRegex = null;

  #writtenInLocale = false;

  #previousCompositionVal = '';

  constructor(widget, model) {
    // initialize the widget and model
    this.#widget = widget;
    this.#model = model;
    // initialize options for backward compatibility
    // eslint-disable-next-line no-underscore-dangle
    this.#options = { ...this.#defaultOptions, ...this.#model._jsonModel };
    let matchStr = this.#matchArray[this.#options.dataType];
    if (matchStr) {
      const ld = this.#options.leadDigits;
      const fd = this.#options.fracDigits;
      const ldstr = ld && ld !== -1 ? `{0,${ld}}`
        : '*';
      const fdstr = fd && fd !== -1 ? `{0,${fd}}`
        : '*';
      matchStr = matchStr.replace('{leading}', ldstr)
        .replace('{fraction}', fdstr);
      const localeStr = matchStr.replace(/{digits}/g, this.#getDigits())
        .replace('{decimal}', escape(this.#options.decimal));
      const engStr = matchStr.replace(/{digits}/g, '[0-9]')
        .replace('{decimal}', '\\.');
      this.#processedValue = !(this.#getDigits() === '[0123456789]' && this.#options.decimal === '.');
      this.#regex = new RegExp(localeStr, 'g');
      this.#engRegex = new RegExp(engStr, 'g');
    }
    // change the input type to text for patterns
    this.#widget.setAttribute('type', 'text');
    this.#attachEventHandlers(widget);
  }

  #attachEventHandlers(widget) {
    widget.addEventListener('keydown', (e) => {
      this.#handleKeyDown(e);
    });
    widget.addEventListener('keypress', (e) => {
      this.#handleKeyPress(e);
    });
    widget.addEventListener('focus', () => {
      this.#widget.value = this.#model.value;
      // if (this.element) setActive(this.element, true);
    });
    widget.addEventListener('paste', (e) => {
      this.#handlePaste(e);
    });
    widget.addEventListener('cut', (e) => {
      this.#handleCut(e);
    });
    widget.addEventListener('blur', (e) => {
      this.#model.value = this.getValue(e.target.value);
      this.#widget.value = this.#model.displayValue;
      // if (this.element) setActive(this.element, false);
    });
    // IME specific handling, to handle japanese languages max limit
    this.#attachCompositionEventHandlers(widget);
  }

  #attachCompositionEventHandlers(widget) {
    // let isComposing = false; // IME Composing going on
    let hasCompositionJustEnded = false; // Used to swallow keyup event related to compositionend
    // IME specific handling, to handle japanese languages max limit
    // since enter can also be invoked during composing, a special handling is done here
    const that = this;
    const changeCaratPosition = function () {
      // change the carat selection position to further limit input of characters
      const range = window.getSelection();
      range.selectAllChildren(widget);
      range.collapseToEnd();
    };
    widget.addEventListener('keyup', (event) => {
      if (/* isComposing || */hasCompositionJustEnded) {
        if (that.#compositionUpdateCallback(event)) {
          changeCaratPosition();
        }
        // IME composing fires keydown/keyup events
        hasCompositionJustEnded = false;
      }
    });
    widget.addEventListener(
      'compositionstart',
      () => {
        // isComposing = true;
      },
    );
    widget.addEventListener(
      'compositionupdate',
      (event) => {
        // event.originalEvent.data refers to the actual content
        if (that.#compositionUpdateCallback(event)) {
          changeCaratPosition();
        }
      },
    );
    widget.addEventListener(
      'compositionend',
      () => {
        // isComposing = false;
        // some browsers (IE, Firefox, Safari) send a keyup event after
        //  compositionend, some (Chrome, Edge) don't. This is to swallow
        // the next keyup event, unless a keydown event happens first
        hasCompositionJustEnded = true;
      },
    );
    widget.addEventListener(
      'keydown',
      (event) => {
        // Safari on OS X may send a keydown of 229 after compositionend
        if (event.which !== 229) {
          hasCompositionJustEnded = false;
        }
      },
    );
  }

  #getDigits() {
    const zeroCode = this.#options.zero.charCodeAt(0);
    let digits = '';
    for (let i = 0; i < 10; i += 1) {
      digits += String.fromCharCode(zeroCode + i);
    }
    return `[${digits}]`;
  }

  getValue(val) {
    // we support full width, half width and locale specific numbers
    let value = toLatinForm(val);
    if (value.length > 0 && this.#processedValue && !value.match(this.#engRegex)) {
      this.#writtenInLocale = true;
      value = this.#convertValueFromLocale(value);
    } else {
      this.#writtenInLocale = false;
    }
    if (value && value.length >= this.#options.combCells) {
      value = value.slice(0, this.#options.combCells);
    }
    this.#previousCompositionVal = value;
    return value;
  }

  #compositionUpdateCallback(event) {
    const that = this;
    let flag = false;
    const { leadDigits } = that.#options;
    const { fracDigits } = that.#options;
    // we don't check use-case where just fracDigits is set since in case of
    // composition update, the value to update is not known
    if (leadDigits !== -1) {
      let val = this.#widget.value;
      if (event.type === 'compositionupdate' && event.originalEvent.data) {
        val += event.originalEvent.data.substr(event.originalEvent.data.length - 1);
      }
      // can't use the existing regex (since current regex checks
      // for english digits), rather doing leadDigit compare
      const frcDigits = fracDigits !== -1 ? (fracDigits + that.#options.decimal.length) : 0;
      let totalLength = leadDigits + frcDigits;
      if (val.indexOf(that.#options.decimal) === -1) {
        totalLength = leadDigits;
      }
      const latinVal = toLatinForm(val);
      // match both since we support full width, half width and locale specific input
      const match = latinVal.match(that.#regex) || latinVal.match(this.#engRegex);
      flag = !match;
      if (match === null) {
        // entered invalid character, revert to previous value
        that.#widget.value = that.#previousCompositionVal;
        flag = true;
      } else if (flag) {
        // if max reached
        const newVal = val.substr(0, totalLength);
        that.#widget.value = newVal;
        that.#previousCompositionVal = newVal;
        flag = true;
      } else {
        that.#previousCompositionVal = val;
      }
    }
    return flag;
  }

  trigger(event, detail) {
    if (!this.#widget) {
      return this;
    }
    const eventName = event.split('.')[0];
    const isNativeEvent = typeof document.body[`on${eventName}`] !== 'undefined';
    if (isNativeEvent) {
      this.#widget.dispatchEvent(new Event(eventName));
      return this;
    }
    const customEvent = new CustomEvent(eventName, {
      detail: detail || null,
    });
    this.#widget.dispatchEvent(customEvent);
    return this;
  }

  #handleKeyInput(event, character) {
    if (event.ctrlKey && !(['paste', 'cut'].includes(event.type))) {
      return true;
    }

    // eslint-disable-next-line prefer-rest-params
    this.#handleKeyDown(arguments);
    this.#options.lengthLimitVisible = true;
    const val = this.#widget.value;
    // if selectionStart attribute isn't supported then its value will be undefined
    const selectionStart = getHTMLSupportedAttr(this.#widget, 'selectionStart') || 0;
    const isSelectionAttrSupported = !(selectionStart === undefined || selectionStart === null);
    const selectionEnd = getHTMLSupportedAttr(this.#widget, 'selectionEnd') || 0;
    const combCells = parseInt(this.#options.combCells, 10) || 0;
    let change = character;

    if (combCells > 0) {
      change = character.substr(0, combCells - val.length + selectionEnd - selectionStart);
    }

    // CQ-4245407 : selectionStart and selectionEnd attributes aren't
    // supported in case of input type = number. It is used for providing
    // native HTML5 implementation for numeric field, so no further processing
    // is required. As it is specific to AF and AF doesn't support change
    // event on each keypress, so this change should be fine
    if (!isSelectionAttrSupported) {
      return true;
    }

    const current = val.substr(0, selectionStart) + change + val.substr(selectionEnd);
    // done to handle support for both full width, half width or mixed input in number field
    const latinCurrentValue = toLatinForm(current);

    if (!(this.#regex == null
        || latinCurrentValue.match(this.#regex)
        || latinCurrentValue.match(this.#engRegex))) {
      event.preventDefault();
      return false;
    }
    if (!(['keydown', 'cut'].includes(event.type))
        && combCells
        && (val.length >= combCells
        || current.length > combCells)
        && selectionStart === selectionEnd) {
      event.preventDefault();
      return false;
    }

    this.#options.curValue = val;
    this.#previousCompositionVal = val;
    this.#options.pos = selectionStart;
    return false;
  }

  #handleKeyDown(event) {
    if (event) {
      const code = event.charCode || event.which || event.keyCode || 0;
      // backspace and del
      if (code === 8 || code === 46) {
        this.#handleKeyInput(event, '', code);
      } else if (code === 32) { // suppress space
        event.preventDefault();
        return false;
      }
    }
    return false;
  }

  #isValidChar(char) {
    const character = toLatinForm(char);
    const lastSingleDigitChar = String.fromCharCode(this.#options.zero.charCodeAt(0) + 9);
    // we only full width, half width and also locale specific if customer has
    // overlayed the i18n file
    return (character >= '0' && character <= '9')
      || (character >= this.#options.zero && character <= lastSingleDigitChar)
      || character === this.#options.decimal || character === this.#options.minus;
  }

  #handleKeyPress(event) {
    if (event) {
      const code = event.charCode || event.which || event.keyCode || 0;
      const character = String.fromCharCode(code);

      if (isNonPrintableKey(event.key)) { // mozilla also generates a keypress, along with keydown
        return true; // for all keys, so only handling printable keys in keypress
      }

      if (this.#isValidChar(character)) this.#handleKeyInput(event, character, code);
      else if (!event.ctrlKey) {
        event.preventDefault();
        return false;
      }
    }
    return false;
  }

  #handlePaste(event) {
    if (event) {
      // get the contents
      let pastedChar;
      if (window.clipboardData && window.clipboardData.getData) { // IE
        pastedChar = window.clipboardData.getData('Text');
      } else if ((event.originalEvent || event).clipboardData
        && (event.originalEvent || event).clipboardData.getData) {
        pastedChar = (event.originalEvent || event).clipboardData.getData('text/plain');
      }

      if (pastedChar) {
        const allPastedCharsValid = pastedChar.split('').every(function (character) {
          return this.#isValidChar(character);
        }, this);
        if (allPastedCharsValid) {
          // during paste we support both half width, full width and locale specific numbers
          pastedChar = toLatinForm(pastedChar);
          this.#handleKeyInput(event, pastedChar, 0);
        } else if (!event.ctrlKey) {
          event.preventDefault();
          return false;
        }
      }
    }
    return false;
  }

  #handleCut(event) {
    if (event) {
      this.#handleKeyInput(event, '', 0);
    }
  }

  #convertValueToLocale(val) {
    const zeroCode = this.#options.zero.charCodeAt(0);
    return val.map(function (c) {
      if (c === '.') {
        return this.#options.decimal;
      } if (c === '-') {
        return this.#options.minus;
      }
      return String.fromCharCode(parseInt(c, 10) + zeroCode);
    }, this).join('');
  }

  #convertValueFromLocale(v) {
    const val = toLatinForm(v);
    const zeroCode = this.#options.zero.charCodeAt(0);
    return val.map(function (c) {
      if (c === this.#options.decimal) {
        return '.';
      } if (c === this.#options.minus) {
        return '-';
      }
      return (c.charCodeAt(0) - zeroCode).toString();
    }, this).join('');
  }

  /**
     * Checks if the edit value is same as value present in the user control(html form element)
     * @returns {boolean}
     */
  #isValueSame() {
    return (((this.#model.value === null) && (this.#widget.value === ''))
      || (this.#model.value === this.#widget.value));
  }

  setValue(value) {
    // if the value is same, don't do anything
    if (!this.#isValueSame()) {
      if (value && this.#writtenInLocale) {
        this.#widget.value = this.#convertValueToLocale(value);
      } else {
        this.#widget.value = this.#model.displayValue;
      }
    }
  }
}
