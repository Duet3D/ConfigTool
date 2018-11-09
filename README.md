# RepRapFirmware Configuration Tool

licensed under the terms of the GPLv3

## Description

This is the new official config tool for RepRapFirmware.
It is entirely built with
- VueJS
- Bootstrap-Vue
- EJS
- JSZip

### Summary

The main entry point is `src/main.js`. This file initialises the app and makes sure that the Start page is loaded using *Vue Router* via `src/Router.js`. The contents of each page can be found in `src/views`.
Reusable components can be found in `src/components`, custom directives in `src/directives` and machine presets in `src/machines`.
Standard values of the boards and the main outline of the JSON template file can be found in `src/defaults`.

To generate macro files EJS is used. To the `render` funtion of each EJS file the `board` and `template` objects are passed, which are also accessible from every component via `this` in this project. In addition helper methods can be passed as part of the `util` object. The invocation of the EJS render function takes place in `src/Compiler.js`, which is only used from `src/App.vue` at this time.

The main goal of this project compared to the first version is the DRY (don't repeat yourself) concept in order to keep everything as flexible as possible.
If new options are supposed to be added, the `v-preset` directive can be used to indicate a title and the constraints of an input field as a Bootstrap tooltip and the default value of `preset`. If the `v-model` directive of an input field does not point to `template`, the target preset can be explicitly specified via `v-preset="<object>"`.

Please note that *Vuex* could not be used in this project due to the missing support for two-way bindings. Instead of this, `src/Store.js` populates the same `board`, `preset` and `template` instances among certain methods to every component that is used anywhere in this project.

## Build Setup

To get going you need a working NodeJS setup.

``` bash
# install yarn globally
npm install -g yarn

# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn serve

# build for production with minification
yarn build
```

Due to missing functionality *yarn* must be used instead of *npm*.

### Contributions

If you wish to enhance this tool, please feel free to do so - generally this is appreciated. However, pull requests will be only accepted if they are clean and match the used coding/markup style.

