export interface FAQ {
  question: string;
  answer: string;
}

export interface ProductVideo {
  // Stable slug used to generate the @id (e.g. "video-motorization-overview"
  // becomes https://www.luxewindowworks.com/#video-motorization-overview).
  // Keep this stable once published — it's the entity identifier crawlers use.
  idSlug: string;
  youtubeId: string;
  title: string;
  description: string;
  uploadDate: string;
  duration: string;
}

export interface ProductPageData {
  slug: string;
  name: string;
  image?: string;
  video?: ProductVideo;
  secondVideo?: ProductVideo;
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  expertInsight: string;
  features: string[];
  idealFor: string[];
  localContext: string;
  faqs: FAQ[];
  metaTitle: string;
  metaDescription: string;
}

export const productPages: Record<string, ProductPageData> = {
  "blinds": {
    slug: "blinds",
    name: "Blinds",
    image: "/images/wood-blinds.jpeg",
    headline: "Tired of Blinds That Warp, Sag, or Yellow After a Few Idaho Summers?",
    subheadline: "Real wood, faux wood, and composite blinds — matched to the right room so they look sharp and stay straight for years. Custom-fit and professionally installed across North Idaho.",
    problem: "Most blinds don't fail because blinds are a bad product — they fail because the wrong material went into the wrong room. Big-box stores sell one-size-fits-all faux wood and let you sort out the rest. Then a few seasons later, the slats on that big south-facing window have bowed in the heat, the budget vinyl has yellowed, or real wood blinds in the bathroom have swelled and stopped tilting. North Idaho is especially hard on the wrong choice: freezing dry winters, intense summer sun on lake-facing glass, and 60-degree temperature swings between January and July.",
    solution: "The fix is matching the material to the window. Faux wood blinds (PVC or vinyl) are lightweight and shrug off moisture — the right call for bathrooms, kitchens, and standard windows. Composite blinds (wood fiber blended with polymer) are heavier and more rigid, holding their shape under heat and UV on large, sunny windows where faux wood would eventually sag. Real wood blinds deliver the warmth and natural grain nothing else matches, ideal for dry living rooms and bedrooms. We carry premium lines from Norman, Alta, and Lafayette, in 2-inch and 2.5-inch slat sizes, with cordless and child-safe lift options. Every set is custom-measured to your exact opening and installed precisely.",
    expertInsight: "After two decades installing blinds across North Idaho, here's what I tell every client: the slickest catalog photo doesn't matter if the material is wrong for your window. I've pulled faux wood blinds out of west-facing living rooms that developed a visible bow after just 3-5 summers — the PVC softens in the heat and gravity does the rest. On those big, bright windows I steer people to composite; I've taken composite slats out after 10-plus summers of direct sun and they were still dead straight. For bathrooms and kitchens it flips — faux wood's moisture resistance is unbeatable and you won't overload the lift mechanism with weight. And one upgrade most people overlook: 2.5-inch slats instead of the standard 2-inch. Fewer, wider slats mean a clearer view, a lower stack height when raised (2-3 more inches of exposed glass), and a clean, plantation-shutter look at a fraction of the cost.",
    features: [
      "Real wood, faux wood (PVC/vinyl), and composite blinds",
      "Horizontal blinds in 2-inch and 2.5-inch slat sizes",
      "Faux wood: excellent moisture resistance for baths and kitchens",
      "Composite: superior heat and UV stability for large, sunny windows",
      "2.5-inch slats — wider view, lower stack height, plantation-shutter look for less",
      "Cordless and child-safe lift options",
      "Premium brands: Norman, Alta, and Lafayette",
      "Custom-measured and professionally installed",
    ],
    idealFor: [
      "Bathrooms and kitchens where moisture would warp real wood (faux wood)",
      "Large west- or south-facing windows with heavy sun (composite)",
      "Living rooms and bedrooms wanting genuine wood warmth (real wood)",
      "Modern homes wanting wide-slat, clean-line styling (2.5-inch)",
      "Rentals and budget-conscious rooms that still want the wood look",
      "Any window where precise, everyday light and privacy control matters",
    ],
    localContext: "North Idaho's climate punishes the wrong blind material — but rewards the right one. On the bright, lake-facing picture windows common around Coeur d'Alene and Sandpoint, composite blinds hold their shape through summers that bow lesser slats. In bathrooms and lakefront homes with constant humidity, faux wood keeps performing where real wood swells. We've matched materials to hundreds of North Idaho windows, carrying Norman, Alta, and Lafayette so the recommendation is driven by your room — not by whatever a catalog pushes hardest.",
    faqs: [
      {
        question: "Faux wood vs. composite blinds — which holds up better in North Idaho?",
        answer: "Both outperform real wood in our climate, but they're not identical. Faux wood (PVC/vinyl) is lightweight and excellent against moisture, ideal for bathrooms, kitchens, and standard windows up to about 6 feet wide. Composite (wood fiber + polymer) is heavier and more rigid, with superior heat and UV resistance — it holds its shape on large, sunny windows where faux wood can bow over a few summers. For big west- or south-facing glass, choose composite; for moisture-prone or budget-conscious rooms, faux wood gives you about 90% of the benefit for less.",
      },
      {
        question: "Will faux wood blinds sag or bow in the sun?",
        answer: "They can — on large windows with prolonged direct sun. PVC softens under sustained heat, and on wide spans gravity slowly bows the slats over 3-5 summers. It's not catastrophic, but it's noticeable. That's exactly why we recommend composite for big, bright, west- or south-facing windows: the wood-fiber core gives the slats structural memory so they stay straight. On standard or shaded windows, faux wood holds up fine.",
      },
      {
        question: "What's the difference between 2-inch and 2.5-inch blind slats?",
        answer: "2.5-inch slats are the upgrade most people don't know to ask for. Fewer, wider slats mean less visual interruption (about 8-9 slats across a window instead of 10-12), a clearer view outside, and a roughly 20% lower stack height when raised — 2-3 more inches of exposed glass. They also replicate the clean, structured look of plantation shutters at a fraction of the cost. The trade-off is minor: slightly more light seepage when tilted, and a bit more recess depth needed for a flush inside mount.",
      },
      {
        question: "Are blinds a good choice for bathrooms and kitchens?",
        answer: "Yes — as long as you use faux wood or composite, not real wood. Faux wood blinds resist steam and humidity beautifully; I've installed them in bathrooms that steam up daily for years without warping. Real wood, by contrast, will swell and eventually stop operating smoothly in those rooms. For kitchens and baths, faux wood is the practical, long-lasting choice.",
      },
      {
        question: "Can blinds be made cordless for child and pet safety?",
        answer: "Yes. We offer cordless lift options across our blind lines, which eliminate the exposed pull cords that pose a strangulation hazard to children and pets. Cordless operation is a straightforward, affordable safety upgrade — and in many rental situations it's now the expected standard. We'll walk you through cordless and motorized options during your consultation.",
      },
      {
        question: "Should I choose real wood or faux wood blinds?",
        answer: "Real wood blinds offer unmatched natural grain and warmth, and they're the premium choice for dry living rooms, bedrooms, and home offices. Faux wood mimics the wood look at a lower price while resisting moisture and handling abuse better — the smarter pick for bathrooms, kitchens, rentals, and high-traffic rooms. The deciding factors are usually the room's moisture level, the window's sun exposure, and your budget. We help you weigh all three for each window rather than defaulting to one material everywhere.",
      },
    ],
    metaTitle: "Custom Blinds in Northern Idaho | Wood, Faux Wood & Composite",
    metaDescription: "Custom wood, faux wood, and composite blinds for North Idaho homes — matched to each room and professionally installed. Norman, Alta, and Lafayette. Serving Coeur d'Alene, Post Falls, Hayden, Sandpoint. Free in-home consultation.",
  },
  "cellular-shades": {
    slug: "cellular-shades",
    name: "Cellular Shades",
    image: "/images/cellular-shades.jpeg",
    headline: "Tired of Watching Your Energy Bills Climb Every Season?",
    subheadline: "Cellular shades are the most energy-efficient window covering available — and in Northern Idaho, that matters more than most places.",
    problem: "Northern Idaho doesn't do moderate weather. January mornings hit single digits. July afternoons push into the 90s. And through all of it, your windows are the weakest link in your home's insulation. Single-pane windows in older Coeur d'Alene homes bleed heat all winter long. Even newer double-pane windows in Post Falls subdivisions let more energy escape than most homeowners realize.",
    solution: "Cellular shades — sometimes called honeycomb shades — use a unique structure of air pockets that act as insulation right at the window. The honeycomb cells trap air, creating a barrier between the extreme outdoor temperatures and your living space. Available in single, double, or triple-cell designs, with options from sheer light-filtering to complete blackout.",
    expertInsight: "After two decades of installing these, here's what most companies won't tell you: the cell size matters more than most people think. A 3/4-inch double cell is the sweet spot for most Northern Idaho homes — it gives you substantial insulation without looking bulky. And if you have large windows facing the lake or the mountains, a top-down/bottom-up option lets you keep your view while still insulating the lower portion of the window. I've installed these in everything from 1960s ranch homes in Coeur d'Alene to brand-new builds in Rathdrum, and the difference in comfort is something homeowners notice immediately.",
    features: [
      "Honeycomb cell structure traps air for superior insulation",
      "Available in single, double, and triple cell options",
      "Light-filtering to full blackout fabric choices",
      "Top-down/bottom-up operation available",
      "Cordless and motorized options for child and pet safety",
      "Extensive color and texture range to match any decor",
    ],
    idealFor: [
      "Bedrooms where temperature control and light blocking matter",
      "Older homes with single-pane windows that need extra insulation",
      "Living rooms with large windows facing extreme sun or cold",
      "Anyone looking to reduce energy bills year-round",
      "Homes with kids or pets (cordless options eliminate safety concerns)",
    ],
    localContext: "In Northern Idaho, cellular shades aren't a luxury — they're practically a necessity. The temperature swings between seasons here are brutal on energy bills. Homeowners in Hayden and Rathdrum with newer construction often assume their windows are efficient enough, but adding cellular shades can make a noticeable difference in both comfort and monthly costs.",
    faqs: [
      {
        question: "Are cellular shades really worth the investment for Northern Idaho homes?",
        answer: "Yes — Northern Idaho's extreme temperature swings make cellular shades one of the most practical upgrades you can make. The honeycomb air-pocket cells act as insulation directly at the window, reducing heat loss in single-digit winter mornings and blocking heat gain through 90°F summers. Homeowners consistently notice a real difference in both comfort and monthly energy costs.",
      },
      {
        question: "What is the difference between single, double, and triple cell shades?",
        answer: "More cells means better insulation. Single-cell is the most affordable entry point. Double-cell is the sweet spot for most Northern Idaho homes — substantial insulation without looking bulky. Triple-cell offers maximum performance for extreme exposures or large unprotected windows. For most homes, a 3/4-inch double cell hits the right balance of value and performance.",
      },
      {
        question: "What is a top-down/bottom-up cellular shade?",
        answer: "A top-down/bottom-up shade can be opened from the top, the bottom, or both simultaneously. This lets you bring natural light in from the top of the window while maintaining privacy at eye level — especially valuable for large windows with lake or mountain views where you want both light and privacy.",
      },
      {
        question: "Can cellular shades be motorized?",
        answer: "Yes. All of the cellular shade brands we carry — Alta, Norman, and Lafayette — offer battery-powered motorization with no hardwiring required. You can control them via remote, smartphone app, or voice assistant (Alexa, Google Home, Apple HomeKit). Battery motors typically last 1–2 years per charge.",
      },
      {
        question: "Should I choose cordless or motorized cellular shades for a home with young children?",
        answer: "Both eliminate cord hazards, but they work differently. Cordless shades use a spring-tension mechanism — you push up or pull down by hand with no cord exposed. It's a straightforward, affordable safety upgrade. Motorized shades go further: no physical contact needed at all, and you can set schedules so shades lower automatically at naptime or bedtime. For most families, cordless is the practical starting point. Motorization is worth the investment if you have multiple windows or want the automation long-term.",
      },
      {
        question: "Does the color of cellular shades affect how they perform?",
        answer: "Yes, in two ways. Lighter colors reflect more heat back into the room during winter, which can slightly reduce their insulating benefit. Darker colors absorb more solar heat in summer, which can be an advantage or drawback depending on the window's orientation. More practically: lighter fabrics show dust more readily. For Northern Idaho homes with intense sun exposure, a mid-tone fabric in the color family that works with your interior is usually the best balance of performance and maintenance.",
      },
    ],
    metaTitle: "Cellular Shades in Northern Idaho | Energy Efficient Window Treatments",
    metaDescription: "Custom cellular shades for Northern Idaho homes. The most energy-efficient window covering for Coeur d'Alene, Post Falls, Hayden. Free in-home consultation with extensive hands-on installer expertise.",
  },
  "solar-shades": {
    slug: "solar-shades",
    name: "Solar Shades",
    image: "/images/solar-shades.jpeg",
    headline: "Love Your View but Hate the Glare?",
    subheadline: "Solar shades let you keep the scenery while blocking the UV rays, heat gain, and glare that come with it.",
    problem: "Living in Northern Idaho means incredible views — Coeur d'Alene Lake, the Bitterroot Range, sunsets over the Rathdrum Prairie. But those west-facing and south-facing windows that give you those views also bring intense afternoon glare, UV damage to your furniture and floors, and serious heat gain in summer. You shouldn't have to choose between your view and your comfort.",
    solution: "Solar shades are engineered to reduce glare and block UV rays while maintaining your outward visibility. They work like sunglasses for your windows — you can still see out, but the harsh effects of direct sunlight are dramatically reduced. Available in different openness factors (typically 1% to 14%), allowing you to choose exactly how much light and visibility you want.",
    expertInsight: "The number one mistake I see people make with solar shades is choosing the wrong openness factor. A 3% is great for south-facing windows that get hammered with direct sun — it blocks more while still letting you see out. A 10% works better for north-facing windows where you want maximum view with light UV protection. And here's something most people don't realize: the fabric color matters as much as the openness percentage. Darker fabrics reduce glare better and give you better outward visibility, while lighter fabrics reflect more heat. For lake-facing homes in Coeur d'Alene, I usually recommend a dark charcoal in 5% — it cuts the glare off the water beautifully while keeping the view crystal clear.",
    features: [
      "UV protection up to 99% depending on openness factor",
      "Maintains outward visibility while reducing glare",
      "Multiple openness factors from 1% to 14%",
      "Reduces heat gain through windows",
      "Protects furniture, floors, and artwork from UV fading",
      "Available in motorized options for hard-to-reach windows",
    ],
    idealFor: [
      "Lake-facing homes in Coeur d'Alene and Sandpoint",
      "South and west-facing windows with intense afternoon sun",
      "Home offices where screen glare is a problem",
      "Rooms with hardwood floors or furniture you want to protect",
      "Anyone who wants light control without losing their view",
    ],
    localContext: "If you live on the lake or anywhere with western exposure in Northern Idaho, solar shades should be near the top of your list. The summer sun here doesn't set until after 9 PM, and that low-angle evening light creates intense glare that standard curtains can't handle without blocking everything. Solar shades solve this elegantly.",
    faqs: [
      {
        question: "Will I still be able to see outside through solar shades?",
        answer: "Yes — solar shades are specifically engineered to maintain outward visibility while reducing glare and blocking UV rays. They work like sunglasses for your windows: you can see out clearly, but the harsh effects of direct sun are dramatically reduced. A 5% or 10% openness factor provides excellent view-through with strong glare control.",
      },
      {
        question: "What openness factor should I choose for my solar shades?",
        answer: "It depends on your window's sun exposure. South and west-facing windows that receive direct afternoon sun typically do best with 3%–5% openness. North-facing windows or shaded exposures can use 10%–14% for maximum view with lighter UV protection. Fabric color matters too — darker fabrics provide better outward visibility and cut glare more effectively than lighter ones.",
      },
      {
        question: "Do solar shades protect furniture and floors from UV fading?",
        answer: "Yes. Depending on the openness factor, solar shades block up to 99% of UV rays — the primary cause of fading in wood floors, furniture, and artwork. Even a 10% openness fabric provides significant UV protection compared to bare glass, making solar shades a smart investment for rooms with hardwood floors or valuable furnishings.",
      },
      {
        question: "Do solar shades provide privacy at night?",
        answer: "No — and this is the most important thing to understand before buying solar shades. During daylight hours, the brighter exterior makes it harder to see in from outside. But at night, when your interior lights are on and it's dark outside, that contrast reverses completely — people outside can see in clearly. For rooms where nighttime privacy matters, solar shades are typically paired with a blackout roller shade or drapery on the same window. Mark will always flag this during a consultation if privacy is a concern.",
      },
      {
        question: "How do solar shade fabrics hold up in Northern Idaho's climate?",
        answer: "Very well. Solar shade fabrics are typically woven from fiberglass or polyester coated to resist UV degradation — the same sun that damages your floors won't break down the fabric. Northern Idaho's freeze-thaw cycles don't affect them the way they affect wood products. The bigger maintenance consideration is dust: in drier summer months, a light vacuuming with a brush attachment every few months keeps them looking sharp.",
      },
    ],
    metaTitle: "Solar Shades in Northern Idaho | Glare Reduction for Lake Views",
    metaDescription: "Custom solar shades for Northern Idaho homes. Reduce glare and UV damage while keeping your lake and mountain views. Serving Coeur d'Alene, Post Falls, Sandpoint. Free consultation.",
  },
  "roller-shades": {
    slug: "roller-shades",
    name: "Roller Shades",
    image: "/images/roller-shades.jpeg",
    headline: "Clean Lines. Simple Function. No Fuss.",
    subheadline: "Roller shades deliver a sleek, modern look that works with any design style — without overcomplicating things.",
    problem: "Not every window needs a complex treatment. Sometimes you want something clean, functional, and understated that doesn't compete with your architecture or decor. But 'simple' doesn't have to mean cheap or boring — and it definitely shouldn't mean poorly made or poorly fitted.",
    solution: "Roller shades are exactly what they sound like — a single piece of fabric that rolls up neatly into a small cassette at the top of your window. What makes them special is the range of fabrics, textures, and opacity levels available, from completely sheer to total blackout. The result is a streamlined look that works in contemporary homes, traditional spaces, and everything in between.",
    expertInsight: "I've been installing roller shades for nearly two decades, and the technology has come a long way. The cassette systems now are sleek and barely visible. The fabrics are incredible — you can get textures that look like linen or woven grass cloth in a roller shade format. The key is getting the measurement right. A roller shade that's even 1/4 inch off shows it, because there's nowhere to hide the gap. That precision is where my experience makes the biggest difference — especially on windows that aren't perfectly square, which is more common than you'd think in both older Coeur d'Alene homes and even new construction.",
    features: [
      "Sleek, minimal profile with clean cassette housing",
      "Huge range of fabric options — sheer to blackout",
      "Premium textures including linen, woven, and metallic finishes",
      "Spring-loaded, chain, or motorized operation",
      "Can be mounted inside or outside the window frame",
      "Easy to clean and maintain",
    ],
    idealFor: [
      "Modern and contemporary home designs",
      "Home offices and media rooms (blackout options)",
      "Kitchens and bathrooms where moisture resistance matters",
      "Commercial spaces and rental properties",
      "Minimalists who want function without visual clutter",
    ],
    localContext: "Roller shades are increasingly popular in the newer construction happening around Post Falls, Rathdrum, and Hayden. The clean-lined architecture in these communities pairs naturally with the streamlined look of a quality roller shade. They're also a smart choice for rental properties — durable, easy to maintain, and universally appealing.",
    faqs: [
      {
        question: "What is the difference between light-filtering and blackout roller shades?",
        answer: "Light-filtering roller shades diffuse incoming light, softening glare while keeping a warm glow in the room — ideal for living areas and kitchens. Blackout roller shades have an opaque fabric or backing that blocks virtually all light, making them the right choice for bedrooms, home theaters, and nurseries where sleep quality matters.",
      },
      {
        question: "How important is precise measurement for roller shades?",
        answer: "Extremely important. A roller shade that's even 1/4 inch off shows immediately — there's no overlap or softness to hide the gap the way drapery can. This is especially true in Northern Idaho homes, where freeze-thaw cycles cause window frames to shift slightly out of square over time. Getting measurement right is where professional installation makes the most difference.",
      },
      {
        question: "Can roller shades be motorized?",
        answer: "Yes. Roller shades are one of the most popular products to motorize because the clean aesthetic pairs naturally with the convenience of remote, app, or voice control. Battery-powered motors require no hardwiring and are installed in a single visit. They're particularly popular for hard-to-reach windows in vaulted great rooms.",
      },
      {
        question: "Should roller shades be inside mounted or outside mounted?",
        answer: "Inside mount fits the shade within the window frame for a clean, architectural look. Outside mount covers the full frame and typically hangs higher, which makes windows appear larger and provides better light blockage at the edges. In Northern Idaho homes — especially older construction in Coeur d'Alene where freeze-thaw cycles have caused frames to shift out of square — outside mount often produces a more polished result because it hides frame imperfections. Mark evaluates each window and recommends based on the actual frame condition and the look you're after.",
      },
      {
        question: "How do I clean roller shades without damaging the fabric?",
        answer: "Light dusting with a soft brush or vacuum brush attachment handles most routine maintenance. For spot cleaning, blot — don't scrub — with a lightly dampened cloth and mild soap. Never soak the fabric or submerge it in water, which can damage the finish and corrode the roller hardware. The specialty textured fabrics we carry are all treated for durability, but professional cleaning is worth considering for heavily soiled shades rather than risking damage with DIY methods.",
      },
    ],
    metaTitle: "Roller Shades in Northern Idaho | Modern Window Treatments",
    metaDescription: "Custom roller shades for Northern Idaho homes. Clean, modern window coverings in premium fabrics. Serving Coeur d'Alene, Post Falls, Hayden. Free in-home consultation.",
  },
  "banded-shades": {
    slug: "banded-shades",
    name: "Banded Shades",
    image: "/images/banded-shades.webp",
    headline: "Control Your Light Without Closing Off the Room.",
    subheadline: "Banded shades give you the flexibility to shift between sheer filtered light and full privacy — with a distinctly modern look.",
    problem: "Most window treatments give you an either/or choice: open for light, closed for privacy. But life isn't that simple. Sometimes you want soft, diffused light in the morning and full privacy at night. Sometimes you want to see out without being seen. Traditional blinds can do this, but they collect dust, break easily, and look dated.",
    solution: "Banded shades — also called zebra shades or dual shades — use alternating bands of sheer and solid fabric on a continuous loop. When the bands align solid-to-solid, you get full privacy and light blocking. Shift them so the sheer bands overlap, and light filters through beautifully while maintaining your view. It's elegant engineering that looks as good as it works.",
    expertInsight: "Banded shades are one of the fastest-growing categories I install, especially in new homes. They photograph beautifully, which is why you see them all over design magazines. But here's the practical advice: the fabric quality varies enormously between brands. Cheap banded shades sag, the bands don't align properly after a few months, and the sheer sections look cloudy instead of crisp. The Lafayette and Norman banded shades I carry use tension systems that keep the bands perfectly aligned long-term. It's one of those products where the difference between a premium version and a budget version is immediately obvious.",
    features: [
      "Alternating sheer and solid fabric bands",
      "Seamless transition between privacy and filtered light",
      "Modern, contemporary aesthetic",
      "Available in a wide range of colors and textures",
      "Smooth, quiet operation",
      "Motorization available for convenience",
    ],
    idealFor: [
      "Living rooms and great rooms where flexible light control is key",
      "Bedrooms that need both morning light and nighttime privacy",
      "Modern and transitional home designs",
      "Street-facing windows where privacy matters during the day",
      "Anyone tired of traditional blinds but wanting similar light control",
    ],
    localContext: "Banded shades are a popular choice in the newer subdivisions around Post Falls and Hayden where contemporary design is the norm. They pair especially well with the open floor plans common in Northern Idaho new construction, where a single great room might have windows facing multiple directions with different light needs throughout the day.",
    faqs: [
      {
        question: "What are banded shades, and how are they different from regular blinds?",
        answer: "Banded shades (also called zebra shades or dual shades) use alternating horizontal bands of sheer and solid fabric on a continuous loop. When solid bands align, you get full privacy. Shift to align the sheer bands, and soft filtered light comes through beautifully. They offer the same light-control flexibility as traditional blinds but with a far more modern, elegant look — and no slats to collect dust.",
      },
      {
        question: "How durable are banded shades over time?",
        answer: "Quality varies enormously between brands. Budget banded shades sag and the bands fall out of alignment within months. The Lafayette and Norman brands carried by Luxe Window Works use tension systems engineered specifically to keep bands perfectly aligned through years of daily use. The difference in long-term performance between a premium and a budget banded shade is immediately obvious.",
      },
      {
        question: "Do banded shades provide privacy from the street during the day?",
        answer: "Yes — when the solid bands are fully aligned, banded shades provide complete privacy even in bright daylight. This makes them ideal for street-facing windows where you want daytime privacy without closing off the room to natural light entirely.",
      },
      {
        question: "Are banded shades a good choice for bedrooms?",
        answer: "It depends on how light-sensitive you are. When the solid bands are fully aligned, banded shades block most light and provide strong privacy — enough for comfortable sleep in most bedrooms. However, they're not true blackout. Light leaks slightly through the transition zones between solid and sheer bands. For shift workers, young children, or anyone who needs complete darkness to sleep well, a dedicated blackout shade is the more reliable choice. Banded shades shine in bedrooms where you want flexible light control and a modern look but complete blackout isn't critical.",
      },
      {
        question: "Can banded shades be motorized?",
        answer: "Yes, and motorization pairs especially well with banded shades because the adjustment is so nuanced. Manually finding the exact alignment where the bands are perfectly open or closed requires a little practice. With motorization, you set the precise positions once — fully open, privacy mode, fully closed — and recall them with one tap. It removes any guesswork and makes the light-control flexibility that defines banded shades effortless to use every day.",
      },
    ],
    metaTitle: "Banded Shades in Northern Idaho | Modern Zebra & Dual Shades",
    metaDescription: "Custom banded (zebra) shades for Northern Idaho homes. Flexible light control with modern style. Serving Coeur d'Alene, Post Falls, Hayden. Free in-home consultation.",
  },
  "roman-shades": {
    slug: "roman-shades",
    name: "Roman Shades",
    image: "/images/roman-shades.webp",
    headline: "Add Warmth and Character That Blinds Never Could.",
    subheadline: "Roman shades bring softness, texture, and timeless elegance to any room — crafted from real fabrics that transform the feel of your space.",
    problem: "Some rooms need more than a functional window covering — they need something that adds warmth, texture, and personality. Hard blinds and minimal shades work in some spaces, but living rooms, dining rooms, and primary bedrooms often call for something softer. Something that makes the room feel finished and intentional, not just covered.",
    solution: "Roman shades fold up in elegant horizontal pleats when raised and lay flat or softly cascading when lowered. Available in an incredible range of fabrics — from crisp linens to rich textures, from subtle neutrals to bold patterns. They bring the richness of drapery with the clean functionality of a shade, and they work in traditional, transitional, and even contemporary settings.",
    expertInsight: "Roman shades are where fabric choice makes or breaks the result. I always recommend bringing fabric samples into the actual room where they'll be installed, at different times of day. A fabric that looks warm and inviting in showroom lighting can look completely different with morning light coming through it versus afternoon sun. I also steer most of my clients toward the flat fold style rather than hobbled (the puffy, cascading look) — flat folds have a more modern, tailored feel that ages better. And from an installation standpoint, Roman shades need to be precisely sized — the fabric folds need to stack evenly, which means the measurement has to account for the fold pattern. It's detail work that matters.",
    features: [
      "Elegant horizontal fabric folds when raised",
      "Vast selection of premium fabrics, textures, and patterns",
      "Flat fold and hobbled (cascading) style options",
      "Light-filtering and blackout lining available",
      "Cordless and motorized operation",
      "Can be paired with drapery panels for a layered look",
    ],
    idealFor: [
      "Living rooms and dining rooms where aesthetics are a priority",
      "Primary bedrooms that want softness and warmth",
      "Transitional and traditional home styles",
      "Rooms where you want to add texture and color through the window treatment",
      "Kitchens — especially above the sink with a flat Roman in a wipeable fabric",
    ],
    localContext: "Roman shades work beautifully in the craftsman and lodge-style homes that are iconic to the Northern Idaho landscape. In Coeur d'Alene and Sandpoint especially, homeowners gravitate toward natural linen and textured fabrics that complement the wood and stone elements common in our local architecture. They add a layer of refinement without feeling out of place.",
    faqs: [
      {
        question: "What fabric should I choose for Roman shades in my home?",
        answer: "Bring samples into the actual room at different times of day before deciding — a fabric that looks warm in a showroom can read very differently with Northern Idaho morning light versus afternoon sun, especially near water. Natural linens and textured fabrics tend to complement the wood and stone elements common in Idaho craftsman and lodge-style homes. Mark always recommends in-room sample review before finalizing any fabric selection.",
      },
      {
        question: "What is the difference between flat fold and hobbled Roman shades?",
        answer: "Flat fold Roman shades stack in crisp, even horizontal pleats — a clean, tailored look that works in both modern and traditional settings and ages well. Hobbled (or relaxed) Roman shades have cascading, puffed folds even when lowered, creating a softer, more traditional appearance. Mark recommends flat fold for most of today's homes as it has a more contemporary feel and wears better over time.",
      },
      {
        question: "Can Roman shades have a blackout lining?",
        answer: "Yes. Most Roman shade fabrics can be backed with a blackout lining, which is particularly popular for bedrooms. The blackout lining doesn't change the exterior appearance of the shade but significantly reduces light transmission, making them a great choice when you want a fabric-rich look without sacrificing sleep quality.",
      },
      {
        question: "Can Roman shades be paired with drapery panels?",
        answer: "Yes — and it's one of the most refined looks in residential window design. A flat Roman shade in a solid or subtly textured fabric, flanked by floor-to-ceiling drapery panels, creates a layered look that's particularly popular in primary bedrooms and formal living rooms in Coeur d'Alene and Sandpoint homes. The Roman shade handles the functional light control and privacy while the drapery adds height, softness, and architectural framing. It's a combination that works especially well when you want to frame a strong view without losing the ability to cover it.",
      },
      {
        question: "How durable are Roman shades compared to hard blinds?",
        answer: "Roman shades involve a fabric and a mechanical lift system, which means the fabric will show wear before composite or aluminum products do. That said, quality Roman shades from reputable manufacturers last 10–15 years with normal use. The failure points are typically the lift cords and the lining — both repairable. The fabric itself, if it's a quality woven or linen-type material, holds up well. Where Roman shades genuinely underperform hard blinds is in high-humidity rooms like bathrooms; for those spaces, a moisture-resistant alternative is a smarter call.",
      },
    ],
    metaTitle: "Roman Shades in Northern Idaho | Elegant Fabric Window Treatments",
    metaDescription: "Custom Roman shades for Northern Idaho homes. Premium fabrics, expert installation. Serving Coeur d'Alene, Post Falls, Sandpoint. Free in-home consultation.",
  },
  "shutters": {
    slug: "shutters",
    name: "Plantation Shutters",
    image: "/images/shutters.jpeg",
    headline: "Norman Shutters — The One Window Treatment That Actually Adds Value to Your Home.",
    subheadline: "We've installed Norman plantation shutters across North Idaho since 2009 — Normandy hardwood, Woodlore Plus composite, and the InvisibleTilt hidden-gear system, measured and installed precisely.",
    problem: "Window treatments typically depreciate the moment they're installed — they're decorating, not improving. And most of them need to be replaced every 5-10 years. If you're investing in your home, especially a home you plan to keep or a property where resale value matters, you want something that lasts and actually adds to the home's worth.",
    solution: "Norman plantation shutters are built to last decades. We install Norman exclusively for interior shutters because the quality is consistent, the engineering is thoughtful, and they hold up to North Idaho's four-season climate. The Normandy line is built from Paulownia — a hardwood with an exceptional strength-to-weight ratio that resists warping through January cold and August heat. The Woodlore and Woodlore Plus composite lines are dimensionally stable and moisture-resistant, the right call for bathrooms, kitchens, and lakefront humidity. Every frame is custom-built to your exact window opening, becomes a permanent part of your home's architecture, and is backed by Norman's limited lifetime warranty. For specialty and exterior applications, we also carry aluminum shutters by The Window Outfitters.",
    expertInsight: "Shutters are where my extensive hands-on expertise matters most, and being a Norman partner since 2009 is a big part of why. Here's why precision matters: shutters require the most precise measurement of any window treatment. Every frame is custom-built to fit your specific window opening, and the tolerances are incredibly tight. A shade can be off by 1/8 inch and nobody notices. A shutter frame that's off by 1/8 inch won't close properly. I've fixed installations from other companies where the frames were built from measurements that didn't account for window frames being out of square — which happens more often than you'd think, especially in Northern Idaho homes that settle with our freeze-thaw cycles. I also help clients choose the right Norman line for each room: Normandy hardwood for the premium look of real wood in living rooms and bedrooms, and Woodlore Plus composite for bathrooms and kitchens where moisture would warp lesser materials. For the cleanest look, I'll usually walk you through Norman's InvisibleTilt — a hidden gear that tilts the louvers with no center bar splitting your view.",
    features: [
      "Norman Normandy premium Paulownia hardwood line — painted or stained finishes",
      "Norman Woodlore & Woodlore Plus composite — moisture-resistant for baths, kitchens, lake homes",
      "InvisibleTilt hidden-gear system — no center tilt bar, unobstructed sightline",
      "Louver sizes 3.5\" and 4.5\" — 4.5\" most popular for larger North Idaho windows",
      "Custom-built to exact window specifications — arches, angles, French and patio doors",
      "Backed by Norman's limited lifetime warranty",
      "Aluminum shutters by The Window Outfitters for specialty and exterior applications",
    ],
    idealFor: [
      "Homeowners planning to stay long-term and want lasting value",
      "Properties where resale value is a consideration",
      "Larger windows where architectural impact matters",
      "Bathrooms, kitchens, and lakefront homes (Woodlore Plus composite)",
      "Any room where you want precise light and privacy control",
      "Historically or architecturally significant homes",
    ],
    localContext: "We've been a Norman partner since 2009, installing Normandy, Woodlore, and Woodlore Plus shutters in everything from historic Coeur d'Alene lakefront homes to new construction in Post Falls, Hayden, and Rathdrum. North Idaho's freeze-thaw cycles can cause window frames to shift subtly out of square over time, which is why precision laser measurement is critical for shutters — our process accounts for those local conditions so the fit stays true for years.",
    faqs: [
      {
        question: "Why does Luxe Window Works install Norman shutters?",
        answer: "We've been a Norman partner since 2009, and for interior shutters we install Norman every time. The quality is consistent, the engineering is thoughtful, and the products perform exactly as promised in real North Idaho homes. Norman manufactures its own components — it even farms its own Paulownia wood for the Normandy line — which means tighter quality control from raw material to finished product. That direct, long-term relationship also gives us real manufacturer access for specifications, custom orders, and warranty support.",
      },
      {
        question: "What is the difference between Norman's Normandy and Woodlore Plus shutters?",
        answer: "Normandy is Norman's premium hardwood line, built from Paulownia — strong, light, and naturally stable, available in painted and stained finishes that show off real wood grain. Woodlore and Woodlore Plus are engineered composite lines in painted finishes only, visually indistinguishable from painted wood. Woodlore Plus adds a polymer-reinforced core that resists steam and humidity, making it the right choice for bathrooms, kitchens, and lakefront homes. For most painted shutters in North Idaho's climate, we specify Woodlore Plus; for the premium real-wood look in dry rooms, Normandy.",
      },
      {
        question: "What is Norman's InvisibleTilt system?",
        answer: "Traditional shutters use a center tilt bar — a vertical rod down the face of the panel that splits the window visually. Norman's InvisibleTilt hides the tilt mechanism inside the stile, so there's no center bar and you get a cleaner, more modern look with an unobstructed view. Because the internal gear maintains even tension across all louvers, closure is more consistent too. It's available on select Normandy and Woodlore Plus configurations, and it's typically the first upgrade we discuss.",
      },
      {
        question: "Why does professional measurement matter so much for plantation shutters?",
        answer: "Shutters require tighter tolerances than any other window treatment. A shutter frame that's off by just 1/8 inch won't close properly. Northern Idaho's freeze-thaw cycles cause window frames to shift out of square over time — more common than most homeowners realize. We take precise laser measurements at multiple points on every opening and account for out-of-square frames in the specifications we send to Norman, so your shutters close cleanly and operate smoothly for years.",
      },
      {
        question: "What louver size should I choose for plantation shutters?",
        answer: "Smaller 3.5-inch louvers create a more traditional look with more horizontal lines — a good fit for smaller windows or classic interiors. Larger 4.5-inch louvers open up the view, let in significantly more light when tilted, and create a cleaner, contemporary feel. Norman's use of lightweight Paulownia in the Normandy line makes 4.5-inch louvers practical without the sagging that heavy basswood panels develop over time. For the larger windows common in North Idaho lake homes and newer construction, 4.5-inch is usually the right specification.",
      },
      {
        question: "Can Norman shutters be installed on doors?",
        answer: "Yes. Norman's Bi-Fold 180 folds completely flat against the wall so a panel never blocks the doorway — essential for French doors and entry doors. For sliding patio doors, Norman offers bypass shutters that slide horizontally. These applications require especially precise measurement because doors flex and move differently than fixed windows, which is why professional installation matters here.",
      },
      {
        question: "Are Norman shutters backed by a warranty?",
        answer: "Yes — Norman backs both the hardwood Normandy line and the Woodlore/Woodlore Plus composite lines with a limited lifetime warranty covering defects in materials and workmanship. As a long-term Norman partner, we're your local point of contact for any warranty question or service need: you call us, not a manufacturer's 800 number.",
      },
    ],
    metaTitle: "Norman Shutters in Northern Idaho | Plantation Shutter Installation",
    metaDescription: "Norman plantation shutters in North Idaho since 2009 — Normandy hardwood, Woodlore Plus composite, InvisibleTilt. Precise measurement and expert installation in Coeur d'Alene, Post Falls, Hayden. Free in-home consultation.",
  },
  "motorization": {
    slug: "motorization",
    name: "Motorization",
    video: {
      idSlug: "video-motorization-overview",
      youtubeId: "BTVQo6bRGEw",
      title: "Motorized Window Treatments — Luxe Window Works",
      description: "See motorized window treatments in action — installed by Luxe Window Works in Northern Idaho. One tap controls every shade in the room. Battery-powered motors, no hardwiring required. Serving Post Falls, Coeur d'Alene, Hayden, and Sandpoint.",
      uploadDate: "2025-08-30",
      duration: "PT53S",
    },
    secondVideo: {
      idSlug: "video-motorization-2025-08-22",
      youtubeId: "nY_XVjk9Bco",
      title: "The Dog Days Of Summer!",
      description: "Motorized window shades from Luxe Window Works. Push-button operation, no cords, safe for kids and pets, and perfect for hard-to-reach windows. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint in North Idaho. Free in-home consultations and 23 years of experience.",
      uploadDate: "2025-08-22",
      duration: "PT9S",
    },
    headline: "One Tap. Every Shade. Perfect Position.",
    subheadline: "Smart motorized shades you can control from your phone, your voice, or the wall — because some things should just be easy.",
    problem: "You've got windows you can't easily reach — above the stairs, in a vaulted ceiling, behind furniture. Or maybe you want all your shades to go down at sunset without getting up from the couch. Or you travel and want your home to look occupied. Manual shades are fine for accessible windows, but modern homes — and modern life — call for something smarter.",
    solution: "Motorization transforms any shade into a smart device. Open and close your window treatments with a remote, your phone, your voice through Alexa or Google Home, or programmed schedules tied to sunrise and sunset. Available for cellular shades, roller shades, Roman shades, and banded shades. Battery-powered options mean no hardwiring required in most cases.",
    expertInsight: "I've watched motorization go from a luxury add-on to one of the most requested features in the window treatment industry. And the technology is genuinely good now. Battery-powered motors from Alta and Norman last 1-2 years on a single charge and are whisper-quiet. The app integration is reliable, and setting up sunrise/sunset schedules is straightforward. My practical advice: if you're motorizing multiple shades in one room, invest in a multi-channel remote or app setup so you can control them as a group. And if you're building new construction, have your electrician run power to your window frames — hardwired motors never need battery changes and can handle heavier shades. I handle the complete setup, programming, and integration so everything works seamlessly from day one.",
    features: [
      "Control via remote, smartphone app, or voice assistant",
      "Compatible with Alexa, Google Home, and Apple HomeKit (brand dependent)",
      "Battery-powered options — no hardwiring needed",
      "Programmable schedules tied to time of day or sunrise/sunset",
      "Whisper-quiet motor operation",
      "Available for most shade types",
      "Group control for multiple shades in one room",
    ],
    idealFor: [
      "Hard-to-reach windows — vaulted ceilings, above stairs, behind furniture",
      "Smart home setups with existing voice assistant integration",
      "Homeowners who want automated sunrise/sunset schedules",
      "New construction where hardwired power can be planned in advance",
      "Anyone who values convenience and modern functionality",
      "Vacation homes and rental properties for security (occupied appearance)",
    ],
    localContext: "Motorization is increasingly popular in Northern Idaho, especially in the new construction happening around Post Falls and Rathdrum. Many of these homes have great rooms with soaring ceilings and large windows that would be impractical to operate manually. For lakefront homes in Coeur d'Alene and Sandpoint, automated sunset schedules mean your privacy shades lower exactly when you need them without lifting a finger.",
    faqs: [
      {
        question: "Do motorized shades require an electrician to install?",
        answer: "Not typically. Battery-powered motors from Alta, Norman, and Lafayette require no hardwiring — Mark installs them in a single visit with no construction work needed. Battery motors last 1–2 years per charge. For new construction, Mark recommends having an electrician run power to window frames if you want hardwired motors, which last indefinitely without battery changes and handle heavier shade fabrics.",
      },
      {
        question: "What smart home systems are compatible with motorized shades?",
        answer: "Alta, Norman, and Lafayette all offer motorized models compatible with Amazon Alexa, Google Home, and Apple HomeKit — though exact compatibility varies by product line. Mark will confirm which specific motor system works with your existing smart home setup during the consultation and handles complete programming and integration after installation.",
      },
      {
        question: "How long do battery-powered motorized shades last on a charge?",
        answer: "Battery-powered motors typically last 1–2 years under normal daily use. When the battery needs replacing, an LED indicator on the motor or a notification in the app will alert you before it goes dead. The motors are whisper-quiet and perform identically to hardwired versions — the only difference is the occasional battery recharge.",
      },
      {
        question: "Can I control all my motorized shades in a room with a single command?",
        answer: "Yes — group control is one of the most useful features of a well-designed motorization setup. You can group shades by room, floor, or the entire house and control them together. A single 'good morning' command raises every shade at once. 'Movie time' lowers the great room shades without touching anything else. Mark programs all group scenes and schedules during installation, so everything is working correctly from day one — no technical setup required on your end.",
      },
      {
        question: "What happens if a motorized shade stops working?",
        answer: "The most common issues — dead batteries or a dropped wireless connection — are easy to fix. True motor failure is rare in quality brands, but if it does happen, virtually every motor we install can still be operated manually as a backup, so you're never stuck with a shade you can't move. Mark handles warranty claims and service on every installation, so you're not left troubleshooting alone. The motors we use typically outlast the shade fabric itself, which is why we treat motorization as a long-term system investment, not just an add-on.",
      },
    ],
    metaTitle: "Motorized Shades in Northern Idaho | Smart Window Treatments",
    metaDescription: "Smart motorized window treatments for Northern Idaho homes. Voice control, app control, automated schedules. Serving Coeur d'Alene, Post Falls, Hayden. Free consultation.",
  },
};
