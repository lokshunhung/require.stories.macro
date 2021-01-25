# require.stories.macro

Transform [globby](https://github.com/sindresorhus/globby) glob patterns into absolute `require` statements for [@storybookjs/react-native](https://github.com/storybookjs/react-native) as a babel macro.

## Installation

`$ yarn add --dev require.stories.macro babel-plugin-macros`

## Usage

This macro should only be used with storybook v5, as a compile-time macro to create `require` statements to be consumed by metro bundler.

v6 is currently [in progress](https://github.com/storybookjs/react-native/issues/131) and this plugin will be deprecated after CSF format is supported in react-native.

Add the plugin `babel-lugin-macros` to babel config. For an `expo` project it should look something like this:

```js
// babel.config.js
module.exports = function (api) {
    api.cache(false);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['babel-plugin-macros'], // <-- add this
        ],
    };
};
```

In `<PROJECT_ROOT>/storybook/index.js`, import and use the macro:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator, configure, getStorybookUI } from '@storybook/react-native';
import requireStories from 'require.stories.macro';

// register addons inside react-native app
require('@storybook/addon-ondevice-actions/register');
require('@storybook/addon-ondevice-knobs/register');

// enables knobs for all stories
addDecorator(withKnobs);

// import stories
configure(() => {
    requireStories(['../src/**/*.stories.tsx']); // <-- add this
}, module);

const StorybookUIRoot = getStorybookUI({
    asyncStorage: AsyncStorage,
});

export default StorybookUIRoot;
```
