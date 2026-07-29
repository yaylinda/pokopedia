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

62 Pokemon in 18 homes (2 x 1-resident, 1 x 2-resident, 2 x 3-resident, 13 x 4-resident).
Identity: restored grassland, gardens, caves, and coast around old Fuchsia City.
Ideal-habitat mix: Bright 34, Cool 1, Dark 1, Dry 14, Humid 12.

### WIT-01 - Bright nature House 01

- Residents (3): Bulbasaur, Exeggcute, Exeggutor
- Compatibility: 65.7/100
- Why: 3/3 prefer Bright; shared favorites: Lots of nature, Gatherings, Group Activities; shared skills: Grow, Teleport.

### WIT-02 - Bright Cute stuff House 02

- Residents (4): Ivysaur, Venusaur, Sprigatito, Floragato
- Compatibility: 77.1/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Lots of nature, Pretty flowers; shared skills: Grow.

### WIT-03 - Bright nature House 03

- Residents (4): Pidgey, Pidgeotto, Pidgeot, Ditto
- Compatibility: 55.2/100
- Why: 4/4 prefer Bright; shared favorites: Lots of nature, Nice breezes, Soft stuff; shared skills: Fly, Search.

### WIT-04 - Humid nature House 04

- Residents (4): Oddish, Gloom, Vileplume, Professor Tangrowth
- Compatibility: 61.9/100
- Why: 4/4 prefer Humid; shared favorites: Lots of nature, Lots of dirt, Pretty flowers; shared skills: Grow.

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

### WIT-09 - Dry Exercise House 09

- Residents (4): Onix, Cubone, Marowak, Trapinch
- Compatibility: 66.7/100
- Why: 4/4 prefer Dry; shared favorites: Exercise, Lots of dirt, Slender objects; shared skills: Build, Bulldoze.

### WIT-10 - Bright Exercise House 10

- Residents (4): Scyther, Scizor, Pinsir, Heracross
- Compatibility: 73.8/100
- Why: 4/4 prefer Bright; shared favorites: Exercise, Lots of nature, Wooden stuff; shared skills: Chop, Build.

### WIT-11 - Dry nature House 11

- Residents (4): Cacnea, Cacturne, Larvesta, Volcarona
- Compatibility: 61.4/100
- Why: 4/4 prefer Dry; shared favorites: Lots of nature, Sharp stuff, Lots of fire; shared skills: Litter, Burn; shared litter: Twine.

### WIT-12 - Bright Construction House 12

- Residents (4): Timburr, Makuhita, Porygon, Porygon2
- Compatibility: 56.7/100
- Why: 4/4 prefer Bright; shared favorites: Construction, Blocky stuff, Colorful stuff; shared skills: Build, Recycle.

### WIT-13 - Bright Fabric House 13

- Residents (3): Mosslax, Smeargle, Porygon-Z
- Compatibility: 67.6/100
- Why: 3/3 prefer Bright; shared favorites: Fabric, Soft stuff, Strange stuff.

### WIT-14 - Bright Containers House 14

- Residents (4): Grubbin, Rookidee, Corvisquire, Corviknight
- Compatibility: 66.7/100
- Why: 4/4 prefer Bright; shared favorites: Containers, Nice breezes, Shiny stuff; shared skills: Chop.

### WIT-15 - Dry nature House 15

- Residents (4): Bonsly, Sudowoodo, Vibrava, Flygon
- Compatibility: 62.4/100
- Why: 4/4 prefer Dry; shared favorites: Lots of nature, Stone stuff, Wooden stuff; shared skills: Bulldoze, Fly.

### WIT-16 - Dark Mixed House 16

- Residents (1): Dartrix
- Compatibility: solo
- Why: 1/1 prefer Dark.

### WIT-17 - Dry Hard stuff House 17

- Residents (2): Aerodactyl, Cranidos
- Compatibility: 51.4/100
- Why: 2/2 prefer Dry; shared favorites: Hard stuff, Stone stuff.

### WIT-18 - Cool Mixed House 18

- Residents (1): Articuno
- Compatibility: solo
- Why: 1/1 prefer Cool.

## Bleak Beach

62 Pokemon in 17 homes (6 x 3-resident, 11 x 4-resident).
Identity: dark seashore, wetlands, palms, sea glass, and the old SS Anne.
Ideal-habitat mix: Humid 62.

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

### BLE-05 - Humid Colorful stuff House 05

- Residents (4): Gulpin, Swalot, Shellos, Shellos East Sea
- Compatibility: 61.4/100
- Why: 4/4 prefer Humid; shared favorites: Colorful stuff, Containers, Cleanliness; shared skills: Storage, Water.

