# Terraria (browser clone)

A from-scratch, single-player Terraria-style sandbox that runs in the browser.
No build step, no external assets — every sprite, sound and background is generated in code.

## Run it

Double-click **`Play Terraria.bat`** in this folder: it serves the folder on <http://localhost:8765> and opens
your browser. Keep that console window open while you play; closing it stops the server. (It needs Python on
your PATH; if a server is already running on 8765 it just opens the game.)

Or serve it yourself:

```bash
python -m http.server 8765
```

and open <http://localhost:8765>.

Opening `index.html` straight from the folder (a `file://` URL) does run, but Chrome blocks IndexedDB there,
so **worlds cannot be saved or loaded**, and the recorded sounds in `assets/` will not load (the game falls
back to its procedural audio). Use the launcher or a local server for real play.

## What's in the box

- **Title screen, world generation & loading screen** with tips (like the reference screenshots).
- **1800×600 tile world**: forest / desert / snow biomes, hills, caves and caverns, ore veins
  (copper, iron, silver, gold, diamonds), clay, water & lava pools, an underworld with hellstone,
  trees with canopies, cacti, flowers, mushrooms, cobwebs, hidden chests with loot, life crystals.
- **Terraria-style lighting**: smooth coloured light, torches, sunlight, day/night cycle with
  sun, moon, stars, clouds and parallax mountains/forest.
- **Mining & building**: pickaxes, axes, hammers (walls), tile hardness, falling sand, water and
  lava simulation (they make obsidian), platforms, doors, furniture (work bench, furnace, anvil,
  chest, table, chair, campfire, lantern), background walls.
- **Inventory & crafting**: 50-slot inventory, hotbar, chests, trash, crafting stations and ~45
  recipes from torches up to gold gear, bombs and a grappling hook.
- **Enemies**: slimes (many colours), zombies and demon eyes at night, bats, skeletons and lava
  slimes deeper down, plus the **Eye of Cthulhu** boss (craft a Suspicious Looking Eye from 6
  lenses, or it may hunt you at night once you have 200+ life).
- **Guide NPC** with a dialog box (Help / Crafting hints), minimap and full-screen map, save/load
  (IndexedDB, autosaves every 3 minutes and on exit).

## Game mechanics (following the Terraria wiki)

- **Health regeneration** uses the real formula: regen time builds while you avoid damage (faster
  standing still ×1.25, slower moving ×0.5), scales with max life, boosted by campfires and by sitting
  on a chair (right-click it).
- **Defense**: three armor slots (head / body / legs); damage taken is reduced by half your defense
  (¾ in Expert), minimum 1. Copper/Iron/Silver/Gold/Molten sets are forged at the Anvil.
- **Critical hits** (4% base, ×2 damage), **knockback**, 40-tick invincibility after a hit.
- **Modifiers**: crafted, looted and dropped tools/weapons roll a random prefix (25% none), e.g.
  *Legendary*, *Broken*, *Light* — changing damage, speed, crit and knockback.
- **Breath meter**: 200 breath, −1 every 7 ticks under water (23 s), refills in 1.1 s, then drowning.
- **Fall damage**: 10 × (blocks − 25), reduced by defense; water and the hook break your fall.
- **Buffs & debuffs**: Potion Sickness (60 s after any healing item), Cozy Fire, On Fire! (lava).
- **Coins & value**: enemies drop copper/silver/gold coins by their value; every item has a value,
  the Merchant (arrives once you hold 50 silver) buys for ⅕ of it and sells supplies.
- **Death**: "You were slain…", you drop half your coins (Classic), a tombstone with the death
  message is placed, random Terraria-style death messages by cause.
- **NPC spawning**: spawn rate / max-spawn tables per layer (1/600 & 5 by day, 1/360 & 6 at night,
  underground 1/108 & 10, cavern 1/300 & 8, underworld 1/240 & 9), off-screen spawn rectangle,
  faster spawns when few enemies are active, fewer spawns near town NPCs.
- **Day/night**: 24 real minutes per day (1 in-game hour = 1 minute), 8 moon phases, and a
  **Blood Moon** (1/9 chance per night once you have >120 life) with far more zombies.
- **World creation**: Small / Medium / Large worlds and Classic / Expert difficulty (Expert:
  enemies ×2 life and damage, ×2.5 coins, weaker defense).
- **Autoswing** toggle in Settings (weapons repeat while the button is held).

## Town NPCs (following the NPCs / NPC names wiki pages)

- **Housing**: NPCs move in only if a valid vacant house exists — an enclosed room of 60–750 tiles
  (frame included) with player-placed walls, a door (or platform) entrance, a light source, a table or
  work bench, and a chair. The **Housing** menu in the inventory has a *?* query banner and one banner
  per NPC: click a banner, then click a room to check it or assign that NPC's home.
- **Who moves in** (real conditions): Guide (world start) · Merchant (50 silver) · Nurse (>100 life +
  Merchant) · Demolitionist (own an explosive + Merchant) · Dryad (Eye of Cthulhu beaten) ·
  Arms Dealer (own Musket Balls or a gun) · Traveling Merchant (22.12% each morning once two town
  NPCs live in town; random stock, leaves at 6 PM). Names come from the wiki's name lists.
- **Behaviour**: they wander by day, go home at night and during Blood Moons (teleporting home when
  off-screen), sit in chairs, open doors, show chat bubbles, and defend themselves — Guide's arrows,
  Merchant's throwing knives, Demolitionist's grenades, Arms Dealer's pistol, Dryad's aura; the Nurse
  heals other NPCs. 250 life, 15 defense (+3 / +10% damage after the Eye is beaten); enemies can
  kill them and they return once their conditions and a vacant house are met again.
- **Services**: shops with buy/sell (⅕ value), the Nurse heals and removes debuffs for coins
  (missing life + 100 copper per debuff). Three or more town NPCs nearby stop enemy spawns around
  your base (except in Expert mode and during events).
- New items: Flintlock Pistol + Musket Balls (ranged), Grenades (no tile damage), Dynamite.
- **The rest of the roster** (`js/townnpcs.js`): the **Dye Trader** (moves in once four NPCs live in town and
  you carry a dye or a **Strange Plant** - a rare drop from breaking flowers; trade plants for rare dyes) and
  the **Skeleton Merchant**, who turns up near you while you explore the caverns and wanders off again
  (stock changes with the moon phase, night and Blood Moons: Strange Brew, Bone Torch, Gradient / Format:C
  yoyos, the Slap Hand...). **Bound NPCs** have to be found before they move in: the Mechanic tied up in
  the Dungeon, the Wizard in the caverns (Hardmode), the webbed Stylist in a spider nest, the Golfer in
  the Underground Desert and the Tortured Soul in the Underworld (Hardmode - free him with **Purification
  Powder** from the Dryad, which also cleanses evil blocks, and he becomes the Tax Collector). Right-click
  to free them; they head for a vacant house and come back the normal way if they die.
- **Town Slimes** (eight, homeless townsfolk with their own looks): Nerdy (King Slime beaten), Cool
  (win a Slime Rain), Diva (Queen Slime beaten), Squire (win the Old One's Army), Surly (bites a fishing
  hook now and then), Mystic (any hostile slime that touches Shimmer), Elder (caged in the Dungeon,
  unlock him with a Golden Key) and Clumsy (stranded on a floating island - talk to him).
- **Happiness** (1.4.4 table): every NPC likes / dislikes biomes and neighbours within 25 tiles; crowding
  (more than three neighbours) and solitude (two or fewer NPCs within 120 tiles) count too. The result is
  a price multiplier (0.75x-1.5x, shown above the shop) and a **Happiness** button in every dialog that
  explains it. A happy enough NPC (0.90x or better) also sells the **pylon** of the biome it lives in.
