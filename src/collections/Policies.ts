import { CollectionConfig } from 'payload';

export const Policies: CollectionConfig = {
  slug: 'policies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true, // Anyone can read published policies
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Policy Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (value) {
              return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            if (data?.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            return value;
          }
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Policy Content',
    },
  ],
};
