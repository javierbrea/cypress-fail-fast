module.exports = {
  plugins: [
    [
      "module-resolver",
      {
        root: ["."],
        alias: {
          "cypress-fail-fast": `../../../`,
        },
      },
    ],
  ],
};
