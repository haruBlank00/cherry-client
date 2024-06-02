import { EventsEnum } from "./constants";
import { daraz } from "./modules/daraz/darazScrapper";
import { homePage } from "./modules/homePage/homePage";
import { queueProcessor } from "./modules/queueProcessor/queueProcessor";
import { scrapTracker } from "./modules/scrapTracker/ScrapTracker";
import { Pages, checkSite, getElements } from "./utils";
import { cherryAxios } from "./utils/axios";

// we should better handle comunation with server

const startScrap = async () => {
  const { currentPage, whiteListed } = checkSite();
  if (!whiteListed) {
    console.info(
      "This is not Daraz or page we don't care. Let's not bother..."
    );
    return;
  }

  // console.log({ appData: JSON.parse(appData) });

  const isScrapable = await scrapTracker.isScrapable();
  if (!isScrapable) {
    console.log("*** *** ALREADY SCRAPPED *** ***");
    return;
  }

  console.log("*** *** NEW TO SCRAP *** *** ");
  switch (currentPage) {
    case Pages.HOME: {
      const { categories, error } = daraz.scrapCategories();
      if (error) {
        console.error(error);
      } else {
        chrome.runtime.sendMessage({
          type: EventsEnum.SAVE_CATEGORIES,
          data: categories,
        });
      }
      return;
    }

    case Pages.LEVEL_1: {
      console.log("level 1 category");
      // we can scrap level 2 categories links
      // and extract data from the link without visiting the link
      // const url =
      //   "https://www.daraz.com.np/products/zeblaze-beyond-3-pro-gps-smart-watch-ultra-hd-amoled-display-built-in-gps-route-import-bluetooth-calling-ip68-water-resistance-1-year-warranty-i131875485-s1039111864.html?spm=a2a0e.searchlistcategory.sku.1.147a4688Ho36oU&search=1";
      // const product = await daraz.scrapProductFromLink(url);
      const productCardsEL = getElements("[data-tracking='product-card'");
      const productsLink: string[] = [];
      productCardsEL.forEach((productCard) => {
        const href =
          productCard.querySelector(":scope > a")?.getAttribute("href") || "";
        productsLink.push(href);
      });

      // same links are repeated so we need to filter them
      // and these links have https prefix so let's add that too
      const uniqueProductsLink = [...new Set(productsLink)]
        .filter((link) => Boolean(link))
        .map((link) => `https:${link}`);

      const { currentQueues = [] } = await chrome.storage.local.get(
        EventsEnum.QUEUE_LINKS
      );
      await chrome.storage.local.set({
        [EventsEnum.QUEUE_LINKS]: [...currentQueues, ...uniqueProductsLink],
      });

      const { error, results } = await queueProcessor.processQueue();

      if (error) {
        // handle error
        console.log(error.message);
      }
      console.log("emit save catesss");

      // proceed to making server request
      // send data to server
      await chrome.runtime.sendMessage({
        type: EventsEnum.SAVE_PRODUCTS,
        data: results,
      });
      break;
    }

    case Pages.LEVEL_2: {
      console.log("level_2");
      break;
    }

    case Pages.PRODUCT: {
      const product = daraz.scrapProduct();
      if (product) {
        chrome.runtime.sendMessage({
          type: EventsEnum.SAVE_PRODUCT,
          data: product,
        });
      }
    }
  }
};
// startScrap();

window.addEventListener("load", async () => {
  try {
    startScrap();

    // hanck and slash :3
    if (window.location.href === "http://localhost:5173/") {
      cherryScrapperPage();
    }
  } catch (error) {
    console.error("Error in startScrap:", error);
  }
});

async function cherryScrapperPage() {
  try {
    const response = await cherryAxios({
      method: "GET",
      url: "/daraz/get-products",
    });
    const { data, success } = response.data as {
      success: boolean;
      data: Product[];
    };
    if (success) {
      const productsEL = document.querySelector("#products")!;
      data.forEach((product) => {
        console.log({ product });
        try {
          const productHTML = homePage.Product(product)!;
          homePage.appendEL(productsEL, productHTML);
        } catch (error) {
          console.error(error);
        }
      });
    }
  } catch (e) {
    // error handle
  }
}