### BLE-06 - Humid Cleanliness House 06

- Residents (4): Gastrodon, Gastrodon East Sea, Piplup, Prinplup
- Compatibility: 85.2/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Containers, Lots of water; shared skills: Water, Trade.

### BLE-07 - Humid Cleanliness House 07

- Residents (3): Goomy, Sliggoo, Poliwag
- Compatibility: 71.4/100
- Why: 3/3 prefer Humid; shared favorites: Cleanliness, Lots of water, Healing; shared skills: Water.

### BLE-08 - Humid water House 08

- Residents (4): Psyduck, Golduck, Kyogre, Lugia
- Compatibility: 65.7/100
- Why: 4/4 prefer Humid; shared favorites: Lots of water, Ocean vibes, Strange stuff; shared skills: ???, Search.

### BLE-09 - Humid Cleanliness House 09

- Residents (4): Lapras, Froakie, Frogadier, Suicune
- Compatibility: 80.5/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Lots of water, Ocean vibes; shared skills: Water.

### BLE-10 - Humid Cute stuff House 10

- Residents (3): Azurill, Marill, Azumarill
- Compatibility: 74.3/100
- Why: 3/3 prefer Humid; shared favorites: Cute stuff, Lots of water, Cleanliness; shared skills: Water, Hype.

### BLE-11 - Humid Garbage House 11

- Residents (4): Paldean Wooper, Clodsire, Trubbish, Garbodor
- Compatibility: 59.5/100
- Why: 4/4 prefer Humid; shared favorites: Garbage, Cleanliness, Complicated stuff; shared skills: Litter, Recycle; shared litter: Squishy clay.

### BLE-12 - Humid Cleanliness House 12

- Residents (3): Empoleon, Poliwhirl, Greninja
- Compatibility: 71.4/100
- Why: 3/3 prefer Humid; shared favorites: Cleanliness, Lots of water, Exercise; shared skills: Water.

### BLE-13 - Humid water House 13

- Residents (4): Lotad, Lombre, Ludicolo, Politoed
- Compatibility: 73.8/100
- Why: 4/4 prefer Humid; shared favorites: Lots of water, Noisy stuff, Containers; shared skills: Water, Hype.

### BLE-14 - Humid Electronics House 14

- Residents (3): Toxel, Toxtricity Amped Form, Toxtricity Low Key Form
- Compatibility: 71.4/100
- Why: 3/3 prefer Humid; shared favorites: Electronics, Noisy stuff, Play spaces; shared skills: Generate, Hype.

### BLE-15 - Humid Cleanliness House 15

- Residents (4): Dratini, Dragonair, Dragonite, Vaporeon
- Compatibility: 67.1/100
- Why: 4/4 prefer Humid; shared favorites: Cleanliness, Lots of fire, Lots of water; shared skills: Water.

### BLE-16 - Humid nature House 16

- Residents (3): Snivy, Servine, Serperior
- Compatibility: 91.4/100
- Why: 3/3 prefer Humid; shared favorites: Lots of nature, Lots of water, Wooden stuff; shared skills: Grow, Litter; shared litter: Vine rope.

### BLE-17 - Humid Group Activities House 17

- Residents (3): Dreepy, Drakloak, Dragapult
- Compatibility: 90.5/100
- Why: 3/3 prefer Humid; shared favorites: Group Activities, Lots of fire, Rides; shared skills: Gather, Search.

## Rocky Ridges

61 Pokemon in 18 homes (2 x 2-resident, 7 x 3-resident, 9 x 4-resident).
Identity: mountains, mines, caves, ore, fossils, and volcanic terrain around Pewter and Mt. Moon.
Ideal-habitat mix: Cool 5, Dry 6, Warm 50.

### ROC-01 - Warm Exercise House 01

- Residents (4): Charmander, Charmeleon, Charizard, Farfetch'd
- Compatibility: 68.6/100
- Why: 4/4 prefer Warm; shared favorites: Exercise, Wooden stuff, Lots of fire; shared skills: Burn.

### ROC-02 - Dry Hard stuff House 02

- Residents (2): Steelix, Shieldon
- Compatibility: 68.6/100
- Why: 2/2 prefer Dry; shared favorites: Hard stuff, Metal stuff, Stone stuff; shared skills: Crush.

### ROC-03 - Warm Cute stuff House 03

- Residents (4): Drifloon, Drifblim, Vulpix, Ninetales
- Compatibility: 50.0/100
- Why: 4/4 prefer Warm; shared favorites: Cute stuff, Lots of fire, Nice breezes; shared skills: Burn.

