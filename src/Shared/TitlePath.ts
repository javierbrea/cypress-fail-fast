/**
 * Checks whether one title path is contained at the beginning of another.
 *
 * Used by the `describe` strategy to decide if a test belongs to the describe
 * block (or any block nested inside it) where fail-fast was triggered: Mocha
 * title paths are hierarchical, so a test is inside a suite when the suite's
 * title path is a prefix of the test's title path.
 *
 * Note that title paths are the only suite identity available on both sides of
 * the plugin (browser hooks and Node tasks), so two sibling describes with
 * exactly the same title chain cannot be told apart. This limitation is
 * documented in the README.
 *
 * @param titlePath Title path of the test being evaluated.
 * @param scopeTitlePath Title path of the describe block acting as skip scope.
 * @returns `true` when `scopeTitlePath` is a prefix of `titlePath`.
 */
export function titlePathStartsWith(
  titlePath: string[],
  scopeTitlePath: string[],
): boolean {
  if (scopeTitlePath.length > titlePath.length) {
    return false;
  }
  return scopeTitlePath.every((title, index) => titlePath[index] === title);
}
