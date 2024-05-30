- setup prject with vite and @crxjs for bundling manifest.json on build

- let's start with scrapping daraz products

## Scrap Daraz

- we have direct access to DOM so not need to parse HTML
- first scrap categoris from header banner section
- the root element for category is ul[data-spn="cate"]

- Lets start with Categories from header banner

  ```javascript
  ul[data-spm="cate"]
  // level1 categories name
      li[id="Level_1_Category_No1"] > span(name)
      li[id="Level_1_Category_No2"]
      li[id="Level_1_Category_No3"]

          // sub categories of level1 categories, number corresponds to id no of level1 category (lvl2)
          ul[data_spm="cate_1"]
          ul[data_spm="cate_2"]
          ul[data_spm="cate_3"]

              // sub categories of level2 categories
              li[date-cate="cate_1_1"]
              li[date-cate="cate_1_2"]
              li[date-cate="cate_1_3"]
                  a[href] > level 3 name
                  ul[data-spm="cate_1_3"]
                      li
                          a
                          img
  ```

How so I store the data?

```javascript
const categories = [
  {
    id: 1,
    name: "Electronics",
    subCategories: [
      {
        id: 11,
        name: "Laptop",
        subCategories: [
          {
            id: 111,
            name: "Laptop",
            image: "laptop.com",
          },
        ],
      },
    ],
  },
];
```
