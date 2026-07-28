# Pokopia Region and Home Plan

Generated 2026-07-27 from the repository's 308-Pokemon dataset.
Every Pokemon appears exactly once. This is a thematic recommendation, not a restriction on moving residents.

## Heuristics

- Region: Honor the Tangrowth opening-story anchor and reward regions where a Pokemon's source habitat is available.
- Region: Score ideal habitat at 4x the researched region affinity.
- Region: Add weighted favorite-item and specialty matches to the region identity.
- Region: Use equal practical region targets (62, 62, 61, 61, 62) so flexible regions do not absorb the roster.
- Region: Improve the deterministic greedy assignment with pair swaps that optimize region fit and a smaller housemate-cohesion term.
- Home: Score pairs for shared ideal habitat, favorite categories, flavor, skills, complementary skills, and litter output.
- Home: Merge only when cross-group and whole-home compatibility clear quality thresholds.
- Home: Allow 1-4 residents; do not force four residents or minimize the number of homes.
- Home: Treat a shared litter item as a small bonus, never as a mandatory pairing rule.

> This is a reproducible recommendation, not a game rule. Pokemon can be moved, and Palette Town can reproduce many biomes.

## Withered Wastelands

62 Pokemon in 17 homes (1 x 2-resident, 4 x 3-resident, 12 x 4-resident).
Identity: restored grassland, gardens, caves, and coast around old Fuchsia City.
Ideal-habitat mix: Bright 20, Dark 10, Dry 7, Humid 15, Warm 10.

### WIT-01 - Bright nature House 01

- Residents (4): Bulbasaur, Exeggcute, Exeggutor, Grubbin
- Compatibility: 58.1/100
- Why: 4/4 prefer Bright; shared favorites: Lots of nature, Watching stuff, Gatherings; shared skills: Grow, Teleport.

### WIT-02 - Bright Cute stuff House 02

- Residents (4): Ivysaur, Venusaur, Sprigatito, Floragato
- Compatibility: 77.1/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Lots of nature, Pretty flowers; shared skills: Grow.

### WIT-03 - Warm Nice breezes House 03

- Residents (3): Charizard, Farfetch'd, Ho-Oh
- Compatibility: 62.9/100
- Why: 3/3 prefer Warm; shared favorites: Nice breezes, Wooden stuff, Exercise.

### WIT-04 - Humid dirt House 04

- Residents (3): Oddish, Gloom, Vileplume
- Compatibility: 79.0/100
- Why: 3/3 prefer Humid; shared favorites: Lots of dirt, Lots of nature, Pretty flowers; shared skills: Grow.

### WIT-05 - Bright nature House 05

- Residents (4): Bellossom, Tangela, Meowscarada, Leafeon
- Compatibility: 68.6/100
- Why: 4/4 prefer Bright; shared favorites: Lots of nature, Pretty flowers, Cute stuff; shared skills: Grow, Hype.

### WIT-06 - Humid nature House 06

- Residents (4): Paras, Parasect, Spinarak, Ariados
- Compatibility: 66.2/100
- Why: 4/4 prefer Humid; shared favorites: Lots of nature, Wooden stuff, Colorful stuff; shared skills: Litter, Search; shared litter: Twine.

### WIT-07 - Bright nature House 07

- Residents (4): Venonat, Venomoth, Combee, Vespiquen
- Compatibility: 66.2/100
- Why: 4/4 prefer Bright; shared favorites: Lots of nature, Wooden stuff, Nice breezes; shared skills: Search.

### WIT-08 - Humid nature House 08

- Residents (4): Bellsprout, Weepinbell, Victreebel, Tangrowth
- Compatibility: 84.3/100
- Why: 4/4 prefer Humid; shared favorites: Lots of nature, Pretty flowers, Lots of dirt; shared skills: Grow, Litter; shared litter: Vine rope.

### WIT-09 - Humid nature House 09

- Residents (4): Professor Tangrowth, Snivy, Servine, Serperior
- Compatibility: 68.1/100
- Why: 4/4 prefer Humid; shared favorites: Lots of nature, Lots of water, Wooden stuff; shared skills: Grow, Litter; shared litter: Vine rope.

### WIT-10 - Bright Exercise House 10

- Residents (4): Scyther, Scizor, Pinsir, Heracross
- Compatibility: 73.8/100
- Why: 4/4 prefer Bright; shared favorites: Exercise, Lots of nature, Wooden stuff; shared skills: Chop, Build.

### WIT-11 - Dark nature House 11

