# Icon Standards

For all icons (UI elements, brands, and symbols) in the enerQA project, use **FontAwesome** via `@fortawesome/react-fontawesome`. 
Do not use raw SVGs or simple text fallbacks (e.g., using an 'f' for Facebook).

## Packages Installed
- `@fortawesome/fontawesome-svg-core`
- `@fortawesome/react-fontawesome`
- `@fortawesome/free-solid-svg-icons` (Solid style)
- `@fortawesome/free-brands-svg-icons` (Brand logos)

## Usage Guidelines

1. **Importing the Component**
   Always import the `FontAwesomeIcon` component.
   ```jsx
   import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
   ```

2. **Importing Specific Icons**
   Only import the specific icons you need to keep the bundle size small.
   - For UI elements: `import { faCoffee, faChevronRight } from '@fortawesome/free-solid-svg-icons';`
   - For brands: `import { faFacebookF, faXTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';`

3. **Using in JSX**
   ```jsx
   // UI Icon
   <FontAwesomeIcon icon={faChevronRight} className="text-gray-500 w-4 h-4" />
   
   // Brand Icon
   <FontAwesomeIcon icon={faXTwitter} className="text-white hover:text-gray-200" />
   ```

4. **Styling**
   Use standard Tailwind CSS classes directly on the `<FontAwesomeIcon />` or its parent wrapper to control size, color, and hover states. SVGs naturally inherit the text color (`currentColor`) unless specified otherwise.
