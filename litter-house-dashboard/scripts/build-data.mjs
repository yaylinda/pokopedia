import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dashboardRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(dashboardRoot, "..");

const readJson = async (filename) =>
  JSON.parse(await readFile(path.join(repoRoot, "data", filename), "utf8"));

const [{ pokemon }, { pokemon: preferences }, { items }] = await Promise.all([
  readJson("pokemon.json"),
  readJson("pokemon-preferences.json"),
  readJson("items.json"),
]);

const litterItems = {
  venusaur: "leaf",
  vileplume: "leaf",
  bellsprout: "vinerope",
  weepinbell: "vinerope",
  tangela: "vinerope",
  tangrowth: "vinerope",
  cacturne: "sturdystick",
  combee: "honey",
  haxorus: "smalllog",
  grimer: "nonburnablegarbage",
  muk: "nonburnablegarbage",
  blissey: "stone",
  spinarak: "twine",
  ariados: "twine",
  mareep: "fluff",
  flaaffy: "fluff",
  paldeanwooper: "squishyclay",
  clodsire: "squishyclay",
  garbodor: "nonburnablegarbage",
  larvesta: "twine",
  volcarona: "twine",
  glimmet: "ironore",
  glimmora: "ironore",
  trapinch: "squishyclay",
  swablu: "fluff",
  altaria: "fluff",
  snivy: "vinerope",
  servine: "vinerope",
  serperior: "vinerope",
  rampardos: "stone",
  bastiodon: "stone",
  tyrantrum: "stone",
  aurorus: "stone",
  jumpluff: "fluff",
  jirachi: "stardust",
};

const currentAdditions = [
  {
    slug: "jumpluff",
    name: "Jumpluff",
    pokopiaNumberDisplay: "#003",
    pokemonIdDisplay: "189",
    imageUrl: "https://www.serebii.net/pokemonpokopia/pokemon/small/189.png",
    detailUrl: "https://www.serebii.net/pokemonpokopia/pokedex/jumpluff.shtml",
    idealHabitat: "Bright",
    favorites: [
      "Soft stuff",
      "Lots of nature",
      "Nice breezes",
      "Pretty flowers",
      "Round stuff",
    ],
    isCurrentAddition: true,
  },
  {
    slug: "jirachi",
    name: "Jirachi",
    pokopiaNumberDisplay: "#005",
    pokemonIdDisplay: "385",
    imageUrl: "https://www.serebii.net/pokemonpokopia/pokemon/small/385.png",
    detailUrl: "https://www.serebii.net/pokemonpokopia/pokedex/jirachi.shtml",
    idealHabitat: "Bright",
    favorites: [
      "Metal stuff",
      "Strange stuff",
      "Shiny stuff",
      "Watching stuff",
      "Wobbly stuff",
    ],
    isCurrentAddition: true,
  },
];

const itemById = new Map(items.map((item) => [item.itemId, item]));
const preferenceBySlug = new Map(
  preferences.map((entry) => [entry.pokemonSlug, entry]),
);

const roster = pokemon
  .filter((entry) => entry.specialties.some((specialty) => specialty.name === "Litter"))
  .map((entry) => {
    const preference = preferenceBySlug.get(entry.slug);
    return {
      slug: entry.slug,
      name: entry.name,
      pokopiaNumberDisplay: entry.pokopiaNumberDisplay,
      pokemonIdDisplay: entry.pokemonIdDisplay,
      imageUrl: entry.imageUrl,
      detailUrl: entry.detailUrl,
      idealHabitat: preference?.idealHabitat?.name ?? "Unknown",
      favorites:
        preference?.favorites
          ?.filter((favorite) => favorite.kind === "favorite-category")
          .map((favorite) => favorite.name) ?? [],
      isCurrentAddition: false,
    };
  })
  .concat(currentAdditions)
  .map((entry) => {
    const item = itemById.get(litterItems[entry.slug]);
    if (!item) throw new Error(`Missing litter item for ${entry.slug}`);
    return {
      ...entry,
      imagePath: `/pokemon/${entry.slug}.png`,
      litterItem: {
        id: item.itemId,
        name: item.name,
        imageUrl: item.pictureUrl,
        imagePath: `/items/${item.itemId}.png`,
      },
    };
  });