- Residents (4): Volbeat, Illumise, Kricketot, Kricketune
- Compatibility: 68.6/100
- Why: 4/4 prefer Dark; shared favorites: Lots of nature, Wooden stuff, Colorful stuff; shared skills: Hype.

### WIT-12 - Dry nature House 12

- Residents (3): Cacnea, Vibrava, Flygon
- Compatibility: 54.3/100
- Why: 3/3 prefer Dry; shared favorites: Lots of nature, Lots of dirt, Lots of fire; shared skills: Bulldoze, Fly.

### WIT-13 - Dry nature House 13

- Residents (4): Cacturne, Sudowoodo, Larvesta, Volcarona
- Compatibility: 61.9/100
- Why: 4/4 prefer Dry; shared favorites: Lots of nature, Wooden stuff, Lots of fire; shared skills: Litter, Burn; shared litter: Twine.

### WIT-14 - Warm Strange stuff House 14

- Residents (4): Drifblim, Girafarig, Farigiraf, Mew
- Compatibility: 57.6/100
- Why: 4/4 prefer Warm; shared favorites: Strange stuff, Watching stuff, Rides; shared skills: Gather.

### WIT-15 - Dark Nice breezes House 15

- Residents (4): Crobat, Rowlet, Dartrix, Decidueye
- Compatibility: 68.6/100
- Why: 4/4 prefer Dark; shared favorites: Nice breezes, Wooden stuff, Lots of nature; shared skills: Chop, Grow.

### WIT-16 - Dark Garbage House 16

- Residents (2): Ekans, Arbok
- Compatibility: 91.4/100
- Why: 2/2 prefer Dark; shared favorites: Garbage, Lots of nature, Slender objects; shared skills: Search.

### WIT-17 - Warm fire House 17

- Residents (3): Fidough, Vulpix, Ninetales
- Compatibility: 62.9/100
- Why: 3/3 prefer Warm; shared favorites: Lots of fire, Soft stuff, Cute stuff; shared skills: Burn.

## Bleak Beach

62 Pokemon in 17 homes (1 x 2-resident, 4 x 3-resident, 12 x 4-resident).
Identity: dark seashore, wetlands, palms, sea glass, and the old SS Anne.
Ideal-habitat mix: Dark 8, Humid 54.

### BLE-01 - Humid Cleanliness House 01

- Residents (4): Squirtle, Slowpoke, Slowbro, Slowking
- Compatibility: 78.1/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Healing, Lots of water; shared skills: Water.

### BLE-02 - Humid Cleanliness House 02

- Residents (4): Wartortle, Blastoise, Goodra, Poliwrath
- Compatibility: 77.6/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Exercise, Lots of water; shared skills: Water, Trade.

### BLE-03 - Humid Group Activities House 03

- Residents (4): Magikarp, Tatsugiri Curly Form, Tatsugiri Droopy Form, Tatsugiri Stretchy Form
- Compatibility: 67.1/100
- Why: 4/4 prefer Humid; shared favorites: Group Activities, Lots of water, Ocean vibes; shared skills: Trade.

### BLE-04 - Humid water House 04

- Residents (4): Gyarados, Cramorant, Wingull, Pelipper
- Compatibility: 81.0/100
- Why: 4/4 prefer Humid; shared favorites: Lots of water, Nice breezes, Ocean vibes; shared skills: Water, Fly.

### BLE-05 - Humid Cleanliness House 05

- Residents (2): Shellos, Shellos East Sea
- Compatibility: 85.7/100
- Why: 2/2 prefer Humid; shared favorites: Cleanliness, Colorful stuff, Containers; shared skills: Water.

### BLE-06 - Humid Cleanliness House 06

- Residents (4): Gastrodon, Gastrodon East Sea, Piplup, Prinplup
- Compatibility: 85.2/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Containers, Lots of water; shared skills: Water, Trade.

### BLE-07 - Humid Cleanliness House 07

- Residents (3): Goomy, Sliggoo, Poliwag
- Compatibility: 71.4/100
- Why: 3/3 prefer Humid; shared favorites: Cleanliness, Lots of water, Healing; shared skills: Water.

### BLE-08 - Dark Nice breezes House 08

- Residents (4): Zubat, Golbat, Noibat, Noivern
- Compatibility: 64.3/100
- Why: 4/4 prefer Dark; shared favorites: Nice breezes, Complicated stuff, Looks like food; shared skills: Search.

### BLE-09 - Humid water House 09

