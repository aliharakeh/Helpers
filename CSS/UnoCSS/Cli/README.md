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
    "unocss:watch": "unocss --watch",
    "unocss:build": "unocss",
    "unocss:clean": "node clean-apply-rule.js",
    // ...
  },
  // ...
}
```

### Import CSS (styles.css)
```scss
@import "unocss.css";
```
