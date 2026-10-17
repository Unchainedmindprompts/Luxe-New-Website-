export interface AreaFAQ {
  question: string;
  answer: string;
}

export interface AreaRelatedPost {
  title: string;
  slug: string;
}

export interface AreaPageData {
  slug: string;
  name: string;
  /**
   * Wikipedia identity for these cities lives in `lib/cities.ts`, alongside the
   * canonical `@id` and county containment. It was duplicated here and there,
   * agreeing by luck rather than by construction; the registry that mints the
   * Place entity is the only place that needs to know.
   */
  headline: string;
  subheadline: string;
  description: string;
  neighborhoods: string[];
  housingTypes: string;
  climateConsiderations: string;
  markInsight?: string;
  faqs?: AreaFAQ[];
  relatedPosts?: AreaRelatedPost[];
  /**
   * Opens the "Products Available in {city}" section. Search Console shows the
   * in-market demand is almost entirely [product] + [city] — "roman shades post
   * falls idaho", "motorized window shades coeur d'alene" — while these pages
   * carried one generic sentence that named no product at all. Written per city
   * rather than templated, because five near-identical paragraphs across five
   * city pages is the thing Google treats as doorway content.
   */
  productIntro: string;
  localCTA: string;
  metaTitle: string;
  metaDescription: string;
  /**
   * Set on the Seattle Eastside entries (Washington). Drives the state-aware
   * schema and the Hunter Douglas service-model copy on the area page: Luxe
   * serves these cities with Hunter Douglas only, by appointment, with
   * measuring and installation through Hunter Douglas Installation Services.
   * Absent on the five North Idaho entries, whose pages carry Luxe's own
   * measuring, installation, and lifetime installation guarantee.
   */
  state?: string;
  /** Route of this city's Hunter Douglas landing page, e.g. "/hunter-douglas-bellevue". */
  hdPage?: string;
}