- Residents (4): Psyduck, Golduck, Kyogre, Lugia
- Compatibility: 65.7/100
- Why: 4/4 prefer Humid; shared favorites: Lots of water, Ocean vibes, Strange stuff; shared skills: ???, Search.

### BLE-10 - Dark Shiny stuff House 10

- Residents (4): Grimer, Muk, Absol, Honchkrow
- Compatibility: 54.8/100
- Why: 4/4 prefer Dark; shared favorites: Shiny stuff, Spooky stuff, Garbage; shared skills: Litter; shared litter: Nonburnable garbage.

### BLE-11 - Humid Cleanliness House 11

- Residents (4): Lapras, Froakie, Frogadier, Suicune
- Compatibility: 80.5/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Lots of water, Ocean vibes; shared skills: Water.

### BLE-12 - Humid Cute stuff House 12

- Residents (3): Azurill, Marill, Azumarill
- Compatibility: 74.3/100
- Why: 3/3 prefer Humid; shared favorites: Cute stuff, Lots of water, Cleanliness; shared skills: Water, Hype.

### BLE-13 - Humid Garbage House 13

- Residents (4): Paldean Wooper, Clodsire, Trubbish, Garbodor
- Compatibility: 59.5/100
- Why: 4/4 prefer Humid; shared favorites: Garbage, Cleanliness, Complicated stuff; shared skills: Litter, Recycle; shared litter: Squishy clay.

### BLE-14 - Humid Cleanliness House 14

- Residents (3): Empoleon, Poliwhirl, Greninja
- Compatibility: 71.4/100
- Why: 3/3 prefer Humid; shared favorites: Cleanliness, Lots of water, Exercise; shared skills: Water.

### BLE-15 - Humid water House 15

- Residents (4): Lotad, Lombre, Ludicolo, Politoed
- Compatibility: 73.8/100
- Why: 4/4 prefer Humid; shared favorites: Lots of water, Noisy stuff, Containers; shared skills: Water, Hype.

### BLE-16 - Humid Electronics House 16

- Residents (3): Toxel, Toxtricity Amped Form, Toxtricity Low Key Form
- Compatibility: 71.4/100
- Why: 3/3 prefer Humid; shared favorites: Electronics, Noisy stuff, Play spaces; shared skills: Generate, Hype.

### BLE-17 - Humid Cleanliness House 17

- Residents (4): Dratini, Dragonair, Dragonite, Vaporeon
- Compatibility: 67.1/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Lots of fire, Lots of water; shared skills: Water.

## Rocky Ridges

61 Pokemon in 19 homes (4 x 2-resident, 7 x 3-resident, 8 x 4-resident).
Identity: mountains, mines, caves, ore, fossils, and volcanic terrain around Pewter and Mt. Moon.
Ideal-habitat mix: Bright 3, Cool 5, Dark 15, Dry 13, Warm 25.

### ROC-01 - Warm Exercise House 01

- Residents (4): Charmander, Charmeleon, Magmar, Magmortar
- Compatibility: 73.8/100
- Why: 4/4 prefer Warm; shared favorites: Exercise, Hard stuff, Lots of fire; shared skills: Burn.

### ROC-02 - Dry dirt House 02

- Residents (4): Onix, Steelix, Cubone, Marowak
- Compatibility: 71.4/100
- Why: 4/4 prefer Dry; shared favorites: Lots of dirt, Slender objects, Exercise; shared skills: Build, Bulldoze.

### ROC-03 - Dark Exercise House 03

- Residents (4): Drilbur, Excadrill, Riolu, Lucario
- Compatibility: 52.4/100
- Why: 4/4 prefer Dark; shared favorites: Exercise, Watching stuff, Construction; shared skills: Build, Search.

### ROC-04 - Bright Construction House 04

- Residents (3): Conkeldurr, Machoke, Machamp
- Compatibility: 88.6/100
- Why: 3/3 prefer Bright; shared favorites: Construction, Exercise, Group Activities; shared skills: Build, Gather.

### ROC-05 - Warm fire House 05

- Residents (3): Litwick, Lampent, Chandelure
- Compatibility: 79.0/100
- Why: 3/3 prefer Warm; shared favorites: Lots of fire, Spooky stuff, Strange stuff; shared skills: Burn.

### ROC-06 - Dark dirt House 06

- Residents (3): Axew, Fraxure, Haxorus
- Compatibility: 80.0/100
- Why: 3/3 prefer Dark; shared favorites: Lots of dirt, Lots of fire, Luxury; shared skills: Chop.

