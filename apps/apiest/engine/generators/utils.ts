export function isWatchMode() {
  return process.argv.includes('--watch');
}

export function firstLetterToUpperCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export function firstLetterToLowerCase(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

export function t(n = 1, x = 2) {
  let result = '';

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < x; j++) {
      result += ' ';
    }
  }

  return result;
}

export function nl(n = 1) {
  let result = '';

  for (let i = 0; i < n; i++) {
    result += '\n';
  }

  return result;
}

export function code(lines: string[], tabs = 0, newLines = 1) {
  return lines
    .map(
      (line) =>
        t(tabs) + line.replace(/ +\n/gm, '\n').replace(/\n/g, '\n' + t(tabs)),
    )
    .join(nl(newLines));
}

export function genProp(key: string, type: string, required = true) {
  return `${key}${required ? '' : '?'}: ${type};`;
}
