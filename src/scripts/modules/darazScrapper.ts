import { getElement } from "../utils/index";

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
    console.log(cate);
  }
}

export const daraz = DarazScrapper.getInstance();
