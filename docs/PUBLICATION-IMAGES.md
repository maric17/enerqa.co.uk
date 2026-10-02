# Publication images

In Admin → Publications, open a publication and choose **Content → Featured Image**. Select or upload a landscape image, add descriptive alternative text in Media, then publish the article to update the public website. Saving a draft keeps the change private.

The featured image supplies both the single article's banner and the Knowledge Hub listing thumbnail. Without it, the site tries the existing Open Graph image, then the first image in the article body, then the shared navy cover. Broken image requests also fall back to the navy cover. An explicitly chosen Open Graph image still takes priority for social sharing.

The schema addition includes `publications.featured_image_id` and `_publications_v.version_featured_image_id`, so images work in both published records and saved drafts. The local database was updated with all 25 publications and their versions preserved. Other environments can preview and apply the same addition:

```sh
# Preview the addition inside a transaction that is rolled back.
node scripts/add-publication-featured-image.mjs
# Add the optional fields after a private backup and preservation checks.
node scripts/add-publication-featured-image.mjs --apply
```

`scripts/check-publication-featured-image.ts` verifies image selection and draft privacy using an existing Media image and a temporary draft that is always rolled back. No test article remains in the database.
