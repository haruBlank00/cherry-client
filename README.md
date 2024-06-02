# Scrap Daraz

- This extension extracts product details from [daraz](https://www.daraz.com.np/)
- run `yarn dev` to start the server
- add dist folder to chrome extension in developer mode

## How to use ?

- cherry-scrapper scraps categories and products
- if we are in home page we can use `scrapCategories` to scrap categories and send to server
- if we are in category page we can use `scrapProducts` to scrap products and send to server
- if we are in product page we can use `scrapProduct` to scrap product and send to server

- In category page, we extrack products links and fetch link with axios and scrap data from there, with server hydration data
- In product page, we extract data the actual
- using server hydration data seems safer in this case as the page doesn't need to have dom to parse
- EG. in product page, doms are lazy loaded and dom doesn't exist, we can't scrap data from there

- Please use `http://localhost:5713` to see the extension's page
- (I am having issue with style in popup so extension doesn't provide UI )

### noiseeeee

- setup prject with vite and @crxjs for bundling manifest.json on build

- let's start with scrapping daraz products

---

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

- phew! now we have a server where we can post categories
- so lets do that, scrap and send to server