- **Pylons**: Forest, Snow, Desert, Jungle, Ocean, Hallow, Cavern and Mushroom pylons (one of each per
  world, placed only in their own biome). Right-click a pylon to pick a destination; both ends need two
  town NPCs nearby and no boss or invasion may be active.

## Pets Overhaul (mod - adapted from the tModLoader mod)

A regular mod in the mod list: switched off, pets give no stats or abilities and Pet Forge recipes and the
Pet Tamer go away; the vanilla pets and light pets themselves stay (they follow you and give light) and the
pet slots always show. Town Pets (cat, dog, bunny) are vanilla too.

- **Regular Pets** (22, with classes Defensive / Offensive / Mobility / Utility / Melee / Mining) give real
  effects: Bone Rattle out-of-combat regen & shield, Brain in a Jar lifesteal pool, Seaweed turtle shell
  (ability), Lightning Carrot, Carrot jump stacks, Eater's Bone auto-jump, Eye Bone pickup/placement
  range, Slice of Hell Cake lava immunity, Spider Egg poison, Tartar Sauce melee stacks, Ball O' Fuse
  Wire explosions, Toy Sled frostburn/slow, Frozen Crown cheat-death, Suspicious Grinning Eye enrage,
  Dog Whistle, The Dirtiest Block, Amber Mosquito, Writhing Remains vein-mining, Deactivated Probe,
  Lizard Egg decoy tail, Mud Bud spores, Bamboo Leaf alert. **F** uses the pet ability.
- **Light Pets** (7) emit light and roll a **Quality** per stat on pickup (grey / blue / gold / animated
  100 %). The Pet Tamer **combines** two of the same Light Pet into one with the best rolls.
- **Town Pets**: Cat / Dog / Bunny licenses (Pet Tamer) and the Squire Slime (drop a Copper Helmet or
  Shortsword on a slime) — pet them for a permanent buff (Mining / Harvesting / Global Fortune, Pet Shielding).
- **Pet stats**: Ability Haste, Pet Damage / Healing / Shielding, Global / Mining / Harvesting Fortune
  (extra drops). The **Pet Monitoring Tablet** shows them all.
- **Pet Tamer** NPC (moves in after you equip a pet; needs a house): sells Pet Food, Pet Forge, Tablet and
  licenses, fights with a bonemerang. Every pet has a **Pet Forge recipe** (Pet Food + materials; some
  need a **Mastery Shard** from Expert bosses). Pets also drop from chests and rarely from enemies.
- **15 achievements** (toasts + list in the title menu / Settings).

## The Adventure Squad (mod - TerraGuardians-style companions)

Listed in the mod list as **The Adventure Squad** and switchable like any other mod: turned off, no bags are
handed out, the companions do not appear and their saved state waits in the save until it is turned back on.
A new character (and existing saves, once) receives four bags, one per class: **Nathan** the Summoner
(Finch Staff), **Logan** the Warrior (Copper Broadsword), **Hero** the Mage (Wand of Sparking) and
**Shiro** the Ranger (Wooden Bow + arrows). Use a bag to call the companion; up to 5 in the squad. They
follow you (jumping, opening doors, teleporting if lost), take contact damage, get **knocked out**
(right-click to help them up, or they recover after a minute), gain **XP and levels** from kills, and chat.
Right-click one for **Chat / Stay here / Follow me / Inventory / Dismiss** (dismissing returns the bag).

- **Own inventories** (`js/squad.js`): every companion has 30 inventory slots plus Head / Body / Legs,
  three vanity slots (shown instead of the armor underneath), three dye slots, four accessory slots, gear
  slots for boots, shield, wings and hook (wings let them fly after you and over gaps, a hook pulls them
  up when stuck), a pet slot and a **light pet** slot (the pet floats behind them lighting the way, and its
  Quality rolls apply - a ranger prefers a pet rolled for ranged damage), opened from the dialog (the panel replaces the crafting list; left
  click moves items with your cursor, right click equips, Shift+click sends an item to your bag, *Take
  All* empties it). They always fight with the best weapon of **their class** they carry, and auto-equip
  better class armor, accessories and pets you hand them. Armor set bonuses, accessory stats and pet
  classes apply to them like they do to you (Nathan's minion slots and whip tags, Hero's mana and mana
  cost, Shiro's ammo - she needs arrows / bullets / rockets in her bag - and Logan's melee speed). Gear
  they stop using - an outclassed weapon, a replaced armor piece, accessory or pet - is **sold on the spot
  and the coins go to you**. Worn armor and vanity are drawn on them, ArmamentDisplay keeps their weapon in
  hand and adds slash effects, and Visual Accessories draws their cloaks, shields, emblems and balloons.
- **Crafting**: a companion who carries the ingredients of a class upgrade crafts it within a couple of
  seconds - no crafting station needed ("Logan crafted Pilum!") - and switches to it if it is better.
  Shiro keeps her quiver at 100 rounds from wood and stone (or whatever ammo recipe she has materials for).
- **Requests**: about every ten seconds, out of combat, a companion who could craft a class weapon /
  armor piece / accessory from materials in *your* inventory asks for them - the world pauses while a
  panel shows the request (*Give* with Enter, *Not now* with Escape). They also ask for finished gear in
  your inventory that beats theirs - class weapons (Nathan wants both a summon staff and a whip), armor,
  accessories and pets; only the item in your hand is off limits - plus class buff potions (Archery for Shiro, Magic Power
  / Mana Regeneration for Hero, Summoning for Nathan, Ale for Logan, Ironskin / Regeneration / Swiftness /
  Endurance / Wrath / Rage / Lifeforce for everyone - drunk when a fight starts), ammo (or wood and stone for arrows), healing / mana potions and
  Life / Mana Crystals. Declined requests come back after 24 in-game hours; nothing is asked during boss
  fights, invasions or while enemies are close.
- **Weapon looks** (`js/weaponlooks.js`): generated weapon icons now match their class - whips coil, spears
  carry a head, summon staves and magic rods/scepters an orb, wands a small crystal, tomes a clasped cover,
  boomerangs bend, launchers are tubes with a rocket, guns have a grip. Hand-drawn icons and the pixel-art
  swords are untouched; companions hold the same icons.
- **Whip animation** (`js/whipfx.js`): swinging a whip uncoils a lash from the hand toward the cursor (or the
  target, for Nathan) in the whip's colour - it waves, cracks with a flash at full reach and snaps back over
  the swing, and the arm follows it instead of holding the coiled icon.
