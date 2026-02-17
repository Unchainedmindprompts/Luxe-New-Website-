export interface AreaPageData {
  slug: string;
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  neighborhoods: string[];
  housingTypes: string;
  climateConsiderations: string;
  localCTA: string;
  metaTitle: string;
  metaDescription: string;
}

export const areaPages: Record<string, AreaPageData> = {
  "coeur-d-alene": {
    slug: "coeur-d-alene",
    name: "Coeur d'Alene",
    headline: "Custom Window Treatments for Coeur d'Alene Homes",
    subheadline: "From lakefront estates to downtown bungalows — window coverings designed for the way Coeur d'Alene lives.",
    description: "Coeur d'Alene is one of the most beautiful places in the Pacific Northwest, and its homes reflect that — from historic downtown craftsman homes to modern lakefront properties with floor-to-ceiling glass. Each presents unique window treatment challenges. Lake-facing windows need solar protection without sacrificing the view. Older homes have windows that aren't perfectly square after decades of settling. Newer construction along the lake often features oversized windows that need custom-engineered solutions. Mark has been installing window treatments in Coeur d'Alene homes for years and understands these local nuances intimately.",
    neighborhoods: ["Downtown Coeur d'Alene", "Sanders Beach", "Fernan Hill", "Coeur d'Alene Place", "Riverstone", "Northwest Boulevard", "Canfield Mountain", "Best Hill"],
    housingTypes: "Coeur d'Alene features an eclectic mix of housing — historic craftsman homes downtown, mid-century ranches in established neighborhoods, newer construction in planned communities, and premium lakefront and view properties. Each style has its own window treatment considerations, from the charming but uneven window frames of 1920s bungalows to the massive window walls in contemporary lakefront builds.",
    climateConsiderations: "Lake Coeur d'Alene creates its own microclimate. Homes near the water experience more humidity, which affects material choices (composite shutters over wood for lake-adjacent rooms). West-facing lakefront windows deal with intense afternoon sun reflecting off the water — solar shades with low openness factors are essential. In winter, the lake effect moderates temperatures slightly compared to inland areas, but older homes with original windows still benefit enormously from the insulating properties of cellular shades.",
    localCTA: "Ready to find the right window treatments for your Coeur d'Alene home? Mark offers free in-home consultations throughout the Coeur d'Alene area — from lakefront properties to downtown neighborhoods.",
    metaTitle: "Window Treatments Coeur d'Alene ID | Custom Blinds, Shades & Shutters",
    metaDescription: "Custom window treatments for Coeur d'Alene homes. Specializing in lakefront properties, historic homes, and new construction. Free in-home consultation. Nearly 20 years experience.",
  },
  "post-falls": {
    slug: "post-falls",
    name: "Post Falls",
    headline: "Window Treatments for Post Falls' Growing Community",
    subheadline: "New construction, growing families, and homes that need window coverings that work as hard as you do.",
    description: "Post Falls is one of the fastest-growing cities in Idaho, and it shows. New subdivisions are going up throughout the city, bringing modern architecture, open floor plans, and large windows that need thoughtful treatment. But Post Falls isn't just new construction — established neighborhoods have their own character and their own window treatment needs. As a Post Falls-based business ourselves, Luxe Window Works is your true local expert.",
    neighborhoods: ["Riverview Estates", "Centennial Trail area", "Prairie Falls", "Pointe Meadows", "Cabernet Estates", "West Post Falls", "Syringa Heights", "Ross Point"],
    housingTypes: "Post Falls has experienced a building boom, meaning a significant portion of homes feature modern construction with open floor plans, large picture windows, and contemporary design. There's also a healthy mix of established ranch-style homes from the 1990s and 2000s, townhomes, and multi-family properties. New builds often have specialty window shapes — arches, angles, and floor-to-ceiling glass — that require precise custom measurement.",
    climateConsiderations: "Post Falls sits in the Spokane River corridor and tends to experience the full force of Northern Idaho's temperature extremes — single digits in winter, 90s in summer. Without the moderating effect of the lake that Coeur d'Alene enjoys, energy-efficient window treatments like cellular shades are especially valuable here. South and west-facing windows in newer homes with larger glass areas can generate significant heat gain in summer, making solar shades or quality roller shades a smart investment.",
    localCTA: "We're based right here in Post Falls and know these neighborhoods well. Schedule a free in-home consultation — Mark can usually get to Post Falls homes the fastest since it's his home base.",
    metaTitle: "Window Treatments Post Falls ID | Blinds, Shades & Shutters",
    metaDescription: "Custom window treatments for Post Falls homes. Local business specializing in new construction and growing communities. Free in-home consultation. Nearly 20 years experience.",
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
    localCTA: "Whether you're on Hayden Lake or in one of the family neighborhoods, Mark provides free in-home consultations throughout the Hayden area. Let's find the right solution for your space.",
    metaTitle: "Window Treatments Hayden ID | Custom Blinds, Shades & Shutters",
    metaDescription: "Custom window treatments for Hayden, ID homes. Specializing in Hayden Lake properties and residential neighborhoods. Free in-home consultation. Nearly 20 years experience.",
  },
  "rathdrum": {
    slug: "rathdrum",
    name: "Rathdrum",
    headline: "Window Treatments for Rathdrum's Expanding Neighborhoods",
    subheadline: "New homes, new families, and window coverings that match the energy of a growing community.",
    description: "Rathdrum has transformed from a quiet small town into one of Northern Idaho's most exciting growth areas. New subdivisions are bringing hundreds of families into modern, well-designed homes that need equally thoughtful window treatments. Rathdrum's blend of new construction, rural-adjacent properties, and small-town charm creates a unique set of window treatment needs that Mark understands from years of working in the area.",
    neighborhoods: ["Rathdrum proper", "Westmond area", "Twin Lakes vicinity", "Highway 41 corridor", "Spirit Lake cutoff area", "Prairie developments"],
    housingTypes: "Rathdrum's housing is predominantly newer construction — ranch-style and two-story homes in planned subdivisions, many featuring open floor plans with large windows. There's also a mix of established small-town homes near Rathdrum's downtown core and larger rural properties on the outskirts. New builds typically have modern window sizes and shapes that work well with contemporary treatments like banded shades and roller shades.",
    climateConsiderations: "Rathdrum sits on the Rathdrum Prairie at a slightly higher elevation than Post Falls or Coeur d'Alene, which means colder winters and more exposure to weather. Wind can be a factor on the prairie, making well-fitted window treatments important for both insulation and comfort. The combination of newer construction (which tends to be more energy-efficient) and extreme temperatures makes cellular shades a particularly smart investment here — they complement modern insulation rather than fighting against drafty older windows.",
    localCTA: "Rathdrum is growing fast, and we're growing with it. Whether you're in a brand-new subdivision or one of the established neighborhoods, Mark offers free in-home consultations throughout the Rathdrum area.",
    metaTitle: "Window Treatments Rathdrum ID | Blinds, Shades & Shutters",
    metaDescription: "Custom window treatments for Rathdrum, ID homes. Specializing in new construction and growing communities. Free in-home consultation. Nearly 20 years experience.",
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
    localCTA: "Mark serves the greater Sandpoint area including lakefront properties, downtown homes, and the Schweitzer corridor. Schedule a free in-home consultation — the drive to Sandpoint is one of his favorites.",
    metaTitle: "Window Treatments Sandpoint ID | Custom Blinds, Shades & Shutters",
    metaDescription: "Luxury window treatments for Sandpoint, ID homes. Specializing in Lake Pend Oreille waterfront properties and mountain homes. Free consultation. Nearly 20 years experience.",
  },
};
