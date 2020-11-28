module.exports = {
  plugins: [
    [
      "module-resolver",
      {
        root: ["."],
        alias: {
          "cypress-fast-fail": `../../`,
        },
      },
    ],
  ],
};