- **Weapon animation** (`js/meleefx.js`): bows and guns are held at the grip and pointed where you aim - a
  bow's string is drawn back with the arrow nocked and snaps on release, guns kick back with a muzzle flash and
  launchers puff smoke; magic staves and wands point at the aim with a pulsing tip that bursts into a ring of
  sparks on every cast, tomes hover open at the chest with a spinning rune circle, and magic guns kick like
  guns; summon staves are raised overhead on a cast - the tip flares in the minion's colour, motes rise from a
  summoning circle at the feet - and rest on the shoulder otherwise; pickaxes, axes and hammers swing full size in an arc through the block under the cursor, chips flying
  off it when the head lands; swords are drawn full size,
  hilt in hand, pivoting through the swing arc with a slash trail in the blade's colour; spears thrust as a real shaft from the
  hand - the head drives out with a streak and pulls back, following you as you move; flails swing on a sagging chain of links with a
  spinning spiked ball, yoyos whirr on a string, boomerangs tumble as bent blades with after-images (all in
  the weapon's colour); the thrower's arm follows the weapon and the hand is empty while it is out - for you
  and for Logan.
- **Real set bonuses** (`js/armorsets.js`): the vanilla sets use Terraria's 1.4.4 bonuses and per-piece
  stats - Copper-Platinum defense, Shadow +15% movement (7% melee speed per piece), Crimson regeneration,
  Meteor free Space Gun (+7% magic per piece), Molten +17% melee damage, Cobalt +15% melee speed,
  Palladium Rapid Healing, Mythril +5% melee crit, Orichalcum petals, Adamantite +18% melee/movement
  speed, Titanium Barrier (shards raised by your hits, +2 defense each, shattering on attackers),
  Chlorophyte leaf crystal, Solar shields (three regenerating shields, each absorbs 30% of a hit),
  Vortex stealth (stand still: +25% ranged damage, +30% ranged crit), Nebula boosters (stacking damage /
  life / mana regeneration from magic hits, +60 mana per piece) and the Stardust Guardian with +5 minion
  slots. Melee damage / speed / crit and ranged / magic crit only count while a weapon of that class is in
  hand (minions are never affected). Mods that alter a set keep their change while enabled (More
  Whip-Based Armors' Stardust whip bonus, the summoner hoods, the wood sets).
- Armor tooltips (yours and theirs) now list the piece bonus, the set it belongs to with how many pieces
  you wear, the set bonus (derived from the bonus itself when a set has no text) and the class it favours.
- New potions (also for you): Archery, Magic Power, Mana Regeneration, Summoning and Titan Potions at a
  Work Bench, and Ale from the Tavernkeep.
- **Orders** (dialog → *Orders*): **Mine**, **Chop**, **Fish** and **Build**, each with a *Stop …* button
  once given; nothing is done without the order, and enemies always come first (they drop the job to fight
  and pick it up again after). *Mine* / *Chop*: they dig the ore veins or
  fell the trees within about 30 tiles of you, swinging the tool for real (tool power and block requirements
  apply). *Fish*: they walk to the nearest lake (75+ tiles of water), cast, and
  reel in whatever bites using the normal fishing rolls, bait consumed from their bag. *Build* asks which plan: a **House** (9×8, doors on both sides, table, chair, torch and a platform loft),
  a **Storage Hall** (16 wide, two floors joined by a platform deck, twelve chests, torches) or an **Arena**
  (Small 40 / Medium 60 / Large 90 tiles wide with 3-5 rows of platforms, torches and two campfires). They
  survey a plot near you (marked out in the world: dashed outline, red blocks to dig, blue holes to fill), level
  it - felling trees, digging the high side into their bag and filling the low side with it - then build the
  plan block by block, one swing per block, crafting the kit (walls, doors, chests, platforms, torches,
  campfires) from the wood, gel, iron bars and dirt in their bag. When you order a build they say at once
  whether they have it all, will ask you for the rest, or - if neither of you has enough - exactly what is
  short; they take what you can spare and, when the rest is nowhere to be found, a paused notice spells out
  the shortfall and asks whether they should wait at the plot or drop the build. When it is done they tell you
  whether a town NPC can move in, and hand you what the plot yielded plus the leftover kit. Everything they mine, chop or catch goes **straight into your inventory** (a
  "+3 Copper Ore" popup on you). A missing tool - pickaxe, axe, fishing pole - or bait is sorted out by
  the companion: they craft the cheapest tool their bag allows, otherwise ask you for a spare one or for the
  materials to make it (and for bait), and start the moment they have it.
- Nago has left the squad (old Nago bags become empty bags; saved Nagos are dropped on load).

## Start with base (mod - adapted from the tModLoader mod)

Listed in the mod list as **Start with base**; switched off, the base options disappear from world creation
and new worlds start without a base. Pick a **Starter Base** when creating a world: **Row Houses, Tower, Apartment Block, Underground
Bunker or Pyramid** (or none), with a choice of **base blocks** (Wood, Gray Brick, Sandstone, Planks,
Stone) and **walls** (Wood, Planked, Gray Brick, Glass, Dirt). The base is built at spawn at the end
of world generation with **one valid house per town NPC the game contains** (Guide, Merchant, Nurse,
Demolitionist, Dryad, Arms Dealer, Pet Tamer — walls, door/platform entrance, torch, table, chair),
so NPCs move straight in as their conditions are met; the Guide already lives there. Optional extras:
a **Hellevator** (lit shaft to the underworld with fall-break platforms) and **Rest Outposts**
(campfire shelters every 150 tiles). Like the mod, it places no chests or crafting stations, and
shows a config code (e.g. `$Ba1FwoTwoWwo`) in the world-creation menu.

## More mod features

- **Trash To Treasure**: items dropped in the trash slot pay their sell value; taking one back costs the
  same. Payout rate (100/50/25/0 %) in Settings.
- **Shift-Click Crafting**: shift-click a recipe to craft straight into your inventory.
- **Mage class + Throarbin-Style Mage Changes**: mana (20 base, +20 per Mana Crystal = 5 Fallen Stars,
  which land at night), mana stars, mana potions with Mana Sickness, mana regeneration; Wand of Sparking
  (8 wood + 45 torches), six gem staffs (gems now come in six kinds: amethyst, topaz, sapphire, emerald,
  ruby, diamond), the multicolor **Jeweler's** (3 bolts) and **Aristocrat's Staff** (6 bolts), **Gem Hoods
  + Robes** with set bonuses for their staff, a **mini mana bar over your head** while mana isn't full,
  three **accessory slots** and the mod's accessories: Magic Cloak, Mana Knuckles, Celestial Knuckles,
  Mana Field, Star Band, Magic Glove (+ Band of Starpower). A Settings toggle switches between the
  buffed 25 % numbers and Throarbin's original 10 %.
- **Boss Checklist**: press **L** for the Boss Log — a checklist in progression order (King Slime, Eye of
  Cthulhu) with per-boss pages: description, spawn info and summon-item recipe, loot and collectible
  checklists (ticked once you've picked the item up), and records (kills, best time, least hits taken).
  Also boss despawn messages, an off-screen boss radar arrow and boss loot markers on the maps.
  New boss: **King Slime** (Slime Crown = 20 Gel + 5 Gold Bars), with trophies/masks for both bosses.
- **Auto Reforge Plus**: rescue the **Goblin Tinkerer** (tied up in the caverns) and talk to him to
  reforge weapons/tools (cost ⅓ of value). The reforge window is draggable and lockable (position is
  remembered), lists every prefix with rarity colours, and **Auto Reforge** repeats until one of the
  prefixes you ticked lands or your coins run out; the basic one-shot button can be hidden.

## Even more mod features (Biome Titles, Gensokyo, Armed Zombies!, Accessories+, Expert/Master Slot, Consolaria, Auto Fisher)

- **Biome Titles**: a big fading title with a subtitle whenever you enter a new area (Forest, Desert,
  Snow Biome, Jungle, Lake, Underground, Caverns, The Underworld, Space, Shrine Grounds).
- **Accessories+**: dedicated **Boots / Shield / Wings** equipment slots next to the accessory column,
  with new items: Hermes & Lightning Boots, Cobalt & Obsidian Shield (knockback immunity, lava walking),
  Leaf & Harpy Wings (hold jump in the air to fly - a flight bar shows the time left), Cloud in a Bottle
  (double jump), Lucky Horseshoe (no fall damage), Aglet, Anklet of the Wind, Obsidian Skull, Shackle.
  Equipment tooltips list their stats; the Traveling Merchant always sells an accessory; chests can hold them.
- **Expert/Master Slot**: Expert and the new **Master** difficulty (pick it when creating a world, enemies
  are 1.5x tougher than Expert) grant a fourth accessory slot.
- **Armed Zombies!**: zombies and skeletons can spawn with a **broadsword** (or heavy axe) and up to three
  pieces of iron armor. Their sword AI has a wind-up, swings, thrusts and charges, chains attacks, keeps
  its distance, gets a recovery penalty after a miss, charges you when you stand still, **parries** your
  attacks and ripostes, and can be **disarmed** (crits disarm more often): a disarmed zombie flees, then
  looks for a weapon on the ground - any unarmed zombie will grab a dropped sword. Armor pieces block a
  hit each and are knocked off as items. Optional survival healing, scared-when-hurt and stagger behaviour,
  and the weapon/axe/armor chances live in **Settings > Mod settings**.
- **Fishing + Auto Fisher**: craft a **Wood Fishing Pole** (8 wood) or Reinforced pole, find **Worms** in
  tall grass, cast into water (bobber, line, bites, reel in). Fishing power = pole + bait, with a lake-size
  penalty (under 75 tiles: nothing bites), dawn/dusk and Blood Moon bonuses. Catches: Bass/Trout/Salmon,
  biome fish (Atlantic Cod, Flounder, Neon Tetra, Armored Cavefish), rare Golden Carp and the **Reaver
  Shark** pickaxe, junk at low power, and **Wooden/Iron/Golden Crates** full of loot. Cook fish at a
  Furnace (Well Fed buff). The **Auto Fisher** accessory (10 iron + 20 wood + 5 gel) casts and reels for
  you while a pole is held; configure auto cast/reel, junk filtering, auto crate opening, auto-sell,
  multiple lines, infinite bait, fishing while swimming and the info panel (lake size, liquid, power, bait,
  forecast, catch records) in Mod settings. Tackle Box saves bait.
- **Gensokyo**: hostile **danmaku** bullets that pass through blocks and hurt you, with a **graze** counter
  (brush past bullets for points); **Fairies** (plain, Sunflower, Ice) that hover and fire spreads and drop
  **Point Items** (1 silver each) and **Power Items** (raise your danmaku Power up to 4.00 for +25 %
  damage per point). Danmaku weapons: homing **Ofuda**, the bouncing **Yin-Yang Orb**, and the Spell Card
  **"Fantasy Seal"**. A **shrine mini-biome** is generated near spawn (stone terrace, torii gate, donation
  chest, a valid shrine house) where the **Shrine Maiden** moves in once you've collected points/grazes;
  she sells danmaku gear. Boss: **Rumia** (Sealed Ribbon = 15 Gel + 3 Lenses + 1 Fallen Star, night only):
  five phases - two non-spells and the spell cards Night Sign "Night Bird", Darkness Sign "Demarcation"
  (darkens the screen) and Moon Sign "Moonlight Ray", each with a timer; survive a spell card without a
  hit to capture it for a Spell Card Bonus. Drops Rumia's Ribbon, Fantasy Seal, trophy and mask.
- **Consolaria**: **Lepus** (Suspicious Looking Egg = 20 Gel + 2 Lenses, also dropped by Diseaster
  Bunnies) - a giant rabbit that lays eggs hatching into **Diseaster Bunnies** and, at 50 %/25 % life,
  a large egg that hatches into a Lepus Kit; drops the **Egg Cannon**, Bunny Hood, trophy and mask.
  **Heart Shrines** underground (a stone-brick room with a ruby heart and a Life Crystal chest), the
  **Holy Hand Grenade** (5 Grenades + 3 Gold Bars + 1 Fallen Star; huge tile-safe explosion), **Vampire
  Miners** in the caverns (life-stealing, drop the light-giving Mining Helmet), and **Mc MoneyPants**
  (arrives with 3 gold + a Merchant) who sells holiday goods. **Holiday events** - Easter (bunnies on the
  surface, eggs in the shop), Halloween (Goodie Bags with candy / Pumpkin Mask) and Christmas (Presents
  with candy canes / Santa Hat) - are always active by default; switch them to real-date mode in Mod settings.
- All new bosses are in the **Boss Log**, and there are new achievements (Gone Fishing, Disarmed, Grazer,
  Spell Breaker, Egg Hunt).

## Big-mod slices (Calamity, Calamity Fables, Wrath of the Gods, Split, Thorium, Fargo's Mutant Mod, The Stars Above, Authentic Races) and libraries (Subworld Library, Structure Helper, SerousCommonLib, Luminance)

- **Calamity Mod**: **Revengeance** and **Death** difficulty modes above Expert (combinable with Master) with
  25 % / 50 % tougher enemies; the **Rage** (R) and **Adrenaline** (V) meters (Rage builds near enemies and
  when hurt, +50 % damage for 9 s; Adrenaline builds during boss fights while you avoid damage, +200 % damage
  and +20 defense for 6 s); the **Desert Scourge** worm boss (Desert Medallion in the desert - burrows,
  lunges, 28 segments); Wulfrum Slimes & Drones dropping Wulfrum Scrap for the **Wulfrum armor** set
  (set bonus: a regenerating 15-point shield); Sea Prism / Pearl Shard → Victide Bars → Aquatic Discharge
  and Scourge of the Desert; extra recipes for Lenses, Cobwebs and Life Crystals.
- **Calamity Fables**: the **Wanderer** quest NPC with a stylish dialogue UI (portrait, name plate,
  typewriter text, choices) and a five-quest chain with lore pages and the Wanderer's Charm; two structures
  (**Abandoned Mineshaft** with side tunnels and chests, **Old Watchtower**) and fancier surface generation
  (boulders, fallen logs, wildflower meadows, ruined brick walls underground).
- **Calamity: Wrath of the Gods**: **Solyn** (story NPC, moves in after your first boss) takes you on a
  Journey to the **Eternal Garden** dimension where **The Nameless Deity** waits: cast bars, Conjure
  Explosions, Starburst, Sword Constellation (telegraphed lines), Sun Blender and a Clock Strike that
  freezes time. Solyn fights beside you. Drops Deific Touch, Wings of the Nameless and a Divine Monolith.
  Visual intensity (shake / flashes) is configurable in Mod settings.
- **Split**: **Photography** - a Camera that snaps real pictures of the scene (stored in a Photo Album),
  the **Shutterbug** NPC with paid photo assignments; **Mana Overload** (casting on empty mana triggers 5 s
  of free, 30 % stronger spells, then Burnout); the **Stranded Ship** structure in the underground snow.
- **Thorium Mod**: three classes - **Bard** (Wooden Whistle, Bongos, Lute; Inspiration resource;
  Empowerments buff you, companions and town NPCs), **Healer** (Healer's Staff radiant bolts heal allies
  they pass, Caduceus Staff heals everyone nearby, Life Recovery), **Thrower** (Shuriken, Bone Javelin,
  Talon Burst; Technique Scroll sets Offensive / Defensive / Mobility; throwing hits build Technique Points,
  G activates); the **Grand Thunder Bird** boss (Storm Flare in the desert; dives and telegraphed lightning);
  the **Cook** NPC and food.
- **Fargo's Mutant Mod**: the **Mutant** (sells every boss summon, Battle/Calming Cry, Super Dummy,
  plushie) and the **Lumberjack**; infinite potions (30+) and ammo/throwables (999+); "Sold by" tooltips;
  Instabridge, Dirt Instabridge, Instalake, Instant Hellevator; Mega Bomb; the **Super Dummy** with a live
  DPS readout; the **Omnistation** buff aura; the World Token.
- **The Stars Above**: choose a **Starfarer** (Asphodene or Eridani - a floating companion with reactive
  dialogue for bosses, biomes, night and low life); the **Stellar Array** (U; 12 passives in 3 tiers with a
  weight budget that grows with bosses defeated); the **Stellar Nova** ultimate (X; Astral Blaze star rain
  or Umbral Blade slash + buff); the **Starfarer's Blade** Aspected weapon (hold to charge a piercing Stellar
  Slash); the **Vagrant of Space and Time** boss with cast bars (Spatial Rend, Temporal Barrage, Chronal
  Rifts, Time Stop); **Cosmic Voyages** - the Starmap takes you to an Asteroid Field dimension full of
  Astral Ore (Astral Bars, Pickaxe, Charm).
- **MrPlague's Authentic Races**: pick a race when creating a world - Human, Elf, Dwarf, Kobold, Vampire,
  Fluftrodon, Soulbeast, Goblin - each with its own look (ears, horns, tails, wings, size), stats and an
  active ability (Z: Bat Form, Fire Breath, Stone Skin, Pounce, Feral Form, Starlight, Tunnel). The
  **Race Editor** (title screen) builds custom races within a power budget; they are saved in the browser.
- **Subworld Library**: real dimensions (Eternal Garden, Asteroid Field) with their own size, sky and
  lighting; the main world, its NPCs and boss are snapshotted and restored; saves inside a subworld still
  save the main world; loot comes home with you; dying sends you home.
- **Structure Helper**: the **Structure Wand** (right-click two corners, left-click to save with a name)
  captures tiles, walls, liquids and chest contents; the **Structure Placer** pastes with a ghost preview;
  the structure list (B) selects, exports/imports JSON and flags structures to generate in new worlds.
- **SerousCommonLib**: text input (crafting **search box**, structure names, JSON import), a keybinding
  registry (listed in Mod settings), tooltip hooks, tile scanning (the **Tile Scanner** item) and player
  stat / damage / event hooks used by every mod above.
- **Luminance**: screen shake, flashes, projectile trails, bloom glows, telegraph lines and particle bursts
  used by the new bosses and weapons, with a Full / Reduced / Off setting.

## Full Terraria content pass (biomes, ores, bosses, events, equipment, NPCs)

- **Biomes** (`js/biomes.js`, `js/biomes2.js`): Forest, Desert, Snow, **Jungle** (mud, jungle grass, vines,
  mahogany), **Corruption or Crimson** (one per world: chasms with Shadow Orbs or angled tunnels with Crimson
  Hearts, Demon Altars, Demonite/Crimtane), **Ocean** at both edges with palms, **the Hallow** (created on
  Hardmode with pearlstone, hallowed grass/sand/ice, crystal shards), **Glowing Mushroom** caves, the
  **Dungeon** (brick tower + a maze of rooms, spikes, chests, Angry Bones, Cursed Skulls; guarded by the Old
  Man), Underground Desert (hardened sand, fossils, antlions), Underground Jungle (hives with honey, jungle
  shrines, a living mahogany tree, the **Jungle Temple** with the Lihzahrd Altar), Ice biome, Underground
  Mushroom, Underground Corruption/Crimson/Hallow, corrupted deserts & ice, the Underworld with an **Ash
  Forest**; mini-biomes: Oasis, Granite Cave, Marble Cave, Spider Nest, Bee Hive, Glowing Moss, Meteorite
  (lands after breaking orbs/hearts), Town, Graveyard, **Aether** (Shimmer pool that decrafts dropped items);
  structures: Underground Cabins, Living Trees, Floating Islands, Ruined Houses, Pyramid, Enchanted Sword
  Shrine, Mosaics, Campsites, Abandoned Minecart Tracks. Every biome has its own enemies and a Biome Title.
  Evil and Hallow spread slowly in Hardmode.
- **Ores** (`js/ores.js`): Copper/Tin, Iron/Lead, Silver/Tungsten, Gold/Platinum (worlds pick one of each),
  Demonite/Crimtane, Meteorite, Obsidian, Hellstone, Cobalt/Palladium, Mythril/Orichalcum,
  Adamantite/Titanium (blessed by smashing altars with the Pwnhammer), Chlorophyte (grows in jungle mud) and
  Luminite (Moon Lord) - each with bars, tools, a sword and an armor set with a set bonus (Solar, Vortex,
  Nebula and Stardust armor from Luminite).
- **Bosses** (`js/bosses2-4.js`): Eater of Worlds, Brain of Cthulhu (Creepers, illusions), Queen Bee,
  Deerclops, Skeletron (Old Man's curse; Dungeon Guardian by day), **Wall of Flesh** (Guide Voodoo Doll in
  lava; starts Hardmode), Queen Slime, The Twins, The Destroyer (probes), Skeletron Prime (four limbs),
  Plantera (hooks, enrage outside the jungle; bulbs grow after the mechs), Golem (temple, power cell),
  Duke Fishron (Truffle Worm bait in the Ocean), Empress of Light (day = Terraprisma), Lunatic Cultist
  (ritual with fakes, Phantasm Dragons), the four **Celestial Pillars** with kill-shields, and the **Moon
  Lord** (three eyes, deathray, core). Events with their bosses: Goblin Army, Slime Rain, Old One's Army
  (Dark Mage, Ogre, Betsy), Pirate Invasion (Flying Dutchman), Solar Eclipse (Mothron), Pumpkin Moon
  (Mourning Wood, Pumpking), Frost Moon (Everscream, Santa-NK1, Ice Queen) and Martian Madness (probe
  escapes -> Martian Saucer). All are in the Boss Log with summon recipes.
- **Equipment** (`js/equipment.js`, `js/catalog.js`): Hook, Mount and Minecart slots next to Boots/Shield/
  Wings, three **Vanity** slots and three **Dye** slots, three switchable **Loadouts**; hooks (Ivy Whip,
  Dual Hook, Hook of Dissonance...), mounts (slime, Queen Slime, UFO, Pigron, bunny; N to ride), minecarts
  on tracks (J), and every weapon class - bows & arrows, guns & bullets, rocket launchers, yoyos, flails,
  spears, boomerangs, magic tomes/staves, whips and **summon staves with minions** - plus ~90 named weapons,
  40+ accessories (emblems, Worm Scarf, Ankh Shield combos at the Tinkerer's Workshop...), buff potions, ammo
  types and the remaining town NPCs: Old Man, Clothier, Mechanic, Wizard, Angler (fishing quests), Truffle,
  Tavernkeep, Steampunker, Cyborg, Pirate, Witch Doctor, Party Girl, Golfer, Zoologist, Painter, Stylist,
  Tax Collector, Santa Claus, Princess and the Goblin Tinkerer.

## Vanilla completeness pass (bosses, items, enemies, blocks, bags) - `js/vanilla_*.js`

A sweep against the wiki's Bosses, Weapons, Armor, Accessories, Pets, Crafting materials, Enemies, Blocks and
Treasure Bag pages. Everything here is core content (no mod tag) and is crafted at Terraria's own stations:

- **Bosses**: all 33 are in and gated in order - Hardmode bosses need the Wall of Flesh, Plantera needs the
  three mechanical bosses, the Golem and the Empress need Plantera, the Cultist needs the Golem, the Moon Lord
  needs the Pillars (or a Celestial Sigil). Summons use the official recipes at the **Demon/Crimson Altar**
  (Slime Crown from a Gold/Platinum Crown, Suspicious Looking Eye, Worm Food, Bloody Spine, Abeemination,
  Deer Thing), Mythril Anvil (the three mechanical summons) and Ancient Manipulator (Celestial Sigil).
- **Crafting stations** (`vanilla_stations.js`): every station is a placeable with its recipes - Sawmill,
  Loom, Bookcase, Placed Bottle / Alchemy Table, Cooking Pot / Cauldron, Tinkerer's Workshop, Imbuing Station,
  Dye Vat, Heavy Work Bench, Keg, Teapot, Ice Machine, Glass Kiln, Crystal Ball, Autohammer, Lihzahrd
  Furnace, Solidifier, Honey Dispenser, Bone Welder, Flesh Cloning Vat, Living Loom, Sky Mill, Steampunk
  Boiler, Blend-O-Matic, Meat Grinder, Decay Chamber, Demon/Crimson Altar, Ancient Manipulator, plus the
  environment stations (water / lava / honey next to you, a Campfire, the Graveyard's Ecto Mist, a table or
  chair). The crafting panel shows recipes for the stations within 5 tiles.
- **Blocks & walls** (`vanilla_blocks.js`): the wood family (Rich Mahogany, Ebonwood, Shadewood, Pearlwood,
  Boreal, Palm, Ash, Dynasty, Spooky) with platforms, walls and a full furniture set each; every ore, stone
  and evil brick smelted at the Furnace; plating at the Heavy Work Bench; gemstone and gemspark blocks;
  cloud, sunplate, bone, slime, flesh, lesion, asphalt, honey, crystal, moss, luminite and fragment bricks;
  natural walls and their safe crafted versions; chests of every kind that really store items; and the
  themed furniture sets (Glass, Stone, Bone, Flesh, Honey, Slime, Frozen, Lihzahrd, Skyware, Steampunk, Living
  Wood, Mushroom, Cactus, Pumpkin, Marble, Granite, Martian, Meteorite, Obsidian, Crystal, Dungeon, Golden,
  Dynasty, Sandstone, Spider, Lesion, the four Lunar sets...). Tiles and walls are now 16-bit ids.
- **Items** (`vanilla_items.js`): crafting materials, the seven herbs and their seeds, buckets, bottled water
  / honey, every potion and flask with its real Bottled-Water-plus-herbs recipe at a Placed Bottle or
  Alchemy Table (flasks at the Imbuing Station), food from the Cooking Pot / Teapot / Keg, all the arrows,
  bullets, rockets, darts, flares and solutions, the thrown weapons and explosives, coloured torches, the
  remaining pickaxes / drills / chainsaws / hamaxes (multi-tools mine and chop), Life Fruit, keys and key
  molds, and the informational accessories up to the Cell Phone and Shellphone.
- **Weapons** (`vanilla_weapons.js`): shortswords and broadswords for every ore and wood, yoyos, spears,
  boomerangs, flails, bows and repeaters, guns, dart / sand / snowball / star / flare / nail guns and
  flamethrowers, launchers, wands, spell tomes (Bookcase), magic guns, minion staffs, sentry staffs (with
  their own sentry slots) and whips - each with real damage / use time / knockback / rarity and its recipe.
- **Armor** (`vanilla_armor.js`): Cactus, Gladiator, Fossil, Ninja, Jungle, Ancient Cobalt, Bee, Necro,
  Obsidian, Pumpkin, Mining, Angler, Eskimo, the magic hats and robes, the melee / ranged / magic helmets
  of every Hardmode ore (the set bonus follows the helmet), Hallowed (+ Hood), Frost, Forbidden, Spider,
  the Squire / Apprentice / Huntress / Monk sets and their tier-3 upgrades, Crystal Assassin, Turtle,
  Beetle, Shroomite, Spectre, Spooky, Tiki; thorns, stealth, Holy Protection, Spectre healing and bolts.
- **Accessories** (`vanilla_accessories.js`): every boot, balloon, bottle, horseshoe balloon and wing, the
  gloves, shields, emblems, cloaks, quivers, counterweights and strings, the Ankh Shield chain with real
  debuff immunities, builder tools, fishing gear, diving gear and mounts, plus all Tinkerer's Workshop
  combinations. Dash / wall climb / water walking / auto-jump run ungated.
- **Pets** (`vanilla_pets.js`): vanilla pets and light pets are core (they still follow and give light with
  Pets Overhaul off), the missing ones are added, and the pet slots always show.
- **Enemies** (`vanilla_enemies.js`): ~200 more enemies by biome / layer / weather / event with coin values
  and item drop tables (Ankh parts, mimic loot, rare weapons and vanity), the Blood Moon, rain, wind and
  Solar Eclipse rosters, and spawn pools per biome. Rain and windy days now happen (`vanilla_bossbags.js`).
- **Treasure Bags** (`vanilla_bossbags.js`): in Expert / Master every boss drops its bag instead of loose
  loot; use it for the drops, the Expert item and coins.
- Vanilla content that mods had claimed (wood armor, movement combos, reworked swords, Old One's Army sets,
  pet items, some potions) is promoted to core (`vanilla_core.js`), so it works with every mod off.
- **Stations are all obtainable**: Work Bench (10 Wood, by hand), Furnace (20 Stone + 4 Wood + 3 Torches), **Iron
  Anvil (5 Iron Bars) or Lead Anvil (5 Lead Bars)** at a Work Bench, Sawmill / Loom / Keg / Heavy Work Bench / Ice
  Machine / Glass Kiln / Cooking Pot / Teapot / Bookcase crafted, Tinkerer's Workshop + Rocket Boots from the
  Goblin Tinkerer, Crystal Ball from the Wizard, Imbuing Station from the Witch Doctor, Autohammer from the
  Truffle, Blend-O-Matic and Steampunk Boiler from the Steampunker, Solidifier from King Slime, Meat Grinder
  from Hardmode Crimson enemies, Honey Dispenser from Queen Bee / hive chests, and Bone Welder (Dungeon),
  Lihzahrd Furnace (Temple), Living Loom (living trees), Sky Mill (sky islands), Flesh Cloning Vat (Crimson
  cabins) and Decay Chamber (Corruption cabins) in the chests of their places. Biome chests also carry their
  Terraria loot (Ice Skates, Flippers, Storm Spears, Feral Claws...). Merchant / Dryad / Mechanic / Party Girl /
  Arms Dealer / Cyborg / Zoologist / Painter / Clothier shops carry the vanilla items they sell.
- **Inventory buttons**: **Sort** (merges stacks and orders the bag by kind, rarity and name) and **Quick
  Stack** (sends stacks into any chest within 20 tiles that already holds that item) under the trash slot;
  chests get **Quick Stack**, **Restock** and **Sort** next to Loot All / Deposit All.
- **Crafting**: click a recipe once for one craft; keep the mouse held on it and after 1.5 s it crafts
  repeatedly (faster the longer you hold, straight onto the cursor / into the inventory with Shift).
- **Map** (Tab) pauses the world completely and can be dragged to look around; **town NPCs** teleport into
  a house the moment you assign it in the housing menu and claim any vacant house on their own.

## Forty-five more mod adaptations (bosses, summoner, accessories, weapons, QoL, townsfolk, plants)

Every mod is listed in the **Mods** panel (main menu, or Settings → Mod settings in-game): a grid of tiles, left click toggles a mod, right click opens its config, hover (hold Ctrl) shows what it does, plus search, Enable all / Disable all, Export and Force Reload. Disabling a mod really turns it off: its items can't be used, crafted, bought or dropped, its enemies stop spawning, its bosses and events can't be started, its NPCs don't move in, its hooks, keys and menus go quiet, and its worldgen is skipped in new worlds (existing worlds keep what was already generated). Core libraries (SerousCommonLib, Subworld Library, Accessories+, Expert slot, Pets Overhaul, N Terraria Utilities, the mod list itself) stay on. Mod state lives in `world.modData` / `player.modData`, so saves stay compatible.

**Qwerty's Bosses and Items 2** (`js/qwerty.js`) – the **Sky Fortress** (a floating brick fortress with towers, chests, Rhuthinium ore veins and the Sky Altar; guarded by Fortress Harpies, Mollusks, High Priests, swarmers and enchanted tiles that drop Souls of Height in Hardmode), Rhuthinium gear with four class helmets and the Focus set bonus, Lune ore (seeded into the snow once the Polar Exterminator falls) and Lune gear, Caelite bars/armor/pickaxe, Gale Swift, Vitalum (lifesteal) and Hydra armor. Ten bosses: **Ancient Machine** (Ancient Emblem), **Rune Ghost** (Summoning Rune; aggro / ice / leech / pursuit runes and the rune scrolls), **Imperious** (Icon of the Conqueror; a living greatsword), **The Hydra** (Hydra Food; three regrowing heads), **Polar Exterminator** (Penguin Whistle; sleeps while its penguins fight), **The Divine Light** (Pendant of the Sky God at the Sky Altar), **Noehtnap** (Ritual Interrupter, night; WARNING beam), the **Invader Battleship** at the end of the **Invaders** event (Invasion Caller; destroy the gun, launcher and engine first), **The Great Tyrannosaurus** at the end of the **Dino Militia** event (Dino Egg) and **O.L.O.R.D.** (post-Moon Lord; kill the turrets to expose the core). Each has weapons for every class, accessories (Swordsman's Badge, Skyward Hilt, Imperious Sheath, Bloody Medallion, Amulet of Patience, Doppleganger, Penguin Generator, Dino Tooth, Tricerashield, Gravity Be Gone...), trophies and masks.

**Ophioid** (`js/bossmods.js`) – Dead Fungusbug / Living Carrion summon the **Ophiocoon** in an evil biome; break it and the **Ophiofly** hatches. Infested Compost (post-mech) calls the **Ophiopede** rematch: a long centipede with The Seeing that showers Souls of Might, Sight and Fright. **Corruption Core Boss** – Shadow/Flesh Wisps haunt the underground evil after a mech boss and drop Shadow Essence for the Shadow Heart; the **Core of Shadow** (Core of Flesh in Crimson worlds) fights from a static arena with four orbitals, the Dread Vortex and a chase; summoned at night it is enraged (50% DR, Dread debuff) and drops the Nightshard. **Jimbo's Desert Expansion** – Cactus Slimes, Dune Scorpions, Sand Wraiths, Dust Devils, scarab swarms, Desert Bandits and Haunted Urns; the **Mega Cactus Slime** (Prickly Pear, or on its own while you explore the desert); Haunted Urn shrines and bandit camps with ambushes; a Caravan Trader who visits the desert by day; Cacti Crasher, Needle Bow, Scorpion Spear, Sandstorm/Scarab staves, Urn of Souls, Bandit Blunderbuss, Dune armor and desert accessories, plus four new recipes for vanilla items.

**Summoner batch** (`js/summoner.js`) – whips now use range / speed modifiers and flat tag damage; sentries (stationary, with their own slot count), serpent minions that grow with every summon, and custom-AI minions. *Summoner++*: ten minions (Living Fireball, Wisp, Bat, Hive Guardian, Fairy, Crimson Axe, Corrupt Spear, Clone, Knife, Spectral Hound, Dark Harvest), three sentries (Bone Saw, Spike Trap, Flame Turret), three whips, whistles and cords, the Molten Glove, Stone of Illusions, Flinx Fur Coat + Flinx Hood set and the Minion Horn. *MoreWhipClassic*: eleven whips from the Whip Rope to the Stardust Whip. *More Whip-Based Armors*: Monk, Tiki, Shinobi Infiltrator and Stardust sets with whip range/speed set bonuses. *Whip Accessories*: ten gloves (Wooden Bracers → Ghostly Grip, which possesses weak enemies). *Evil Biome Summoner Extension*: Mother of Creepers, Rotten Eye, Ocular Staff, Metallic Eye, Bloody Scythe, Rotten Whip, Staff of the Hungry, Resentful Eye / Disgraceful Thorns / Molten Necklace armor conversions. *Ore Helmets for Summoner*: a Hood for every Hardmode ore set. *Ophidiomancy*: rattlesnakes and pythons, snake staves (Rattlesnake → Basilisk), the Snake Charmer set, Serpent Fang, Snake Skin Cloak, Charmer's Flute. *Goose's Vanilla Expansion*: maces, boomerangs, early minions (Slime, Finch, Vampire Frog, Abigail's Flower) and the Pilum. *Starting Class Weapons*: Wooden Dagger, Wooden Wand, Grass Whip, Wooden Throwing Knives (and the Wooden Bow) crafted by hand from 10 wood. *Wood Armor Bonuses*: trees drop biome woods (Ebonwood, Shadewood, Boreal, Rich Mahogany, Palm, Pearlwood, Ash) and all eight wood armor sets have real bonuses.

**Accessories & inventory** (`js/accessories2.js`) – *niol's Buffed Accessories* (Honey Comb bees, Star Cloak stars, cuffs, scopes, emblem reworks, Yoyo Bag, Cross Necklace, Pygmy Necklace, Berserker Rage and Enhanced Mana Regeneration buffs), *Advanced Accessory Combinations* (ten combos at the Tinkerer's Workshop, with the missing vanilla bases added), *Wings Bonuses* (every wing pair does something extra, more with matching armor), *Visual Accessories* (wings, shields, cloaks, balloons, emblems and boots drawn on the character), *Potion Slots* (healing / mana / wormhole slots; quick heal uses them first; **O** quick mana, **I** recall/wormhole slot), *Automatic Quick Heal* (auto heal below a life threshold, auto mana), *Bank Buttons* (Piggy Bank and Safe with inventory buttons, shift-click quick stack, **K** / **L**), *Teleport To Map Death* (click the skull on the Tab map) and *Gravitation Don't Flip the Screen* (Gravitation Potion / Gravity Globe: press Down in the air to flip; the camera stays put).

**Weapon reworks** (`js/weapons2.js`) – *Alternative Gem Staffs* (every gem staff has a unique attack, plus the Amber Staff and Thunder Zapper), *Full Weapons Overhaul* / *Koishi's Vanilla Weapon Rework* (ore swords throw waves, boomerangs charge on right click, spell tomes summon arcane familiars with the Arcane Energy bar, a dozen missing vanilla swords from the Blade of Grass to the Terra Blade, Shotgun, Zapinators, Blood Rain Bow, Staff of the Frost Hydra, Flare Gun with four flares, Thorn Arrows, Ricochet Bullets, Flare and Nebula Rift, sentry teleporting), *ArmamentDisplay* (held weapons always shown, slash effects, glowing dropped items, shield bash on right click) and *Fish Guns+* (24 fish guns, flamethrowers fed by gel and launchers, Scale Shot and Roe Rounds).

**Quality of life** (`js/qol2.js`) – *More Obtaining Tooltips* (crafting, sellers, drops, fishing, crates, shimmer), *Tooltip Icon* (icons on tooltip lines), *N Terraria Utilities* (Inventory / Quests / Mods tabs at the bottom of the inventory and a quest system), *Basic Automated (Vein) Mining* (mine one ore, the vein follows; shift + right click with a pickaxe whitelists a block), *Plentiful Ores* (ore multiplier at world creation, Wall of Flesh seeds Hardmode ores, Moon Lord scatters Luminite, fast Chlorophyte), *Wombat's General Improvements* (toggleable tweaks), *Demolitionist Sells Explore Potions* (ten potions incl. new Dangersense, Shine, Night Owl, Calming and Gravitation), *Merchant Sells Baits*, *Enemies drop Biome Crates* (ten biome crates, also fished up in their biomes) and the *Vanilla Fishing Expansion* (rods up to the Zenith Fishing Rod with many hooks and lava fishing, mineral / magnetic / botanical rods, baits incl. pillar baits, Super Crate and Sonar potions, lava fish and the Obsidian Lava Crate).

**Townsfolk & companions** (`js/townsfolk.js`) – *Better Friendly NPCs* (town NPCs scale with your boss count, retreat home when hurt, resist damage near home, regenerate while resting, counter-attack; optional invincibility), *Enraged Townsfolk* (hit NPCs enrage: faster, tougher, red aura), *TerraGuardians* (Blue, Sardine, Zacks, Alex, Brutus, Mabel, Vladimir and Cotton wander into your world by day - talk to recruit, chat, take their quests, follow / stay, and the big ones carry you) and the *Pets Overhaul: Calamity Addon* (one more effect for every pet and light pet).

**Plants & shimmer** (`js/verdure.js`) – *Violent Verdure*: twelve herbs in four families (NightBloom = mage, LunarGlimmer = summoner, HeartShoot = ranger, BogBud = melee) spliced at the Splicing Table, planted like seeds and harvested when they glow; harvesting can wake plant creatures whose Verdant Trophies the Gardener trades; brews, family weapons, Sprout / Thicket / Overgrowth armor with class helmets, tools, accessories and ammo. *More Shimmer!*: a vault sealed in void blocks under the Aether - dive into the Shimmer to phase down into it, mine cracked void and Aetherium, loot its chests; a Star Cloak dropped into Shimmer becomes the Chromatic Cloak (phasing only while holding Down).

## Audio (assets/bgm, assets/sfx)

`js/music.js` plays Terraria's soundtrack by situation the way the game does: Title on the menu; Overworld Day (sometimes Alt Overworld Day) / Night on the surface; Town Day / Night with three or more townsfolk nearby; Eerie on a Blood Moon or at a Meteorite; biome tracks for Snow / Ice, Desert / Underground Desert, Jungle / Jungle Night / Underground Jungle, Corruption, Crimson and Hallow (surface and underground), Ocean Day / Night, Mushrooms, Dungeon, Temple, Hell, Space Day / Night, Graveyard and the Aether; Underground / Alt Underground elsewhere below the surface; event themes (Goblins, Pirates, Martians, Pumpkin Moon, Frost Moon, Old One's Army, Slime Rain, Eclipse, The Towers, Lunar Boss); and every vanilla boss with its own theme (King Slime, Queen Bee, Eater of Worlds, Skeletron, Deerclops, Queen Slime, Twins, Destroyer, Skeletron Prime, Plantera, Duke Fishron, Empress, Lunatic Cultist) with Boss 1-5 for the rest, mod bosses included. Tracks crossfade.

