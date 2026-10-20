# Explore Our Domains — proposed photo selections

Selected and downloaded on 20 October 2026. These are dedicated stock photos, sourced directly from their Unsplash photo pages. They are not taken from Enerqa publications, article feeds or the CMS.

The user clarified that the image-free layout was reviewed, then the discussion moved toward adding images. Amr asked for suitable images that are free to use commercially. The four selections below are implemented locally for review; Amr's acceptance and production deployment remain open.

| Domain | Proposed subject and reason | Photographer and source | Local asset |
| --- | --- | --- | --- |
| Climate Action & Carbon Management | Athabasca Glacier: gives climate risk a concrete visual, distinct from the energy card. | [Joshua Tsu — glacier](https://unsplash.com/photos/a-large-glacier-with-mountains-in-the-background-qQ8UfaCordo) | `public/images/domains/climate-glacier.webp` |
| Energy Systems & Transition | Aerial solar farm: shows physical energy infrastructure. | [Andreas Gücklhorn — solar panels](https://unsplash.com/photos/aerial-photography-of-grass-field-with-blue-solar-panels-Ilpf2eUPpUE) | `public/images/domains/energy-solar.webp` |
| Environment, Nature & Circularity | Forest river from above: represents connected water and ecosystem health. | [Tholaal Mohamed — forest river](https://unsplash.com/photos/aerial-photo-of-forest-river-during-daytime-7nr0fG3o7zc) | `public/images/domains/nature-river.webp` |
| Sustainable Business, ESG & Finance | Planted building façade: connects business assets and the built environment with sustainability. Illustrative only; it does not claim a certified environmental rating. | [CHUTTERSNAP — planted building](https://unsplash.com/photos/white-concrete-building-x08EWozs0c4) | `public/images/domains/business-building.webp` |

## Licence evidence

All four individual photo pages displayed “Free to use under the Unsplash License” when checked. They were free photos, not Unsplash+ selections. The [Unsplash License](https://unsplash.com/license) allows free download and commercial use, including modification and distribution; attribution is appreciated but not required. Restrictions include selling substantially unmodified images and compiling a competing image service. This use places the photos inside original domain cards on the Enerqa website.

Keep these source and credit records with the assets. No photographer endorsement, property certification or Enerqa project ownership is implied. The selected crops contain no prominent identifiable people or brand logos.

Downloaded image endpoints (each requested with `auto=format&fit=crop&w=960&h=600&q=82&fm=webp`):

- Climate: `https://images.unsplash.com/photo-1740149593722-2383e0702365`
- Energy: `https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9`
- Nature: `https://images.unsplash.com/photo-1559436012-4d78c3346e17`
- Business: `https://images.unsplash.com/photo-1504788482283-123743797899`

## Implementation

The user subsequently requested restoration of the earlier hover-driven background layout. The section now restores the shared-background design from commit `530691e`: four transparent columns sit over one full-width photo, and hovering or focusing a domain crossfades to its photo. The selected domain expands slightly and reveals its description and Discover label. Automatic rotation and its pause button remain removed.

The photos are stored locally as 960 × 600 WebP images. Next.js serves responsive sizes and loads them lazily into fixed background layers. One dark gradient overlay keeps text readable over every photo. Images have empty alternative text because the adjacent domain heading supplies the link name and these photos are illustrative. Touch layouts keep descriptions and Discover visible; all four original destinations are retained.

## Initial card-layout validation — 20 October 2026

- The updated domain component test passed; component and test ESLint checks passed.
- Browser checks passed at widths of 1366, 1024, 768, 390 and 320 pixels: all four photos loaded, all original links remained, and the page had no horizontal overflow or browser errors.
- Mouse hover and keyboard focus revealed details at desktop/tablet widths. Touch layouts kept details visible. A separate 390-pixel phone viewport screenshot confirmed the visible description and Discover label.
- Desktop image crops were reviewed visually. Images are illustrative proposals, pending Amr's selection.

## Restored background-layout validation — 20 October 2026

- Both domain component tests passed, including all four pointer selections and a keyboard focus selection updating the matching background. Component and test ESLint checks passed.
- Browser checks passed at 1366, 1024, 768, 390 and 320 pixels: all four photos loaded; desktop hover and keyboard focus selected the matching background; touch descriptions remained visible; headings fit; no horizontal overflow or browser errors occurred.
- After restoring the original bottom alignment for inactive titles, final checks passed again at 1366, 768, 390 and 320 pixels, including unclipped descriptions and Discover labels. The restored desktop background layout was reviewed visually.

## Next actions

- Amr: review the proposed photo subjects and crops at `http://localhost:3000/#transition-priorities`.
- Developer: after the images are selected, deploy and check the public homepage. Local checks do not confirm a production change.
