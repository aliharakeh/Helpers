# UnoCss with angular

## Packages
```
npm i -D @angular-builders/custom-webpack postcss postcss-loader unocss @unocss/postcss
```

### loaders
- https://webpack.js.org/loaders/postcss-loader/
- https://webpack.js.org/loaders/sass-loader/

### UnoCss postCss plugin
- https://unocss.dev/integrations/postcss

## Custom webpack config
`Angular.json`
```
// ...
"architect": {
        "build": {
          "builder": "@angular-builders/custom-webpack:browser",
          "options": {
            "customWebpackConfig": {
              "path": "./extra-webpack.config.js",
              "replaceDuplicatePlugins": true
            },
            "outputPath": "...",
        // ....
        "serve": {
          "builder": "@angular-builders/custom-webpack:dev-server",
// ...
```

## Import CSS (styles.css)
```scss
@unocss;
```
