export const getElement = (selector: string) => {
  return document.querySelector(selector);
};

export const getElements = (selector: string) => {
  return document.querySelectorAll(selector);
};
