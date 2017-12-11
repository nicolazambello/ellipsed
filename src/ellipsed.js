/*
 *   Copyright (C) 2017  Nicola Zambello
 *
 *    The JavaScript code in this page is open source software licensed under MIT license
 *    References about this code and its license, see:
 *
 *    https://github.com/nzambello/ellipsed
 *
 */

function tokensReducer(acc, token) {
  const { el, elStyle, elHeight, rowsLimit, rowsWrapped, options } = acc;
  if (rowsWrapped === rowsLimit + 1) {
    return { ...acc };
  }
  const textBeforeWrap = el.textContent;
  let newRowsWrapped = rowsWrapped;
  let newHeight = elHeight;
  el.textContent = el.textContent.length
    ? `${el.textContent} ${token}${options.replaceStr}`
    : `${token}${options.replaceStr}`;

  if (parseFloat(elStyle.height) > parseFloat(elHeight)) {
    newRowsWrapped++;
    newHeight = elStyle.height;

    if (newRowsWrapped === rowsLimit + 1) {
      el.innerHTML =
        textBeforeWrap[textBeforeWrap.length - 1] === '.' && options.replaceStr === '...'
          ? `${textBeforeWrap}..`
          : `${textBeforeWrap}${options.replaceStr}`;

      return { ...acc, elHeight: newHeight, rowsWrapped: newRowsWrapped };
    }
  }

  el.textContent = textBeforeWrap.length ? `${textBeforeWrap} ${token}` : `${token}`;

  return { ...acc, elHeight: newHeight, rowsWrapped: newRowsWrapped };
}

function ellipsis(selector = '', rows = 1, options = {}) {
  const defaultOptions = {
    replaceStr: '...',
    responsive: false,
    debounceDelay: 250,
  };

  const opts = { ...defaultOptions, ...options };

  const elements = document.querySelectorAll(selector);
  const originalTexts = [];

  for (let i = 0; i < elements.length; i++) {
    window.setTimeout(() => {
      const el = elements[i];
      originalTexts[i] = el.textContent;
      const splittedText = el.textContent.split(' ');

      el.textContent = '';
      const elStyle = window.getComputedStyle(el);

      splittedText.reduce(tokensReducer, {
        el,
        elStyle,
        elHeight: 0,
        rowsLimit: rows,
        rowsWrapped: 0,
        options: opts,
      });
    }, 0);
  }

  if (opts.responsive) {
    let resizeTimeout = false;

    const resizeHandler = () => {
      for (let i = 0; i < elements.length; i++) {
        elements[i].textContent = originalTexts[i];
      }
      ellipsis(selector, rows, { ...options, responsive: false });
    };

    const resizeListener = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeHandler, opts.debounceDelay);
    };

    window.addEventListener('resize', resizeListener);

    return resizeListener;
  }
}

function disableResponsive(listener) {
  window.removeEventListener('resize', listener);
}

export { disableResponsive, ellipsis };
