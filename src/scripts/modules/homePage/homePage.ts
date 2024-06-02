import { getElement } from "../../utils";

interface HomePageInterface {
  // Product component that takes props and return HTML
  Product: (product: Product) => string;
  // append HTML string to DOM
  appendEL: (rootEL: Element, htmlStr: string) => void;
}
export class HomePage implements HomePageInterface {
  Product = (product: Product) => {
    const { name = "", url = "" } = product;
    const {
      price: { current = 0, discount = 0, original = 0 },
    } = product;
    const {
      ratingsAndReviews: { score = 0, total = 0 },
    } = product;
    const { alt = "", src = "" } = product.images?.[0] || {};
    return `
          <a
            href="${url}"
            class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
           <figure>
             <img
             class='block w-32 h-32 mx-auto m-4'
              src=${src}
              alt=${alt}
            />
           </figure>
            <div class="p-4">
              <h2 class="text-xl font-semibold mb-2">${name}</h2>
              <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-bold text-green-600">${current}</div>
                <div class="text-sm text-gray-500 line-through">${original}</div>
                <div class="text-sm text-red-600">${discount} off</div>
              </div>
              <div class="flex items-center mb-4">
                <div class="flex items-center">
                  <!-- Rating stars based on the score -->
                  <div class="flex items-center text-yellow-500">
                  <span>${score} / 5</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  </div>
                  <span class="ml-2 text-gray-600">(${total})</span>
                </div>
              </div>
            </div>
          </a>`;
  };

  appendEL(rootEL: Element, htmlStr: string) {
    console.log({ htmlStr });
    const product = getElement("#products");

    rootEL?.insertAdjacentHTML("beforeend", htmlStr);
  }
}

export const homePage = new HomePage();
