type TLevelOne = {
  id: string;
  label: string;
  subcategories: TLevelTwo[];
};

type TLevelTwo = {
  id: string;
  label: string;
  href: string;
  subcategories: TLevelThree[];
};

type TLevelThree = {
  id: string;
  label: string;
  href: string;
  image: {
    src: string;
    alt: string;
  };
};

type Categories = TLevelOne;
