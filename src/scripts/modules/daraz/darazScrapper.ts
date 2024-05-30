import { getElement } from "../../utils/index";

interface DarazScrapperInterface {
  getCategories(): void;
}
class DarazScrapper implements DarazScrapperInterface {
  private static instance: DarazScrapper;
  public static getInstance(): DarazScrapper {
    if (!DarazScrapper.instance) {
      DarazScrapper.instance = new DarazScrapper();
    }
    return DarazScrapper.instance;
  }
  getCategories(): void {
    const cate = getElement("[data-spm='cate']") as HTMLUListElement;
    const level1Cates = cate.querySelectorAll<HTMLLIElement>(
      ".lzd-site-menu-root-item"
    );

    const categories: { id: string; label: string }[] = [];
    level1Cates.forEach((cate) => {
      const id = cate.getAttribute("id");
      const label = cate.querySelector(".txt-holder")?.textContent?.trim();
      if (!id || !label) return;
      categories.push({
        id,
        label,
      });
    });

    console.log({ categories });
  }
}

export const daraz = DarazScrapper.getInstance();