Sound effects map onto Terraria's files: Dig / Tink for digging and mining, Item_1 swings, Item_5 bows, Item_11 / 36 / 40 / 41 guns, Item_61 launchers, Item_34 flamethrowers, Item_8 / 9 / 20 / 12 magic and lasers, Item_152 whips, Item_44 summons, Item_7 grapples, Item_17 fishing, Item_3 potions, Item_4 life crystals, NPC_Hit / NPC_Killed (bone and metal variants for skeletons and machines), Player_Hit / Player_Killed, Grab, Coin, Menu_Open / Close / Tick, Chat, Door_Opened / Closed, Double_Jump, Splash, Roar and Mech for boss arrivals, Zombie groans, drips underground and thunder on blood moons. Music and sound-effect volumes are in Settings (title and in-game). Missing files fall back to the old procedural effects.

## Controls (Terraria defaults)

| Action | Key |
| --- | --- |
| Move | A / D |
| Jump | Space |
| Drop through platforms | S |
| Use item / attack / mine / place | Left click |
| Interact (chest, door, NPC) | Right click |
| Inventory / close menus | Esc |
| Hotbar | 1–0, mouse wheel |
| Grapple (needs a Grappling Hook) | E |
| Pet ability | F |
| Boss Log | L |
| Quick heal | H |
| Throw item (Shift: whole stack) | T |
| Trash item under cursor | Delete |
| Auto select tool | Shift (hold) |
| Smart cursor | Left Ctrl |
| Cycle map style (minimap → overlay → hidden) | M |
| Fullscreen map | Tab |
| Map zoom | + / − |
| Hide UI | F11 |
| Quick save | F5 |
| Rage / Adrenaline (Revengeance) | R / V |
| Thrower technique | G |
| Stellar Array / Stellar Nova | U / X |
| Structure list | B |
| Race ability | Z |
| Mount / dismount | N |
| Minecart on a track | J |
| Piggy Bank / Safe | K / L |
| Quick mana (potion slot) | O |
| Recall / wormhole potion slot | I |
| Flip gravity (Gravitation / Gravity Globe, in the air) | Down |
| Charged boomerang throw / tome familiar / shield bash | Right click |
| Vein-mining whitelist | Shift + right click (pickaxe) |

