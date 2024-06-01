import { AxiosError, AxiosResponse } from "axios";
import { cherryAxios } from "../../utils/axios";
import { getElement, getElements } from "../../utils/index";

interface DarazScrapperInterface {
  scrapCategories(): void;
  saveCategories(categories: TLevelOne[]): void;
}
class DarazScrapper implements DarazScrapperInterface {
  private static instance: DarazScrapper;
  public static getInstance(): DarazScrapper {
    if (!DarazScrapper.instance) {
      DarazScrapper.instance = new DarazScrapper();
    }
    return DarazScrapper.instance;
  }

  /*
   * Scrap home page of daraz to extract categories
   */
  scrapCategories(): { categories: TLevelOne[] | null; error: string | null } {
    // this is the root ul element which wraps all the categories
    const rootCate = getElement("[data-spm='cate']") as HTMLUListElement;

    if (!rootCate) {
      const errorMsg = "Oh NOOOO!!!. Couldn't find the root element. :(";
      return { categories: null, error: errorMsg };
    }

    // this is the NodeList of all the categories at level 1
    const level_1_cates_EL = rootCate.querySelectorAll<HTMLLIElement>(
      ".lzd-site-menu-root-item"
    );

    // we will parse the DOM and store level_1 categories here
    // i.e spm = cate
    const level_1: TLevelOne[] = [];

    // iterate over level_1 categories
    level_1_cates_EL.forEach((level_1_cate) => {
      const level_1_spm = "cate";
      const id = level_1_cate.getAttribute("id");
      const label = level_1_cate
        .querySelector(".txt-holder")
        ?.textContent?.trim();
      if (!id || !label) return;

      // we will store level 2 dom here
      const level_2: TLevelTwo[] = [];

      // this id and label is of level 1 categories
      // we add it's subcategoires, i.e level 2 for level 1 categories
      level_1.push({
        id,
        spm: level_1_spm,
        label,
        subcategories: level_2,
      });

      // this is the level 2 categories
      // cate = "cate_x" x corresponds to the the index of level_1 category
      const level_2_cates_EL = rootCate.querySelector(`.${id}`);
      console.log({ level_2_cates_EL });
      const level_2_spm = level_2_cates_EL?.getAttribute("data-spm")!;
      level_2_cates_EL
        ?.querySelectorAll(":scope > li")
        .forEach((level_2_cate) => {
          const id = crypto.randomUUID();
          const label =
            level_2_cate.querySelector(":scope > a")?.textContent?.trim() || "";
          const href =
            level_2_cate.querySelector<HTMLAnchorElement>(":scope > a")?.href ||
            "";

          // we will save level 3 categories here
          const level_3: TLevelThree[] = [];

          // we create and push level 2 category
          level_2.push({
            spm: level_2_spm,
            id,
            label,
            subcategories: level_3,
            href,
          });

          // level 3 categories
          level_2_cate
            .querySelectorAll(":scope > ul ul li")
            .forEach((level3Cate) => {
              const id = crypto.randomUUID();
              const grandNode = level3Cate.parentElement?.parentElement;
              const spm = grandNode?.dataset?.spm!;
              const href = level3Cate.querySelector("a")?.href || "";
              const image = {
                src: level3Cate.querySelector("img")?.src || "",
                alt: level3Cate.querySelector("img")?.alt || "",
              };
              const label = level3Cate.querySelector("span")?.textContent || "";
              level_3.push({
                spm,
                id,
                href,
                image,
                label,
              });
            });
        });
    });

    console.log({ level_1 });
    return { categories: level_1, error: null };
  }

  /*
   * Save scrapped home page category to server
   */
  async saveCategories(categories: TLevelOne[]) {
    console.log({ categories });
    try {
      const response = await cherryAxios<
        AxiosResponse<{ success: boolean; message: string }>
      >({
        url: "/daraz/save-categories",
        method: "POST",
        data: categories,
      });

      if (!response.data.data.success) {
        throw Error(response.data.data.message);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error({
          message: error.message,
          name: error.name,
          status: error.status,
        });
      }
      console.error({ error }, "from save categories");
    }
  }

  // scrap general products page Level_2 categories page
  scrapProducts() {
    // const generalProductsEL = getElement("[data-spm='sku']");
  }

  // scrap single product from product page
  scrapProduct() {
    // find carousel and select it
    // find image src and alt
    // ok great, img.item-gallery__thumbnail-image is the elemnt we want
    const product = {
      images: [],
      selectors: [],
    } as Partial<Product>;

    const galleryImages = getElements(".item-gallery__image-wrapper img");
    galleryImages.forEach((image) => {
      const alt = image.getAttribute("alt")!;
      const src = image.getAttribute("src")!;
      product.images?.push({
        alt,
        src,
      });
    });

    // find product name and scrap :)
    const nameEL = getElement(".pdp-mod-product-badge-title");
    const productName = nameEL?.textContent?.trim()!;
    product.name = productName;

    // find and scrap prices
    const currentPriceEL = getElement(".pdp-price_type_normal");
    const currentPrice = currentPriceEL?.textContent?.trim()!;

    const originalPriceEL = getElement(".pdp-price_type_deleted");
    const originPrice = originalPriceEL?.textContent?.trim()!;

    const discountEL = getElement(".pdp-product-price__discount");
    const discountedPrice = discountEL?.textContent?.trim()!;

    product.price = {
      current: currentPrice,
      original: originPrice,
      discount: discountedPrice,
    };

    // scrap selectors and variants
    /**
     * div.sku-selector
     *  div.sku-prop[]
     *    div
     *       h6.section-title
     *       div.section-content
     *          div.sku-prop-content-header > span > textContent
     *          div.sku-prop-content
     *
     *
     */
    const selectors: Selector[] = [];
    const skuSelectorEL = getElement(".sku-selector");
    console.log({ skuSelectorEL });
    skuSelectorEL?.querySelectorAll(".sku-prop").forEach((prop) => {
      console.log({ prop });
      // get title
      const sectionTitle = prop
        .querySelector("h6.section-title")
        ?.textContent?.trim()!; // color-family

      const sectionContentEL = prop.querySelector(".section-content");
      // section content can have header (or not)
      const propTitleEL = sectionContentEL?.querySelector(
        ".sku-prop-content-header" // .sku-name -> Blank
      );
      const propSectionTitle = prop
        .querySelector(".sku-name")
        ?.textContent?.trim()!;

      console.log({ propTitleEL, propSectionTitle });
      const propContent = prop.querySelector(".sku-prop-content");

      // contents can have bunch of images without textContent
      // or variants with textContent

      const variants: Variant[] = [];

      propContent
        ?.querySelectorAll(".sku-variable-name-text")
        .forEach((variant) => {
          const variantLabel = variant.textContent?.trim()!;

          variants.push({ label: variantLabel });
        });

      propContent?.querySelectorAll("img").forEach((variant) => {
        const src = variant.getAttribute("src")!;
        const alt = variant.getAttribute("alt")!;
        variants.push({ image: { src, alt } });
      });
      propContent?.querySelectorAll;

      const selector: Selector = {
        title: sectionTitle,
        variant: propSectionTitle,
        variants,
      };

      selectors.push(selector);
    });

    product.selectors = selectors;

    console.log({ product });
    // return product;
  }
}

export const daraz = DarazScrapper.getInstance();
