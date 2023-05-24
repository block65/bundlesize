# @block65/bundlesize

Bundle file size analyzer.

### Installation

Install @block65/bundlesize using npm or pnpm:

```bash
npm install @block65/bundlesize
```
or

```bash
pnpm add @block65/bundlesize -D
```

### Usage

Create a `bundlesize.config.js` configuration file specifying files to analyze and their maximum sizes.

Example configuration file:

```javascript
module.exports = {
  files: [
    {
      path: 'dist/*.js',
      maxSize: '100 KB',
      compression: 'brotli'
    },
    {
      path: 'dist/vendor.js',
      maxSize: '500 KB'
    },
  ],
};
```

NOTE: Maximum sizes are in base 10.

To analyze bundle sizes, run:

```bash
npx @block65/bundlesize
```

or

```bash
pnpx @block65/bundlesize
```

### License
@block65/bundlesize is MIT licensed. See LICENSE.md for details.
