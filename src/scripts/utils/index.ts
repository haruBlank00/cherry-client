export const getElement = (selector: string) => {
  return document.querySelector(selector);
};

export const getElements = (selector: string) => {
  return document.querySelectorAll(selector);
};

export function checkSite() {
  const whiteListeOrigins = ["https://www.daraz.com.np"];
  const currentOrigin = window.location.origin;

  return whiteListeOrigins.includes(currentOrigin);
}
