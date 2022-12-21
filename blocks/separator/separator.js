export default function decorate(block) {
    const separator = document.createElement('hr');
    separator.className = "separator-style";
    block.append(separator);
  }