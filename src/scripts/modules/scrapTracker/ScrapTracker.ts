/**
 * Let's track the page we have visited so we don't rescrap same page again
 *
 * visitedSited = []? simple array will do?
 */
class ScrapTracker {
  public static scrapTracker: ScrapTracker;
  static getInstance() {
    if (!this.scrapTracker) {
      this.scrapTracker = new ScrapTracker();
    }
    return this.scrapTracker;
  }
  /**
   * Check if the page has already been visited.
   * if it's not, it's scrabale -> return true
   * else it has already been scrapped -> return false
   * @returns boolean
   */
  async isScrapable(link?: string) {
    // hash after the last `.`  is dynamic so let's discard that
    // and only care about url before it
    const { visited_site } = await chrome.storage.local.get("visited_site");
    if (!visited_site) {
      await chrome.storage.local.set({
        visited_site: [],
      });
    }
    const href = link || window.location.href;
    const fragments = href.split(".");
    fragments.pop();
    const hrefWithoutHash = fragments.join(".");

    const isScraped = visited_site.find(
      (site: string) => site === hrefWithoutHash
    );
    if (Boolean(isScraped)) {
      // if it's already scraped, we don't need to scrap again
      return false;
    }

    await chrome.storage.local.set({
      visited_site: [...(visited_site || []), hrefWithoutHash],
    });

    return true;
  }
}

export const scrapTracker = ScrapTracker.getInstance();
