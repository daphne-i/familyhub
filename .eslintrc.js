module.exports = {
  root: true,
  extends: '@react-native',
  parser: '@babel/eslint-parser', // Explicitly set the parser
  parserOptions: {
    requireConfigFile: false, // This is the fix
    babelOptions: {
      presets: ['module:@react-native/babel-preset'], // Provide the preset directly
    },
  },
};