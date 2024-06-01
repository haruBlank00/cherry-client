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