export const areaPages: Record<string, AreaPageData> = {
  "coeur-d-alene": {
    slug: "coeur-d-alene",
    name: "Coeur d'Alene",
    hdPage: "/hunter-douglas-coeur-d-alene",
    headline: "Custom Window Treatments for Coeur d'Alene Homes",
    subheadline: "From lakefront estates to downtown bungalows — we come to your home, bring samples, and recommend what will actually work in Coeur d'Alene light.",
    description: "Luxe Window Works is based in Post Falls and provides custom blinds, shades, shutters, and motorized window treatments throughout Coeur d'Alene. We bring samples to your home, help you compare options in the room, take professional measurements, and handle installation. Whether you are settling into a new build or updating existing windows, start with how you want the light, privacy, and controls to work.",
    neighborhoods: ["Downtown Coeur d'Alene", "Sanders Beach", "Fernan Hill", "Coeur d'Alene Place", "Riverstone", "Northwest Boulevard", "Canfield Mountain", "Best Hill"],
    housingTypes: "Coeur d'Alene features an eclectic mix of housing — historic craftsman homes downtown, mid-century ranches in established neighborhoods, newer construction in planned communities, and premium lakefront and view properties. Each style has its own window treatment considerations, from the charming but uneven window frames of 1920s bungalows to the massive window walls in contemporary lakefront builds.",
    climateConsiderations: "Lake Coeur d'Alene creates its own microclimate. Homes near the water experience more humidity, which affects material choices (composite shutters over wood for lake-adjacent rooms). West-facing lakefront windows deal with intense afternoon sun reflecting off the water — solar shades with low openness factors are essential. In winter, the lake effect moderates temperatures slightly compared to inland areas, but older homes with original windows still benefit enormously from the insulating properties of cellular shades.",
    markInsight: "Lakefront properties are some of the most rewarding to work on — and the most unforgiving if you get the materials wrong. I've seen lesser-finished wood shutters warp near Lake Coeur d'Alene within a couple of seasons. The finish and product quality make all the difference — Norman's Osmo-finished wood shutters handle humidity much better than standard wood, and composite like Woodlore Plus is still the lowest-maintenance option. It's not always a simple wood vs. composite answer; it's about matching the right product to the exposure. West-facing lake windows are in a category of their own — the sun reflecting off the water is intense in a way that surprises people. I typically spec 3% or 5% openness solar shades on those exposures, and the difference is dramatic. The other thing that comes up constantly in CDA is older homes with window frames that have settled over decades. They're not square, they're not plumb, and a lot of installers just force a standard product in there. I measure every window individually, every time.",
    faqs: [
      {
        question: "Do wood or composite shutters hold up better near Lake Coeur d'Alene?",
        answer: "It depends more on the product quality and finish than the material alone. Standard wood shutters can warp or crack with lake humidity, but Norman's Osmo-finished wood shutters use a hardwax oil treatment that holds up well in high-humidity environments. Composite options like Norman's Woodlore Plus are the lower-maintenance choice and carry a lifetime warranty.",
      },
      {
        question: "My lakefront windows face west and get blinding afternoon sun off the water — what actually works?",
        answer: "A 3% or 5% openness solar shade cuts glare by 95%+ while keeping your lake view intact. The 3% fabric nearly eliminates glare; 5% lets in slightly more light. Both are available motorized so you can adjust them from your phone when afternoon glare kicks in.",
      },
      {
        question: "My 1920s craftsman home in downtown CDA has original window frames that aren't square — can you still get a proper fit?",
        answer: "Yes. Original craftsman-era frames often vary a quarter inch or more out of square. The key is measuring at multiple points and building the treatment to fit the actual opening, not a standard size. We measure every window individually on every job.",
      },
      {
        question: "Are there window treatment options that work in high-humidity rooms in a Coeur d'Alene lake home?",
        answer: "Yes. Composite or faux-wood shutters, aluminum blinds, and synthetic roller shade fabrics all hold up well in humid lake-adjacent rooms. Avoid real wood blinds, fabric Roman shades, and woven woods in these spaces — they absorb moisture, warp, or develop mildew.",
      },
    ],
    relatedPosts: [
      {
        title: "5 Biggest Window Treatment Fears Coeur d'Alene Homeowners Have — Solved",
        slug: "5-biggest-window-treatment-fears-in-coeur-dalene-solved",
      },
      {
        title: "Why Your Craftsman Home Feels Cold — and How Cellular Shades Fix It",
        slug: "why-craftsman-homes-feel-cold-in-coeur-dalene-fixed",
      },
      {
        title: "Mermet KoolBlack® Solar Screens for Coeur d'Alene Lake Views",
        slug: "mermet-koolblack-solar-screens-for-coeur-dalene-homes",
      },
      {
        title: "Moisture-Proof Window Treatments for Lake Homes, Kitchens & Bathrooms",
        slug: "moisture-proof-window-treatments-kitchens-bathrooms-lake-homes",
      },
      {
        title: "SmartDrape Patio-Door Shades in Coeur d'Alene and Post Falls",
        slug: "smartdrape-patio-door-shades-in-coeur-dalene-post-falls",
      },
    ],
    productIntro:
      "Lake views and big south-facing glass make solar shades and motorized shades the two we install most often in Coeur d'Alene. Plantation shutters are common in the older homes near downtown, and cellular shades handle the bedrooms in almost every project.",
    localCTA: "Ready to find the right window treatments for your Coeur d'Alene home? We offer free in-home consultations throughout the Coeur d'Alene area — from lakefront properties to downtown neighborhoods.",
    metaTitle: "Custom Window Treatments in Coeur d'Alene | Free In-Home Consultation",
    metaDescription: "Custom blinds, shades, shutters, and motorized treatments for Coeur d'Alene homes — lakefront, historic, and new construction. Free in-home consultation with Luxe Window Works.",
  },
  "post-falls": {
    slug: "post-falls",
    name: "Post Falls",
    headline: "Custom Window Treatments for Post Falls Homes",
    subheadline: "New construction, growing families, and homes that need window coverings that work as hard as you do. We are based in Post Falls.",
    description: "Post Falls is one of the fastest-growing cities in Idaho, and it shows. New subdivisions are going up throughout the city, bringing modern architecture, open floor plans, and large windows that need thoughtful treatment. But Post Falls isn't just new construction — established neighborhoods have their own character and their own window treatment needs. As a Post Falls-based business ourselves, Luxe Window Works is your true local expert.",
    neighborhoods: ["Riverview Estates", "Centennial Trail area", "Prairie Falls", "Pointe Meadows", "Cabernet Estates", "West Post Falls", "Syringa Heights", "Ross Point"],
    housingTypes: "Post Falls has experienced a building boom, meaning a significant portion of homes feature modern construction with open floor plans, large picture windows, and contemporary design. There's also a healthy mix of established ranch-style homes from the 1990s and 2000s, townhomes, and multi-family properties. New builds often have specialty window shapes — arches, angles, and floor-to-ceiling glass — that require precise custom measurement.",
    climateConsiderations: "Post Falls sits in the Spokane River corridor and tends to experience the full force of Northern Idaho's temperature extremes — single digits in winter, 90s in summer. Without the moderating effect of the lake that Coeur d'Alene enjoys, energy-efficient window treatments like cellular shades are especially valuable here. South and west-facing windows in newer homes with larger glass areas can generate significant heat gain in summer, making solar shades or quality roller shades a smart investment.",
    markInsight: "Post Falls is our home base, so I know these neighborhoods street by street. The new construction boom here has been remarkable — and it's created a very specific set of challenges. Builder-grade windows are larger than they used to be, open floor plans mean you're often treating a wall of glass rather than individual windows, and specialty shapes like arched transoms are everywhere in the newer subdivisions. The other thing I see constantly in Post Falls new builds: buyers move in and realize they have zero privacy and zero light control because the builder doesn't include window treatments. Getting in early — ideally before you're fully moved in — makes the job easier and the result cleaner. Post Falls also hits temperature extremes harder than CDA without the lake to moderate things, so cellular shades are almost always part of the conversation.",
    faqs: [
      {
        question: "When is the best time to order window treatments for a new construction home in Post Falls?",
        answer: "The best time is before you move in, if possible. Once furniture is in place, installation gets harder — especially on large windows or specialty shapes. Ideally, schedule a consultation shortly after you close or get your move-in date. That gives enough time to measure, order, and have treatments installed before or during the first week you're in the home. Custom orders typically take 3–4 weeks; plantation shutters and custom drapes run 6–8 weeks. If you're already moved in, no problem — it just takes a bit more coordination on install day.",
      },
      {
        question: "My new Post Falls home has an arched transom window above the front door — can you treat that?",
        answer: "Yes. Arched and specialty-shaped windows are common in Post Falls new construction, and they're very treatable. The options depend on the shape and size: some arches work well with a fabric shade that follows the curve, others are better left untreated to let in light while the lower rectangular section gets a shade or shutter. For arched windows that need light control or privacy, we can fit a custom shutter with an arched top panel. During the consultation I'll assess each specialty window and give you honest options — including when leaving it bare is actually the right call.",
      },
      {
        question: "Are cellular shades worth it in a newer Post Falls home that's already well-insulated?",
        answer: "Yes, and here's why: Post Falls hits temperature extremes harder than Coeur d'Alene because there's no lake to moderate the climate. Even in a well-insulated new build, glass is always the weakest thermal link — and windows can account for 25–30% of heating and cooling loss. Cellular shades add a meaningful insulating layer at the glass itself, which complements your wall and attic insulation rather than replacing it. In a home with a lot of south or west-facing glass — which is common in Post Falls new construction — the energy impact is especially noticeable in summer.",
      },
      {
        question: "How do I get window treatments that match the style of my new Post Falls home without it looking builder-basic?",
        answer: "The biggest upgrade from builder-basic is custom sizing and layering. Off-the-shelf treatments are cut to standard sizes and rarely fit new construction windows cleanly — you'll see light gaps, awkward proportions, or treatments that just look like they don't belong. Custom-measured treatments fill the opening precisely, which immediately looks more intentional and finished. Beyond fit, layering a sheer roller shade with blackout or pairing a solar shade with side panels gives the room depth that a single product can't. During the consultation I bring samples and we look at the whole room, not just the window.",
      },
    ],
    relatedPosts: [
      {
        title: "Window Coverings for New Construction in Coeur d'Alene & Rathdrum",
        slug: "window-coverings-for-new-construction-in-coeur-dalene-rathdrum",
      },
      {
        title: "Cellular Shades for Energy Savings in Coeur d'Alene & Post Falls",
        slug: "cellular-shades-for-energy-savings-in-coeur-dalene-post-falls",
      },
      {
        title: "The Science of Savings: Energy-Efficient Window Treatments for Northern Idaho",
        slug: "energy-efficient-window-treatments-for-northern-idaho-homes",
      },
      {
        title: "How Much Does Battery-Operated Motorized Shade Installation Cost in Post Falls?",
        slug: "how-much-does-battery-operated-motorized-shades-installation-cost-in-post-falls-coeur-dalene-id",
      },
      {
        title: "Faux Wood vs. Composite Blinds: Which Holds Up Better in Northern Idaho?",
        slug: "faux-wood-vs-composite-blinds-which-holds-up-better-in-northern-idaho",
      },
    ],
    productIntro:
      "Post Falls homes usually start with cellular shades, because the temperature swings here are sharper without the lake to moderate them. Motorized shades follow close behind — new construction favors tall windows and wide spans that are awkward to reach. Plantation shutters and roman shades round out most whole-home projects.",
    localCTA: "We're based right here in Post Falls and know these neighborhoods well. Schedule a free in-home consultation — we can usually get to Post Falls homes the fastest since it's our home base.",
    metaTitle: "Custom Window Treatments in Post Falls | Free In-Home Consultation",
    metaDescription: "Luxe Window Works is based in Post Falls. We bring samples to your home, measure every window, and install custom blinds, shades, and shutters. Free in-home consultation.",
  },
  "hayden": {
    slug: "hayden",
    name: "Hayden",
    headline: "Custom Window Coverings for Hayden Homes",
    subheadline: "From Hayden Lake properties to the family neighborhoods along Government Way — tailored solutions for every home.",
    description: "Hayden blends the appeal of lakeside living with the convenience of a growing suburban community. Hayden Lake properties present premium window treatment opportunities with lake views that need solar protection, while the residential neighborhoods throughout Hayden feature a mix of established homes and newer construction that each benefit from professional window treatment consultation.",
    neighborhoods: ["Hayden Lake waterfront", "Honeysuckle Beach area", "Government Way corridor", "Atlas Road neighborhoods", "Hayden Meadows", "Lancaster Road area"],
    housingTypes: "Hayden offers everything from luxury lakefront properties on Hayden Lake — often with expansive windows designed to showcase water views — to comfortable family homes in established neighborhoods and newer construction in developing areas. The lakefront and near-lake properties tend toward larger, more architecturally distinctive homes that benefit from premium treatments like shutters and motorized solutions.",
    climateConsiderations: "Hayden Lake properties deal with similar water-reflection glare issues as Coeur d'Alene lakefront homes, making solar shades a popular choice. Inland Hayden neighborhoods experience the full range of Northern Idaho temperature extremes without lake moderation. The area's elevation means slightly more snow and cold in winter than lower-lying Post Falls, making energy efficiency an important factor in window treatment selection.",
    markInsight: "Hayden is interesting because it's two very different markets in the same city. Hayden Lake properties are some of the most architecturally distinctive homes I work in — large windows, premium finishes, owners who have strong opinions about what they want. Then a few miles away you have the family neighborhoods along Government Way and Atlas Road where the priorities are completely different: privacy, light control, durability for kids and pets. I approach those two conversations very differently. On the lake properties, motorized shades come up constantly — especially for clerestory windows and high installations where manual operation just isn't practical. In the family neighborhoods, it's usually about finding something that looks great, holds up, and doesn't require a lot of fuss.",
    faqs: [
      {
        question: "What window treatments work best for Hayden Lake waterfront properties with large view windows?",
        answer: "Solar shades are the go-to for lake-view windows — they cut glare and UV while keeping the view intact, which is exactly what you want on Hayden Lake. For openness factor, most lakefront clients land on 3% or 5% fabric depending on how much direct sun the window gets. On larger window walls or hard-to-reach installations, motorized solar shades are worth the investment — you can adjust them from your phone as the sun moves without touching them. For rooms where you also need full privacy at night, a layered approach works well: solar shade for daytime glare control, blackout roller behind it for evenings.",
      },
      {
        question: "Are plantation shutters a good fit for a home near Hayden Lake?",
        answer: "Shutters are one of the strongest choices for Hayden Lake properties — they add architectural character that matches the quality of the home, they provide precise light control, and they hold their value well. For rooms directly adjacent to the lake or with high humidity exposure, the same material guidance applies as with any lake property: Norman's Osmo-finished wood or a composite like Woodlore Plus will hold up better than standard wood. For interior rooms away from direct moisture, real wood shutters are a beautiful option. The premium look of shutters also photographs well, which matters for higher-value lake homes.",
      },
      {
        question: "I have a vacation home on Hayden Lake — is it worth getting motorized shades for a property I only use part of the year?",
        answer: "It's actually one of the best use cases for motorization. Motorized shades let you control your home remotely — you can lower shades before you arrive to keep the house cool in summer, raise them to check in on the property, or set schedules so treatments are in the right position when you get there. For a vacation home, manual treatments mean either leaving them in one position for months or arriving to a house that's been in full sun all summer. Motorized shades via a phone app solve that completely. Battery-operated motors are also easy to install in a vacation home since there's no hardwiring required.",
      },
      {
        question: "How do I choose window treatments for a Hayden home with a mix of lake-view rooms and standard interior rooms?",
        answer: "You don't have to use the same product everywhere, and you usually shouldn't. The lake-facing rooms are a different problem than the bedrooms or home office — they need glare control and view preservation more than blackout. A common approach: solar shades on the lake-view windows, cellular or roller shades in bedrooms for privacy and light control, and shutters in bathrooms or rooms where you want something that looks built-in and permanent. During the consultation I'll go room by room and make sure each window gets the treatment that actually fits what that space needs.",
      },
    ],
    relatedPosts: [
      {
        title: "Smart Shade Motorization Guide for Northern Idaho Homes",
        slug: "smart-shade-motorization-guide-for-northern-idaho-homes",
      },
      {
        title: "Layered Shutters & Motorized Shades for Northern Idaho Homes",
        slug: "layered-shutters-motorized-shades-for-northern-idaho-homes",
      },
      {
        title: "The Hidden Value of Plantation Shutters in Northern Idaho Homes",
        slug: "the-hidden-value-of-plantation-shutters-in-northern-idaho-homes",
      },
      {
        title: "The Smart Shade Showdown: Hardwired vs RF vs IR vs Z-Wave",
        slug: "smart-shade-motorization-guide-for-northern-idaho-homes",
      },
    ],
    productIntro:
      "Hayden splits two ways. Lake properties need solar shades for glare and heat off the water, while the family homes along Government Way are mostly cellular shades and wood blinds. Plantation shutters show up in the newer builds on the north end.",
    localCTA: "Whether you're on Hayden Lake or in one of the family neighborhoods, we provide free in-home consultations throughout the Hayden area. Let's find the right solution for your space.",
    metaTitle: "Hayden Window Treatments | Luxe Window Works",
    metaDescription: "Custom window treatments for Hayden, ID homes — including Hayden Lake properties. Free in-home consultation. 24 years consulting, designing, and installing window treatments.",
  },
  "rathdrum": {
    slug: "rathdrum",
    name: "Rathdrum",
    headline: "Window Treatments for Rathdrum's Expanding Neighborhoods",
    subheadline: "New homes, new families, and window coverings that match the energy of a growing community.",
    description: "Rathdrum has transformed from a quiet small town into one of Northern Idaho's most exciting growth areas. New subdivisions are bringing hundreds of families into modern, well-designed homes that need equally thoughtful window treatments. Rathdrum's blend of new construction, rural-adjacent properties, and small-town charm creates a unique set of window treatment needs that our 24 years in the trade are well-suited to handle.",
    neighborhoods: ["Rathdrum proper", "Westmond area", "Twin Lakes vicinity", "Highway 41 corridor", "Spirit Lake cutoff area", "Prairie developments"],
    housingTypes: "Rathdrum's housing is predominantly newer construction — ranch-style and two-story homes in planned subdivisions, many featuring open floor plans with large windows. There's also a mix of established small-town homes near Rathdrum's downtown core and larger rural properties on the outskirts. New builds typically have modern window sizes and shapes that work well with contemporary treatments like banded shades and roller shades.",
    climateConsiderations: "Rathdrum sits on the Rathdrum Prairie at a slightly higher elevation than Post Falls or Coeur d'Alene, which means colder winters and more exposure to weather. Wind can be a factor on the prairie, making well-fitted window treatments important for both insulation and comfort. The combination of newer construction (which tends to be more energy-efficient) and extreme temperatures makes cellular shades a particularly smart investment here — they complement modern insulation rather than fighting against drafty older windows.",
    markInsight: "Rathdrum surprises people. The growth out here has been fast — new subdivisions that didn't exist five years ago are now full neighborhoods. What I tell Rathdrum homeowners is this: newer construction doesn't mean your windows are already handled. Builder-grade windows are more energy-efficient than they used to be, but glass is still glass — it conducts heat and cold far more readily than an insulated wall. The temperature swings on the Rathdrum Prairie are serious, and cellular shades add a meaningful insulating layer right at the glass where you need it most. They're almost always the right starting point here, and they complement the insulation you already have rather than replacing it.",
    faqs: [
      {
        question: "Does the Rathdrum Prairie's open setting affect what window treatments make sense?",
        answer: "The main thing it affects is how much you feel the temperature extremes — the prairie doesn't have a lake nearby to moderate the climate the way Coeur d'Alene does, so winters run colder and summers can run hotter. That makes the insulating value of cellular shades especially relevant here. The honeycomb cell structure traps air at the glass, which is where heat and cold transfer most readily in any home. Precise fit matters too — a custom-measured shade that fills the window opening properly gives you better light control and a cleaner look than a standard off-the-shelf size.",
      },
      {
        question: "My Rathdrum home was built recently and is well-insulated — do I still need energy-efficient window treatments?",
        answer: "Yes. Even in a new build with good insulation, windows are the thermal weak point — glass conducts heat and cold far more readily than an insulated wall. Modern energy-efficient windows are better than they used to be, but adding a cellular shade at the glass itself is a meaningful additional layer. Think of it like a good jacket over a good sweater — both matter. In Rathdrum specifically, where winters are colder and windier than in lower-elevation communities in the corridor, cellular shades on south, east, and west exposures are a smart investment regardless of how new the home is.",
      },
      {
        question: "What's the best window treatment for the large windows in my Rathdrum new construction home?",
        answer: "It depends on the room and orientation, but for Rathdrum new builds the most common starting point is cellular shades for bedrooms and main living areas — they handle the energy efficiency piece and look clean and modern. For south and west-facing windows that get strong afternoon sun, a solar shade is worth layering in if you want to keep the light without the heat. Open floor plans with large picture windows often do well with a roller shade in a neutral fabric — it keeps things visually clean while giving you light control. I'll go window by window during the consultation rather than pushing one product across the whole house.",
      },
      {
        question: "Are there window treatment options that hold up well with kids and pets in a Rathdrum family home?",
        answer: "Yes, and it's one of the most common conversations I have with Rathdrum families. Cordless and motorized options are the safest choice for households with young kids — no cords means no hazard, and it's now the standard I recommend regardless. For durability, faux-wood blinds and composite shutters hold up to bumps, humidity, and general family life better than fabric-only options. Roller shades in performance fabrics are also surprisingly durable and easy to wipe down. The products I carry are made by manufacturers — Lafayette Interior Fashions, Norman Window Fashions, Alta — who back them with real warranties, so if something does get damaged, there's a path to resolution.",
      },
    ],
    relatedPosts: [
      {
        title: "STOP LEAKING MONEY: The Expert's Guide to Choosing Cellular Shades for Maximum ROI",
        slug: "cellular-shades-for-energy-savings-in-coeur-dalene-post-falls",
      },
      {
        title: "Window Coverings for New Construction in Coeur d'Alene & Rathdrum",
        slug: "window-coverings-for-new-construction-in-coeur-dalene-rathdrum",
      },
      {
        title: "Why Performance Solar Shade Fabrics Are Worth Every Penny",
        slug: "why-performance-solar-shade-fabrics-are-worth-every-penny-a-window-pros-honest-take",
      },
      {
        title: "Energy-Efficient Window Treatments for Northern Idaho Homes",
        slug: "energy-efficient-window-treatments-for-northern-idaho-homes",
      },
    ],
    productIntro:
      "Rathdrum's new subdivisions mean a lot of bare windows at once, so cellular shades and roller shades cover a whole house without the budget getting away from you. Motorized shades are worth it on anything above a stairwell or out of easy reach.",
    localCTA: "Rathdrum is growing fast, and we're growing with it. Whether you're in a brand-new subdivision or one of the established neighborhoods, we offer free in-home consultations throughout the Rathdrum area.",
    metaTitle: "Rathdrum Window Treatments | Luxe Window Works",
    metaDescription: "Custom window treatments for Rathdrum, ID homes — new construction and growing neighborhoods. Free in-home consultation. 24 years consulting, designing, and installing window treatments.",
  },
  "sandpoint": {
    slug: "sandpoint",
    name: "Sandpoint",
    headline: "Luxury Window Treatments for Sandpoint's Lakeside Living",
    subheadline: "Premium window coverings for one of Idaho's most stunning communities — where every window is a frame for something beautiful.",
    description: "Sandpoint sits at the northern tip of Lake Pend Oreille, one of the largest and deepest lakes in the western United States. The homes here are as impressive as the setting — from historic downtown properties to luxury lakefront estates and mountain-view homes in the surrounding hills. Window treatments in Sandpoint aren't just functional — they're part of the home's relationship with its extraordinary surroundings.",
    neighborhoods: ["Downtown Sandpoint", "Lake Pend Oreille waterfront", "Bottle Bay", "Sagle area", "Ponder Point", "Gold Hill", "Schweitzer Mountain area"],
    housingTypes: "Sandpoint features some of Northern Idaho's most architecturally distinctive homes. Lakefront properties often have massive window walls designed to maximize lake and mountain views. Mountain homes near Schweitzer may feature lodge-style architecture with soaring ceilings and dramatic window configurations. Downtown Sandpoint has charming older homes with character and quirky window shapes. Each requires a tailored approach.",
    climateConsiderations: "Sandpoint's northerly location means longer, colder winters and more snow than communities further south in the corridor. Lake Pend Oreille moderates temperatures somewhat for waterfront properties, but inland and mountain-area homes experience the full force of Northern Idaho winter. Summer brings long, warm days with intense sun that reflects brilliantly off the lake — making solar protection crucial for waterfront properties. The combination of extreme seasons and premium homes makes energy-efficient, high-quality window treatments not just a comfort issue but a home protection investment.",
    markInsight: "Sandpoint is genuinely one of my favorite places to work. The drive is beautiful, and the homes up there are some of the most architecturally interesting in the whole region. Lake Pend Oreille is massive — the views are in a completely different category than anywhere else I serve. That changes the conversation around window treatments significantly. Nobody up there wants to block the view. So the question is always how do we manage the sun and protect the home without taking away the reason you bought the place. Motorization also comes up more in Sandpoint than anywhere else — lodge-style homes with 18 or 20-foot ceilings and clerestory windows aren't something you can treat manually. You need a motorized solution, and often a longer rod or specialty lift system. I've done enough of these to know what works.",
    faqs: [
      {
        question: "What window treatments let me keep my view of Lake Pend Oreille while controlling glare?",
        answer: "Solar shades are the right product for lake-view windows in Sandpoint. The key is choosing the correct openness factor — the percentage of light that passes through the fabric. A 3% fabric cuts the overwhelming majority of glare while keeping the view fully visible; a 5% fabric lets in a bit more light with a slight tradeoff. Both options look clean and nearly invisible from inside when looking out. For windows that also need full privacy at night, a dual shade system — solar shade in front, blackout or privacy roller behind — gives you control at any time of day without sacrificing the daytime view. Lake Pend Oreille is too good a view to compromise.",
      },
      {
        question: "I have a lodge-style home near Schweitzer with very tall windows — what are my options?",
        answer: "Motorization is the practical answer for tall windows in lodge-style homes, and it's what I recommend almost universally for these installations. Manual operation on a 16 or 20-foot window isn't realistic — the cords are unwieldy and the operation wears out over time. Motorized shades on a battery or hardwired motor can be operated by phone, remote, or voice, and can be set on schedules. For clerestory windows that are purely decorative and don't need covering, sometimes the right answer is to leave them as-is and focus treatment on the lower operable windows. I'll assess each window during the consultation and give you an honest take on what's worth treating and how.",
      },
      {
        question: "How do I protect furniture and floors from sun damage in a Sandpoint home with big windows?",
        answer: "UV protection is one of the strongest arguments for solar shades on Lake Pend Oreille waterfront and view properties. Summer days in Sandpoint are long and the sun angle off the lake intensifies UV exposure significantly. Solar shade fabrics block 95–99% of UV rays depending on the fabric and openness factor — even a 10% open fabric blocks the vast majority of damaging UV while letting in diffused natural light. Hardwood floors, rugs, upholstery, and artwork are all vulnerable to fading without UV protection at the glass. The investment in good solar shades typically costs far less than refinishing floors or replacing furniture.",
      },
      {
        question: "Is it worth investing in quality window treatments for a Sandpoint vacation home I use seasonally?",
        answer: "Yes — possibly more so than a primary residence. A vacation home sits empty and unmonitored for long stretches, which means windows that face south or west are taking full sun exposure with no one there to close a shade. UV damage, heat buildup, and fading happen whether you're home or not. Quality solar shades on those exposures protect your investment year-round. Motorized shades add another layer of value for a vacation property — you can control them remotely, lower them before you arrive to keep the house at a reasonable temperature, and set schedules so the home is always in the right position. For a home at Sandpoint's price point, the treatment cost is a small fraction of what you're protecting.",
      },
    ],
    relatedPosts: [
      {
        title: "Stop Sun Fading in North Idaho Log Homes with UV Shades",
        slug: "stop-sun-fading-in-north-idaho-log-homes-with-uv-shades",
      },
      {
        title: "Smart Shade Motorization Guide for Northern Idaho Homes",
        slug: "smart-shade-motorization-guide-for-northern-idaho-homes",
      },
      {
        title: "The Science of Savings: Energy-Efficient Window Treatments for Northern Idaho",
        slug: "energy-efficient-window-treatments-for-northern-idaho-homes",
      },
      {
        title: "Why Performance Solar Shade Fabrics Are Worth Every Penny",
        slug: "why-performance-solar-shade-fabrics-are-worth-every-penny-a-window-pros-honest-take",
      },
    ],
    productIntro:
      "Sandpoint homes lean toward big glass and long views, so solar shades and motorized shades lead here — you want the view preserved and the glare gone. Plantation shutters suit the architecture on the older streets above the lake, and cellular shades earn their keep through a Sandpoint winter.",
    localCTA: "We serve the greater Sandpoint area including lakefront properties, downtown homes, and the Schweitzer corridor. Schedule a free in-home consultation — the drive to Sandpoint is one of our favorites.",
    metaTitle: "Sandpoint Window Treatments | Luxe Window Works",
    metaDescription: "Luxury window treatments for Sandpoint, ID — Lake Pend Oreille waterfront and mountain homes. Free consultation. 24 years consulting, designing, and installing window treatments.",
  },
  // Seattle Eastside entries (added October 2026). Hunter Douglas only, served
  // by appointment from Luxe's Post Falls base: Luxe handles the in-home
  // consultation and sale; measuring and installation are performed through
  // Hunter Douglas Installation Services. No North Idaho claims on these pages.
  bellevue: {
    slug: "bellevue",
    name: "Bellevue",
    state: "Washington",
    hdPage: "/hunter-douglas-bellevue",
    headline: "Hunter Douglas Window Treatments for Bellevue Homes",
    subheadline: "West-facing Lake Washington glass, modern remodels, and whole-home PowerView projects. We bring the Hunter Douglas collection to your Bellevue home by appointment.",
    description: "Luxe Window Works is based in Post Falls, Idaho and serves Bellevue by appointment with Hunter Douglas window treatments. Owner Mark Abplanalp sold Hunter Douglas on the Eastside for years and brings 20 years as a Hunter Douglas dealer to every consultation. We come to your home with samples, help you compare collections and controls in your own light, and coordinate measuring and installation through Hunter Douglas Installation Services, the manufacturer's own certified installation service.",
    neighborhoods: ["Medina", "Clyde Hill", "Hunts Point", "West Bellevue", "Bridle Trails", "BelRed", "Crossroads", "Newport Shores", "Somerset"],
    housingTypes: "Bellevue housing runs from mid-century homes in Bridle Trails and Newport to the large contemporary remodels and new construction of West Bellevue, Medina, and Clyde Hill. Tall glass, open floor plans, and west-facing Lake Washington views are common, and they call for treatments that manage glare and heat without giving up the view.",
    climateConsiderations: "West-facing Bellevue homes take strong afternoon sun off Lake Washington. Solar and sheer shades with the right openness factor cut glare and UV while keeping the view, and cellular shades help with the heat that builds up on big glass. In the gray months, light-filtering fabrics keep rooms bright without the flat look of a closed blind.",
    faqs: [
      {
        question: "Does Luxe Window Works have a showroom in Bellevue?",
        answer: "No. Luxe is based in Post Falls, Idaho and serves Bellevue by appointment with in-home consultations. We bring Hunter Douglas samples to your home, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers.",
      },
      {
        question: "Who measures and installs Hunter Douglas shades in Bellevue?",
        answer: "Measuring and installation are performed through Hunter Douglas Installation Services, the manufacturer's certified installation network. Measurements are guaranteed for fit, installation carries a one-year installation guarantee from the service, and the shades themselves carry the Hunter Douglas lifetime warranty.",
      },
      {
        question: "What window treatments handle west-facing Lake Washington glare?",
        answer: "Sheer shades like Silhouette and solar shades with a lower openness factor are the usual answer: they diffuse or filter the afternoon sun while preserving the view. We compare openness levels in your actual light during the consultation.",
      },
    ],
    productIntro: "In Bellevue, Luxe works exclusively with Hunter Douglas. Silhouette sheer shades and Designer Solar Shades lead for lake-facing glass, PowerView automation ties shades into the smart-home systems Bellevue homes already run, and Duette cellular shades handle comfort on large windows.",
    localCTA: "Ready to compare Hunter Douglas in your Bellevue home? Book an in-home consultation and we will bring the collection to you.",
    metaTitle: "Bellevue Hunter Douglas Window Treatments | Luxe Window Works",
    metaDescription: "Hunter Douglas shades, blinds, and PowerView automation for Bellevue, WA homes. In-home consultations by appointment; measuring and installation through Hunter Douglas Installation Services.",
  },
  kirkland: {
    slug: "kirkland",
    name: "Kirkland",
    state: "Washington",
    hdPage: "/hunter-douglas-kirkland",
    headline: "Hunter Douglas Window Treatments for Kirkland Homes",
    subheadline: "Waterfront light in Juanita and Houghton, family homes in Rose Hill. Hunter Douglas samples in your home, by appointment.",
    description: "Luxe Window Works is based in Post Falls, Idaho and serves Kirkland by appointment with Hunter Douglas window treatments. Owner Mark Abplanalp sold Hunter Douglas on the Eastside for years and brings 20 years as a Hunter Douglas dealer to every consultation. We bring samples to your home so you can weigh view, privacy, and glare in the rooms themselves, then coordinate measuring and installation through Hunter Douglas Installation Services, the manufacturer's own certified installation service.",
    neighborhoods: ["Juanita", "Houghton", "Rose Hill", "Totem Lake", "Finn Hill", "Market", "Moss Bay", "Everest", "Kingsgate"],
    housingTypes: "Kirkland mixes waterfront and near-lake homes in Houghton and Juanita with established family neighborhoods in Rose Hill, Finn Hill, and Kingsgate, plus newer townhomes around Totem Lake. Waterfront glass wants view-preserving light control; the family neighborhoods ask more about privacy, durability, and room darkening.",
    climateConsiderations: "Kirkland's west-facing homes along Lake Washington get bright afternoon sun and reflected glare off the water. Sheer and solar fabrics manage it without closing the view down. Away from the water, the priorities flip to privacy and insulation, where cellular shades and lined Roman shades do the work.",
    faqs: [
      {
        question: "Does Luxe Window Works have a showroom in Kirkland?",
        answer: "No. Luxe is based in Post Falls, Idaho and serves Kirkland by appointment with in-home consultations. We bring Hunter Douglas samples to your home, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers.",
      },
      {
        question: "Can I keep my Lake Washington view and still cut the glare?",
        answer: "Yes. Silhouette sheer shades diffuse the light while keeping a daytime view, and solar shades filter glare and UV at an openness level you choose. Both are available with PowerView automation so the west rooms adjust on a schedule.",
      },
      {
        question: "Who handles installation for Kirkland orders?",
        answer: "Measuring and installation are performed through Hunter Douglas Installation Services, the manufacturer's certified installation network. Measurements are guaranteed for fit, installation carries a one-year installation guarantee from the service, and the shades carry the Hunter Douglas lifetime warranty.",
      },
    ],
    productIntro: "In Kirkland, Luxe works exclusively with Hunter Douglas. Silhouette and Luminette sheers suit the lake-facing rooms, Duette cellular shades handle comfort and privacy inland, and PowerView automation is a natural fit for Kirkland's connected homes.",
    localCTA: "Ready to compare Hunter Douglas in your Kirkland home? Book an in-home consultation and we will bring the collection to you.",
    metaTitle: "Kirkland Hunter Douglas Window Treatments | Luxe Window Works",
    metaDescription: "Hunter Douglas shades, blinds, and PowerView automation for Kirkland, WA homes. In-home consultations by appointment; measuring and installation through Hunter Douglas Installation Services.",
  },
  sammamish: {
    slug: "sammamish",
    name: "Sammamish",
    state: "Washington",
    hdPage: "/hunter-douglas-sammamish",
    headline: "Hunter Douglas Window Treatments for Sammamish Homes",
    subheadline: "Big homes, tall windows, two-story great rooms. Hunter Douglas and PowerView, chosen in your home, by appointment.",
    description: "Luxe Window Works is based in Post Falls, Idaho and serves Sammamish by appointment with Hunter Douglas window treatments. Owner Mark Abplanalp sold Hunter Douglas on the Eastside for years and brings 20 years as a Hunter Douglas dealer to every consultation. We bring samples to your home, plan each room with you, and coordinate measuring and installation through Hunter Douglas Installation Services, the manufacturer's own certified installation service.",
    neighborhoods: ["Klahanie", "Pine Lake", "Beaver Lake", "Sahalee", "Trossachs", "Aldarra", "Inglewood Hill", "East Lake Sammamish"],
    housingTypes: "Sammamish is largely newer, larger single-family construction: two-story great rooms, clerestory windows, primary suites with big glass, and open plans throughout Klahanie, Trossachs, and the Pine Lake and Beaver Lake neighborhoods. High and hard-to-reach windows are the norm, which makes motorization a practical choice rather than a luxury.",
    climateConsiderations: "Large south and west exposures in Sammamish homes build up heat on summer afternoons, and two-story glass is hard to shade by hand. PowerView automation on a schedule handles the daily adjustment, cellular shades add insulation at the glass, and solar fabrics protect floors and furnishings from UV.",
    faqs: [
      {
        question: "Does Luxe Window Works have a showroom in Sammamish?",
        answer: "No. Luxe is based in Post Falls, Idaho and serves Sammamish by appointment with in-home consultations. We bring Hunter Douglas samples to your home, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers.",
      },
      {
        question: "What is the best way to cover two-story windows in a great room?",
        answer: "Motorized shades are the practical answer for glass you cannot reach. With PowerView automation, Hunter Douglas shades open, close, and tilt by remote, app, or schedule. We plan the power options and controls with you during the consultation.",
      },
      {
        question: "Who measures and installs Hunter Douglas shades in Sammamish?",
        answer: "Measuring and installation are performed through Hunter Douglas Installation Services, the manufacturer's certified installation network. Measurements are guaranteed for fit, installation carries a one-year installation guarantee from the service, and the shades carry the Hunter Douglas lifetime warranty.",
      },
    ],
    productIntro: "In Sammamish, Luxe works exclusively with Hunter Douglas. PowerView motorized shades lead for two-story great rooms and hard-to-reach glass, Duette cellular shades handle comfort in large rooms, and Silhouette sheers soften the light in open living spaces.",
    localCTA: "Ready to compare Hunter Douglas in your Sammamish home? Book an in-home consultation and we will bring the collection to you.",
    metaTitle: "Sammamish Hunter Douglas Window Treatments | Luxe Window Works",
    metaDescription: "Hunter Douglas shades and PowerView automation for Sammamish, WA homes, including two-story windows. In-home consultations by appointment; installation through Hunter Douglas Installation Services.",
  },
  issaquah: {
    slug: "issaquah",
    name: "Issaquah",
    state: "Washington",
    hdPage: "/hunter-douglas-issaquah",
    headline: "Hunter Douglas Window Treatments for Issaquah Homes",
    subheadline: "Newer construction in the Highlands and Talus, mountain light on Squak. Hunter Douglas samples in your home, by appointment.",
    description: "Luxe Window Works is based in Post Falls, Idaho and serves Issaquah by appointment with Hunter Douglas window treatments. Owner Mark Abplanalp sold Hunter Douglas on the Eastside for years and brings 20 years as a Hunter Douglas dealer to every consultation. We bring samples to your home, help you move past builder-grade coverings room by room, and coordinate measuring and installation through Hunter Douglas Installation Services, the manufacturer's own certified installation service.",
    neighborhoods: ["Issaquah Highlands", "Talus", "Squak Mountain", "Olde Town", "Gilman", "Providence Point", "Newport Way", "Tibbetts Valley"],
    housingTypes: "Issaquah housing is dominated by newer planned communities: Issaquah Highlands and Talus homes with tall windows and open plans, hillside homes on Squak Mountain with valley views, and older homes around Olde Town. Many newer homes still wear the builder-grade blinds they were sold with, and upgrading them is the most common Issaquah project.",
    climateConsiderations: "Issaquah sits against the foothills, so light swings with the season and the slope of the lot. Hillside homes take strong sun on view glass, while shaded north-facing rooms need fabrics that keep what light there is. Cellular shades help with the temperature swings that come with elevation and large windows.",
    faqs: [
      {
        question: "Does Luxe Window Works have a showroom in Issaquah?",
        answer: "No. Luxe is based in Post Falls, Idaho and serves Issaquah by appointment with in-home consultations. We bring Hunter Douglas samples to your home, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers.",
      },
      {
        question: "Can you replace the builder-grade blinds in a newer Issaquah home?",
        answer: "Yes, and it is one of the most common projects we consult on in Issaquah. We help you prioritize room by room, starting where light, privacy, or heat bothers you most, and everything is measured and installed through Hunter Douglas Installation Services.",
      },
      {
        question: "Who measures and installs Hunter Douglas shades in Issaquah?",
        answer: "Measuring and installation are performed through Hunter Douglas Installation Services, the manufacturer's certified installation network. Measurements are guaranteed for fit, installation carries a one-year installation guarantee from the service, and the shades carry the Hunter Douglas lifetime warranty.",
      },
    ],
    productIntro: "In Issaquah, Luxe works exclusively with Hunter Douglas. Duette cellular shades and Designer Roller Shades are the workhorses for newer construction, Silhouette sheers suit the view glass on the hillsides, and PowerView automation grows with the home.",
    localCTA: "Ready to compare Hunter Douglas in your Issaquah home? Book an in-home consultation and we will bring the collection to you.",
    metaTitle: "Issaquah Hunter Douglas Window Treatments | Luxe Window Works",
    metaDescription: "Hunter Douglas shades, blinds, and PowerView automation for Issaquah, WA homes. In-home consultations by appointment; measuring and installation through Hunter Douglas Installation Services.",
  },
  renton: {
    slug: "renton",
    name: "Renton",
    state: "Washington",
    hdPage: "/hunter-douglas-renton",
    headline: "Hunter Douglas Window Treatments for Renton Homes",
    subheadline: "Lake views in Kennydale, family neighborhoods in Fairwood and the Highlands. Hunter Douglas samples in your home, by appointment.",
    description: "Luxe Window Works is based in Post Falls, Idaho and serves Renton by appointment with Hunter Douglas window treatments. Owner Mark Abplanalp sold Hunter Douglas on the Eastside for years and brings 20 years as a Hunter Douglas dealer to every consultation. We bring samples to your home, help you plan whole-home or room-by-room projects around your budget, and coordinate measuring and installation through Hunter Douglas Installation Services, the manufacturer's own certified installation service.",
    neighborhoods: ["Kennydale", "Fairwood", "Renton Highlands", "Benson Hill", "Cascade", "Talbot Hill", "Downtown Renton", "Gene Coulon Park area"],
    housingTypes: "Renton housing ranges widely: view homes above Lake Washington in Kennydale, established family neighborhoods in Fairwood and the Renton Highlands, and older homes near downtown. Project sizes range just as widely, from a single primary suite to a whole home at once.",
    climateConsiderations: "Kennydale and other west-facing Renton homes take afternoon sun off Lake Washington, where solar and sheer fabrics protect the view without the glare. In the valley neighborhoods, privacy and room darkening for shift workers and early sleepers come up constantly, and blackout cellular shades are the usual answer.",
    faqs: [
      {
        question: "Does Luxe Window Works have a showroom in Renton?",
        answer: "No. Luxe is based in Post Falls, Idaho and serves Renton by appointment with in-home consultations. We bring Hunter Douglas samples to your home, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers.",
      },
      {
        question: "Can I do a whole home in stages to manage the budget?",
        answer: "Yes. Many Renton projects start with the rooms that bother you most and add rooms over time. We keep your selections on file so later stages match, and each stage is measured and installed through Hunter Douglas Installation Services.",
      },
      {
        question: "Who measures and installs Hunter Douglas shades in Renton?",
        answer: "Measuring and installation are performed through Hunter Douglas Installation Services, the manufacturer's certified installation network. Measurements are guaranteed for fit, installation carries a one-year installation guarantee from the service, and the shades carry the Hunter Douglas lifetime warranty.",
      },
    ],
    productIntro: "In Renton, Luxe works exclusively with Hunter Douglas. Duette cellular shades lead for comfort and blackout bedrooms, Designer Roller and solar shades handle the Kennydale lake glass, and Applause cellular shades offer a value path for whole-home projects.",
    localCTA: "Ready to compare Hunter Douglas in your Renton home? Book an in-home consultation and we will bring the collection to you.",
    metaTitle: "Renton Hunter Douglas Window Treatments | Luxe Window Works",
    metaDescription: "Hunter Douglas shades, blinds, and PowerView automation for Renton, WA homes. In-home consultations by appointment; measuring and installation through Hunter Douglas Installation Services.",
  },
  "maple-valley": {
    slug: "maple-valley",
    name: "Maple Valley",
    state: "Washington",
    hdPage: "/hunter-douglas-maple-valley",
    headline: "Hunter Douglas Window Treatments for Maple Valley Homes",
    subheadline: "Family homes around Lake Wilderness and Cherokee Bay. Hunter Douglas samples in your home, by appointment.",
    description: "Luxe Window Works is based in Post Falls, Idaho and serves Maple Valley by appointment with Hunter Douglas window treatments. Owner Mark Abplanalp sold Hunter Douglas on the Eastside for years and brings 20 years as a Hunter Douglas dealer to every consultation. We bring samples to your home, focus on the practical questions family homes raise, and coordinate measuring and installation through Hunter Douglas Installation Services, the manufacturer's own certified installation service.",
    neighborhoods: ["Lake Wilderness", "Cherokee Bay", "Glacier Park", "Ravensdale", "Hobart", "Four Corners", "Summit Park", "Rock Creek"],
    housingTypes: "Maple Valley is family country: single-family subdivisions around Lake Wilderness and Four Corners, acreage homes out toward Ravensdale and Hobart, and newer construction mixed throughout. Priorities run practical: privacy from close neighbors, blackout bedrooms for kids, cordless operation for safety, and fabrics that hold up to daily family use.",
    climateConsiderations: "Maple Valley's tree cover and valley floor mean many homes fight for light in winter and want it controlled in summer. Light-filtering cellular and roller shades keep rooms bright without glare, and blackout options matter for bedrooms facing early summer sunrises.",
    faqs: [
      {
        question: "Does Luxe Window Works have a showroom in Maple Valley?",
        answer: "No. Luxe is based in Post Falls, Idaho and serves Maple Valley by appointment with in-home consultations. We bring Hunter Douglas samples to your home, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers.",
      },
      {
        question: "Are Hunter Douglas shades safe for homes with young kids?",
        answer: "Yes. Hunter Douglas offers cordless and motorized operating systems that remove accessible cords, including LiteRise and PowerView automation. We will walk through the safest options for each room during your consultation.",
      },
      {
        question: "Who measures and installs Hunter Douglas shades in Maple Valley?",
        answer: "Measuring and installation are performed through Hunter Douglas Installation Services, the manufacturer's certified installation network. Measurements are guaranteed for fit, installation carries a one-year installation guarantee from the service, and the shades carry the Hunter Douglas lifetime warranty.",
      },
    ],
    productIntro: "In Maple Valley, Luxe works exclusively with Hunter Douglas. Cordless Duette cellular shades and Designer Roller Shades suit family homes, blackout options handle kids' bedrooms, and Silhouette sheers soften light in living spaces around Lake Wilderness.",
    localCTA: "Ready to compare Hunter Douglas in your Maple Valley home? Book an in-home consultation and we will bring the collection to you.",
    metaTitle: "Maple Valley Hunter Douglas Window Treatments | Luxe Window Works",
    metaDescription: "Hunter Douglas shades, blinds, and PowerView automation for Maple Valley, WA homes. In-home consultations by appointment; installation through Hunter Douglas Installation Services.",
  },
};
