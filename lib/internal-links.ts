/**
 * Contextual product links inside article bodies.
 *
 * Search Console showed the problem this exists to fix: the blog carries 59%
 * of the site's impressions and 75% of its clicks, while the nine product
 * pages sit at average positions 21–57 and drew 8 clicks in twelve months.
 * The cause was structural — 47 of 52 posts contained no in-body link to a
 * product page at all. Every product link on an article came from the header
 * and footer nav, which is boilerplate on every page and passes almost
 * nothing. The blog held all the authority and had no edge to send it down.
 *
 * This runs at render time rather than rewriting the 52 markdown files. That
 * keeps the source prose untouched, applies identically to posts served from
 * Payload and from markdown, covers every future post with no author effort,
 * and is revertible in one line if the linking ever needs to change.
 *
 * The rules are deliberately conservative: first mention only, one link per
 * product per article, capped per article, and never inside a heading, a code
 * block, an existing link, or raw HTML. Anchor text is whatever the author
 * already wrote — nothing is inserted, only wrapped.
 */

/**
 * Phrase → product slug. Order is significant twice over: the combined matcher
 * below is a regex alternation, and JS alternation is leftmost-first, so the
 * longest phrasing has to come first for "exterior solar shades" to win over
 * "solar shades" and "plantation shutters" over "shutters". Singular forms
 * still need their own entries — \b stops `roman shade` from matching inside
 * `roman shades` — but they can safely follow their plural.
 */
const TERMS: ReadonlyArray<readonly [string, string]> = [
  ["exterior solar shades", "exterior-solar-shades"],
  ["exterior solar shade", "exterior-solar-shades"],
  ["motorized window treatments", "motorization"],
  ["motorized window treatment", "motorization"],
  ["plantation shutters", "shutters"],
  ["plantation shutter", "shutters"],
  ["cellular shades", "cellular-shades"],
  ["cellular shade", "cellular-shades"],
  ["honeycomb shades", "cellular-shades"],
  ["honeycomb shade", "cellular-shades"],
  ["motorized shades", "motorization"],
  ["motorized shade", "motorization"],
  ["faux wood blinds", "blinds"],
  ["composite blinds", "blinds"],
  ["vertical blinds", "blinds"],
  ["wood blinds", "blinds"],
  ["mini blinds", "blinds"],
  ["roller shades", "roller-shades"],
  ["roller shade", "roller-shades"],
  ["roman shades", "roman-shades"],
  ["roman shade", "roman-shades"],
  ["banded shades", "banded-shades"],
  ["zebra shades", "banded-shades"],
  ["dual shades", "banded-shades"],
  ["solar shades", "solar-shades"],
  ["solar shade", "solar-shades"],
  ["motorization", "motorization"],
  ["shutters", "shutters"],
  ["blinds", "blinds"],
];

const LOOKUP = new Map(TERMS.map(([phrase, slug]) => [phrase, slug]));

/**
 * Regions the linker must never touch. Alternation order matters here too:
 * fenced code before inline code, and a full <a>…</a> before the generic tag
 * pattern, so an anchor's inner text is protected rather than just its tags.
 * rehype-raw is enabled on these articles, so raw HTML genuinely appears.
 */
const PROTECTED = [
  "```[\\s\\S]*?```", // fenced code
  "`[^`\\n]*`", // inline code
  "^ {0,3}#{1,6}[^\\n]*$", // ATX headings
  "^ {0,3}>[^\\n]*$", // markdown blockquote lines
  "<h[1-6]\\b[^>]*>[\\s\\S]*?</h[1-6]>", // HTML headings, inner text included
  "<blockquote\\b[^>]*>[\\s\\S]*?</blockquote>", // HTML pull quotes
  "!\\[[^\\]]*\\]\\([^)]*\\)", // images
  "\\[[^\\]]*\\]\\([^)]*\\)", // existing markdown links
  "<a\\b[^>]*>[\\s\\S]*?</a>", // raw HTML anchors, inner text included
  "<[^>]+>", // any other raw HTML tag
].join("|");

/**
 * Spaces become [\s-]+ so a phrase survives both a line wrap and a hyphenated
 * spelling — authors write "mini-blinds" as often as "mini blinds".
 *
 * The boundaries are lookarounds rather than \b because a hyphen is not a word
 * character, so \bblinds\b happily matches the tail of "mini-blinds" and would
 * link half a compound. Requiring a non-hyphen, non-word character on each side
 * keeps a bare term from biting into a longer word, and lets the multi-word
 * entries above claim the whole compound instead.
 */
const MATCHER = new RegExp(
  "(?<![\\w-])(" + TERMS.map(([p]) => p.replace(/ /g, "[\\s-]+")).join("|") + ")(?![\\w-])",
  "gi"
);

export interface LinkProductsOptions {
  /**
   * Most links to add to one article. Five keeps a ~1,000-word post reading
   * like prose rather than a link farm, while still giving every product page
   * inbound edges once it is spread across 52 articles.
   */
  max?: number;
}

/**
 * Wraps the first mention of each product in a markdown link to its page.
 * Returns the markdown unchanged when there is nothing eligible to link.
 */
export function linkProducts(
  markdown: string,
  { max = 5 }: LinkProductsOptions = {}
): string {
  if (!markdown) return markdown;

  const linked = new Set<string>();
  let added = 0;

  const linkFreeText = (text: string): string =>
    text.replace(MATCHER, (match) => {
      if (added >= max) return match;
      const slug = LOOKUP.get(match.toLowerCase().replace(/\s+/g, " "));
      if (!slug || linked.has(slug)) return match;
      linked.add(slug);
      added += 1;
      // An HTML anchor rather than markdown link syntax, because most of these
      // articles are raw HTML exported from the previous CMS — <p>, <h3>,
      // <figure> — and CommonMark does not parse markdown inside an HTML
      // block, so `[text](url)` renders as literal punctuation on those posts.
      // Inline HTML is valid inside markdown too, and rehype-raw is already
      // enabled here, so one form works correctly for both kinds of post.
      return `<a href="/products/${slug}">${match}</a>`;
    });

  // Split into protected and free spans, then rewrite only the free ones. A
  // single pass over the source keeps the two kinds of region from drifting
  // out of sync, which is what a naive global replace would risk.
  const protectedRe = new RegExp(PROTECTED, "gmi");
  let out = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = protectedRe.exec(markdown)) !== null) {
    out += linkFreeText(markdown.slice(cursor, match.index));
    out += match[0];
    cursor = match.index + match[0].length;
  }
  out += linkFreeText(markdown.slice(cursor));

  return out;
}