### ROC-07 - Warm fire House 07

- Residents (4): Growlithe, Arcanine, Torchic, Moltres
- Compatibility: 66.2/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Stone stuff, Nice breezes; shared skills: Burn, Search.

### ROC-08 - Warm fire House 08

- Residents (4): Combusken, Blaziken, Scorbunny, Volcanion
- Compatibility: 67.1/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Containers, Stone stuff; shared skills: Burn, Build.

### ROC-09 - Dark Exercise House 09

- Residents (3): Geodude, Graveler, Golem
- Compatibility: 85.7/100
- Why: 3/3 prefer Dark; shared favorites: Exercise, Hard stuff, Round stuff; shared skills: Crush.

### ROC-10 - Dry Hard stuff House 10

- Residents (3): Bonsly, Aerodactyl, Shieldon
- Compatibility: 56.2/100
- Why: 3/3 prefer Dry; shared favorites: Hard stuff, Stone stuff, Round stuff.

### ROC-11 - Dark Luxury House 11

- Residents (3): Larvitar, Pupitar, Tyranitar
- Compatibility: 80.0/100
- Why: 3/3 prefer Dark; shared favorites: Luxury, Shiny stuff, Stone stuff; shared skills: Bulldoze, Crush.

### ROC-12 - Warm Hard stuff House 12

- Residents (4): Torkoal, Rolycoly, Carkol, Coalossal
- Compatibility: 86.7/100
- Why: 4/4 prefer Warm; shared favorites: Hard stuff, Lots of fire, Metal stuff; shared skills: Burn, Gather.

### ROC-13 - Warm fire House 13

- Residents (4): Charcadet, Armarouge, Ceruledge, Entei
- Compatibility: 79.5/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Luxury, Stone stuff; shared skills: Burn, Trade.

### ROC-14 - Dark Complicated stuff House 14

- Residents (2): Glimmet, Glimmora
- Compatibility: 100/100
- Why: 2/2 prefer Dark; shared favorites: Complicated stuff, Garbage, Hard stuff; shared skills: Litter; shared litter: Iron ore.

### ROC-15 - Warm Fabric House 15

- Residents (2): Cyndaquil, Quilava
- Compatibility: 91.4/100
- Why: 2/2 prefer Warm; shared favorites: Fabric, Lots of fire, Metal stuff; shared skills: Burn.

### ROC-16 - Dry Exercise House 16

- Residents (2): Trapinch, Cranidos
- Compatibility: 57.1/100
- Why: 2/2 prefer Dry; shared favorites: Exercise, Hard stuff.

### ROC-17 - Cool Hard stuff House 17

- Residents (3): Beldum, Metang, Metagross
- Compatibility: 74.3/100
- Why: 3/3 prefer Cool; shared favorites: Hard stuff, Metal stuff, Strange stuff; shared skills: Recycle.

### ROC-18 - Dry Exercise House 18

- Residents (4): Rampardos, Bastiodon, Tyrunt, Tyrantrum
- Compatibility: 90.0/100
- Why: 4/4 prefer Dry; shared favorites: Exercise, Hard stuff, Luxury; shared skills: Crush, Litter; shared litter: Stone.

### ROC-19 - Cool Hard stuff House 19

- Residents (2): Amaura, Aurorus
- Compatibility: 68.6/100
- Why: 2/2 prefer Cool; shared favorites: Hard stuff, Shiny stuff, Stone stuff; shared skills: Crush.

## Sparkling Skylands

61 Pokemon in 17 homes (1 x 2-resident, 5 x 3-resident, 11 x 4-resident).
Identity: high, windy sky islands with the urban and technological ruins of Celadon and Saffron.
Ideal-habitat mix: Bright 58, Cool 3.

### SKY-01 - Bright nature House 01

- Residents (3): Pidgey, Pidgeotto, Pidgeot
- Compatibility: 76.2/100
- Why: 3/3 prefer Bright; shared favorites: Lots of nature, Nice breezes, Soft stuff; shared skills: Fly, Search.

### SKY-02 - Bright Electronics House 02

- Residents (4): Magnemite, Magneton, Magnezone, Stereo Rotom
- Compatibility: 64.3/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Group Activities, Metal stuff; shared skills: Generate.

### SKY-03 - Bright Construction House 03

- Residents (4): Timburr, Makuhita, Hariyama, Gallade
- Compatibility: 77.1/100
- Why: 4/4 prefer Bright; shared favorites: Construction, Exercise, Fabric; shared skills: Build, Bulldoze.

