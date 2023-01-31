import { getWidget } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import { Checkbox } from '../checkbox/checkbox.js';

export class Radio extends Checkbox {
  blockName = Constants.RADIO;

  updateValue = (element, value) => {
    const widget = getWidget(element);
    widget.checked = this.model.enum?.[0] === value;
    if (widget.checked) {
      widget.setAttribute(Constants.HTML_ATTRS.CHECKED, Constants.HTML_ATTRS.CHECKED);
      widget.setAttribute(Constants.ARIA_CHECKED, `${true}`);
    } else {
      widget.removeAttribute(Constants.HTML_ATTRS.CHECKED);
      widget.setAttribute(Constants.ARIA_CHECKED, `${false}`);
    }
  };
}

export default async function decorate(block, model) {
  const radio = new Radio(block, model);
  radio.render();
}
