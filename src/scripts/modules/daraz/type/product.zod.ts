import { z } from "zod";

export const priceSchema = z.object({
  original: z.string(),
  current: z.string(),
  discount: z.string(),
});

export const imageVariantSchema = z.array(
  z.object({
    src: z.string(),
    alt: z.string(),
  })
);

const variantSchema = z.object({
  image: z
    .object({
      src: z.string(),
    })
    .optional(),
  label: z.string().optional(),
});

export const selectorSchema = z.array(
  z.object({
    title: z.string(),
    variant: z.string(),
    variants: z.array(variantSchema),
  })
);

const reviewTagSchema = z.object({
  tag: z.string(),
  count: z.string(),
});

export const ratingsAndReviewSchema = z.object({
  score: z.string(),
  total: z.string(),
  detail: z.object({}),
  reviewTags: z.array(reviewTagSchema),
});

const highlightsSchema = z.object({
  label: z.string(),
});

// const contentsSchema = z.object({
//   label: z.string(),
// });

const specificationSchema = z.object({
  title: z.string(),
  value: z.string(),
});

const detailsSchema = z.object({
  highlights: z.array(highlightsSchema),
  contents: z.string(),
  specifications: z.array(specificationSchema),
});

export const productSchema = z.object({
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string(),
    })
  ),
  name: z.string(),
  price: priceSchema,
  selectors: selectorSchema,
  ratingsAndReviews: ratingsAndReviewSchema,
  details: detailsSchema,
});
