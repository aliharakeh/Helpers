# UnoCss with angular

## Packages
```
npm i -D unocss
```

## Config
- uno.config.ts
- clean-apply-rule.js

### Package.json
````json5
{
  // ...
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "npm run unocss:build & npm run unocss:clean & ng build",
    "unocss:watch": "unocss src/styles.scss src/app/**/* -o src/unocss.css --watch",
    "unocss:clean": "node clean-apply-rule.js",
    "unocss:build": "unocss src/styles.scss src/app/**/* -o src/unocss.css
    // ...
  },
  // ...
}
```

### Import CSS (styles.css)
```scss
@import "unocss.css";
```