### SKY-04 - Bright Construction House 04

- Residents (4): Gurdurr, Tinkatink, Tinkatuff, Tinkaton
- Compatibility: 71.0/100
- Why: 4/4 prefer Bright; shared favorites: Construction, Exercise, Metal stuff; shared skills: Build.

### SKY-05 - Bright Cute stuff House 05

- Residents (3): Pichu, Peakychu, Elekid
- Compatibility: 72.4/100
- Why: 3/3 prefer Bright; shared favorites: Cute stuff, Electronics, Glass stuff; shared skills: Generate.

### SKY-06 - Bright Electronics House 06

- Residents (4): Pikachu, Raichu, Voltorb, Electrode
- Compatibility: 71.4/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Round stuff, Glass stuff; shared skills: Generate, Explode.

### SKY-07 - Cool Luxury House 07

- Residents (3): Meowth, Persian, Articuno
- Compatibility: 61.9/100
- Why: 3/3 prefer Cool; shared favorites: Luxury, Shiny stuff, Containers; shared skills: Trade.

### SKY-08 - Bright Electronics House 08

- Residents (4): Electabuzz, Electivire, Pawmo, Pawmot
- Compatibility: 72.9/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Exercise, Glass stuff; shared skills: Generate, Crush.

### SKY-09 - Bright Cute stuff House 09

- Residents (4): Mareep, Flaaffy, Ampharos, Pawmi
- Compatibility: 81.4/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Electronics, Glass stuff; shared skills: Generate, Litter; shared litter: Fluff.

### SKY-10 - Bright Colorful stuff House 10

- Residents (4): Smeargle, Porygon, Porygon2, Porygon-Z
- Compatibility: 65.2/100
- Why: 4/4 prefer Bright; shared favorites: Colorful stuff, Soft stuff, Strange stuff; shared skills: Recycle.

### SKY-11 - Bright Cute stuff House 11

- Residents (4): Minccino, Cinccino, Swablu, Altaria
- Compatibility: 68.1/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Soft stuff, Cleanliness; shared skills: Gather, Litter; shared litter: Fluff.

### SKY-12 - Bright Electronics House 12

- Residents (4): Charjabug, Vikavolt, Raikou, Zapdos
- Compatibility: 65.2/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Glass stuff, Nice breezes; shared skills: Generate, Chop.

### SKY-13 - Bright Shiny stuff House 13

- Residents (4): Gholdengo, Rookidee, Corvisquire, Corviknight
- Compatibility: 63.8/100
- Why: 4/4 prefer Bright; shared favorites: Shiny stuff, Containers, Nice breezes; shared skills: Chop.

### SKY-14 - Bright Cute stuff House 14

- Residents (3): Mime Jr., Mr. Mime, Espeon
- Compatibility: 67.6/100
- Why: 3/3 prefer Bright; shared favorites: Cute stuff, Strange stuff, Rides; shared skills: Gather.

### SKY-15 - Bright Healing House 15

- Residents (3): Ralts, Kirlia, Gardevoir
- Compatibility: 81.9/100
- Why: 3/3 prefer Bright; shared favorites: Healing, Strange stuff, Symbols; shared skills: Teleport.

### SKY-16 - Bright Cute stuff House 16

- Residents (4): Plusle, Minun, Dedenne, Jolteon
- Compatibility: 67.6/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Electronics, Glass stuff; shared skills: Generate.

### SKY-17 - Bright Electronics House 17

- Residents (2): Wattrel, Kilowattrel
- Compatibility: 77.1/100
- Why: 2/2 prefer Bright; shared favorites: Electronics, Gatherings, Nice breezes; shared skills: Generate.

## Palette Town

62 Pokemon in 19 homes (3 x 1-resident, 1 x 2-resident, 3 x 3-resident, 12 x 4-resident).
Identity: adaptable free-build and multiplayer islands with materials for nearly every biome.
Ideal-habitat mix: Bright 14, Cool 1, Dark 27, Humid 5, Warm 15.

### PAL-01 - Bright Exercise House 01

- Residents (4): Tyrogue, Hitmonlee, Hitmonchan, Hitmontop
- Compatibility: 87.6/100
- Why: 4/4 prefer Bright; shared favorites: Exercise, Fabric, Group Activities; shared skills: Trade.

### PAL-02 - Dark Soft stuff House 02

- Residents (4): Koffing, Weezing, Hoothoot, Noctowl
- Compatibility: 60.5/100
- Why: 4/4 prefer Dark; shared favorites: Soft stuff, Wobbly stuff, Complicated stuff; shared skills: Fly, Recycle.

