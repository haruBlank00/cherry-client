type TLevelOne = {
  id: string;
  label: string;
  spm: "cate";
  subcategories: TLevelTwo[];
};

type TLevelTwo = {
  // level 2 cate have spm as cate_levelX
  spm: string;
  id: string;
  label: string;
  href: string;
  subcategories: TLevelThree[];
};

type TLevelThree = {
  // level 3 cate have spm are cate_levelX_levelY
  spm: string;
  id: string;
  label: string;
  href: string;
  image: {
    src: string;
    alt: string;
  };
};

/*
 * cat = {
 *  id
 *  label
 *  spm: 'cate'
 *  subcategories: [
 *    {
 *      spm: 'cate_1',
 *      id
 *      label
 *      href
 *      subcategories: [
 *        {
 *          spm: 'cate_1_1'
 *          id
 *          label
 *          href
 *          image: {
 *            src
 *            alt
 *          }
 *        }
 *      ]
 *    }
 *  ]}
 */

type Categories = TLevelOne;

// *****************
type Product = {
  images: { src: string; alt: string }[];
  name: string;
  price: {
    original: string;
    current: string;
    discount: string;
  };
  selectors: Selector[];
  ratingsAndReviews: RatingsAndReview;
  details: Details;
};

type ImageVariant = { src: string; alt: string };
type Variant = {
  image?: {
    src: string;
    alt: string;
  };
  label?: string;
};

type Selector = {
  title: string; // it's on the left side, like a key
  variant: string;
  variants: Variant[];
};

type ReviewTag = {
  tag: string;
  count: string;
};

type RatingsAndReview = {
  score: string;
  total: string; // total ratings the product got
  detail: {
    // how many people gave this rating (looks like count is broken in daraz)
    // total rating doesn't match the individual count?.?
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviewTags: ReviewTag[];
};

type Details = {
  highlights: Highlights[];
  contents: string;
  specifications: Specification[];
};

type Highlights = { label: string };

type Contents = { label: string };

type Specification = { title: string; value: string };