### ROC-04 - Warm fire House 04

- Residents (3): Litwick, Lampent, Chandelure
- Compatibility: 79.0/100
- Why: 3/3 prefer Warm; shared favorites: Lots of fire, Spooky stuff, Strange stuff; shared skills: Burn.

### ROC-05 - Warm fire House 05

- Residents (4): Growlithe, Arcanine, Moltres, Ho-Oh
- Compatibility: 65.7/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Nice breezes, Stone stuff; shared skills: Burn, Search.

### ROC-06 - Warm Looks like food House 06

- Residents (4): Munchlax, Snorlax, Skwovet, Greedent
- Compatibility: 59.5/100
- Why: 4/4 prefer Warm; shared favorites: Looks like food, Soft stuff, Group Activities; shared skills: Bulldoze.

### ROC-07 - Warm fire House 07

- Residents (4): Torchic, Magby, Magmar, Magmortar
- Compatibility: 68.6/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Stone stuff, Cute stuff; shared skills: Burn.

### ROC-08 - Warm Containers House 08

- Residents (3): Combusken, Blaziken, Volcanion
- Compatibility: 77.1/100
- Why: 3/3 prefer Warm; shared favorites: Containers, Lots of fire, Construction; shared skills: Burn, Build.

### ROC-09 - Warm Noisy stuff House 09

- Residents (3): Igglybuff, Chatot, Sylveon
- Compatibility: 65.7/100
- Why: 3/3 prefer Warm; shared favorites: Noisy stuff, Cute stuff, Fabric; shared skills: Hype.

### ROC-10 - Warm Hard stuff House 10

- Residents (4): Torkoal, Rolycoly, Carkol, Coalossal
- Compatibility: 86.7/100
- Why: 4/4 prefer Warm; shared favorites: Hard stuff, Lots of fire, Metal stuff; shared skills: Burn, Gather.

### ROC-11 - Warm Group Activities House 11

- Residents (3): Scorbunny, Raboot, Cinderace
- Compatibility: 73.3/100
- Why: 3/3 prefer Warm; shared favorites: Group Activities, Lots of fire, Stone stuff; shared skills: Burn.

### ROC-12 - Warm Cute stuff House 12

- Residents (3): Fidough, Dachsbun, Eevee
- Compatibility: 64.8/100
- Why: 3/3 prefer Warm; shared favorites: Cute stuff, Group Activities, Letters and words; shared skills: Search, Trade.

### ROC-13 - Warm fire House 13

- Residents (4): Charcadet, Armarouge, Ceruledge, Entei
- Compatibility: 79.5/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Luxury, Stone stuff; shared skills: Burn, Trade.

### ROC-14 - Warm fire House 14

- Residents (4): Cyndaquil, Quilava, Typhlosion, Flareon
- Compatibility: 78.1/100
- Why: 4/4 prefer Warm; shared favorites: Lots of fire, Metal stuff, Rides; shared skills: Burn.

### ROC-15 - Warm Strange stuff House 15

- Residents (3): Girafarig, Farigiraf, Mew
- Compatibility: 64.8/100
- Why: 3/3 prefer Warm; shared favorites: Strange stuff, Watching stuff, Rides; shared skills: Gather.

### ROC-16 - Cool Hard stuff House 16

- Residents (3): Beldum, Metang, Metagross
- Compatibility: 74.3/100
- Why: 3/3 prefer Cool; shared favorites: Hard stuff, Metal stuff, Strange stuff; shared skills: Recycle.

### ROC-17 - Dry Exercise House 17

- Residents (4): Rampardos, Bastiodon, Tyrunt, Tyrantrum
- Compatibility: 90.0/100
- Why: 4/4 prefer Dry; shared favorites: Exercise, Hard stuff, Luxury; shared skills: Crush, Litter; shared litter: Stone.

### ROC-18 - Cool Hard stuff House 18

- Residents (2): Amaura, Aurorus
- Compatibility: 68.6/100
- Why: 2/2 prefer Cool; shared favorites: Hard stuff, Shiny stuff, Stone stuff; shared skills: Crush.

## Sparkling Skylands

61 Pokemon in 16 homes (3 x 3-resident, 13 x 4-resident).
Identity: high, windy sky islands with the urban and technological ruins of Celadon and Saffron.
Ideal-habitat mix: Bright 61.

### SKY-01 - Bright Electronics House 01

- Residents (4): Magnemite, Magneton, Magnezone, Stereo Rotom
- Compatibility: 64.3/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Group Activities, Metal stuff; shared skills: Generate.

