import { lexicalEditor, BlocksFeature, UploadFeature } from '@payloadcms/richtext-lexical'
import { GridBlock } from './blocks/GridBlock'

export const standardEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({
      blocks: [GridBlock],
    }),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'float',
              type: 'select',
              label: 'Float (wrap text around image)',
              defaultValue: 'none',
              options: [
                { label: 'None (image sits on its own line)', value: 'none' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                description: 'Float the image to one side so the paragraphs that follow wrap around it (classic magazine layout). Pair with a Small/Medium Width so there is room for the text. Always full width on mobile. When set, this replaces Alignment.',
              },
            },
            {
              name: 'alignment',
              type: 'select',
              label: 'Alignment',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                description: 'Horizontal alignment. Ignored when Float is set.',
              },
            },
            {
              name: 'width',
              type: 'select',
              label: 'Width',
              defaultValue: 'original',
              options: [
                { label: 'Original size', value: 'original' },
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Full width', value: 'full' },
              ],
            },
            {
              name: 'exactWidth',
              type: 'text',
              label: 'Exact width (px)',
              admin: {
                description: 'Optional. Overrides the Width preset with an exact pixel width (stays responsive — shrinks on mobile). Leave blank to use the preset.',
              },
            },
            {
              name: 'cornerRadius',
              type: 'number',
              label: 'Corner radius (px)',
              defaultValue: 0,
              admin: {
                description: 'Rounds the image corners by this many pixels. Defaults to 0 for square corners.',
              },
            },
            {
              name: 'caption',
              type: 'text',
              label: 'Caption',
              admin: {
                description: 'Optional. Displays a small caption under the image.',
              },
            },
          ],
        },
      },
    }),
  ],
})