### PAL-03 - Bright Mixed House 03

- Residents (1): Ditto
- Compatibility: solo
- Why: 1/1 prefer Bright.

### PAL-04 - Humid Colorful stuff House 04

- Residents (2): Gulpin, Swalot
- Compatibility: 77.1/100
- Why: 2/2 prefer Humid; shared favorites: Colorful stuff, Containers, Looks like food; shared skills: Storage.

### PAL-05 - Warm Cute stuff House 05

- Residents (4): Drifloon, Igglybuff, Chatot, Sylveon
- Compatibility: 55.7/100
- Why: 4/4 prefer Warm; shared favorites: Cute stuff, Noisy stuff, Fabric; shared skills: Hype.

### PAL-06 - Dark Group Activities House 06

- Residents (4): Gastly, Haunter, Gengar, Dusknoir
- Compatibility: 85.2/100
- Why: 4/4 prefer Dark; shared favorites: Group Activities, Spooky stuff, Strange stuff; shared skills: Gather, Trade.

### PAL-07 - Bright Fabric House 07

- Residents (4): Happiny, Chansey, Blissey, Audino
- Compatibility: 79.5/100
- Why: 4/4 prefer Bright; shared favorites: Fabric, Healing, Round stuff; shared skills: Trade.

### PAL-08 - Warm Looks like food House 08

- Residents (4): Munchlax, Snorlax, Skwovet, Dachsbun
- Compatibility: 58.6/100
- Why: 4/4 prefer Warm; shared favorites: Looks like food, Soft stuff, Group Activities; shared skills: Bulldoze, Search.

### PAL-09 - Bright Cute stuff House 09

- Residents (4): Mosslax, Jigglypuff, Wigglytuff, Mawile
- Compatibility: 51.4/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Soft stuff, Group Activities; shared skills: Hype, Trade.

### PAL-10 - Dark Luxury House 10

- Residents (4): Zorua, Zoroark, Murkrow, Umbreon
- Compatibility: 63.8/100
- Why: 4/4 prefer Dark; shared favorites: Luxury, Shiny stuff, Group Activities; shared skills: Trade.

### PAL-11 - Dark Spooky stuff House 11

- Residents (4): Mimikyu, Gimmighoul, Misdreavus, Mismagius
- Compatibility: 60.0/100
- Why: 4/4 prefer Dark; shared favorites: Spooky stuff, Strange stuff, Group Activities; shared skills: Trade.

### PAL-12 - Dark Rides House 12

- Residents (3): Cleffa, Duskull, Dusclops
- Compatibility: 51.4/100
- Why: 3/3 prefer Dark; shared favorites: Rides, Spooky stuff, Strange stuff; shared skills: Gather.

### PAL-13 - Dark Group Activities House 13

- Residents (4): Clefairy, Clefable, Diglett, Dugtrio
- Compatibility: 70.0/100
- Why: 4/4 prefer Dark; shared favorites: Group Activities, Play spaces, Cute stuff; shared skills: Hype.

### PAL-14 - Bright Mixed House 14

- Residents (1): Machop
- Compatibility: solo
- Why: 1/1 prefer Bright.

### PAL-15 - Warm fire House 15

- Residents (3): Magby, Raboot, Cinderace
- Compatibility: 65.7/100
- Why: 3/3 prefer Warm; shared favorites: Lots of fire, Stone stuff, Group Activities; shared skills: Burn.

### PAL-16 - Warm Metal stuff House 16

- Residents (4): Greedent, Typhlosion, Eevee, Flareon
- Compatibility: 49.5/100
- Why: 4/4 prefer Warm; shared favorites: Metal stuff, Cute stuff, Group Activities; shared skills: Burn, Trade.

### PAL-17 - Dark Strange stuff House 17

- Residents (4): Abra, Kadabra, Alakazam, Mewtwo
- Compatibility: 72.9/100
- Why: 4/4 prefer Dark; shared favorites: Strange stuff, Watching stuff, Metal stuff; shared skills: Teleport.

### PAL-18 - Humid Group Activities House 18

- Residents (3): Dreepy, Drakloak, Dragapult
- Compatibility: 90.5/100
- Why: 3/3 prefer Humid; shared favorites: Group Activities, Lots of fire, Rides; shared skills: Gather, Search.

### PAL-19 - Cool Mixed House 19

- Residents (1): Glaceon
- Compatibility: solo
- Why: 1/1 prefer Cool.