### SKY-02 - Bright Exercise House 02

- Residents (4): Tyrogue, Hitmonlee, Hitmonchan, Hitmontop
- Compatibility: 87.6/100
- Why: 4/4 prefer Bright; shared favorites: Exercise, Fabric, Group Activities; shared skills: Trade.

### SKY-03 - Bright Construction House 03

- Residents (4): Gurdurr, Conkeldurr, Hariyama, Gallade
- Compatibility: 75.7/100
- Why: 4/4 prefer Bright; shared favorites: Construction, Exercise, Fabric; shared skills: Build.

### SKY-04 - Bright Cute stuff House 04

- Residents (3): Pichu, Peakychu, Elekid
- Compatibility: 72.4/100
- Why: 3/3 prefer Bright; shared favorites: Cute stuff, Electronics, Glass stuff; shared skills: Generate.

### SKY-05 - Bright Electronics House 05

- Residents (4): Pikachu, Raichu, Voltorb, Electrode
- Compatibility: 71.4/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Round stuff, Glass stuff; shared skills: Generate, Explode.

### SKY-06 - Bright Fabric House 06

- Residents (4): Happiny, Chansey, Blissey, Audino
- Compatibility: 79.5/100
- Why: 4/4 prefer Bright; shared favorites: Fabric, Healing, Round stuff; shared skills: Trade.

### SKY-07 - Bright Electronics House 07

- Residents (4): Electabuzz, Electivire, Pawmo, Pawmot
- Compatibility: 72.9/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Exercise, Glass stuff; shared skills: Generate, Crush.

### SKY-08 - Bright Cute stuff House 08

- Residents (4): Mareep, Flaaffy, Ampharos, Pawmi
- Compatibility: 81.4/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Electronics, Glass stuff; shared skills: Generate, Litter; shared litter: Fluff.

### SKY-09 - Bright Cute stuff House 09

- Residents (4): Minccino, Cinccino, Swablu, Altaria
- Compatibility: 68.1/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Soft stuff, Cleanliness; shared skills: Gather, Litter; shared litter: Fluff.

### SKY-10 - Bright Electronics House 10

- Residents (4): Charjabug, Vikavolt, Raikou, Zapdos
- Compatibility: 65.2/100
- Why: 4/4 prefer Bright; shared favorites: Electronics, Glass stuff, Nice breezes; shared skills: Generate, Chop.

### SKY-11 - Bright Cute stuff House 11

- Residents (4): Jigglypuff, Wigglytuff, Wattrel, Kilowattrel
- Compatibility: 48.6/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Electronics, Gatherings; shared skills: Generate, Hype.

### SKY-12 - Bright Construction House 12

- Residents (3): Machop, Machoke, Machamp
- Compatibility: 96.2/100
- Why: 3/3 prefer Bright; shared favorites: Construction, Exercise, Group Activities; shared skills: Build, Gather.

### SKY-13 - Bright Cute stuff House 13

- Residents (4): Mawile, Tinkatink, Tinkatuff, Tinkaton
- Compatibility: 67.1/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Metal stuff, Construction; shared skills: Build.

### SKY-14 - Bright Strange stuff House 14

- Residents (4): Gholdengo, Ralts, Kirlia, Gardevoir
- Compatibility: 63.3/100
- Why: 4/4 prefer Bright; shared favorites: Strange stuff, Healing, Symbols; shared skills: Teleport.

### SKY-15 - Bright Cute stuff House 15

- Residents (3): Mime Jr., Mr. Mime, Espeon
- Compatibility: 67.6/100
- Why: 3/3 prefer Bright; shared favorites: Cute stuff, Strange stuff, Rides; shared skills: Gather.

### SKY-16 - Bright Cute stuff House 16

- Residents (4): Plusle, Minun, Dedenne, Jolteon
- Compatibility: 67.6/100
- Why: 4/4 prefer Bright; shared favorites: Cute stuff, Electronics, Glass stuff; shared skills: Generate.

## Palette Town

62 Pokemon in 17 homes (1 x 2-resident, 4 x 3-resident, 12 x 4-resident).
Identity: adaptable free-build and multiplayer islands with materials for nearly every biome.
Ideal-habitat mix: Cool 3, Dark 59.

### PAL-01 - Dark Complicated stuff House 01

- Residents (4): Koffing, Weezing, Riolu, Lucario
- Compatibility: 53.8/100
- Why: 4/4 prefer Dark; shared favorites: Complicated stuff, Gatherings, Construction; shared skills: Build, Recycle.

### PAL-02 - Dark Nice breezes House 02

