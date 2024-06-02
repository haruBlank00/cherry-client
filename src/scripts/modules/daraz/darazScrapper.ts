import { AxiosError, AxiosResponse } from "axios";
import { cherryAxios } from "../../utils/axios";
import { getElement, getElements } from "../../utils/index";
import {
  imageVariantSchema,
  priceSchema,
  ratingsAndReviewSchema,
  selectorSchema,
} from "./type/product.zod";

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

    return { categories: level_1, error: null };
  }

  /*
   * Save scrapped home page category to server
   */
  async saveCategories(categories: TLevelOne[]) {
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
  // this is for when we visit the individual product page
  scrapProduct(rootEL?: Document): Product | null {
    // find carousel and select it
    // find image src and alt
    // ok great, img.item-gallery__thumbnail-image is the elemnt we want
    const product = {
      selectors: [],
    } as Partial<Product>;

    const images: ImageVariant[] = [];
    const galleryImages = getElements(
      ".item-gallery__image-wrapper img",
      rootEL
    );
    galleryImages.forEach((image) => {
      const alt = image.getAttribute("alt")!;
      const src = image.getAttribute("src")!;
      images?.push({
        alt,
        src,
      });
    });
    const imageSchemaResult = imageVariantSchema.safeParse(images);
    if (imageSchemaResult.success) {
      product.images = imageSchemaResult.data;
    }

    // find product name and scrap :)
    const nameEL = getElement(".pdp-mod-product-badge-title", rootEL);
    const productName = nameEL?.textContent?.trim()!;
    product.name = productName;

    // find and scrap prices
    const currentPriceEL = getElement(".pdp-price_type_normal", rootEL);
    const currentPrice = currentPriceEL?.textContent?.trim()!;

    const originalPriceEL = getElement(".pdp-price_type_deleted", rootEL);
    const originPrice = originalPriceEL?.textContent?.trim()!;

    const discountEL = getElement(".pdp-product-price__discount", rootEL);
    const discountedPrice = discountEL?.textContent?.trim()!;

    const price = {
      current: currentPrice,
      original: originPrice,
      discount: discountedPrice,
    };
    const priceSchemaResult = priceSchema.safeParse(price);
    if (priceSchemaResult.success) {
      product.price = priceSchemaResult.data;
    }

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
    const skuSelectorEL = getElement(".sku-selector", rootEL);
    skuSelectorEL?.querySelectorAll(".sku-prop").forEach((prop) => {
      // get title
      const sectionTitle = prop
        .querySelector("h6.section-title")
        ?.textContent?.trim()!; // color-family

      const propSectionTitle = prop
        .querySelector(".sku-name")
        ?.textContent?.trim()!;

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
        variants.push({ image: { src } });
      });

      const selector: Selector = {
        title: sectionTitle,
        variant: propSectionTitle,
        variants,
      };

      selectors.push(selector);
    });

    const selectorSchemaResult = selectorSchema.safeParse(selectors);
    if (selectorSchemaResult.success) {
      product.selectors = selectorSchemaResult.data;
    }

    // ************************************
    // Scrap ratings and reviews...
    // const ratings = {
    //   scrore: 0,
    //   total: 0,
    //   detail: {
    //     5: 0,
    //     4: 0,
    //     3: 0,
    //     2: 0,
    //     1: 0,
    //   },
    // };
    const ratingsAndReview: RatingsAndReview = {
      score: "0",
      detail: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
      reviewTags: [],
      total: "0",
    };
    const score = getElement(
      ".review-info .score",
      rootEL
    )?.textContent?.trim()!;
    const total = getElement(
      ".review-info .rate-num",
      rootEL
    )?.textContent?.trim()!;
    ratingsAndReview.score = score;
    ratingsAndReview.total = total;

    const detailEL = getElement(".review-info .detail", rootEL);
    detailEL?.querySelectorAll("li").forEach((detailEl, index, array) => {
      const arrayLength = array.length;
      const star = (arrayLength -
        index) as keyof typeof ratingsAndReview.detail;
      const percent = detailEl.querySelector(".percent")?.textContent?.trim()!;
      ratingsAndReview.detail[star] = Number(percent);
    });

    // now let's do for ratings and review
    // what people like about it

    getElements(".review-filter", rootEL).forEach((reviewTagEL) => {
      const tagNcount = reviewTagEL
        ?.querySelector(".review-filter .review-tag")
        ?.textContent?.trim()!;

      const tagNcountPattern = /(\w+)\((\d+)\)/;
      const tagNcountMatch = tagNcount.match(tagNcountPattern);

      if (tagNcountMatch) {
        const [_, tag, count] = tagNcountMatch;
        ratingsAndReview.reviewTags.push({
          count,
          tag,
        });
      }
    });

    const ratingsAndReviewResult =
      ratingsAndReviewSchema.safeParse(ratingsAndReview);

    if (ratingsAndReviewResult.success) {
      product.ratingsAndReviews = ratingsAndReview;
    }

    // *** *** *** LET'S GOOOOO
    // SCRAP PRODUCT DETAILS AND STUFFS
    const details: Details = {
      highlights: [],
      contents: "",
      specifications: [],
    };

    // find highlights
    getElement(".pdp-product-highlights", rootEL)
      ?.querySelectorAll("li")
      .forEach((highlightEL) => {
        const highlight = highlightEL.textContent?.trim()!;
        details.highlights.push({
          label: highlight,
        });
      });

    // find contents
    const contents = getElement(".detail-content", rootEL)?.textContent;
    details.contents = contents || "";

    // find specifications
    getElement("ul.specification-keys", rootEL)
      ?.querySelectorAll("li")
      .forEach((specificationEL) => {
        const title = specificationEL
          .querySelector(".key-title")
          ?.textContent?.trim()!;
        const value = specificationEL
          .querySelector(".key-value")
          ?.textContent?.trim()!;
        details.specifications.push({
          title,
          value,
        });
      });

    product.details = details;

    return product as Product;
  }

  // extract data from server hydration data if the page has not been visited
  // we can pass the product link and it will parse
  // we can use it to scrap multiple products
  async scrapProductFromLink(url: string): Promise<Product | null> {
    const response = await cherryAxios({
      url,
      method: "GET",
    });
    const parser = new DOMParser();
    const html = response.data;
    const appDataRegex = /app\.run\((\{.*?\})\)/;
    const appDataResult = html.match(appDataRegex);
    if (!appDataResult) {
      return null;
    }
    const appData = appDataResult[1];
    const fields = JSON.parse(appData)?.data?.root?.fields;
    /**
     * fields = {... product}
     */
    const name = fields?.product?.title;

    const prices = fields?.skuInfos[0]?.price;
    const price = {
      discount: prices?.discount,
      // we also have value in number (1499), text => Rs. 1499
      current: prices?.salePrice.text,
      original: prices?.originalPrice.text,
    };

    const reviews = fields?.pc_reviews_v3;
    const detail = reviews?.scores.reduce(
      (
        acc: Record<number, number>,
        curr: number,
        index: number,
        scores: number[]
      ) => {
        const star = scores.length - index;
        acc[star] = curr;
        return acc;
      },
      {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      }
    );

    const reviewTags = reviews?.reviewTags?.map(
      (tag: { name: string; reviewCount: number }) => ({
        tag: tag.name,
        count: tag.reviewCount,
      })
    );
    const ratingsAndReviews = {
      score: reviews?.rating,
      total: reviews?.allReviewsCount,
      detail,
      reviewTags,
    };

    const skuProperties = fields?.productOption?.skuBase?.properties;
    const selectors = skuProperties?.reduce(
      (acc: any, curr: { name: any; values: any[] }) => {
        const title = curr.name;
        let variant = "";

        const variants = curr.values.map((value) => {
          // value can be object with image or without image
          const hasImage = value.hasOwnProperty("image");
          if (hasImage) {
            variant = "N/A";
            const src = value.image;
            return { image: src };
          }

          variant = value.name;
          return {
            label: value.value.nam,
          };
        });

        const selector = {
          title,
          variant,
          variants,
        };
        return [...acc, selector];
      },
      []
    );

    const highlightsHTMLstring = fields?.product?.highlights;
    console.log({ highlightsHTMLstring });

    const highlightsEL = parser.parseFromString(
      highlightsHTMLstring,
      "text/html"
    );

    const highlights: { label: string }[] = [];
    highlightsEL
      .querySelectorAll("li")
      .forEach((highlightEL) =>
        highlights.push({ label: highlightEL?.textContent?.trim()! })
      );
    const specifications = Object.values(
      fields?.specifications as { features: {} }[]
    ).map((specification) => {
      return Object.entries(specification.features).map(([key, value]) => {
        return {
          title: key,
          value: value as string,
        };
      });
    });

    const contents = fields?.product?.desc || "";
    const details = {
      highlights,
      specifications: specifications.reduce(
        (acc, curr) => [...acc, ...curr],
        []
      ),
      contents,
    };

    const images = (fields?.skuGalleries[0] || []).map(
      (gallery: { src: string }) => ({
        src: gallery.src,
        alt: "", // alt is not in this data, we need to find it from somewhere else :(
      })
    );
    const product: Product = {
      name,
      price,
      ratingsAndReviews,
      selectors,
      details,
      images,
    };
    return product;
  }

  async saveProduct(product: Product) {
    try {
      const response = await cherryAxios<
        AxiosResponse<{ success: boolean; message: string }>
      >({
        url: "/daraz/save-product",
        method: "POST",
        data: product,
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
}

export const daraz = DarazScrapper.getInstance();