## Files

- `js/util.js` – maths, seeded RNG, Perlin noise, text helpers
- `js/tiles.js`, `js/items.js`, `js/mechanics.js` – tiles/walls/items, recipes, coins, armor, prefixes, spawn tables
- `js/sprites.js` – procedural pixel-art generation
- `js/world.js`, `js/worldgen.js` – world data, liquids, generation
- `js/lighting.js` – light propagation
- `js/entities.js`, `js/enemies.js` – player, NPC, drops, enemies, boss
- `js/render.js`, `js/ui.js` – rendering and HUD/menus
- `js/armed.js`, `js/fishing.js`, `js/gensokyo.js`, `js/consolaria.js`, `js/extras.js` – the mod slices above
- `js/luminance.js`, `js/serous.js`, `js/subworlds.js` – effect, library and dimension systems
- `js/calamity.js`, `js/fables.js`, `js/wotg.js`, `js/split.js`, `js/thorium.js`, `js/fargo.js`, `js/starsabove.js`, `js/structures.js`, `js/races.js` – the big-mod slices
- `js/music.js` – the soundtrack and sound-effect mapping (assets/bgm, assets/sfx)
- `js/townnpcs.js` – Dye Trader, Skeleton Merchant, town slimes, bound NPC rescues, happiness and pylons
- `js/squad.js` – class companions: inventories, equipment stats, class combat, crafting and requests
- `js/armorsets.js` – Terraria's real armor set bonuses and per-piece stats
- `js/weaponlooks.js` – class-shaped weapon icons
- `js/vanilla_lib.js`, `js/vanilla_stations.js`, `js/vanilla_blocks.js`, `js/vanilla_items.js`, `js/vanilla_weapons.js`, `js/vanilla_armor.js`, `js/vanilla_accessories.js`, `js/vanilla_pets.js`, `js/vanilla_enemies.js`, `js/vanilla_bossbags.js`, `js/vanilla_core.js` – the vanilla completeness pass
- `js/whipfx.js` – whip lash animation
- `js/meleefx.js` – flail chain, yoyo string and boomerang animations
- `js/modlist.js`, `js/qwerty.js`, `js/bossmods.js`, `js/summoner.js`, `js/accessories2.js`, `js/weapons2.js`, `js/qol2.js`, `js/townsfolk.js`, `js/verdure.js` – the forty-five-mod batch
- `js/save.js`, `js/main.js` – persistence and the game loop
