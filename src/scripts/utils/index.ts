export const getElement = (selector: string, rootEL?: Document) => {
  return (rootEL || document).querySelector(selector);
};

export const getElements = (selector: string, rootEL?: Document) => {
  return (rootEL || document).querySelectorAll(selector);
};

export enum Pages {
  HOME,
  LEVEL_1,
  LEVEL_2,
  PRODUCT,
}
/**
 *
 * let's check if our current page is home page
 * level1 category page
 * level2 cateory page
 * or individual product page
 *
 * {
 *  whiteListed: boolean,
 *  currentPage: 'home' | 'lvl1' | 'lvl2' | 'product'
 * }
 */
export function checkSite() {
  const whiteListeOrigins = ["https://www.daraz.com.np"];

  const currentOrigin = window.location.origin;
  const isWhiteListed = whiteListeOrigins.includes(currentOrigin);
  console.log({ currentOrigin, isWhiteListed });
  if (!isWhiteListed) {
    return {
      whiteListed: false,
      currentPage: null,
    };
  }

  const path = window.location.pathname;
  if (path === "/") {
    return {
      whiteListed: true,
      currentPage: Pages.HOME,
    };
  }

  const isProductPage = path.split("/")[1] === "products";
  if (isProductPage) {
    return {
      whiteListed: true,
      currentPage: Pages.PRODUCT,
    };
  }

  const search = window.location.search;
  const isCategoryPage = search.includes("spm");
  if (isCategoryPage) {
    /**
     * if we are on Level2 category, search will have something like cate_1
     * ?spm=a2a0e.searchlistcategory.cate_1.1.400a3c49L8dnEo'
     *
     * if we are on level3 category, search will have cate_1_1
     * ?spm=a2a0e.searchlistcategory.cate_1_1.1.400a3c49L8dnEo'
     */
    const levelCode = search.split(".")[2];
    // it will be "cate_1" or "cate_1_1"
    const levels = levelCode.split("_");
    const level = levels.length; // will be 2 if level is 1 and 3 is lvl is 2
    // in home page category, 1st category is lvl1, but we can't visit it
    // after that, level2 is consider level1 when category page is visited

    let currentPage = Pages.LEVEL_1;
    if (level === 3) {
      currentPage = Pages.LEVEL_2;
    }
    return {
      whiteListed: true,
      currentPage,
    };
  }

  return {
    whiteListed: false,
    currentPage: null,
  };
}