- Residents (4): Hoothoot, Noctowl, Murkrow, Honchkrow
- Compatibility: 69.0/100
- Why: 4/4 prefer Dark; shared favorites: Nice breezes, Fabric, Letters and words; shared skills: Fly, Trade.

### PAL-03 - Dark nature House 03

- Residents (4): Volbeat, Illumise, Kricketot, Kricketune
- Compatibility: 68.6/100
- Why: 4/4 prefer Dark; shared favorites: Lots of nature, Wooden stuff, Colorful stuff; shared skills: Hype.

### PAL-04 - Dark Watching stuff House 04

- Residents (4): Drilbur, Excadrill, Ekans, Arbok
- Compatibility: 64.8/100
- Why: 4/4 prefer Dark; shared favorites: Watching stuff, Lots of nature, Garbage; shared skills: Search.

### PAL-05 - Dark dirt House 05

- Residents (3): Axew, Fraxure, Haxorus
- Compatibility: 80.0/100
- Why: 3/3 prefer Dark; shared favorites: Lots of dirt, Lots of fire, Luxury; shared skills: Chop.

### PAL-06 - Dark Nice breezes House 06

- Residents (4): Zubat, Golbat, Noibat, Noivern
- Compatibility: 64.3/100
- Why: 4/4 prefer Dark; shared favorites: Nice breezes, Complicated stuff, Looks like food; shared skills: Search.

### PAL-07 - Dark Nice breezes House 07

- Residents (4): Crobat, Absol, Rowlet, Decidueye
- Compatibility: 62.9/100
- Why: 4/4 prefer Dark; shared favorites: Nice breezes, Wooden stuff, Letters and words; shared skills: Chop, Grow.

### PAL-08 - Cool Group Activities House 08

- Residents (3): Meowth, Persian, Glaceon
- Compatibility: 68.6/100
- Why: 3/3 prefer Cool; shared favorites: Group Activities, Shiny stuff, Containers; shared skills: Trade.

### PAL-09 - Dark Garbage House 09

- Residents (4): Grimer, Muk, Glimmet, Glimmora
- Compatibility: 76.7/100
- Why: 4/4 prefer Dark; shared favorites: Garbage, Shiny stuff, Complicated stuff; shared skills: Litter; shared litter: Iron ore, Nonburnable garbage.

### PAL-10 - Dark Group Activities House 10

- Residents (4): Gastly, Haunter, Gengar, Dusknoir
- Compatibility: 85.2/100
- Why: 4/4 prefer Dark; shared favorites: Group Activities, Spooky stuff, Strange stuff; shared skills: Gather, Trade.

### PAL-11 - Dark Luxury House 11

- Residents (3): Zorua, Zoroark, Umbreon
- Compatibility: 62.9/100
- Why: 3/3 prefer Dark; shared favorites: Luxury, Shiny stuff, Cute stuff; shared skills: Trade.

### PAL-12 - Dark Spooky stuff House 12

- Residents (4): Mimikyu, Gimmighoul, Misdreavus, Mismagius
- Compatibility: 60.0/100
- Why: 4/4 prefer Dark; shared favorites: Spooky stuff, Strange stuff, Group Activities; shared skills: Trade.

### PAL-13 - Dark Round stuff House 13

- Residents (4): Cleffa, Geodude, Graveler, Golem
- Compatibility: 64.3/100
- Why: 4/4 prefer Dark; shared favorites: Round stuff, Exercise, Hard stuff; shared skills: Crush.

### PAL-14 - Dark Group Activities House 14

- Residents (4): Clefairy, Clefable, Diglett, Dugtrio
- Compatibility: 70.0/100
- Why: 4/4 prefer Dark; shared favorites: Group Activities, Play spaces, Cute stuff; shared skills: Hype.

### PAL-15 - Dark Luxury House 15

- Residents (3): Larvitar, Pupitar, Tyranitar
- Compatibility: 80.0/100
- Why: 3/3 prefer Dark; shared favorites: Luxury, Shiny stuff, Stone stuff; shared skills: Bulldoze, Crush.

### PAL-16 - Dark Strange stuff House 16

- Residents (4): Abra, Kadabra, Alakazam, Mewtwo
- Compatibility: 72.9/100
- Why: 4/4 prefer Dark; shared favorites: Strange stuff, Watching stuff, Metal stuff; shared skills: Teleport.

### PAL-17 - Dark Rides House 17

- Residents (2): Duskull, Dusclops
- Compatibility: 68.6/100
- Why: 2/2 prefer Dark; shared favorites: Rides, Spooky stuff, Strange stuff; shared skills: Gather.
