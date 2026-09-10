/**
 * Contextual product links inside article bodies.
 *
 * Search Console showed the problem this exists to fix: the blog carries 59%
 * of the site's impressions and 75% of its clicks, while the product
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
  ["custom drapery", "custom-drapery"],
  ["custom drapes", "custom-drapery"],
  ["custom drape", "custom-drapery"],
  ["drapery", "custom-drapery"],
  ["drapes", "custom-drapery"],
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
/**
 * The five service-area cities. Search Console shows the demand here is almost
 * entirely [product] + [city] — "roman shades post falls idaho", "motorized
 * window shades coeur d'alene" — with the area pages ranking 15th to 22nd for
 * them. They were as starved of internal links as the product pages were: 4 of
 * 52 articles linked to one, and the articles are frequently *about* these
 * towns.
 *
 * Apostrophes are matched in both straight and curly form because the corpus
 * contains both, and so do the queries.
 */
const AREA_TERMS: ReadonlyArray<readonly [string, string]> = [
  ["coeur d'alene", "coeur-d-alene"],
  ["post falls", "post-falls"],
  ["rathdrum", "rathdrum"],
  ["sandpoint", "sandpoint"],
  ["hayden", "hayden"],
];

const AREA_LOOKUP = new Map(AREA_TERMS.map(([phrase, slug]) => [phrase, slug]));

/**
 * Two links is enough for cities: the articles name their town repeatedly, and
 * past the first mention the repetition reads as keyword stuffing rather than
 * as writing.
 */
const AREA_MAX = 2;

/**
 * Every way an apostrophe appears in this corpus. The CMS export writes
 * "Coeur d&apos;Alene" as an HTML entity, so a pattern looking only for ' or ’
 * matches nothing at all on the very articles that are about the town.
 */
const APOSTROPHE = "(?:['’]|&(?:apos|#39|#x27|rsquo|#8217);)";

/** Builds the alternation for one group of terms. */
function matcherFor(terms: ReadonlyArray<readonly [string, string]>): RegExp {
  const alternation = terms
    .map(([p]) => p.replace(/ /g, "[\\s-]+").replace(/'/g, APOSTROPHE))
    .join("|");
  return new RegExp("(?<![\\w-])(" + alternation + ")(?![\\w-])", "gi");
}

const PRODUCT_MATCHER = matcherFor(TERMS);
const AREA_MATCHER = matcherFor(AREA_TERMS);

/** Normalises a matched phrase — or a title — back to its lookup key. */
function key(match: string): string {
  return match
    .toLowerCase()
    .replace(/&(?:apos|#39|#x27|rsquo|#8217);/g, "'")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ");
}

/**
 * Wraps the first mention of each term in one group with a link to its page,
 * skipping every protected region. Runs over the whole document in a single
 * pass so protected and free spans cannot drift out of sync.
 */
function linkGroup(
  source: string,
  matcher: RegExp,
  lookup: Map<string, string>,
  prefix: string,
  max: number,
  alreadyLinked: ReadonlySet<string> = new Set()
): string {
  const linked = new Set<string>(alreadyLinked);
  let added = 0;

  const linkFreeText = (text: string): string =>
    text.replace(matcher, (match) => {
      if (added >= max) return match;
      const slug = lookup.get(key(match));
      if (!slug || linked.has(slug)) return match;
      linked.add(slug);
      added += 1;
      // An HTML anchor rather than markdown link syntax, because most of these
      // articles are raw HTML exported from the previous CMS — <p>, <h3>,
      // <figure> — and CommonMark does not parse markdown inside an HTML
      // block, so `[text](url)` renders as literal punctuation on those posts.
      // Inline HTML is valid inside markdown too, and rehype-raw is already
      // enabled here, so one form works correctly for both kinds of post.
      return `<a href="${prefix}${slug}">${match}</a>`;
    });

  // Split into protected and free spans, then rewrite only the free ones. A
  // single pass over the source keeps the two kinds of region from drifting
  // out of sync, which is what a naive global replace would risk.
  const protectedRe = new RegExp(PROTECTED, "gmi");
  let out = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = protectedRe.exec(source)) !== null) {
    out += linkFreeText(source.slice(cursor, match.index));
    out += match[0];
    cursor = match.index + match[0].length;
  }
  out += linkFreeText(source.slice(cursor));

  return out;
}

/**
 * Adds contextual links from an article body to the product and area pages it
 * already mentions. Products and cities have separate budgets so a town name
 * appearing early cannot eat a product's slot.
 *
 * The two passes run in sequence rather than as one combined matcher, which is
 * safe because the anchors written by the first pass are themselves a protected
 * region for the second — a city name inside a product link stays untouched.
 *
 * Two links is enough for cities: the articles name their town repeatedly, and
 * beyond the first mention the repetition reads as keyword stuffing rather than
 * as writing.
 */
export function addInternalLinks(
  markdown: string,
  { title = "" }: { title?: string } = {}
): string {
  if (!markdown) return markdown;

  let out = linkGroup(markdown, PRODUCT_MATCHER, LOOKUP, "/products/", 5);

  // Cities named in the article's title get first claim on the area budget.
  // Ordering by first mention alone gave the wrong answer often enough to
  // matter: an article titled "…Near Post Falls & Coeur d'Alene" happened to
  // say "Hayden" earlier in its body and spent a slot there, leaving the two
  // towns it is actually about unlinked.
  const linkedAreas = (s: string) =>
    new Set([...s.matchAll(/href="\/areas\/([^"]+)"/g)].map((m) => m[1]));

  const titleKey = key(title);
  const fromTitle = AREA_TERMS.filter(
    ([phrase]) => titleKey.includes(phrase) || titleKey.includes(phrase.replace(/'/g, ""))
  );

  let claimed = linkedAreas(out); // respects any hand-written area link already present
  if (fromTitle.length) {
    out = linkGroup(out, matcherFor(fromTitle), new Map(fromTitle), "/areas/", AREA_MAX, claimed);
    claimed = linkedAreas(out);
  }
  const remaining = AREA_MAX - claimed.size;
  if (remaining > 0) {
    out = linkGroup(out, AREA_MATCHER, AREA_LOOKUP, "/areas/", remaining, claimed);
  }
  return out;
}
