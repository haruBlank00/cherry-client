export const EventsEnum = {
  SAVE_CATEGORIES: "SAVE_CATEGORIES",
  SAVE_PRODUCT: "SAVE_PRODUCT",
  GET_VISITED_LINKS: "GET_VISITED_LINKS",
};

export type EVENTS = keyof typeof EventsEnum;