const houses = [
  {
    id: "garden-pavilion",
    name: "Garden Pavilion",
    subtitle: "A flowering, pollinator-friendly trio",
    pokemon: ["venusaur", "vileplume", "combee"],
    strength: "Strong",
    primaryReason: "Shared favorite: Lots of nature",
    reasons: ["Venusaur + Vileplume both litter Leaf", "Venusaur + Combee both prefer Bright", "Vileplume brings a Humid edge"],
  },
  {
    id: "vine-conservatory",
    name: "Vine Conservatory",
    subtitle: "One lush home for four prolific climbers",
    pokemon: ["bellsprout", "weepinbell", "tangela", "tangrowth"],
    strength: "Best fit",
    primaryReason: "All four litter Vine rope",
    reasons: ["Three prefer Humid", "All love Lots of nature", "Strong water and flower overlap"],
  },
  {
    id: "serpentine-greenhouse",
    name: "Serpentine Greenhouse",
    subtitle: "A tidy vine-producing evolution line",
    pokemon: ["snivy", "servine", "serperior"],
    strength: "Best fit",
    primaryReason: "Same family, habitat, and litter item",
    reasons: ["All prefer Humid", "All litter Vine rope", "Nature, wood, and water favorites overlap"],
  },
  {
    id: "web-workshop",
    name: "Web Workshop",
    subtitle: "A compact woodland weaving nook",
    pokemon: ["spinarak", "ariados"],
    strength: "Best fit",
    primaryReason: "Same family with identical preferences",
    reasons: ["Both prefer Humid", "Both litter Twine", "All five favorite categories match"],
  },
  {
    id: "sunmoth-forge",
    name: "Sunmoth Forge",
    subtitle: "Warm fibers, firelight, and wooden details",
    pokemon: ["larvesta", "volcarona"],
    strength: "Best fit",
    primaryReason: "Same family, Dry habitat, and Twine litter",
    reasons: ["Both love nature and fire", "Wooden stuff and Symbols overlap", "Their secondary Burn specialty fits the theme"],
  },
  {
    id: "cloud-pasture",
    name: "Cloud Pasture",
    subtitle: "A soft, bright home with a shared fluffy harvest",
    pokemon: ["mareep", "flaaffy", "swablu", "altaria"],
    strength: "Best fit",
    primaryReason: "All prefer Bright and litter Fluff",
    reasons: ["Cute stuff is shared by all four", "Two natural family pairs", "Fabric, soft, and breezy decor all work"],
  },
  {
    id: "soft-meadow",
    name: "Soft Meadow",
    subtitle: "A cheerful restorative nook for two gentle residents",
    pokemon: ["jumpluff", "blissey"],
    strength: "Strong",
    primaryReason: "Bright habitat with Soft and Round favorites",
    reasons: ["Jumpluff litters Fluff", "Blissey likes Fabric and Healing", "A calm meadow theme suits both"],
  },
  {
    id: "mudroom",
    name: "Mudroom",
    subtitle: "A cozy clay-producing burrow for two marshy neighbors",
    pokemon: ["paldeanwooper", "clodsire"],
    strength: "Best fit",
    primaryReason: "Same family, Humid habitat, and Squishy clay litter",
    reasons: ["Both enjoy Garbage and Lots of dirt", "Their favorite lists support a muddy waterside build", "No conflicting habitat conditions"],
  },
  {
    id: "reclamation-yard",
    name: "Reclamation Yard",
    subtitle: "A surprisingly shiny home built around useful waste",
    pokemon: ["grimer", "muk", "garbodor"],
    strength: "Best fit",
    primaryReason: "Garbage favorites and Nonburnable garbage litter",
    reasons: ["All like Garbage and Shiny stuff", "Gatherings overlap across the trio", "Grimer + Muk prefer Dark; Garbodor prefers Humid"],
  },
  {
    id: "crystal-observatory",
    name: "Crystal Observatory",
    subtitle: "Rare minerals under a star-filled roof",
    pokemon: ["glimmet", "glimmora", "jirachi"],
    strength: "Inspired",
    primaryReason: "Shiny favorites and valuable mineral litter",
    reasons: ["Glimmet + Glimmora are an exact match", "Jirachi adds Stardust to their Iron ore", "Split the Bright and Dark zones inside the build"],
  },
  {
    id: "fossil-courtyard",
    name: "Fossil Courtyard",
    subtitle: "A monumental stone garden for ancient silhouettes",
    pokemon: ["rampardos", "bastiodon", "tyrantrum", "aurorus"],
    strength: "Best fit",
    primaryReason: "All litter Stone and love Stone + Hard stuff",
    reasons: ["The first three prefer Dry", "Luxury and Exercise unite the fossil trio", "Aurorus needs a Cool alcove"],
  },
  {
    id: "rugged-lookout",
    name: "Rugged Lookout",
    subtitle: "A sun-baked desert outpost with plenty of open ground",
    pokemon: ["cacturne", "trapinch"],
    strength: "Strong",
    primaryReason: "Both require a Dry ideal habitat",
    reasons: ["Their desert character supports one coherent build", "Trapinch likes dirt and exercise space", "Their litter items differ: Stick + Clay"],
  },
  {
    id: "dragons-den",
    name: "Dragon’s Den",
    subtitle: "A focused Dark retreat for one powerful resident",
    pokemon: ["haxorus"],
    strength: "Best fit",
    primaryReason: "A solo house preserves Haxorus’s Dark habitat",
    reasons: ["No forced habitat compromise", "Luxury, fire, dirt, and exercise can shape the whole room", "Small log litter remains easy to collect"],
  },
];

const rosterBySlug = new Map(roster.map((entry) => [entry.slug, entry]));
const used = houses.flatMap((house) => house.pokemon);
const duplicates = used.filter((slug, index) => used.indexOf(slug) !== index);
const missing = roster.filter((entry) => !used.includes(entry.slug)).map((entry) => entry.slug);

if (duplicates.length || missing.length || used.length !== roster.length) {
  throw new Error(
    `Invalid grouping. Missing: ${missing.join(", ") || "none"}; duplicate: ${duplicates.join(", ") || "none"}`,
  );
}

const output = {
  generatedAt: "2026-07-11",
  sources: {
    repo: "Pokopedia JSON data",
    litter: "https://www.serebii.net/pokemonpokopia/litter.shtml",
  },
  roster,
  houses: houses.map((house, index) => ({
    ...house,
    number: index + 1,
    pokemon: house.pokemon.map((slug) => rosterBySlug.get(slug)),
  })),
};

await writeFile(
  path.join(dashboardRoot, "app", "litter-data.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(`Wrote ${roster.length} Pokémon across ${houses.length} houses.`);
