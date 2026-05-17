import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const siteOrigin = process.env.PUBLIC_SITE_URL || "http://localhost:3000";
const rawAdsenseClient = (process.env.ADSENSE_CLIENT || "").trim();
const adsenseClient = rawAdsenseClient
  ? rawAdsenseClient.startsWith("ca-") ? rawAdsenseClient : `ca-${rawAdsenseClient}`
  : "";
const adsensePublisherId = rawAdsenseClient
  ? rawAdsenseClient.replace(/^ca-/, "")
  : "";
const adsenseInlineSlot = (process.env.ADSENSE_SLOT_INLINE || "").trim();
const adsenseSidebarSlot = (process.env.ADSENSE_SLOT_SIDEBAR || "").trim();
const adsenseEnabled = Boolean(adsenseClient);

const siteName = "Minecraft For Beginners";

const navLabels = {
  en: {
    home: "Home",
    guides: "Beginner Guides",
    path: "Start Here",
    resources: "Resources",
    farming: "Farming & Villagers",
    progression: "Progression",
    read: "Read guide",
    back: "Back to home",
    language: "Language",
    about: "About",
    privacy: "Privacy",
    contact: "Contact"
  },
  de: {
    home: "Start",
    guides: "Anfanger-Guides",
    path: "Erste Schritte",
    resources: "Ressourcen",
    farming: "Farmen & Dorfbewohner",
    progression: "Fortschritt",
    read: "Guide lesen",
    back: "Zuruck zur Startseite",
    language: "Sprache",
    about: "Uber das Projekt",
    privacy: "Datenschutz",
    contact: "Kontakt"
  },
  fr: {
    home: "Accueil",
    guides: "Guides debutants",
    path: "Premiers pas",
    resources: "Ressources",
    farming: "Fermes & villageois",
    progression: "Progression",
    read: "Lire le guide",
    back: "Retour a l'accueil",
    language: "Langue",
    about: "A propos",
    privacy: "Confidentialite",
    contact: "Contact"
  }
};

const homeCopy = {
  en: {
    langName: "English",
    eyebrow: "Minecraft Beginner Survival Guides",
    title: "It's 2026 and you still haven't really started Minecraft? Start here.",
    subtitle:
      "Step-by-step Minecraft survival guides for complete beginners. Clear answers, fast reading, and zero veteran jargon.",
    primary: "Start with the first day guide",
    secondary: "Read all beginner guides",
    compareTitle: "Built for first-time players",
    compareCards: [
      {
        title: "No wiki maze",
        text: "Every guide answers one exact beginner question and gets to the point fast."
      },
      {
        title: "No veteran jargon",
        text: "Tools, ores, villagers, food, the Nether and coordinates explained in plain language."
      },
      {
        title: "Made for search",
        text: "The site is structured around the exact questions new Minecraft players actually type into Google."
      }
    ],
    sectionTitle: "Start with these beginner questions",
    sectionText:
      "These are the most useful pages for a player who wants to survive the first few hours and stop feeling lost.",
    categoriesTitle: "Simple path for new players",
    categories: [
      {
        label: "Start Here",
        text: "Your first day, first shelter, first tools, and the basics you cannot skip."
      },
      {
        label: "Resources",
        text: "Wood, coal, iron, torches and the safest path to your first serious mining trip."
      },
      {
        label: "Food & Villagers",
        text: "How to stay alive, build food supply, and use villages without overcomplicating things."
      },
      {
        label: "Progression",
        text: "How to get ready for the Nether, enchant tools, and eventually face the Ender Dragon."
      }
    ],
    footer: "Three-language Minecraft guide project for Europe: English, Deutsch and Francais."
  },
  de: {
    langName: "Deutsch",
    eyebrow: "Minecraft-Uberlebensguides fur Anfanger",
    title: "2026 und du bist immer noch nicht richtig in Minecraft eingestiegen? Dann fang hier an.",
    subtitle:
      "Schritt-fur-Schritt-Guides fur komplette Minecraft-Anfanger. Klare Antworten, kurze Texte und kein unniger Profi-Jargon.",
    primary: "Mit dem Guide fur den ersten Tag starten",
    secondary: "Alle Anfanger-Guides lesen",
    compareTitle: "Gebaut fur echte Einsteiger",
    compareCards: [
      {
        title: "Keine Wiki-Endlosschleife",
        text: "Jeder Guide beantwortet genau eine konkrete Anfangerfrage und kommt schnell zum Punkt."
      },
      {
        title: "Ohne Experten-Sprache",
        text: "Werkzeuge, Erze, Dorfbewohner, Nahrung, Nether und Koordinaten in einfacher Sprache erklart."
      },
      {
        title: "Fur Suchanfragen gebaut",
        text: "Die Seiten orientieren sich an den Fragen, die neue Minecraft-Spieler wirklich suchen."
      }
    ],
    sectionTitle: "Starte mit diesen Fragen",
    sectionText:
      "Diese Guides helfen dir am meisten, wenn du die ersten Stunden uberleben und endlich verstehen willst, was du tun sollst.",
    categoriesTitle: "Einfacher Pfad fur neue Spieler",
    categories: [
      {
        label: "Erste Schritte",
        text: "Erster Tag, erste Werkzeuge, erstes Haus und alles, was man am Anfang wirklich braucht."
      },
      {
        label: "Ressourcen",
        text: "Holz, Kohle, Eisen, Fackeln und der sicherste Weg zu deinem ersten Mining-Trip."
      },
      {
        label: "Farmen & Dorfbewohner",
        text: "Wie du Essen sicherst, Tiere zuchtest und Dorfer sinnvoll nutzt."
      },
      {
        label: "Fortschritt",
        text: "Wie du dich auf den Nether vorbereitest, Werkzeuge verzauberst und spater den Enderdrachen schaffst."
      }
    ],
    footer: "Dreisprachiges Minecraft-Projekt fur Europa: English, Deutsch und Francais."
  },
  fr: {
    langName: "Francais",
    eyebrow: "Guides Minecraft de survie pour debutants",
    title: "En 2026, vous ne vous etes toujours pas vraiment mis a Minecraft ? Commencez ici.",
    subtitle:
      "Des guides Minecraft etape par etape pour les vrais debutants. Des reponses claires, rapides a lire, sans jargon de veteran.",
    primary: "Commencer par le guide du premier jour",
    secondary: "Voir tous les guides debutants",
    compareTitle: "Concu pour les nouveaux joueurs",
    compareCards: [
      {
        title: "Pas de labyrinthe de wiki",
        text: "Chaque guide repond a une question precise de debutant et va droit au but."
      },
      {
        title: "Sans jargon complique",
        text: "Outils, minerais, villageois, nourriture, Nether et coordonnees expliques avec des mots simples."
      },
      {
        title: "Pense pour la recherche",
        text: "Le site suit les vraies questions que les nouveaux joueurs Minecraft tapent dans Google."
      }
    ],
    sectionTitle: "Commencez par ces questions",
    sectionText:
      "Ce sont les pages les plus utiles si vous voulez survivre aux premieres heures sans vous sentir perdu.",
    categoriesTitle: "Parcours simple pour debuter",
    categories: [
      {
        label: "Premiers pas",
        text: "Premier jour, premiers outils, premier abri et tout ce qu'il faut comprendre au debut."
      },
      {
        label: "Ressources",
        text: "Bois, charbon, fer, torches et chemin le plus sur pour miner au debut."
      },
      {
        label: "Fermes & villageois",
        text: "Comment rester en vie, produire de la nourriture et utiliser les villages sans se compliquer la vie."
      },
      {
        label: "Progression",
        text: "Comment se preparer pour le Nether, enchanter ses outils et avancer vers l'Ender Dragon."
      }
    ],
    footer: "Projet Minecraft en trois langues pour l'Europe : English, Deutsch et Francais."
  }
};

const guides = [
  {
    id: "first-day",
    category: "path",
    visual: "first-day",
    pages: {
      en: {
        slug: "how-to-survive-your-first-day-in-minecraft",
        title: "How to Survive Your First Day in Minecraft",
        summary: "A calm first-day plan: gather wood, make basic tools, find food, craft a bed and survive the first night.",
        quickAnswer:
          "On your first day in Minecraft, get wood immediately, craft basic tools, gather food, build a simple shelter, and make a bed before night.",
        steps: [
          "Punch a tree and collect enough wood for planks and sticks.",
          "Craft a crafting table and make a wooden pickaxe, then upgrade to stone tools quickly.",
          "Kill animals or gather easy food so you are not forced to travel hungry at night.",
          "Find coal if possible, or make charcoal, then craft torches.",
          "Build a tiny shelter or use a hill, cave wall or village house as a temporary base.",
          "Craft a bed before dark so you can skip the first dangerous night."
        ],
        mistakes: [
          "Running around exploring too far instead of securing wood and shelter first.",
          "Waiting too long to gather food.",
          "Going into deep caves before having torches and spare tools."
        ],
        tips: [
          "The goal of day one is not a perfect house. It is simple survival.",
          "If you find sheep early, a bed is more important than decoration.",
          "Keep your crafting table and furnace inside your shelter so you can work through the night."
        ]
      },
      de: {
        slug: "wie-uberlebt-man-den-ersten-tag-in-minecraft",
        title: "Wie uberlebt man den ersten Tag in Minecraft?",
        summary: "Ein ruhiger Plan fur Tag eins: Holz sammeln, Werkzeuge bauen, Essen finden, Bett craften und die erste Nacht uberleben.",
        quickAnswer:
          "Am ersten Tag solltest du sofort Holz sammeln, einfache Werkzeuge craften, Essen besorgen, einen kleinen Unterschlupf bauen und vor der Nacht ein Bett herstellen.",
        steps: [
          "Schlage einen Baum und sammle genug Holz fur Bretter und Stocke.",
          "Baue eine Werkbank, stelle eine Holzspitzhacke her und upgrade dann moglichst schnell auf Steinwerkzeuge.",
          "Sammle Essen oder erlege Tiere, damit du nachts nicht hungrig losziehen musst.",
          "Suche Kohle oder stelle Holzkohle her und crafte Fackeln.",
          "Baue einen kleinen Unterschlupf oder nutze einen Hugel, eine Hohlenwand oder ein Dorfhaus als Startbasis.",
          "Stelle vor Einbruch der Dunkelheit ein Bett her, damit du die erste Nacht uberspringen kannst."
        ],
        mistakes: [
          "Zu weit herumlaufen statt zuerst Holz und Schutz zu sichern.",
          "Zu spat nach Essen suchen.",
          "Zu fruh in tiefe Hohlen gehen."
        ],
        tips: [
          "Tag eins ist nicht fur ein perfektes Haus da, sondern fur sicheres Uberleben.",
          "Wenn du fruh Schafe findest, ist ein Bett wichtiger als Deko.",
          "Werkbank und Ofen gehoren in deinen Unterschlupf."
        ]
      },
      fr: {
        slug: "comment-survivre-a-votre-premier-jour-dans-minecraft",
        title: "Comment survivre a votre premier jour dans Minecraft ?",
        summary: "Un plan simple pour le jour 1 : recuperer du bois, fabriquer des outils, trouver de la nourriture, un lit et passer la premiere nuit.",
        quickAnswer:
          "Le premier jour dans Minecraft, prenez du bois tout de suite, fabriquez des outils de base, trouvez de la nourriture, creez un petit abri et un lit avant la nuit.",
        steps: [
          "Frappez un arbre et recuperez assez de bois pour faire des planches et des batons.",
          "Fabriquez une table de craft, puis une pioche en bois avant de passer vite aux outils en pierre.",
          "Prenez de la nourriture ou chassez quelques animaux pour ne pas explorer la nuit en ayant faim.",
          "Cherchez du charbon ou fabriquez du charbon de bois, puis creez des torches.",
          "Construisez un petit abri ou utilisez une colline, une paroi de grotte ou une maison de village comme base temporaire.",
          "Fabriquez un lit avant la nuit pour pouvoir dormir immediatement."
        ],
        mistakes: [
          "Explorer trop loin avant de securiser du bois et un abri.",
          "Attendre trop longtemps avant de chercher de la nourriture.",
          "Entrer dans des grottes profondes sans torches."
        ],
        tips: [
          "Le but du premier jour n'est pas une belle maison, mais de survivre.",
          "Si vous trouvez des moutons rapidement, le lit passe avant la decoration.",
          "Gardez votre table de craft et votre four a l'interieur."
        ]
      }
    }
  },
  {
    id: "wood",
    category: "resources",
    visual: "wood",
    pages: {
      en: {
        slug: "how-to-get-wood-fast-in-minecraft",
        title: "How to Get Wood Fast in Minecraft",
        summary: "The fastest early routine for gathering enough logs, planks and sticks without wasting daylight.",
        quickAnswer:
          "The fastest way to get wood in Minecraft is to cut several nearby trees immediately, convert logs into planks, and replant or move toward a forest edge.",
        steps: [
          "Spawn, look around, and move straight toward the nearest cluster of trees.",
          "Punch one tree until you can craft an axe or at least enough planks for tools.",
          "Upgrade to a stone axe as soon as possible because it saves a lot of time.",
          "Cut trees with leaves close together so you waste less walking time.",
          "Turn part of the wood into planks and sticks right away."
        ],
        mistakes: [
          "Cutting a single tree and then wandering around without a plan.",
          "Ignoring the value of a stone axe.",
          "Using all logs as decoration before securing tools and shelter."
        ],
        tips: [
          "Oak and birch forests are perfect for beginners.",
          "Keep extra logs in your base because wood is needed for almost everything early on."
        ]
      },
      de: {
        slug: "wie-bekommt-man-schnell-holz-in-minecraft",
        title: "Wie bekommt man schnell Holz in Minecraft?",
        summary: "Die schnellste Anfangsroutine fur genug Stamme, Bretter und Stocke ohne Zeitverlust.",
        quickAnswer:
          "Am schnellsten bekommst du Holz, wenn du direkt mehrere nahe Baume fallst, fruh eine Steinaxt craftest und das Holz sofort fur Bretter und Stocke nutzt.",
        steps: [
          "Gehe nach dem Spawn direkt zum nachsten Baumgebiet.",
          "Sammle zuerst genug Holz fur Werkbank, Stocke und erste Werkzeuge.",
          "Baue so fruh wie moglich eine Steinaxt.",
          "Falle Baume, die dicht beieinander stehen, damit du weniger Laufwege hast.",
          "Verarbeite einen Teil des Holzes sofort zu Brettern."
        ],
        mistakes: [
          "Nur einen Baum schlagen und dann planlos herumlaufen.",
          "Zu lange ohne Axt arbeiten.",
          "Alles Holz direkt fur Deko verschwenden."
        ],
        tips: [
          "Eichen- und Birkenwalder sind ideal fur den Start.",
          "Lagere immer etwas Holz in deiner Basis."
        ]
      },
      fr: {
        slug: "comment-obtenir-du-bois-rapidement-dans-minecraft",
        title: "Comment obtenir du bois rapidement dans Minecraft ?",
        summary: "La routine la plus rapide pour recuperer assez de troncs, planches et batons au debut.",
        quickAnswer:
          "Le moyen le plus rapide est de couper plusieurs arbres proches des le depart, puis de fabriquer vite une hache en pierre.",
        steps: [
          "Apres le spawn, allez directement vers le groupe d'arbres le plus proche.",
          "Recuperez assez de bois pour la table de craft, les batons et les premiers outils.",
          "Fabriquez une hache en pierre des que possible.",
          "Coupez des arbres proches les uns des autres pour limiter les deplacements.",
          "Transformez tout de suite une partie du bois en planches."
        ],
        mistakes: [
          "Couper un seul arbre puis partir sans plan.",
          "Rester trop longtemps sans hache.",
          "Utiliser tout le bois pour la deco trop tot."
        ],
        tips: [
          "Les forets de chenes et de bouleaux sont parfaites pour commencer.",
          "Gardez toujours des buches en reserve dans votre base."
        ]
      }
    }
  },
  {
    id: "crafting-table",
    category: "path",
    visual: "crafting-table",
    pages: {
      en: {
        slug: "how-to-make-a-crafting-table-in-minecraft",
        title: "How to Make a Crafting Table in Minecraft",
        summary: "The first essential crafting upgrade every player needs within the first minute.",
        quickAnswer:
          "Turn one log into planks, place four planks in your inventory crafting grid, and you will get a crafting table.",
        steps: [
          "Collect at least one wood log from any tree.",
          "Open your inventory and convert the log into wooden planks.",
          "Place four planks in the small 2x2 crafting grid.",
          "Take the crafting table and place it on the ground.",
          "Use it to unlock the full 3x3 crafting grid for tools and survival items."
        ],
        mistakes: [
          "Trying to craft advanced items in the inventory grid only.",
          "Forgetting to pick the table back up when moving base."
        ],
        tips: [
          "Craft the table as early as possible because it unlocks almost every important early-game item."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A crafting table is made from four wooden planks. Any wood type works. You make it inside the small 2x2 grid in your inventory.",
          ingredients: [
            "1 wood log -> turn it into 4 wooden planks",
            "Use 4 planks for the recipe"
          ],
          result: "1 crafting table",
          notes: [
            "The result looks like a brown cube with a grid pattern on top.",
            "Place it on the ground, then right-click or tap it to open the full 3x3 crafting menu."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-eine-werkbank-in-minecraft",
        title: "Wie macht man eine Werkbank in Minecraft?",
        summary: "Das erste wichtige Upgrade fur fast jedes Crafting-Rezept.",
        quickAnswer:
          "Verwandle einen Holzstamm in Bretter, lege vier Bretter ins 2x2-Inventarfeld und du erhaltst eine Werkbank.",
        steps: [
          "Sammle mindestens einen Holzstamm.",
          "Offne dein Inventar und mache daraus Holzbretter.",
          "Lege vier Bretter in das kleine Crafting-Feld.",
          "Nimm die Werkbank heraus und platziere sie auf dem Boden.",
          "Nutze danach das 3x3-Crafting-Feld fur bessere Rezepte."
        ],
        mistakes: [
          "Zu lange nur mit dem kleinen Inventar-Crafting arbeiten.",
          "Die Werkbank beim Umzug vergessen."
        ],
        tips: [
          "Je fruher du eine Werkbank baust, desto schneller kommst du an Werkzeuge und Schutz."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Eine Werkbank wird aus vier Holzbrettern hergestellt. Die Holzart ist egal. Das Rezept passt in dein kleines 2x2-Inventarfeld.",
          ingredients: [
            "1 Holzstamm -> daraus werden 4 Holzbretter",
            "4 Bretter fur das Rezept benutzen"
          ],
          result: "1 Werkbank",
          notes: [
            "Das Ergebnis sieht aus wie ein brauner Block mit Raster oben.",
            "Stelle die Werkbank auf den Boden und offne sie fur das volle 3x3-Crafting-Menü."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-une-table-de-craft-dans-minecraft",
        title: "Comment fabriquer une table de craft dans Minecraft ?",
        summary: "Le premier vrai outil de progression pour presque tout crafter.",
        quickAnswer:
          "Transformez un tronc en planches, placez quatre planches dans la grille 2x2 de l'inventaire et vous obtenez une table de craft.",
        steps: [
          "Recuperez au moins un tronc de bois.",
          "Ouvrez l'inventaire et transformez-le en planches.",
          "Placez quatre planches dans la petite grille de craft.",
          "Recuperez la table de craft et posez-la au sol.",
          "Utilisez ensuite la grille 3x3 pour les outils et objets utiles."
        ],
        mistakes: [
          "Rester trop longtemps limite a la petite grille de l'inventaire.",
          "Oublier la table de craft quand on change de base."
        ],
        tips: [
          "Fabriquez-la le plus tot possible pour accelerer toute votre progression."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Une table de craft se fabrique avec quatre planches de bois. N'importe quel type de bois fonctionne. La recette tient dans la petite grille 2x2 de l'inventaire.",
          ingredients: [
            "1 tronc de bois -> transformez-le en 4 planches",
            "Utilisez 4 planches pour la recette"
          ],
          result: "1 table de craft",
          notes: [
            "Le resultat ressemble a un bloc brun avec une grille sur le dessus.",
            "Posez-la au sol, puis ouvrez-la pour acceder au vrai menu 3x3."
          ]
        }
      }
    }
  },
  {
    id: "bed",
    category: "path",
    visual: "bed",
    pages: {
      en: {
        slug: "how-to-make-a-bed-in-minecraft",
        title: "How to Make a Bed in Minecraft",
        summary: "A beginner's guide to skipping the first dangerous night as fast as possible.",
        quickAnswer:
          "To make a bed in Minecraft, collect three wool and three wooden planks, then craft them together on a crafting table.",
        steps: [
          "Find three sheep and collect three wool.",
          "Cut wood and craft three wooden planks.",
          "Use a crafting table.",
          "Place three wool in the top row and three planks in the middle row.",
          "Take the bed and place it inside a safe shelter."
        ],
        mistakes: [
          "Waiting until night to start looking for sheep.",
          "Placing a bed in an unsafe open area."
        ],
        tips: [
          "A bed is often more valuable than almost anything else on the first day."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A bed is made from three wool and three wooden planks on a crafting table.",
          ingredients: [
            "3 wool from sheep",
            "3 wooden planks from logs"
          ],
          result: "1 bed",
          notes: [
            "The bed is a long red sleeping item by default if you use the standard texture set.",
            "Put wool on the top row and planks on the middle row."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-ein-bett-in-minecraft",
        title: "Wie macht man ein Bett in Minecraft?",
        summary: "Der schnellste Weg, die erste gefahrliche Nacht zu uberspringen.",
        quickAnswer:
          "Fur ein Bett brauchst du drei Wolle und drei Holzbretter. Beides craftest du an einer Werkbank zu einem Bett.",
        steps: [
          "Finde drei Schafe und sammle drei Wolle.",
          "Sammle Holz und mache daraus drei Bretter.",
          "Nutze eine Werkbank.",
          "Lege drei Wolle oben und drei Bretter in die mittlere Reihe.",
          "Platziere das Bett in einem sicheren Unterschlupf."
        ],
        mistakes: [
          "Erst nachts nach Schafen suchen.",
          "Das Bett im Freien aufstellen."
        ],
        tips: [
          "Fur den ersten Tag ist ein Bett oft wichtiger als fast alles andere."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Ein Bett wird an der Werkbank aus drei Wolle und drei Holzbrettern hergestellt.",
          ingredients: [
            "3 Wolle von Schafen",
            "3 Holzbretter aus Holzstammen"
          ],
          result: "1 Bett",
          notes: [
            "Im Standard-Look ist das Bett ein langes rotes Schlafobjekt.",
            "Lege die Wolle oben und die Bretter in die mittlere Reihe."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-un-lit-dans-minecraft",
        title: "Comment fabriquer un lit dans Minecraft ?",
        summary: "Le moyen le plus simple d'eviter la premiere nuit dangereuse.",
        quickAnswer:
          "Pour fabriquer un lit, il faut trois laines et trois planches de bois, puis utiliser une table de craft.",
        steps: [
          "Trouvez trois moutons et recuperez trois laines.",
          "Coupez du bois et transformez-le en trois planches.",
          "Utilisez une table de craft.",
          "Placez les trois laines sur la ligne du haut et les trois planches au milieu.",
          "Posez le lit dans un abri sur."
        ],
        mistakes: [
          "Attendre la nuit pour chercher des moutons.",
          "Poser le lit dans une zone non securisee."
        ],
        tips: [
          "Au debut, un lit vaut souvent plus qu'une belle base."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Un lit se fabrique sur une table de craft avec trois laines et trois planches de bois.",
          ingredients: [
            "3 laines provenant des moutons",
            "3 planches obtenues a partir des troncs"
          ],
          result: "1 lit",
          notes: [
            "Avec les textures standard, le lit ressemble a un long objet rouge pour dormir.",
            "Placez la laine sur la ligne du haut et les planches au milieu."
          ]
        }
      }
    }
  },
  {
    id: "furnace-guide",
    category: "resources",
    visual: "furnace-guide",
    pages: {
      en: {
        slug: "how-to-make-and-use-a-furnace-in-minecraft",
        title: "How to Make and Use a Furnace in Minecraft",
        summary: "What a furnace is, how to craft it, what it looks like, and how to smelt early-game resources without wasting fuel.",
        quickAnswer:
          "A furnace is made from 8 cobblestone around an empty center slot on a crafting table. Place an item to smelt on top, fuel on the bottom, and the result appears on the right.",
        steps: [
          "Collect at least 8 cobblestone with a wooden pickaxe or better.",
          "Open a crafting table.",
          "Place cobblestone in all slots except the center slot.",
          "Take the furnace and place it near your base.",
          "Open it, put the item to smelt in the top slot and fuel in the bottom slot.",
          "Wait for the arrow to finish and collect the smelted result."
        ],
        mistakes: [
          "Using logs or planks carelessly when coal or charcoal is available.",
          "Trying to smelt without fuel in the bottom slot.",
          "Forgetting that one furnace can be reused many times."
        ],
        tips: [
          "Charcoal is one of the best early fuels if you cannot find coal fast.",
          "Keep your furnace near your crafting table and chest so the early game feels much simpler."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A furnace is crafted with 8 cobblestone in a ring shape around an empty center slot.",
          ingredients: [
            "8 cobblestone",
            "1 crafting table to place the recipe"
          ],
          result: "1 furnace",
          notes: [
            "The furnace is a gray block with a dark opening on the front.",
            "Inside the furnace: top slot = item, bottom slot = fuel, right side = result."
          ]
        }
      },
      de: {
        slug: "wie-macht-und-benutzt-man-einen-ofen-in-minecraft",
        title: "Wie macht und benutzt man einen Ofen in Minecraft?",
        summary: "Was ein Ofen ist, wie man ihn craftet und wie man fruhe Materialien ohne Brennstoff-Verschwendung schmilzt.",
        quickAnswer:
          "Ein Ofen wird aus 8 Bruchstein um ein leeres Mittelfeld an der Werkbank hergestellt. Oben kommt das Schmelzgut hinein, unten der Brennstoff und rechts erscheint das Ergebnis.",
        steps: [
          "Sammle mindestens 8 Bruchstein mit einer Holzspitzhacke oder besser.",
          "Offne eine Werkbank.",
          "Lege Bruchstein in alle Felder auer das mittlere.",
          "Nimm den Ofen heraus und stelle ihn an deiner Basis auf.",
          "Offne ihn, lege das Material oben und den Brennstoff unten hinein.",
          "Warte, bis der Pfeil fertig ist, und sammle das Ergebnis ein."
        ],
        mistakes: [
          "Holzstamme oder Bretter verschwenden, obwohl Kohle oder Holzkohle da ist.",
          "Ohne Brennstoff im unteren Feld schmelzen wollen.",
          "Vergessen, dass ein Ofen immer wieder benutzt werden kann."
        ],
        tips: [
          "Holzkohle ist am Anfang ein sehr guter Brennstoff.",
          "Werkbank, Ofen und Kiste nah beieinander machen das fruhe Spiel viel leichter."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Ein Ofen wird aus 8 Bruchstein in Ringform um ein leeres Mittelfeld hergestellt.",
          ingredients: [
            "8 Bruchstein",
            "1 Werkbank fur das Rezept"
          ],
          result: "1 Ofen",
          notes: [
            "Der Ofen ist ein grauer Block mit dunkler Offnung vorne.",
            "Im Ofen gilt: oben = Material, unten = Brennstoff, rechts = Ergebnis."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-et-utiliser-un-four-dans-minecraft",
        title: "Comment fabriquer et utiliser un four dans Minecraft ?",
        summary: "Ce qu'est un four, comment le fabriquer et comment faire fondre les ressources du debut sans gaspiller le combustible.",
        quickAnswer:
          "Un four se fabrique avec 8 blocs de pierre taillee autour d'une case centrale vide. Mettez l'objet a cuire en haut, le combustible en bas, et le resultat apparait a droite.",
        steps: [
          "Recuperez au moins 8 blocs de cobblestone avec une pioche en bois ou mieux.",
          "Ouvrez une table de craft.",
          "Placez la cobblestone dans toutes les cases sauf celle du centre.",
          "Recuperez le four et posez-le pres de votre base.",
          "Ouvrez-le, mettez l'objet a cuire en haut et le combustible en bas.",
          "Attendez la fin de la cuisson puis prenez le resultat."
        ],
        mistakes: [
          "Gaspiller trop de buches ou de planches alors que du charbon ou charbon de bois existe.",
          "Essayer de cuire sans combustible dans le slot du bas.",
          "Oublier qu'un four peut servir encore et encore."
        ],
        tips: [
          "Le charbon de bois est un excellent combustible au debut.",
          "Gardez le four pres de la table de craft et du coffre pour simplifier le debut."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Un four se fabrique avec 8 blocs de cobblestone places en anneau autour d'une case centrale vide.",
          ingredients: [
            "8 cobblestone",
            "1 table de craft pour la recette"
          ],
          result: "1 four",
          notes: [
            "Le four est un bloc gris avec une ouverture sombre sur la face avant.",
            "Dans le four : haut = objet, bas = combustible, droite = resultat."
          ]
        }
      }
    }
  },
  {
    id: "torches",
    category: "resources",
    visual: "torch",
    pages: {
      en: {
        slug: "how-to-make-torches-in-minecraft",
        title: "How to Make Torches in Minecraft",
        summary: "Light, safety and navigation all start with one simple recipe.",
        quickAnswer:
          "Craft torches by combining coal or charcoal with sticks on a crafting table or in your inventory.",
        steps: [
          "Get coal from coal ore or make charcoal by smelting logs.",
          "Craft sticks from wooden planks.",
          "Place one coal or charcoal above one stick.",
          "Take the torches and place them in caves, shelters and paths."
        ],
        mistakes: [
          "Entering caves without enough light.",
          "Forgetting charcoal exists when you cannot find coal."
        ],
        tips: [
          "Torches are both light and navigation markers. Use them to mark your way home."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "Torches are crafted by stacking one coal or charcoal above one stick.",
          ingredients: [
            "1 coal or 1 charcoal",
            "1 stick"
          ],
          result: "4 torches",
          notes: [
            "A torch looks like a small wooden handle with a glowing top.",
            "If you cannot find coal, smelt logs into charcoal first."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-fackeln-in-minecraft",
        title: "Wie macht man Fackeln in Minecraft?",
        summary: "Licht, Sicherheit und Orientierung beginnen mit einem sehr einfachen Rezept.",
        quickAnswer:
          "Fackeln stellst du her, indem du Kohle oder Holzkohle mit Stocken kombinierst.",
        steps: [
          "Besorge Kohle oder schmelze Holz zu Holzkohle.",
          "Mache Stocke aus Brettern.",
          "Lege Kohle oder Holzkohle uber einen Stock.",
          "Nutze die Fackeln in Hohlen, deiner Basis und auf Wegen."
        ],
        mistakes: [
          "Ohne genug Licht in Hohlen gehen.",
          "Nicht daran denken, dass Holzkohle eine gute Ersatzlosung ist."
        ],
        tips: [
          "Mit Fackeln markierst du auch den Ruckweg nach Hause."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Fackeln entstehen, wenn du eine Kohle oder Holzkohle uber einen Stock legst.",
          ingredients: [
            "1 Kohle oder 1 Holzkohle",
            "1 Stock"
          ],
          result: "4 Fackeln",
          notes: [
            "Eine Fackel sieht aus wie ein kleiner Holzgriff mit leuchtender Spitze.",
            "Wenn du keine Kohle findest, nutze zuerst Holzkohle."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-des-torches-dans-minecraft",
        title: "Comment fabriquer des torches dans Minecraft ?",
        summary: "La lumiere, la securite et le repere dans les grottes commencent avec cette recette simple.",
        quickAnswer:
          "Fabriquez des torches en combinant du charbon ou du charbon de bois avec des batons.",
        steps: [
          "Recuperez du charbon ou fabriquez du charbon de bois en cuisant des buches.",
          "Fabriquez des batons a partir de planches.",
          "Placez un charbon ou charbon de bois au-dessus d'un baton.",
          "Utilisez les torches dans les grottes, votre abri et sur vos chemins."
        ],
        mistakes: [
          "Entrer dans des grottes sans lumiere suffisante.",
          "Oublier que le charbon de bois fonctionne aussi."
        ],
        tips: [
          "Les torches servent aussi a retrouver votre chemin."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Les torches se fabriquent en plaçant un charbon ou charbon de bois au-dessus d'un baton.",
          ingredients: [
            "1 charbon ou 1 charbon de bois",
            "1 baton"
          ],
          result: "4 torches",
          notes: [
            "Une torche ressemble a un petit manche en bois avec une tete lumineuse.",
            "Si vous ne trouvez pas de charbon, fabriquez d'abord du charbon de bois."
          ]
        }
      }
    }
  },
  {
    id: "coal",
    category: "resources",
    visual: "coal",
    pages: {
      en: {
        slug: "how-to-find-coal-in-minecraft",
        title: "How to Find Coal in Minecraft",
        summary: "Where new players should look first and what to do if no coal appears early.",
        quickAnswer:
          "Coal is easiest to find on hillsides, mountains and shallow caves. If you cannot find it early, make charcoal from logs.",
        steps: [
          "Search exposed stone on hills and mountain edges first.",
          "Check shallow caves near your spawn.",
          "Mine coal ore with a wooden pickaxe or better.",
          "If no coal appears, smelt wood logs into charcoal and keep progressing."
        ],
        mistakes: [
          "Going too deep underground too early.",
          "Stopping all progress just because coal was not found immediately."
        ],
        tips: [
          "Charcoal is the perfect backup plan for beginners."
        ]
      },
      de: {
        slug: "wie-findet-man-kohle-in-minecraft",
        title: "Wie findet man Kohle in Minecraft?",
        summary: "Wo Einsteiger zuerst suchen sollten und was du machst, wenn du fruh keine Kohle findest.",
        quickAnswer:
          "Kohle findest du am einfachsten an Berghangen, auf freiliegendem Stein und in flachen Hohlen. Wenn du keine findest, nutze Holzkohle.",
        steps: [
          "Suche zuerst an Hugeln, Bergen und offenen Steinflachen.",
          "Prufe kleine Hohlen in Spawnnahe.",
          "Baue Kohleerz mit einer Holzspitzhacke oder besser ab.",
          "Falls du keine Kohle findest, schmelze Holz zu Holzkohle."
        ],
        mistakes: [
          "Zu fruh zu tief graben.",
          "Den ganzen Fortschritt stoppen, nur weil du keine Kohle siehst."
        ],
        tips: [
          "Holzkohle ist fur Anfanger eine sehr gute Notlosung."
        ]
      },
      fr: {
        slug: "comment-trouver-du-charbon-dans-minecraft",
        title: "Comment trouver du charbon dans Minecraft ?",
        summary: "Ou chercher en premier et quoi faire si vous n'en trouvez pas tout de suite.",
        quickAnswer:
          "Le charbon se trouve facilement sur les flancs de montagne, dans la pierre exposee et dans les grottes peu profondes. Sinon, utilisez du charbon de bois.",
        steps: [
          "Cherchez d'abord sur les collines, montagnes et surfaces de pierre visibles.",
          "Verifiez les petites grottes pres du spawn.",
          "Minez le minerai de charbon avec une pioche en bois ou mieux.",
          "Si vous n'en trouvez pas, faites fondre du bois pour produire du charbon de bois."
        ],
        mistakes: [
          "Descendre trop profond trop tot.",
          "Bloquer toute sa progression parce qu'on ne trouve pas de charbon tout de suite."
        ],
        tips: [
          "Le charbon de bois est une excellente solution de secours."
        ]
      }
    }
  },
  {
    id: "iron",
    category: "resources",
    visual: "iron",
    pages: {
      en: {
        slug: "how-to-find-iron-in-minecraft",
        title: "How to Find Iron in Minecraft",
        summary: "Iron is the first resource that makes Minecraft feel much easier. Here is the safest route to it.",
        quickAnswer:
          "The easiest way to find iron in Minecraft is to explore caves or mine underground with a stone pickaxe, then smelt the raw iron in a furnace.",
        steps: [
          "Make a stone pickaxe first.",
          "Bring torches, food and an extra pickaxe.",
          "Search caves or mine underground layers with exposed stone.",
          "Mine iron ore blocks with your stone pickaxe.",
          "Smelt raw iron in a furnace.",
          "Use your first ingots for an iron pickaxe, shield or bucket."
        ],
        mistakes: [
          "Trying to mine iron with a wooden pickaxe.",
          "Going underground without torches.",
          "Using first iron for decoration instead of survival upgrades."
        ],
        tips: [
          "Mark your path with torches so you do not get lost.",
          "Caves are usually faster than random straight mining early on."
        ]
      },
      de: {
        slug: "wie-findet-man-eisen-in-minecraft",
        title: "Wie findet man Eisen in Minecraft?",
        summary: "Eisen ist die erste Ressource, mit der Minecraft deutlich leichter wird. So kommst du sicher daran.",
        quickAnswer:
          "Am einfachsten findest du Eisen, indem du Hohlen erkundest oder mit einer Steinspitzhacke unter Tage abbaust und das Roheisen danach im Ofen schmilzt.",
        steps: [
          "Stelle zuerst eine Steinspitzhacke her.",
          "Nimm Fackeln, Essen und eine Ersatzspitzhacke mit.",
          "Suche Hohlen oder mine unter der Erde in Steinbereichen.",
          "Baue Eisenerz mit deiner Steinspitzhacke ab.",
          "Schmelze das Roheisen im Ofen.",
          "Nutze dein erstes Eisen fur Spitzhacke, Schild oder Eimer."
        ],
        mistakes: [
          "Eisen mit einer Holzspitzhacke abbauen wollen.",
          "Ohne Fackeln in den Untergrund gehen.",
          "Das erste Eisen fur unwichtige Sachen verschwenden."
        ],
        tips: [
          "Markiere deinen Weg mit Fackeln.",
          "Hohlen sind fur den Start oft schneller als blindes Graben."
        ]
      },
      fr: {
        slug: "comment-trouver-du-fer-dans-minecraft",
        title: "Comment trouver du fer dans Minecraft ?",
        summary: "Le fer est la premiere ressource qui rend Minecraft beaucoup plus facile. Voici le chemin le plus simple pour en obtenir.",
        quickAnswer:
          "Le moyen le plus simple est d'explorer des grottes ou de miner sous terre avec une pioche en pierre, puis de faire fondre le fer brut dans un four.",
        steps: [
          "Fabriquez d'abord une pioche en pierre.",
          "Prenez des torches, de la nourriture et une pioche de secours.",
          "Cherchez des grottes ou minez dans les zones de pierre visibles.",
          "Minez les blocs de minerai de fer avec votre pioche en pierre.",
          "Faites fondre le fer brut dans un four.",
          "Utilisez vos premiers lingots pour une pioche en fer, un bouclier ou un seau."
        ],
        mistakes: [
          "Essayer de miner le fer avec une pioche en bois.",
          "Partir sous terre sans torches.",
          "Depenser son premier fer dans des objets secondaires."
        ],
        tips: [
          "Marquez votre chemin avec des torches.",
          "Les grottes sont souvent plus rapides que le minage au hasard au debut."
        ]
      }
    }
  },
  {
    id: "food",
    category: "farming",
    visual: "food",
    pages: {
      en: {
        slug: "how-to-find-food-early-in-minecraft",
        title: "How to Find Food Early in Minecraft",
        summary: "The simplest early-game food options and when to switch into farming.",
        quickAnswer:
          "The easiest early food comes from animals, villages and basic crops. As soon as possible, start a wheat farm or use village food to stabilize survival.",
        steps: [
          "Pick berries, gather hay bales in villages, or kill a few animals early.",
          "Cook meat in a furnace for better hunger value.",
          "Keep seeds from grass so you can start a wheat farm quickly.",
          "Once you have a base, create a small food farm near water."
        ],
        mistakes: [
          "Traveling too far while hunger is already low.",
          "Eating all wheat instead of using some for farming."
        ],
        tips: [
          "Village hay bales are one of the strongest beginner food shortcuts in the game."
        ]
      },
      de: {
        slug: "wie-findet-man-fruh-essen-in-minecraft",
        title: "Wie findet man fruh Essen in Minecraft?",
        summary: "Die einfachsten Nahrungsquellen am Anfang und wann du auf Farmen umstellen solltest.",
        quickAnswer:
          "Am Anfang bekommst du Essen am leichtesten uber Tiere, Dorfer und einfache Felder. Danach solltest du so fruh wie moglich eine kleine Weizenfarm starten.",
        steps: [
          "Sammle Beeren, nutze Heuballen aus Dorfern oder erlege fruh ein paar Tiere.",
          "Brate Fleisch im Ofen, damit es besser satt macht.",
          "Sammle Samen aus Gras fur deine erste Weizenfarm.",
          "Baue an deiner Basis ein kleines Feld in Wassernaehe."
        ],
        mistakes: [
          "Zu weit reisen, obwohl der Hunger schon niedrig ist.",
          "Den ganzen Weizen essen statt einen Teil fur die Farm zu behalten."
        ],
        tips: [
          "Heuballen aus Dorfern sind fur Einsteiger extrem stark."
        ]
      },
      fr: {
        slug: "comment-trouver-de-la-nourriture-au-debut-dans-minecraft",
        title: "Comment trouver de la nourriture au debut dans Minecraft ?",
        summary: "Les options de nourriture les plus simples au debut et le bon moment pour lancer une ferme.",
        quickAnswer:
          "Au debut, la nourriture la plus simple vient des animaux, des villages et des cultures de base. Des que possible, lancez une petite ferme de ble.",
        steps: [
          "Ramassez des baies, utilisez les bottes de foin des villages ou chassez quelques animaux.",
          "Faites cuire la viande dans un four pour recuperer plus de faim.",
          "Gardez des graines pour lancer rapidement une petite ferme de ble.",
          "Installez une mini zone de culture pres de l'eau."
        ],
        mistakes: [
          "Partir trop loin alors que la faim baisse deja.",
          "Manger tout le ble au lieu d'en garder pour cultiver."
        ],
        tips: [
          "Les bottes de foin de village sont l'un des meilleurs raccourcis de debut."
        ]
      }
    }
  },
  {
    id: "lost",
    category: "path",
    visual: "lost",
    pages: {
      en: {
        slug: "how-to-avoid-getting-lost-in-minecraft",
        title: "How to Avoid Getting Lost in Minecraft",
        summary: "The simplest navigation habits beginners should learn before exploring too far.",
        quickAnswer:
          "Use landmarks, torches, coordinates and short exploration loops. Do not wander too far from your base without a return plan.",
        steps: [
          "Build your first base near a clear landmark such as a hill, river or village.",
          "Place torches or blocks in a consistent pattern on your route.",
          "Write down or screenshot your home coordinates.",
          "Explore in short loops instead of one long directionless trip."
        ],
        mistakes: [
          "Running in random directions without checking coordinates.",
          "Exploring caves and forests with no markers."
        ],
        tips: [
          "The best navigation system for beginners is simple repetition, not clever tricks."
        ]
      },
      de: {
        slug: "wie-verliert-man-sich-nicht-in-minecraft",
        title: "Wie verliert man sich nicht in Minecraft?",
        summary: "Die einfachsten Navigationsregeln fur Anfanger, bevor du weiter erkundest.",
        quickAnswer:
          "Nutze markante Orte, Fackeln, Koordinaten und kurze Erkundungsrouten. Laufe nicht weit von deiner Basis weg, ohne einen Ruckweg zu planen.",
        steps: [
          "Baue deine erste Basis bei einem auffalligen Ort wie Fluss, Hugel oder Dorf.",
          "Setze Fackeln oder Markierungsblocke in einem festen Muster.",
          "Notiere dir deine Heimat-Koordinaten.",
          "Erkunde in kurzen Schleifen statt in einer langen planlosen Richtung."
        ],
        mistakes: [
          "Einfach loslaufen ohne Blick auf Koordinaten.",
          "Walder und Hohlen ohne Markierungen betreten."
        ],
        tips: [
          "Feste Gewohnheiten helfen neuen Spielern mehr als komplizierte Navigations-Tricks."
        ]
      },
      fr: {
        slug: "comment-eviter-de-se-perdre-dans-minecraft",
        title: "Comment eviter de se perdre dans Minecraft ?",
        summary: "Les habitudes de navigation les plus utiles pour les debutants avant d'explorer loin.",
        quickAnswer:
          "Utilisez des reperes, des torches, les coordonnees et des trajets courts. Ne vous eloignez pas trop de votre base sans plan de retour.",
        steps: [
          "Construisez votre premiere base pres d'un repere clair comme une colline, une riviere ou un village.",
          "Placez des torches ou des blocs de facon coherente sur votre trajet.",
          "Notez ou capturez les coordonnees de votre base.",
          "Explorez par petites boucles au lieu d'un seul long trajet sans plan."
        ],
        mistakes: [
          "Courir dans tous les sens sans verifier les coordonnees.",
          "Explorer grottes et forets sans reperes."
        ],
        tips: [
          "Pour les debutants, des habitudes simples valent mieux que des astuces compliquees."
        ]
      }
    }
  },
  {
    id: "house",
    category: "path",
    visual: "house",
    pages: {
      en: {
        slug: "how-to-find-your-house-in-minecraft",
        title: "How to Find Your House in Minecraft",
        summary: "The fastest recovery plan when you forgot where your starter base is.",
        quickAnswer:
          "Use coordinates if you have them. If not, retrace torch trails, follow landmarks, climb higher ground, and search calmly instead of running randomly.",
        steps: [
          "Check whether you wrote down your home coordinates.",
          "Look for your torch lines, bridge paths or cut trees.",
          "Climb a hill or tower to scan the area from above.",
          "Return to the last location you clearly remember.",
          "Once you find home again, record the coordinates immediately."
        ],
        mistakes: [
          "Panicking and running farther away.",
          "Traveling at night while already lost."
        ],
        tips: [
          "After this happens once, you will never ignore coordinates again."
        ]
      },
      de: {
        slug: "wie-findet-man-sein-haus-in-minecraft-wieder",
        title: "Wie findet man sein Haus in Minecraft wieder?",
        summary: "Der schnellste Notfallplan, wenn du deine Startbasis nicht mehr findest.",
        quickAnswer:
          "Nutze Koordinaten, falls du sie hast. Wenn nicht, suche nach Fackelspuren, markanten Orten und gehe ruhig vor statt planlos wegzulaufen.",
        steps: [
          "Prufe zuerst, ob du deine Heimat-Koordinaten notiert hast.",
          "Suche nach Fackeln, gefallten Baumen oder einfachen Wegen.",
          "Steig auf einen Hugel oder baue kurz nach oben, um die Gegend zu uberblicken.",
          "Gehe zuruck zum letzten Ort, den du sicher erkennst.",
          "Notiere die Koordinaten sofort, sobald du wieder zuhause bist."
        ],
        mistakes: [
          "In Panik noch weiter wegzulaufen.",
          "Nachts orientierungslos weiterzureisen."
        ],
        tips: [
          "Spatestens danach wirst du Koordinaten ernst nehmen."
        ]
      },
      fr: {
        slug: "comment-retrouver-sa-maison-dans-minecraft",
        title: "Comment retrouver sa maison dans Minecraft ?",
        summary: "Le meilleur plan de secours quand vous avez perdu votre base de depart.",
        quickAnswer:
          "Utilisez vos coordonnees si vous les avez. Sinon, suivez les torches, les reperes visibles, prenez de la hauteur et cherchez calmement.",
        steps: [
          "Verifiez d'abord si vous avez note les coordonnees de votre base.",
          "Cherchez vos torches, vos chemins ou les arbres que vous avez coupes.",
          "Montez sur une colline ou construisez vers le haut pour observer la zone.",
          "Revenez au dernier endroit dont vous etes sur.",
          "Une fois rentre, notez les coordonnees tout de suite."
        ],
        mistakes: [
          "Paniquer et partir encore plus loin.",
          "Continuer a voyager la nuit quand on est deja perdu."
        ],
        tips: [
          "Apres cette erreur une fois, les coordonnees deviennent une habitude."
        ]
      }
    }
  },
  {
    id: "chest-guide",
    category: "resources",
    visual: "chest",
    pages: {
      en: {
        slug: "how-to-make-a-chest-in-minecraft",
        title: "How to Make a Chest in Minecraft",
        summary: "New players lose items and waste time mostly because they wait too long to build real storage.",
        quickAnswer:
          "A chest is crafted from 8 wooden planks in a ring shape around an empty center slot on a crafting table.",
        steps: [
          "Turn logs into wooden planks first.",
          "Open your crafting table and leave the middle slot empty.",
          "Place 8 planks around that empty center slot.",
          "Put the chest inside your base near your crafting table and furnace.",
          "Store wood, food, cobblestone, coal and spare tools early so your inventory stays usable."
        ],
        mistakes: [
          "Keeping everything in your inventory until you die and lose track of it.",
          "Throwing useful early materials away because your inventory is full.",
          "Placing your first chest outside where you can miss it at night."
        ],
        tips: [
          "A chest is one of the earliest quality-of-life upgrades in the whole game.",
          "Make one chest for blocks and one for food and tools as soon as possible.",
          "If you put two chests side by side, they become one large chest."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A chest is made from 8 wooden planks in a ring shape, with the center square left empty.",
          ingredients: [
            "2 wood logs -> turn them into wooden planks",
            "8 wooden planks"
          ],
          result: "1 chest",
          notes: [
            "The result looks like a small brown storage box with a latch on the front.",
            "Put the planks around the outside edge and leave the middle slot empty."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-eine-truhe-in-minecraft",
        title: "Wie macht man eine Truhe in Minecraft?",
        summary: "Neue Spieler verlieren oft Materialien, weil sie zu spat echte Lagerung bauen.",
        quickAnswer:
          "Eine Truhe wird an der Werkbank aus 8 Holzbrettern in Ringform um ein leeres Mittelfeld hergestellt.",
        steps: [
          "Verwandle Holzstamme zuerst in Holzbretter.",
          "Offne die Werkbank und lass das Mittelfeld frei.",
          "Lege 8 Bretter rund um dieses leere Feld.",
          "Stelle die Truhe in deine Basis neben Werkbank und Ofen.",
          "Lagere fruh Holz, Essen, Bruchstein, Kohle und Ersatzwerkzeuge, damit dein Inventar frei bleibt."
        ],
        mistakes: [
          "Alles im Inventar zu tragen, bis man stirbt und Sachen verliert.",
          "Nutliche Materialien wegzuwerfen, weil das Inventar voll ist.",
          "Die erste Truhe drauen im Dunkeln zu platzieren."
        ],
        tips: [
          "Eine Truhe ist eines der fruhesten und wichtigsten Komfort-Upgrades.",
          "Baue moglichst fruh eine Truhe fur Bloche und eine fur Essen und Werkzeuge.",
          "Zwei Truhen nebeneinander ergeben eine groe Truhe."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Eine Truhe wird aus 8 Holzbrettern in Ringform gebaut. Das Feld in der Mitte bleibt leer.",
          ingredients: [
            "2 Holzstamme -> in Holzbretter umwandeln",
            "8 Holzbretter"
          ],
          result: "1 Truhe",
          notes: [
            "Das Ergebnis sieht aus wie eine kleine braune Aufbewahrungsbox mit Verschluss vorne.",
            "Lege die Bretter an den Auenrand und lass das Mittelfeld frei."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-un-coffre-dans-minecraft",
        title: "Comment fabriquer un coffre dans Minecraft ?",
        summary: "Les debutants perdent souvent du temps et des objets parce qu'ils attendent trop avant de creer un vrai stockage.",
        quickAnswer:
          "Un coffre se fabrique avec 8 planches de bois en cercle autour d'une case centrale vide sur une table de craft.",
        steps: [
          "Transformez d'abord des troncs en planches.",
          "Ouvrez la table de craft et laissez la case du milieu vide.",
          "Placez 8 planches autour de cette case vide.",
          "Posez le coffre dans votre base pres de la table de craft et du four.",
          "Rangez tot le bois, la nourriture, la cobblestone, le charbon et les outils de rechange pour garder un inventaire propre."
        ],
        mistakes: [
          "Garder tous les objets sur soi jusqu'a mourir et tout melanger.",
          "Jeter des ressources utiles parce que l'inventaire est plein.",
          "Poser le premier coffre dehors et le perdre dans la nuit."
        ],
        tips: [
          "Le coffre est l'un des meilleurs upgrades de confort du debut de partie.",
          "Faites un coffre pour les blocs et un autre pour la nourriture et les outils.",
          "Deux coffres cotes a cote deviennent un grand coffre."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Un coffre se fabrique avec 8 planches de bois placees autour d'une case centrale vide.",
          ingredients: [
            "2 troncs de bois -> a transformer en planches",
            "8 planches de bois"
          ],
          result: "1 coffre",
          notes: [
            "Le resultat ressemble a une petite boite de rangement marron avec un fermoir devant.",
            "Placez les planches sur le bord exterieur et laissez la case du milieu vide."
          ]
        }
      }
    }
  },
  {
    id: "charcoal",
    category: "resources",
    visual: "coal",
    pages: {
      en: {
        slug: "how-to-make-charcoal-in-minecraft",
        title: "How to Make Charcoal in Minecraft",
        summary: "If you cannot find coal yet, charcoal is the early-game backup that saves torches, fuel and time.",
        quickAnswer:
          "Smelt one wood log in a furnace using another fuel source, and the result is charcoal. Charcoal works almost the same as coal for torches and fuel.",
        steps: [
          "Craft a furnace from 8 cobblestone.",
          "Put one wood log in the top slot of the furnace.",
          "Use planks, sticks, extra logs or coal as temporary fuel in the bottom slot.",
          "Wait for the furnace to finish smelting the log into charcoal.",
          "Use charcoal with sticks to make torches, or keep it as better fuel."
        ],
        mistakes: [
          "Wandering too long for coal when you already have wood and a furnace.",
          "Burning all your planks before turning one log into charcoal first.",
          "Ignoring charcoal and staying in the dark too long."
        ],
        tips: [
          "Charcoal solves the classic beginner problem of having wood but no cave coal yet.",
          "Once you have one charcoal, you can often snowball into more fuel and more torches.",
          "This is one of the fastest ways to stabilize your first base."
        ]
      },
      de: {
        slug: "wie-bekommt-man-schnell-holzkohle-in-minecraft",
        title: "Wie bekommt man schnell Holzkohle in Minecraft?",
        summary: "Wenn du noch keine Kohle findest, ist Holzkohle die fruhe Ersatzlosung fur Fackeln, Brennstoff und Zeit.",
        quickAnswer:
          "Schmelze einen Holzstamm im Ofen mit einem anderen Brennstoff, dann entsteht Holzkohle. Sie funktioniert fast wie normale Kohle fur Fackeln und als Brennstoff.",
        steps: [
          "Baue einen Ofen aus 8 Bruchstein.",
          "Lege einen Holzstamm in den oberen Slot des Ofens.",
          "Nutze Bretter, Stocke, Ersatzstamme oder Kohle als vorlaufigen Brennstoff unten.",
          "Warte, bis aus dem Stamm Holzkohle geworden ist.",
          "Nutze die Holzkohle mit Stocken fur Fackeln oder direkt als besseren Brennstoff."
        ],
        mistakes: [
          "Zu lange nach Kohle zu suchen, obwohl Holz und Ofen schon da sind.",
          "Alle Bretter zu verbrennen, statt zuerst einen Stamm in Holzkohle zu verwandeln.",
          "Holzkohle zu ignorieren und dadurch zu lange im Dunkeln zu bleiben."
        ],
        tips: [
          "Holzkohle lost ein typisches Anfangerproblem: viel Holz, aber noch keine Kohle.",
          "Mit dem ersten Stuck Holzkohle kommst du oft schnell zu mehr Brennstoff und mehr Fackeln.",
          "So stabilisierst du deine erste Basis deutlich fruher."
        ]
      },
      fr: {
        slug: "comment-obtenir-du-charbon-de-bois-dans-minecraft",
        title: "Comment obtenir du charbon de bois dans Minecraft ?",
        summary: "Si vous ne trouvez pas encore de charbon, le charbon de bois est la solution du debut pour les torches, le combustible et le temps gagne.",
        quickAnswer:
          "Faites cuire un tronc de bois dans un four avec un autre combustible, et vous obtenez du charbon de bois. Il fonctionne presque comme le charbon normal pour les torches et le four.",
        steps: [
          "Fabriquez un four avec 8 blocs de cobblestone.",
          "Placez un tronc de bois dans la case du haut.",
          "Utilisez des planches, des batons, d'autres troncs ou du charbon comme combustible temporaire en bas.",
          "Attendez la fin de la cuisson pour obtenir du charbon de bois.",
          "Utilisez-le avec des batons pour faire des torches ou gardez-le comme meilleur combustible."
        ],
        mistakes: [
          "Chercher du charbon trop longtemps alors que vous avez deja du bois et un four.",
          "Bruler toutes vos planches avant de transformer un tronc en charbon de bois.",
          "Ignorer cette solution et rester trop longtemps sans lumiere."
        ],
        tips: [
          "Le charbon de bois regle un probleme classique du debut: beaucoup de bois, mais pas encore de charbon.",
          "Une fois le premier obtenu, il devient plus facile de produire du combustible et des torches.",
          "C'est une des manieres les plus rapides de stabiliser votre premiere base."
        ]
      }
    }
  },
  {
    id: "coordinates",
    category: "path",
    visual: "lost",
    pages: {
      en: {
        slug: "how-to-use-coordinates-in-minecraft",
        title: "How to Use Coordinates in Minecraft",
        summary: "Most new players get lost because they never start using coordinates early enough.",
        quickAnswer:
          "Coordinates tell you your exact location in the world. Use them to record your base, villages, caves and portal spots so you can return without guessing.",
        steps: [
          "Open the coordinate display for your version of Minecraft.",
          "Stand inside your base and write down the X, Y and Z values.",
          "Repeat this for useful places like a village, a mine entrance or a ruined portal.",
          "Before exploring far away, screenshot or note your base coordinates again.",
          "When lost, move your X and Z values back toward home instead of wandering randomly."
        ],
        mistakes: [
          "Only trying to learn coordinates after you are already badly lost.",
          "Remembering only one number instead of the full location.",
          "Traveling far with no written home coordinates."
        ],
        tips: [
          "For beginners, coordinates are better than memory.",
          "Your first base, first village and first Nether portal should all be written down.",
          "This one habit saves more time than almost any beginner trick."
        ]
      },
      de: {
        slug: "wie-benutzt-man-koordinaten-in-minecraft",
        title: "Wie benutzt man Koordinaten in Minecraft?",
        summary: "Viele neue Spieler verlaufen sich, weil sie Koordinaten nicht fruh genug benutzen.",
        quickAnswer:
          "Koordinaten zeigen deine exakte Position in der Welt. Nutze sie fur deine Basis, Dorfer, Hohleneingange und Portale, damit du sicher zuruckfindest.",
        steps: [
          "Aktiviere die Koordinatenanzeige fur deine Minecraft-Version.",
          "Stell dich in deine Basis und notiere X, Y und Z.",
          "Wiederhole das fur nutzliche Orte wie ein Dorf, einen Mineneingang oder ein ruiniertes Portal.",
          "Bevor du weit losziehst, sichere die Heimat-Koordinaten erneut per Screenshot oder Notiz.",
          "Wenn du dich verirrst, bewege X und Z gezielt Richtung Zuhause statt planlos zu laufen."
        ],
        mistakes: [
          "Koordinaten erst lernen zu wollen, wenn man schon komplett verloren ist.",
          "Sich nur eine Zahl statt den ganzen Ort zu merken.",
          "Weit zu reisen, ohne die Heim-Koordinaten aufzuschreiben."
        ],
        tips: [
          "Fur Anfanger sind Koordinaten besser als Erinnerung.",
          "Deine erste Basis, dein erstes Dorf und dein erstes Nether-Portal sollten notiert sein.",
          "Diese eine Gewohnheit spart mehr Zeit als fast jeder kleine Trick."
        ]
      },
      fr: {
        slug: "comment-utiliser-les-coordonnees-dans-minecraft",
        title: "Comment utiliser les coordonnees dans Minecraft ?",
        summary: "Beaucoup de nouveaux joueurs se perdent parce qu'ils n'utilisent pas les coordonnees assez tot.",
        quickAnswer:
          "Les coordonnees donnent votre position exacte dans le monde. Utilisez-les pour noter votre base, les villages, les grottes et les portails afin de toujours pouvoir revenir.",
        steps: [
          "Activez l'affichage des coordonnees dans votre version de Minecraft.",
          "Placez-vous dans votre base et notez les valeurs X, Y et Z.",
          "Faites la meme chose pour les lieux utiles comme un village, l'entree d'une mine ou un portail en ruine.",
          "Avant d'explorer loin, reprenez une capture ou notez encore les coordonnees de la base.",
          "Si vous etes perdu, ramenez vos valeurs X et Z vers la maison au lieu de marcher au hasard."
        ],
        mistakes: [
          "Essayer d'apprendre les coordonnees seulement apres s'etre deja perdu.",
          "Retenir un seul nombre au lieu de l'emplacement complet.",
          "Partir loin sans noter les coordonnees de la maison."
        ],
        tips: [
          "Pour un debutant, les coordonnees sont plus fiables que la memoire.",
          "Votre premiere base, votre premier village et votre premier portail du Nether devraient etre notes.",
          "Cette habitude vous fera gagner plus de temps que presque n'importe quelle astuce de debut."
        ]
      }
    }
  },
  {
    id: "wheat-farm",
    category: "farming",
    visual: "food",
    pages: {
      en: {
        slug: "how-to-start-a-wheat-farm-in-minecraft",
        title: "How to Start a Wheat Farm in Minecraft",
        summary: "A tiny wheat farm is one of the safest ways for beginners to stop food panic in the first few days.",
        quickAnswer:
          "Get seeds from grass, place them on hydrated farmland near water, and protect the farm so it can keep growing while you do other tasks.",
        steps: [
          "Break grass until you collect several wheat seeds.",
          "Find water or dig one water block near your base.",
          "Use a hoe on dirt blocks around the water to make farmland.",
          "Plant the seeds and wait for the wheat to grow fully before harvesting.",
          "Replant seeds immediately so the farm keeps producing food."
        ],
        mistakes: [
          "Planting seeds on plain dirt instead of farmland.",
          "Breaking all the wheat and forgetting to replant.",
          "Starting the farm too far from your base and not checking it often."
        ],
        tips: [
          "A small farm beats random food searching once your first day is over.",
          "Villages often speed this up because hay bales can become early bread.",
          "Wheat also helps later with animal breeding."
        ]
      },
      de: {
        slug: "wie-startet-man-eine-weizenfarm-in-minecraft",
        title: "Wie startet man eine Weizenfarm in Minecraft?",
        summary: "Eine kleine Weizenfarm ist eine der sichersten Losungen gegen fruhen Essensstress.",
        quickAnswer:
          "Sammle Samen aus Gras, pflanze sie auf befeuchtetem Ackerboden neben Wasser und schutze die Farm, damit sie wahrend anderer Aufgaben wachsen kann.",
        steps: [
          "Zerstore Gras, bis du einige Weizensamen hast.",
          "Suche Wasser oder setze einen Wasserblock nahe deiner Basis.",
          "Benutze eine Hacke auf Erde um das Wasser herum, um Ackerboden zu erzeugen.",
          "Pflanze die Samen und warte, bis der Weizen voll ausgewachsen ist.",
          "Pflanze nach der Ernte sofort neue Samen nach."
        ],
        mistakes: [
          "Samen auf normale Erde statt auf Ackerboden zu setzen.",
          "Den ganzen Weizen abzubauen und nichts neu zu pflanzen.",
          "Die Farm zu weit weg von der Basis anzulegen."
        ],
        tips: [
          "Nach Tag eins ist eine kleine Farm besser als dauernd Essen zu suchen.",
          "Dorfer beschleunigen das oft, weil Heuballen schnell zu Brot werden.",
          "Weizen ist spater auch fur Tierzucht wichtig."
        ]
      },
      fr: {
        slug: "comment-demarrer-une-ferme-de-ble-dans-minecraft",
        title: "Comment demarrer une ferme de ble dans Minecraft ?",
        summary: "Une petite ferme de ble est l'un des moyens les plus surs d'eviter la panique de nourriture au debut.",
        quickAnswer:
          "Recuperez des graines dans l'herbe, plantez-les sur une terre hydratee pres de l'eau et protegez la ferme pour qu'elle pousse pendant que vous faites autre chose.",
        steps: [
          "Cassez de l'herbe jusqu'a obtenir plusieurs graines de ble.",
          "Trouvez de l'eau ou placez un bloc d'eau pres de votre base.",
          "Utilisez une houe sur la terre autour de l'eau pour creer des terres agricoles.",
          "Plantez les graines et attendez que le ble soit completement mature avant de recolter.",
          "Replantez immediatement pour que la ferme continue a produire."
        ],
        mistakes: [
          "Planter sur de la terre normale au lieu d'une terre agricole.",
          "Recolter tout le ble puis oublier de replanter.",
          "Construire la ferme trop loin de la base."
        ],
        tips: [
          "Une petite ferme devient vite meilleure que chercher de la nourriture au hasard.",
          "Les villages accelerent souvent ce depart grace aux bottes de foin transformables en pain.",
          "Le ble servira aussi plus tard pour l'elevage des animaux."
        ]
      }
    }
  },
  {
    id: "village-guide",
    category: "farming",
    visual: "village",
    pages: {
      en: {
        slug: "how-to-find-and-use-a-village-in-minecraft",
        title: "How to Find and Use a Village in Minecraft",
        summary: "Villages are one of the biggest beginner shortcuts for food, beds, shelter and early survival.",
        quickAnswer:
          "A village can give you beds, food, shelter, workstations and fast early safety. Take what you need, but stay alert at night and avoid making the village less safe.",
        steps: [
          "Search plains and open areas first because villages are easier to spot there.",
          "Use village beds for safe sleeping if night is coming.",
          "Check hay bales, crops and houses for fast early food and shelter.",
          "Place your own chest and furnace nearby if you want to use the village as a temporary base.",
          "Keep watch at night so zombies and other mobs do not turn the village into a trap."
        ],
        mistakes: [
          "Treating a village as perfectly safe after dark.",
          "Looting everything but never setting up your own storage or respawn point.",
          "Leaving without recording the village coordinates."
        ],
        tips: [
          "For true beginners, a village can remove half the pressure of the first few days.",
          "Hay bales are one of the fastest food boosts you can find early.",
          "If a village helps you once, write down the coordinates immediately."
        ]
      },
      de: {
        slug: "wie-benutzt-man-ein-dorf-in-minecraft-am-anfang",
        title: "Wie benutzt man ein Dorf in Minecraft am Anfang?",
        summary: "Dorfer sind eine der groten Abkurzungen fur Nahrung, Betten, Schutz und fruhes Uberleben.",
        quickAnswer:
          "Ein Dorf kann dir Betten, Essen, Schutz, Werkstationen und schnelle Sicherheit geben. Nimm, was du brauchst, aber pass nachts auf und mach das Dorf nicht unsicher.",
        steps: [
          "Suche zuerst Ebenen und offene Gebiete, dort sind Dorfer leichter zu entdecken.",
          "Nutze Dorfbetten, wenn die Nacht naherkommt.",
          "Prufe Heuballen, Felder und Hauser fur schnelles Essen und Schutz.",
          "Stell eigene Truhe und Ofen auf, wenn du das Dorf als vorlaufige Basis nutzen willst.",
          "Bleib nachts wachsam, damit Zombies und andere Mobs das Dorf nicht zur Falle machen."
        ],
        mistakes: [
          "Ein Dorf nachts fur komplett sicher zu halten.",
          "Alles mitzunehmen, aber keinen eigenen Spawnpunkt oder Stauraum aufzubauen.",
          "Das Dorf zu verlassen, ohne die Koordinaten zu notieren."
        ],
        tips: [
          "Fur echte Anfanger nimmt ein Dorf oft die Halfte des Anfangsdrucks weg.",
          "Heuballen sind einer der schnellsten fruhen Essens-Boosts.",
          "Wenn dir ein Dorf einmal geholfen hat, notiere sofort die Koordinaten."
        ]
      },
      fr: {
        slug: "comment-utiliser-un-village-au-debut-dans-minecraft",
        title: "Comment utiliser un village au debut dans Minecraft ?",
        summary: "Les villages sont l'un des plus grands raccourcis pour la nourriture, les lits, l'abri et la survie au debut.",
        quickAnswer:
          "Un village peut vous donner des lits, de la nourriture, un abri, des blocs utiles et une securite rapide. Prenez ce dont vous avez besoin, mais restez prudent la nuit.",
        steps: [
          "Cherchez d'abord dans les plaines et les zones ouvertes, car les villages y sont plus visibles.",
          "Utilisez les lits du village si la nuit approche.",
          "Verifiez les bottes de foin, les cultures et les maisons pour obtenir vite de la nourriture et un abri.",
          "Posez votre propre coffre et votre propre four si vous voulez utiliser le village comme base temporaire.",
          "Restez attentif la nuit pour eviter que zombies et autres mobs transforment le village en piege."
        ],
        mistakes: [
          "Croire qu'un village est totalement sur une fois la nuit tombee.",
          "Tout recuperer sans creer son propre stockage ni point de respawn.",
          "Repartir sans noter les coordonnees du village."
        ],
        tips: [
          "Pour un vrai debutant, un village peut enlever une enorme partie de la pression des premiers jours.",
          "Les bottes de foin donnent l'un des meilleurs boosts de nourriture du debut.",
          "Si un village vous sauve une fois, notez ses coordonnees tout de suite."
        ]
      }
    }
  },
  {
    id: "nether-prep",
    category: "progression",
    visual: "netherPrep",
    pages: {
      en: {
        slug: "how-to-prepare-for-the-nether-in-minecraft",
        title: "How to Prepare for the Nether in Minecraft",
        summary: "New players usually enter the Nether too early, then lose gear, food and their way home in minutes.",
        quickAnswer:
          "Before entering the Nether, bring solid food, extra blocks, torches, spare tools, a safe overworld base location and the coordinates of your portal.",
        steps: [
          "Do not enter the Nether until your overworld basics feel stable.",
          "Bring enough food, building blocks and at least one backup tool.",
          "Write down or screenshot your portal coordinates before going through.",
          "Place a chest near the portal with a few emergency supplies.",
          "Treat your first Nether trip as scouting, not as a deep adventure."
        ],
        mistakes: [
          "Going in with almost no food or blocks.",
          "Entering before recording portal coordinates.",
          "Trying to explore too far on the very first trip."
        ],
        tips: [
          "The Nether is not the place to improvise as a beginner.",
          "Your first goal is learning the area around the portal and getting back alive.",
          "If your overworld base is still messy, fix that first and delay the trip."
        ]
      },
      de: {
        slug: "wie-bereitet-man-sich-auf-den-nether-vor-in-minecraft",
        title: "Wie bereitet man sich auf den Nether vor in Minecraft?",
        summary: "Neue Spieler gehen oft zu fruh in den Nether und verlieren dort in Minuten Ausrustung, Essen und den Heimweg.",
        quickAnswer:
          "Bevor du in den Nether gehst, brauchst du genug Essen, Ersatzblocke, Fackeln, Werkzeug-Reserve, eine sichere Oberwelt-Basis und die Koordinaten deines Portals.",
        steps: [
          "Geh nicht in den Nether, solange deine Oberwelt-Grundlagen noch instabil sind.",
          "Nimm genug Essen, Baublocke und mindestens ein Ersatzwerkzeug mit.",
          "Notiere oder screenshotte die Portal-Koordinaten vor dem Durchgang.",
          "Stell eine Truhe mit Notfallvorraten neben das Portal.",
          "Sieh den ersten Nether-Trip als Erkundung, nicht als groe Expedition."
        ],
        mistakes: [
          "Mit fast keinem Essen oder Baumaterial hineinzugehen.",
          "Vorher keine Portal-Koordinaten aufzuschreiben.",
          "Beim ersten Besuch sofort zu weit wegzulaufen."
        ],
        tips: [
          "Der Nether ist fur Anfanger kein Ort fur Improvisation.",
          "Dein erstes Ziel ist, die Portal-Umgebung kennenzulernen und lebend zuruckzukommen.",
          "Wenn deine Oberwelt-Basis noch chaotisch ist, bring erst dort Ordnung rein."
        ]
      },
      fr: {
        slug: "comment-se-preparer-au-nether-dans-minecraft",
        title: "Comment se preparer au Nether dans Minecraft ?",
        summary: "Les nouveaux joueurs entrent souvent trop tot dans le Nether, puis perdent equipement, nourriture et chemin du retour en quelques minutes.",
        quickAnswer:
          "Avant d'entrer dans le Nether, apportez assez de nourriture, des blocs, des torches, des outils de secours, une base sure dans l'Overworld et les coordonnees de votre portail.",
        steps: [
          "N'entrez pas dans le Nether tant que vos bases de survie dans l'Overworld ne sont pas stables.",
          "Prenez assez de nourriture, de blocs de construction et au moins un outil de rechange.",
          "Notez ou capturez les coordonnees du portail avant de traverser.",
          "Placez un coffre pres du portail avec quelques reserves d'urgence.",
          "Considerez le premier voyage comme une reconnaissance, pas comme une grande expedition."
        ],
        mistakes: [
          "Entrer avec trop peu de nourriture ou de blocs.",
          "Traverser sans noter les coordonnees du portail.",
          "Aller trop loin des la toute premiere visite."
        ],
        tips: [
          "Le Nether n'est pas un endroit ou improviser quand on debute.",
          "Le premier objectif est d'apprendre la zone autour du portail et de revenir vivant.",
          "Si votre base principale est encore mal organisee, reglez ca avant le voyage."
        ]
      }
    }
  },
  {
    id: "shield",
    category: "resources",
    visual: "shield",
    pages: {
      en: {
        slug: "how-to-make-a-shield-in-minecraft",
        title: "How to Make a Shield in Minecraft",
        summary: "A shield is one of the best early-game survival upgrades because it prevents cheap beginner deaths.",
        quickAnswer:
          "A shield is crafted with 6 wooden planks and 1 iron ingot on a crafting table. Use it as soon as you have your first iron spare.",
        steps: [
          "Find and smelt at least one iron ingot first.",
          "Turn wood logs into wooden planks.",
          "Open the crafting table and place 6 planks plus 1 iron ingot in the shield pattern.",
          "Move the shield into your hotbar and equip it.",
          "Use it against skeleton arrows, close-range hits and dangerous surprise attacks."
        ],
        mistakes: [
          "Spending early iron on less important items before making a shield.",
          "Crafting one but never equipping it in a useful slot.",
          "Assuming armor alone is enough to survive early caves."
        ],
        tips: [
          "For beginners, a shield often saves more lives than one extra armor piece.",
          "If skeletons are your biggest problem, a shield changes the game immediately.",
          "Make the shield as soon as your iron pickaxe is already secured."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A shield is crafted with wooden planks and one iron ingot on a crafting table.",
          ingredients: [
            "6 wooden planks",
            "1 iron ingot"
          ],
          result: "1 shield",
          notes: [
            "The shield is a defensive item you hold to block damage.",
            "It is especially valuable against skeleton arrows and sudden cave hits."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-ein-schild-in-minecraft",
        title: "Wie macht man ein Schild in Minecraft?",
        summary: "Ein Schild ist eines der besten fruhen Uberlebens-Upgrades, weil es billige Anfanger-Tode verhindert.",
        quickAnswer:
          "Ein Schild wird an der Werkbank aus 6 Holzbrettern und 1 Eisenbarren hergestellt. Nutze es, sobald dein erstes freies Eisen da ist.",
        steps: [
          "Finde und schmelze zuerst mindestens einen Eisenbarren.",
          "Verwandle Holzstamme in Holzbretter.",
          "Offne die Werkbank und lege 6 Bretter plus 1 Eisenbarren im Schildmuster hinein.",
          "Zieh das Schild in die Hotbar und ruste es aus.",
          "Nutze es gegen Skelette, Nahkampftreffer und uberraschende Angriffe."
        ],
        mistakes: [
          "Fruhes Eisen fur weniger wichtige Dinge auszugeben, bevor ein Schild gebaut wird.",
          "Ein Schild zu craften, aber nie sinnvoll auszurusten.",
          "Zu denken, Rüstung allein reiche in fruhen Hohlen aus."
        ],
        tips: [
          "Fur Anfanger rettet ein Schild oft mehr Leben als ein zusatzliches Rustungsteil.",
          "Wenn Skelette dein grotes Problem sind, verandert ein Schild sofort alles.",
          "Baue es, sobald deine Eisenspitzhacke schon gesichert ist."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Ein Schild wird an der Werkbank aus Holzbrettern und einem Eisenbarren hergestellt.",
          ingredients: [
            "6 Holzbretter",
            "1 Eisenbarren"
          ],
          result: "1 Schild",
          notes: [
            "Das Schild ist ein Verteidigungsgegenstand zum Blocken von Schaden.",
            "Besonders wertvoll ist es gegen Skelettpfeile und plötzliche Treffer in Hohlen."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-un-bouclier-dans-minecraft",
        title: "Comment fabriquer un bouclier dans Minecraft ?",
        summary: "Le bouclier est l'un des meilleurs upgrades de survie du debut car il evite beaucoup de morts betes.",
        quickAnswer:
          "Un bouclier se fabrique avec 6 planches de bois et 1 lingot de fer sur une table de craft. Utilisez-le des que vous avez un peu de fer libre.",
        steps: [
          "Trouvez et faites fondre au moins un lingot de fer.",
          "Transformez des troncs en planches.",
          "Ouvrez la table de craft et placez 6 planches plus 1 lingot dans le motif du bouclier.",
          "Mettez le bouclier dans votre barre rapide et equipez-le.",
          "Utilisez-le contre les fleches des squelettes, les coups de pres et les attaques surprises."
        ],
        mistakes: [
          "Depenser le premier fer dans des objets moins utiles avant de faire un bouclier.",
          "En fabriquer un puis ne jamais l'equiper correctement.",
          "Croire que l'armure seule suffit dans les premieres grottes."
        ],
        tips: [
          "Pour un debutant, un bouclier sauve souvent plus de vies qu'une piece d'armure en plus.",
          "Si les squelettes vous posent probleme, le bouclier change tout tres vite.",
          "Fabriquez-le des que votre pioche en fer est deja securisee."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Un bouclier se fabrique sur une table de craft avec des planches de bois et un lingot de fer.",
          ingredients: [
            "6 planches de bois",
            "1 lingot de fer"
          ],
          result: "1 bouclier",
          notes: [
            "Le bouclier est un objet defensif que l'on tient pour bloquer les degats.",
            "Il est tres utile contre les fleches des squelettes et les coups surprises dans les grottes."
          ]
        }
      }
    }
  },
  {
    id: "safe-mining",
    category: "resources",
    visual: "safeMining",
    pages: {
      en: {
        slug: "how-to-mine-safely-in-minecraft",
        title: "How to Mine Safely in Minecraft",
        summary: "Most beginner mining deaths come from entering caves too early, too dark, or too greedy.",
        quickAnswer:
          "Mine safely by bringing torches, food, spare tools, blocks and a calm plan. Light your path, stop when your inventory is full, and leave before panic starts.",
        steps: [
          "Do not start a real mining trip until you have food, torches and at least stone tools.",
          "Place torches regularly so you can see and find the way back.",
          "Keep blocks on you to close dangerous openings or make quick bridges.",
          "If mobs appear and the cave feels messy, retreat instead of forcing progress.",
          "Return home before your inventory, health or confidence completely collapses."
        ],
        mistakes: [
          "Going underground with almost no food or torches.",
          "Digging deeper when already low on health.",
          "Getting greedy after finding iron and then dying with everything."
        ],
        tips: [
          "Safe mining is slower than panic mining, but it gives better results.",
          "The real beginner skill is coming back alive with resources.",
          "A short successful trip is better than a long disaster."
        ]
      },
      de: {
        slug: "wie-baut-man-sicher-in-minecraft-ab",
        title: "Wie baut man sicher in Minecraft ab?",
        summary: "Die meisten Anfanger sterben beim Abbau, weil sie zu fruh, zu dunkel oder zu gierig in Hohlen gehen.",
        quickAnswer:
          "Baue sicher ab, indem du Fackeln, Essen, Ersatzwerkzeuge, Blocke und einen ruhigen Plan mitnimmst. Beleuchte den Weg, geh rechtzeitig zuruck und zwinge keinen Fortschritt.",
        steps: [
          "Starte keinen echten Mining-Trip ohne Essen, Fackeln und mindestens Steinwerkzeuge.",
          "Setze regelmaig Fackeln, damit du sehen und zuruckfinden kannst.",
          "Trage Blocke bei dir, um Gefahrenstellen zu schlieen oder kleine Brücken zu bauen.",
          "Wenn Mobs auftauchen und die Hohle chaotisch wirkt, zieh dich lieber zuruck.",
          "Kehre heim, bevor Inventar, Leben oder Nerven komplett leer sind."
        ],
        mistakes: [
          "Fast ohne Essen oder Fackeln unter Tage zu gehen.",
          "Mit wenig Leben immer tiefer zu graben.",
          "Nach dem ersten Eisen gierig zu werden und alles zu verlieren."
        ],
        tips: [
          "Sicheres Mining ist langsamer als Panik-Mining, bringt aber bessere Ergebnisse.",
          "Die wichtigste Anfangerfahigkeit ist, lebend mit Beute zuruckzukommen.",
          "Ein kurzer erfolgreicher Trip ist besser als eine lange Katastrophe."
        ]
      },
      fr: {
        slug: "comment-miner-en-securite-dans-minecraft",
        title: "Comment miner en securite dans Minecraft ?",
        summary: "La plupart des morts des debutants arrivent parce qu'ils entrent trop tot dans les grottes, sans lumiere ou avec trop de greed.",
        quickAnswer:
          "Minez en securite avec des torches, de la nourriture, des outils de rechange, des blocs et un plan calme. Eclairez votre chemin, arretez-vous avant la panique, et rentrez vivant.",
        steps: [
          "Ne partez pas miner serieusement sans nourriture, torches et au moins des outils en pierre.",
          "Placez regulierement des torches pour voir et retrouver la sortie.",
          "Gardez des blocs pour fermer des ouvertures dangereuses ou faire de petits ponts.",
          "Si des mobs apparaissent et que la grotte devient confuse, reculez au lieu de forcer.",
          "Rentrez a la base avant que l'inventaire, la vie ou le calme ne s'effondrent."
        ],
        mistakes: [
          "Descendre avec presque pas de nourriture ni de torches.",
          "Continuer a miner avec peu de points de vie.",
          "Devenir trop gourmand apres avoir trouve du fer et tout perdre."
        ],
        tips: [
          "Miner prudemment est plus lent que miner dans la panique, mais bien plus rentable.",
          "La vraie competence du debutant, c'est de revenir vivant avec les ressources.",
          "Un petit trajet reussi vaut mieux qu'une longue catastrophe."
        ]
      }
    }
  },
  {
    id: "villager-trading",
    category: "farming",
    visual: "villagerTrade",
    pages: {
      en: {
        slug: "how-to-trade-with-villagers-in-minecraft",
        title: "How to Trade with Villagers in Minecraft",
        summary: "Trading looks complicated at first, but beginners only need the simple idea: useful items in, better progression out.",
        quickAnswer:
          "Trading with villagers means giving them certain items, often emerald-related exchanges, in return for useful gear, food or materials. Start simple and do not overbuild the system too early.",
        steps: [
          "Find a village and keep it safe enough to use during the day.",
          "Click a villager and look at the offered trades instead of guessing.",
          "Start with easy value sources like village resources or simple farm output.",
          "Learn which villagers are actually useful for your stage of the game.",
          "Do not turn trading into a giant project until your base, food and mining are already stable."
        ],
        mistakes: [
          "Trying to understand every villager type on day one.",
          "Ignoring villages completely because trading seems too advanced.",
          "Getting distracted by trading before solving food and survival basics."
        ],
        tips: [
          "Beginner trading is about practical help, not a perfect emerald empire.",
          "Villagers become much easier once you already know one safe village location.",
          "Treat trading as a bonus layer after your first survival basics are under control."
        ]
      },
      de: {
        slug: "wie-handelt-man-mit-dorfbewohnern-in-minecraft",
        title: "Wie handelt man mit Dorfbewohnern in Minecraft?",
        summary: "Handel wirkt am Anfang kompliziert, aber Einsteiger brauchen nur das Grundprinzip: nützliche Dinge hinein, Fortschritt heraus.",
        quickAnswer:
          "Beim Handel gibst du Dorfbewohnern bestimmte Gegenstande und bekommst dafur nutzliche Ausrustung, Essen oder Materialien. Fang einfach an und bau nicht zu fruh ein Riesensystem.",
        steps: [
          "Finde ein Dorf und halte es tagsuber sicher genug zur Nutzung.",
          "Offne einen Dorfbewohner und schau dir die angebotenen Handel an, statt zu raten.",
          "Starte mit einfachen Wertquellen wie Dorfer-Ressourcen oder einer kleinen Farm.",
          "Lerne, welche Dorfbewohner fur deine aktuelle Spielphase wirklich hilfreich sind.",
          "Mach aus Handel kein Groprojekt, solange Basis, Essen und Mining noch nicht stabil sind."
        ],
        mistakes: [
          "Am ersten Tag alle Dorfbewohnertypen verstehen zu wollen.",
          "Dorfer komplett zu ignorieren, weil Handel zu kompliziert wirkt.",
          "Sich vom Handel ablenken zu lassen, bevor die Uberlebensgrundlagen stehen."
        ],
        tips: [
          "Anfanger-Handel bedeutet praktische Hilfe, nicht sofort ein perfektes Smaragd-System.",
          "Dorfbewohner werden viel einfacher, wenn du schon ein sicheres Dorf kennst.",
          "Sieh Handel als Zusatzschicht, nachdem die ersten Survival-Grundlagen sitzen."
        ]
      },
      fr: {
        slug: "comment-echanger-avec-les-villageois-dans-minecraft",
        title: "Comment echanger avec les villageois dans Minecraft ?",
        summary: "Le commerce parait complexe au debut, mais un nouveau joueur n'a besoin que de l'idee simple: donner des ressources utiles contre une meilleure progression.",
        quickAnswer:
          "Echanger avec les villageois consiste a leur donner certains objets pour recevoir de l'equipement, de la nourriture ou des ressources utiles. Commencez simple et n'en faites pas un gros systeme trop tot.",
        steps: [
          "Trouvez un village et gardez-le assez sur pour l'utiliser pendant la journee.",
          "Cliquez sur un villageois et regardez les echanges proposes au lieu de deviner.",
          "Commencez avec des sources simples de valeur comme les ressources du village ou une petite production de ferme.",
          "Apprenez quels villageois sont vraiment utiles a votre stade de progression.",
          "Ne transformez pas le commerce en grand projet tant que la base, la nourriture et le minage ne sont pas stables."
        ],
        mistakes: [
          "Essayer de comprendre tous les types de villageois des le premier jour.",
          "Ignorer completement les villages parce que le commerce semble trop avance.",
          "Se laisser distraire par le commerce avant de regler la survie de base."
        ],
        tips: [
          "Le commerce debutant sert a obtenir une aide pratique, pas a construire tout de suite un empire d'emeraudes.",
          "Les villageois deviennent beaucoup plus simples quand vous connaissez deja un village sur.",
          "Voyez le commerce comme une couche supplementaire apres les bases de survie."
        ]
      }
    }
  },
  {
    id: "starter-house",
    category: "path",
    visual: "starterHouse",
    pages: {
      en: {
        slug: "how-to-build-a-simple-starter-house-in-minecraft",
        title: "How to Build a Simple Starter House in Minecraft",
        summary: "Your first house should solve survival problems, not become an architecture project that delays everything else.",
        quickAnswer:
          "A simple starter house only needs walls, a roof, a door, light, a bed, storage and space for a crafting table and furnace.",
        steps: [
          "Pick a flat spot close to wood, food and your first mining area.",
          "Build small walls from dirt, wood or cobblestone instead of trying to make a big house.",
          "Add a roof quickly so mobs cannot drop in from above.",
          "Place a door, torches, a bed, a crafting table, a furnace and at least one chest inside.",
          "Improve the house later only after your food, mining and tools are stable."
        ],
        mistakes: [
          "Trying to build a beautiful large base on day one.",
          "Leaving the roof open and calling it finished.",
          "Putting key blocks outside instead of inside safe walls."
        ],
        tips: [
          "A good starter house is boring in a useful way.",
          "Size matters less than safety, lighting and location.",
          "Your first house is a survival tool, not your forever home."
        ]
      },
      de: {
        slug: "wie-baut-man-ein-einfaches-starthaus-in-minecraft",
        title: "Wie baut man ein einfaches Starthaus in Minecraft?",
        summary: "Dein erstes Haus soll Uberlebensprobleme losen und nicht zu einem Bauprojekt werden, das alles andere verzogert.",
        quickAnswer:
          "Ein einfaches Starthaus braucht nur Wande, Dach, Tur, Licht, Bett, Stauraum und Platz fur Werkbank und Ofen.",
        steps: [
          "Wahle einen flachen Ort nahe Holz, Essen und deinem ersten Minengebiet.",
          "Baue kleine Wande aus Erde, Holz oder Bruchstein statt sofort ein groes Haus zu planen.",
          "Setze schnell ein Dach, damit keine Mobs von oben hineinfallen.",
          "Stell Tur, Fackeln, Bett, Werkbank, Ofen und mindestens eine Truhe hinein.",
          "Verbessere das Haus erst, wenn Nahrung, Mining und Werkzeuge stabil sind."
        ],
        mistakes: [
          "Schon an Tag eins ein schones Riesenhaus bauen zu wollen.",
          "Das Dach offen zu lassen und es trotzdem fertig zu nennen.",
          "Wichtige Bloche drauen statt in sicheren Wanden zu platzieren."
        ],
        tips: [
          "Ein gutes Starthaus ist auf nutzliche Weise langweilig.",
          "Groe ist weniger wichtig als Sicherheit, Licht und Standort.",
          "Dein erstes Haus ist ein Survival-Werkzeug und nicht dein Endprojekt."
        ]
      },
      fr: {
        slug: "comment-construire-une-maison-de-depart-simple-dans-minecraft",
        title: "Comment construire une maison de depart simple dans Minecraft ?",
        summary: "Votre premiere maison doit regler des problemes de survie, pas devenir un projet d'architecture qui ralentit tout le reste.",
        quickAnswer:
          "Une maison de depart simple a seulement besoin de murs, d'un toit, d'une porte, de lumiere, d'un lit, de stockage et de place pour une table de craft et un four.",
        steps: [
          "Choisissez un endroit plat pres du bois, de la nourriture et de votre premiere zone de minage.",
          "Construisez de petits murs en terre, bois ou cobblestone au lieu de viser trop grand.",
          "Ajoutez vite un toit pour empecher les mobs de tomber dedans.",
          "Placez une porte, des torches, un lit, une table de craft, un four et au moins un coffre a l'interieur.",
          "Ameliorez la maison plus tard, une fois la nourriture, le minage et les outils stabilises."
        ],
        mistakes: [
          "Essayer de construire une grande belle base des le premier jour.",
          "Laisser le toit ouvert et considerer la maison terminee.",
          "Laisser les blocs importants dehors au lieu de les mettre a l'abri."
        ],
        tips: [
          "Une bonne maison de depart est simple d'une maniere utile.",
          "La taille compte moins que la securite, la lumiere et l'emplacement.",
          "Votre premiere maison est un outil de survie, pas votre maison finale."
        ]
      }
    }
  },
  {
    id: "bread",
    category: "farming",
    visual: "breadGuide",
    pages: {
      en: {
        slug: "how-to-make-bread-in-minecraft",
        title: "How to Make Bread in Minecraft",
        summary: "Bread is one of the first reliable foods beginners can craft once they stop relying on random animals.",
        quickAnswer:
          "Bread is crafted from 3 wheat on a crafting table or in the 2x2 inventory grid. It is one of the simplest early foods to mass-produce.",
        steps: [
          "Collect wheat from a village field or grow your own with wheat seeds.",
          "Wait until the crop is fully grown before harvesting it.",
          "Place 3 wheat in a horizontal row to craft bread.",
          "Keep some seeds for replanting so your food supply keeps growing.",
          "Use bread as steady travel food while saving better items for emergencies."
        ],
        mistakes: [
          "Breaking early wheat too soon and getting poor results.",
          "Using every harvest immediately instead of replanting part of it.",
          "Depending only on hunting instead of building a repeatable food source."
        ],
        tips: [
          "If you find a village early, bread can solve food problems almost instantly.",
          "Bread is not fancy, but it is stable and beginner-friendly.",
          "A tiny wheat farm plus bread is enough to calm down the early game."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "Bread is made from 3 wheat placed in a straight horizontal row.",
          ingredients: [
            "3 wheat",
            "A crafting table is helpful, but the small 2x2 inventory grid also works"
          ],
          result: "1 bread",
          notes: [
            "Bread is one of the easiest repeatable foods for beginners.",
            "Make sure you keep enough seeds to grow the next harvest."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-brot-in-minecraft",
        title: "Wie macht man Brot in Minecraft?",
        summary: "Brot ist eines der ersten verlasslichen Lebensmittel, sobald du nicht mehr nur von zufalligen Tieren lebst.",
        quickAnswer:
          "Brot wird aus 3 Weizen hergestellt. Du kannst es an der Werkbank oder sogar im kleinen 2x2-Inventarfeld craften.",
        steps: [
          "Sammle Weizen aus einem Dorf oder baue ihn selbst mit Weizensamen an.",
          "Warte, bis die Pflanzen voll ausgewachsen sind.",
          "Lege 3 Weizen in eine waagerechte Reihe, um Brot zu craften.",
          "Behalte genug Samen zum Nachpflanzen.",
          "Nutze Brot als stabiles Reise-Essen und spare starkeres Essen fur Notfalle."
        ],
        mistakes: [
          "Weizen zu fruh abzubauen.",
          "Die ganze Ernte sofort zu essen statt etwas neu anzupflanzen.",
          "Nur auf Jagd zu setzen statt eine wiederholbare Nahrungsquelle aufzubauen."
        ],
        tips: [
          "Wenn du fruh ein Dorf findest, kann Brot dein Essensproblem fast sofort losen.",
          "Brot ist nicht spektakular, aber stabil und anfangerfreundlich.",
          "Eine kleine Weizenfarm plus Brot beruhigt den fruhen Spielstart enorm."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Brot wird aus 3 Weizen in einer geraden waagerechten Reihe hergestellt.",
          ingredients: [
            "3 Weizen",
            "Eine Werkbank ist praktisch, aber auch das kleine 2x2-Inventarfeld reicht"
          ],
          result: "1 Brot",
          notes: [
            "Brot ist eines der einfachsten wiederholbaren Lebensmittel fur Anfanger.",
            "Achte darauf, genug Samen fur die nachste Ernte zu behalten."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-du-pain-dans-minecraft",
        title: "Comment fabriquer du pain dans Minecraft ?",
        summary: "Le pain est l'une des premieres nourritures fiables qu'un debutant peut produire regulierement.",
        quickAnswer:
          "Le pain se fabrique avec 3 bles. Vous pouvez le faire sur une table de craft ou meme dans la petite grille 2x2 de l'inventaire.",
        steps: [
          "Recuperez du ble dans un village ou faites-le pousser avec des graines de ble.",
          "Attendez que la culture soit completement mature avant de la recolter.",
          "Placez 3 ble en ligne horizontale pour fabriquer du pain.",
          "Gardez assez de graines pour replanter.",
          "Utilisez le pain comme nourriture reguliere pendant vos deplacements."
        ],
        mistakes: [
          "Recolter le ble trop tot.",
          "Manger toute la recolte sans replanter une partie.",
          "Compter uniquement sur la chasse au lieu d'une vraie source stable."
        ],
        tips: [
          "Si vous trouvez un village tot, le pain peut regler tres vite le probleme de nourriture.",
          "Le pain n'est pas impressionnant, mais il est stable et facile pour un debutant.",
          "Une petite ferme de ble plus du pain suffit a rendre le debut beaucoup plus calme."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Le pain se fabrique avec 3 ble places sur une ligne horizontale.",
          ingredients: [
            "3 ble",
            "Une table de craft aide, mais la petite grille 2x2 de l'inventaire suffit aussi"
          ],
          result: "1 pain",
          notes: [
            "Le pain est l'une des nourritures repetables les plus simples pour debuter.",
            "Gardez assez de graines pour la prochaine recolte."
          ]
        }
      }
    }
  },
  {
    id: "find-village",
    category: "farming",
    visual: "village",
    pages: {
      en: {
        slug: "how-to-find-a-village-in-minecraft",
        title: "How to Find a Village in Minecraft",
        summary: "Villages are one of the strongest beginner shortcuts, so finding one early is worth real time.",
        quickAnswer:
          "The easiest way to find a village is to travel through open biomes, stay on high ground when possible, and watch for rooftops, paths, farms and hay bales.",
        steps: [
          "Search open areas instead of heavy forests first.",
          "Climb hills regularly to look farther across the terrain.",
          "Watch for straight paths, crop fields, hay bales and roof shapes.",
          "Travel in daylight so you can scan faster and avoid bad fights.",
          "When you find a village, record the coordinates immediately."
        ],
        mistakes: [
          "Wandering through dense terrain with no plan.",
          "Missing an obvious village because you never stop to scan from higher ground.",
          "Finding one and then leaving without noting where it is."
        ],
        tips: [
          "Villages are usually worth more than random exploration at the same stage.",
          "Even one village can give you beds, food, shelter and better stability.",
          "If your world start feels rough, finding a village can reset the whole run."
        ]
      },
      de: {
        slug: "wie-findet-man-ein-dorf-in-minecraft",
        title: "Wie findet man ein Dorf in Minecraft?",
        summary: "Dorfer sind eine der starksten Anfanger-Abkurzungen, deshalb lohnt sich die fruhe Suche wirklich.",
        quickAnswer:
          "Am einfachsten findest du ein Dorf, wenn du offene Biome absuchst, moglichst oft von hoheren Punkten schaust und auf Wege, Felder, Heuballen und Dachformen achtest.",
        steps: [
          "Suche zuerst offene Gebiete statt dichte Walder ab.",
          "Steig regelmaig auf Hugel, um weiter sehen zu konnen.",
          "Achte auf gerade Wege, Felder, Heuballen und typische Dachformen.",
          "Reise tagsuber, damit du schneller scannen und schlechte Kampfe vermeiden kannst.",
          "Notiere die Koordinaten sofort, wenn du ein Dorf gefunden hast."
        ],
        mistakes: [
          "Planlos durch dichtes Gelande zu laufen.",
          "Ein offensichtliches Dorf zu ubersehen, weil du nie von oben schaust.",
          "Ein Dorf zu finden und dann ohne Notiz weiterzugehen."
        ],
        tips: [
          "Dorfer sind in dieser Phase meist wertvoller als zufallige Erkundung.",
          "Schon ein einziges Dorf kann Betten, Essen, Schutz und Stabilitat geben.",
          "Wenn dein Start hart ist, kann ein Dorf den ganzen Run beruhigen."
        ]
      },
      fr: {
        slug: "comment-trouver-un-village-dans-minecraft",
        title: "Comment trouver un village dans Minecraft ?",
        summary: "Les villages sont l'un des plus gros raccourcis pour debutants, donc en trouver un tot vaut vraiment le temps passe.",
        quickAnswer:
          "Le plus simple est de chercher dans les biomes ouverts, de prendre de la hauteur regulierement et de reperer chemins, champs, bottes de foin et toits.",
        steps: [
          "Cherchez d'abord dans les zones ouvertes plutot que dans les forets denses.",
          "Montez souvent sur des collines pour voir plus loin.",
          "Observez les chemins rectilignes, les champs, les bottes de foin et les formes de toits.",
          "Voyagez de jour pour scanner plus vite et eviter les mauvais combats.",
          "Notez les coordonnees des que vous trouvez un village."
        ],
        mistakes: [
          "Errer dans un terrain dense sans plan.",
          "Rater un village evident parce qu'on ne prend jamais de hauteur.",
          "Trouver un village puis repartir sans noter son emplacement."
        ],
        tips: [
          "A ce stade, un village vaut souvent plus qu'une exploration au hasard.",
          "Un seul village peut donner des lits, de la nourriture, un abri et plus de stabilite.",
          "Si votre debut est difficile, trouver un village peut relancer toute la partie."
        ]
      }
    }
  },
  {
    id: "door-guide",
    category: "path",
    visual: "doorGuide",
    pages: {
      en: {
        slug: "how-to-make-a-door-in-minecraft",
        title: "How to Make a Door in Minecraft",
        summary: "A door sounds basic, but beginners often delay it and leave their first shelter much less safe than it should be.",
        quickAnswer:
          "A door is crafted from 6 wooden planks arranged in two vertical columns of three. It is one of the fastest safety upgrades for a starter shelter.",
        steps: [
          "Turn logs into wooden planks first.",
          "Place 6 planks in two full vertical columns on a crafting table.",
          "Put the door at the entrance of your shelter or starter house.",
          "Light the inside with torches so the shelter stays safe after dark.",
          "Use the door to control where you enter and leave instead of leaving a hole open."
        ],
        mistakes: [
          "Building a first shelter with no real entrance control.",
          "Leaving the house open and assuming walls alone are enough.",
          "Forgetting torches and making the inside unsafe anyway."
        ],
        tips: [
          "A door makes a tiny shelter feel much more secure immediately.",
          "Your first home does not need style, but it does need closure.",
          "If you are panicking at sunset, a fast door is better than a perfect base."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A wooden door is made from 6 wooden planks arranged in two vertical columns.",
          ingredients: [
            "6 wooden planks",
            "A crafting table"
          ],
          result: "3 doors",
          notes: [
            "Doors are simple, cheap and very useful in the early game.",
            "Put one on your shelter before you start worrying about decoration."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-eine-tur-in-minecraft",
        title: "Wie macht man eine Tur in Minecraft?",
        summary: "Eine Tur klingt banal, aber viele Anfanger verzichten zu lange darauf und machen den ersten Schutzraum unnötig unsicher.",
        quickAnswer:
          "Eine Tur wird aus 6 Holzbrettern hergestellt, angeordnet in zwei senkrechten Dreier-Spalten. Sie ist eines der schnellsten Sicherheits-Upgrades fur den Start.",
        steps: [
          "Verwandle zuerst Holz in Holzbretter.",
          "Lege 6 Bretter in zwei volle senkrechte Spalten auf der Werkbank.",
          "Setze die Tur an den Eingang deines Schutzraums oder Starthauses.",
          "Beleuchte innen mit Fackeln, damit der Raum nachts sicher bleibt.",
          "Nutze die Tur, um Ein- und Ausgang zu kontrollieren statt ein offenes Loch zu lassen."
        ],
        mistakes: [
          "Einen ersten Schutzraum ohne echten Eingang zu bauen.",
          "Das Haus offen zu lassen und zu glauben, Wande allein reichen.",
          "Fackeln zu vergessen und das Innere trotzdem unsicher zu machen."
        ],
        tips: [
          "Eine Tur macht selbst einen winzigen Schutzraum sofort sicherer.",
          "Dein erstes Haus braucht keinen Stil, aber einen ordentlichen Abschluss.",
          "Wenn die Sonne untergeht, ist eine schnelle Tur besser als eine perfekte Basis."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Eine Holztur wird aus 6 Holzbrettern in zwei senkrechten Spalten hergestellt.",
          ingredients: [
            "6 Holzbretter",
            "Eine Werkbank"
          ],
          result: "3 Turen",
          notes: [
            "Turen sind einfach, billig und im fruhen Spiel sehr nützlich.",
            "Setze zuerst eine Tur, bevor du uber Deko nachdenkst."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-une-porte-dans-minecraft",
        title: "Comment fabriquer une porte dans Minecraft ?",
        summary: "Une porte parait basique, mais les debutants la retardent souvent et rendent leur premier abri beaucoup moins sur qu'il ne devrait l'etre.",
        quickAnswer:
          "Une porte se fabrique avec 6 planches de bois placees en deux colonnes verticales de trois. C'est l'un des upgrades de securite les plus rapides du debut.",
        steps: [
          "Transformez d'abord le bois en planches.",
          "Placez 6 planches en deux colonnes verticales completes sur la table de craft.",
          "Mettez la porte a l'entree de votre abri ou maison de depart.",
          "Eclairez l'interieur avec des torches pour garder l'abri sur la nuit.",
          "Utilisez la porte pour controler l'entree et la sortie au lieu de laisser un trou ouvert."
        ],
        mistakes: [
          "Construire un premier abri sans vraie entree.",
          "Laisser la maison ouverte en pensant que les murs suffisent.",
          "Oublier les torches et laisser l'interieur dangereux."
        ],
        tips: [
          "Une porte rend immediatement un petit abri beaucoup plus rassurant.",
          "Votre premiere maison n'a pas besoin d'etre belle, mais elle doit fermer.",
          "Si le soleil se couche, une porte rapide vaut mieux qu'une base parfaite."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Une porte en bois se fabrique avec 6 planches placees en deux colonnes verticales.",
          ingredients: [
            "6 planches de bois",
            "Une table de craft"
          ],
          result: "3 portes",
          notes: [
            "Les portes sont simples, peu cheres et tres utiles au debut.",
            "Installez-en une avant de penser a la decoration."
          ]
        }
      }
    }
  },
  {
    id: "stone-pickaxe-guide",
    category: "resources",
    visual: "stonePickaxeGuide",
    pages: {
      en: {
        slug: "how-to-make-a-stone-pickaxe-in-minecraft",
        title: "How to Make a Stone Pickaxe in Minecraft",
        summary: "This is the first real upgrade that starts almost every serious Minecraft run.",
        quickAnswer:
          "A stone pickaxe is crafted from 3 cobblestone and 2 sticks on a crafting table. It is the minimum tool for safe early progression into iron.",
        steps: [
          "Make a wooden pickaxe first so you can mine stone.",
          "Mine at least 3 cobblestone blocks.",
          "Craft 2 sticks from planks if you do not already have them.",
          "Place 3 cobblestone on the top row and 2 sticks down the middle column.",
          "Use the stone pickaxe for better mining speed and to collect iron."
        ],
        mistakes: [
          "Staying with wooden tools too long.",
          "Entering caves before upgrading from wood to stone.",
          "Forgetting that iron ore needs at least a stone pickaxe."
        ],
        tips: [
          "The stone pickaxe is one of the biggest power jumps in the first minutes.",
          "Upgrade to stone almost immediately after making your first crafting table.",
          "Without this tool, early mining stays slow and risky."
        ],
        crafting: {
          title: "Crafting recipe",
          intro:
            "A stone pickaxe is made from 3 cobblestone and 2 sticks on a crafting table.",
          ingredients: [
            "3 cobblestone",
            "2 sticks"
          ],
          result: "1 stone pickaxe",
          notes: [
            "This is the tool that unlocks practical early mining.",
            "Use it before you start trying to collect iron."
          ]
        }
      },
      de: {
        slug: "wie-macht-man-eine-steinspitzhacke-in-minecraft",
        title: "Wie macht man eine Steinspitzhacke in Minecraft?",
        summary: "Das ist das erste echte Upgrade, mit dem fast jeder ernsthafte Minecraft-Start beginnt.",
        quickAnswer:
          "Eine Steinspitzhacke wird aus 3 Bruchstein und 2 Stocken an der Werkbank hergestellt. Sie ist das Mindestwerkzeug fur den sicheren Weg zu Eisen.",
        steps: [
          "Baue zuerst eine Holzspitzhacke, um Stein abbauen zu konnen.",
          "Sammle mindestens 3 Bruchstein.",
          "Crafte 2 Stocke aus Brettern, falls du noch keine hast.",
          "Lege 3 Bruchstein oben und 2 Stocke in die mittlere Spalte.",
          "Nutze die Steinspitzhacke fur schnelleres Mining und um Eisen zu sammeln."
        ],
        mistakes: [
          "Zu lange bei Holzwerkzeugen zu bleiben.",
          "In Hohlen zu gehen, bevor du von Holz auf Stein upgradest.",
          "Zu vergessen, dass Eisenerz mindestens eine Steinspitzhacke braucht."
        ],
        tips: [
          "Die Steinspitzhacke ist einer der groten Kraftsprunge in den ersten Minuten.",
          "Upgrade fast sofort auf Stein, nachdem du deine erste Werkbank gebaut hast.",
          "Ohne dieses Werkzeug bleibt fruhes Mining langsam und gefahrlich."
        ],
        crafting: {
          title: "Crafting-Rezept",
          intro:
            "Eine Steinspitzhacke wird aus 3 Bruchstein und 2 Stocken an der Werkbank hergestellt.",
          ingredients: [
            "3 Bruchstein",
            "2 Stocke"
          ],
          result: "1 Steinspitzhacke",
          notes: [
            "Dieses Werkzeug schaltet praktisches fruhes Mining erst richtig frei.",
            "Nutze sie, bevor du ernsthaft Eisen sammeln willst."
          ]
        }
      },
      fr: {
        slug: "comment-fabriquer-une-pioche-en-pierre-dans-minecraft",
        title: "Comment fabriquer une pioche en pierre dans Minecraft ?",
        summary: "C'est le premier vrai upgrade sur lequel reposent presque tous les debuts de partie serieux.",
        quickAnswer:
          "Une pioche en pierre se fabrique avec 3 cobblestone et 2 batons sur une table de craft. C'est l'outil minimum pour progresser vers le fer.",
        steps: [
          "Fabriquez d'abord une pioche en bois pour pouvoir miner la pierre.",
          "Recuperez au moins 3 blocs de cobblestone.",
          "Fabriquez 2 batons avec des planches si besoin.",
          "Placez 3 cobblestone en haut et 2 batons dans la colonne centrale.",
          "Utilisez la pioche en pierre pour miner plus vite et recolter du fer."
        ],
        mistakes: [
          "Rester trop longtemps avec des outils en bois.",
          "Entrer dans les grottes avant de passer du bois a la pierre.",
          "Oublier que le minerai de fer demande au minimum une pioche en pierre."
        ],
        tips: [
          "La pioche en pierre est l'un des plus gros gains de puissance des premieres minutes.",
          "Passez a la pierre presque juste apres votre premiere table de craft.",
          "Sans cet outil, le debut du minage reste lent et risqué."
        ],
        crafting: {
          title: "Recette de fabrication",
          intro:
            "Une pioche en pierre se fabrique avec 3 cobblestone et 2 batons sur une table de craft.",
          ingredients: [
            "3 cobblestone",
            "2 batons"
          ],
          result: "1 pioche en pierre",
          notes: [
            "C'est l'outil qui debloque vraiment le minage utile du debut.",
            "Utilisez-la avant de chercher serieusement du fer."
          ]
        }
      }
    }
  },
  {
    id: "ender-dragon-prep",
    category: "progression",
    visual: "enderDragon",
    pages: {
      en: {
        slug: "how-to-prepare-for-the-ender-dragon-in-minecraft",
        title: "How to Prepare for the Ender Dragon in Minecraft",
        summary: "The Ender Dragon should feel like a planned expedition, not a random panic fight you entered too early.",
        quickAnswer:
          "Before fighting the Ender Dragon, make sure your gear, food, backup plan and portal knowledge are stable. The real goal is preparation, not bravery.",
        steps: [
          "Do not rush toward the End just because you finally can.",
          "Bring strong food, spare blocks and a clear route back through your portal plan.",
          "Make sure your tools and armor are no longer barely good enough.",
          "Use your earlier survival habits: note locations, store backups and avoid improvising under pressure.",
          "Treat the dragon fight like the end of a long preparation line, not the beginning of one."
        ],
        mistakes: [
          "Trying the fight as soon as progression becomes technically possible.",
          "Entering with weak supplies and no recovery plan.",
          "Thinking courage matters more than logistics."
        ],
        tips: [
          "The Ender Dragon is much easier when everything before it is already organized.",
          "A calm prepared run beats a dramatic underprepared one.",
          "If the fight feels scary, that often means the preparation is still incomplete."
        ]
      },
      de: {
        slug: "wie-bereitet-man-sich-auf-den-enderdrachen-vor-in-minecraft",
        title: "Wie bereitet man sich auf den Enderdrachen vor in Minecraft?",
        summary: "Der Enderdrache sollte sich wie eine geplante Expedition anfuhlen und nicht wie ein Panikkampf, den du zu fruh begonnen hast.",
        quickAnswer:
          "Bevor du gegen den Enderdrachen kampfst, mussen Ausrustung, Essen, Notfallplan und Portalwissen stabil sein. Entscheidend ist Vorbereitung, nicht Mut.",
        steps: [
          "Hetze nicht ins Ende, nur weil es technisch moglich geworden ist.",
          "Nimm starkes Essen, Ersatzblocke und einen klaren Ruckweg mit.",
          "Achte darauf, dass Werkzeuge und Rustung nicht mehr nur gerade so ausreichen.",
          "Nutze deine bisherigen Uberlebensregeln: Orte notieren, Backups lagern und nicht unter Druck improvisieren.",
          "Sieh den Drachenkampf als Abschluss einer langen Vorbereitung, nicht als deren Anfang."
        ],
        mistakes: [
          "Den Kampf zu versuchen, sobald der Fortschritt es gerade erlaubt.",
          "Mit schwachen Vorraten und ohne Rettungsplan hineinzugehen.",
          "Zu glauben, Mut sei wichtiger als Organisation."
        ],
        tips: [
          "Der Enderdrache ist viel leichter, wenn davor schon alles geordnet ist.",
          "Ein ruhiger vorbereiteter Run ist besser als ein dramatischer unvorbereiteter.",
          "Wenn sich der Kampf zu gefahrlich anfuhlt, ist oft die Vorbereitung noch nicht fertig."
        ]
      },
      fr: {
        slug: "comment-se-preparer-a-lender-dragon-dans-minecraft",
        title: "Comment se preparer a l'Ender Dragon dans Minecraft ?",
        summary: "L'Ender Dragon devrait ressembler a une expedition preparee, pas a un combat panique commence trop tot.",
        quickAnswer:
          "Avant d'affronter l'Ender Dragon, votre equipement, votre nourriture, votre plan de secours et votre gestion des portails doivent etre solides. L'important, c'est la preparation.",
        steps: [
          "Ne vous precipitez pas vers l'End juste parce que vous pouvez enfin y aller.",
          "Prenez de la bonne nourriture, des blocs de reserve et un vrai plan de retour.",
          "Assurez-vous que vos outils et votre armure ne sont plus simplement 'a peine suffisants'.",
          "Appliquez vos bonnes habitudes: noter les lieux, stocker des reserves et eviter d'improviser sous pression.",
          "Considerez le combat contre le dragon comme l'aboutissement d'une longue preparation."
        ],
        mistakes: [
          "Tenter le combat des que la progression le rend possible.",
          "Entrer avec peu de ressources et sans plan de recuperation.",
          "Croire que le courage compte plus que la logistique."
        ],
        tips: [
          "L'Ender Dragon devient bien plus simple quand tout ce qui vient avant est deja organise.",
          "Une partie calme et preparee vaut mieux qu'une tentative dramatique et mal preparee.",
          "Si le combat semble trop effrayant, c'est souvent que la preparation n'est pas encore assez solide."
        ]
      }
    }
  }
];

const locales = ["en", "de", "fr"];

const infoPages = {
  about: {
    en: {
      slug: "about",
      title: "About Minecraft For Beginners",
      summary:
        "Why this site exists, who it is for, and how the guides are written for complete beginners.",
      body: [
        "Minecraft For Beginners is a three-language guide project built for people who are still confused by Minecraft after the first few hours.",
        "The goal is simple: answer one beginner problem at a time in plain language, with visual help for key in-game items, blocks and places.",
        "This site is written for new players in English, German and French, with a strong focus on the early game, survival basics and practical progression.",
        "We prefer short, actionable guides over wiki-style overload. If a guide cannot help a beginner do the next step, it needs to be improved."
      ]
    },
    de: {
      slug: "uber-das-projekt",
      title: "Uber Minecraft For Beginners",
      summary:
        "Warum diese Website existiert, fur wen sie gedacht ist und wie die Inhalte fur komplette Anfanger aufgebaut sind.",
      body: [
        "Minecraft For Beginners ist ein dreisprachiges Guide-Projekt fur Menschen, die sich nach den ersten Stunden in Minecraft noch immer verloren fuhlen.",
        "Das Ziel ist einfach: immer nur ein Anfangerproblem klar und in einfacher Sprache losen, mit visueller Hilfe fur wichtige Begriffe aus dem Spiel.",
        "Die Inhalte richten sich an neue Spieler in Englisch, Deutsch und Franzosisch, mit starkem Fokus auf fruhes Uberleben und praktischen Fortschritt.",
        "Wir bevorzugen kurze, nutzliche Guides statt uberladener Wiki-Texte. Wenn ein Beitrag einem Anfanger nicht beim nachsten Schritt hilft, muss er besser werden."
      ]
    },
    fr: {
      slug: "a-propos",
      title: "A propos de Minecraft For Beginners",
      summary:
        "Pourquoi ce site existe, a qui il s'adresse et comment les guides sont construits pour de vrais debutants.",
      body: [
        "Minecraft For Beginners est un projet de guides en trois langues pour les personnes qui se sentent encore perdues dans Minecraft apres leurs premieres heures de jeu.",
        "L'objectif est simple: resoudre un probleme de debutant a la fois, avec un langage clair et une aide visuelle pour les objets, blocs et lieux du jeu.",
        "Le site s'adresse aux nouveaux joueurs en anglais, allemand et francais, avec un accent fort sur la survie du debut et une progression pratique.",
        "Nous preferons des guides courts et utiles plutot qu'un style wiki surcharge. Si un guide n'aide pas un debutant a faire le prochain pas, il doit etre ameliore."
      ]
    }
  },
  privacy: {
    en: {
      slug: "privacy-policy",
      title: "Privacy Policy",
      summary:
        "Basic privacy information for visitors, including analytics, advertising preparation and contact handling.",
      body: [
        "Minecraft For Beginners may collect limited technical information such as browser type, pages viewed, device information and approximate location through standard website analytics tools.",
        "If advertising tools such as Google AdSense are connected in the future, third parties may use cookies or similar technologies to serve and measure ads.",
        "If you contact the site directly, the information you send is used only to respond to your message or manage the site.",
        "By using the site, you understand that basic operational and analytics data may be processed to improve content, performance and monetization."
      ]
    },
    de: {
      slug: "datenschutz",
      title: "Datenschutz",
      summary:
        "Grundlegende Datenschutzinformationen fur Besucher, einschlielich Analyse, Werbevorbereitung und Kontaktanfragen.",
      body: [
        "Minecraft For Beginners kann begrenzte technische Informationen wie Browsertyp, besuchte Seiten, Gerateinformationen und ungefahren Standort uber ublichen Analyse-Tools erfassen.",
        "Falls in Zukunft Werbetools wie Google AdSense verbunden werden, konnen Dritte Cookies oder ahnliche Technologien zur Ausspielung und Messung von Anzeigen verwenden.",
        "Wenn du die Website direkt kontaktierst, werden deine Angaben nur zur Beantwortung deiner Nachricht oder zur Verwaltung der Website genutzt.",
        "Mit der Nutzung der Website erkennst du an, dass grundlegende Betriebs- und Analysedaten verarbeitet werden konnen, um Inhalte, Leistung und Monetarisierung zu verbessern."
      ]
    },
    fr: {
      slug: "politique-de-confidentialite",
      title: "Politique de confidentialite",
      summary:
        "Informations de base sur la confidentialite des visiteurs, y compris l'analyse, la preparation publicitaire et la gestion des messages.",
      body: [
        "Minecraft For Beginners peut collecter des informations techniques limitees comme le type de navigateur, les pages consultees, l'appareil utilise et une localisation approximative via des outils d'analyse standard.",
        "Si des outils publicitaires comme Google AdSense sont connectes plus tard, des tiers pourront utiliser des cookies ou technologies similaires pour afficher et mesurer des annonces.",
        "Si vous contactez directement le site, les informations envoyees sont utilisees uniquement pour repondre a votre message ou gerer le site.",
        "En utilisant le site, vous acceptez que des donnees techniques et analytiques de base puissent etre traitees pour ameliorer le contenu, la performance et la monetisation."
      ]
    }
  },
  contact: {
    en: {
      slug: "contact",
      title: "Contact",
      summary:
        "How to reach the site owner for corrections, feedback, advertising questions or content suggestions.",
      body: [
        "If you want to report a mistake, suggest a guide topic or ask about the project, use the contact email below.",
        "For advertising, collaboration or site questions, you can use a placeholder address until a final business email is set up.",
        "Recommended contact address: hello@minecraftforbeginners.example",
        "Until a dedicated support system is added, replies may be delayed."
      ]
    },
    de: {
      slug: "kontakt",
      title: "Kontakt",
      summary:
        "So erreichst du den Betreiber fur Korrekturen, Feedback, Werbeanfragen oder Themenvorschlage.",
      body: [
        "Wenn du einen Fehler melden, ein Thema vorschlagen oder eine Frage zum Projekt stellen willst, nutze die unten genannte Kontaktadresse.",
        "Fur Werbung, Zusammenarbeit oder allgemeine Website-Fragen kannst du vorerst eine Platzhalter-Adresse verwenden, bis eine endgultige Business-Mail eingerichtet ist.",
        "Empfohlene Kontaktadresse: hello@minecraftforbeginners.example",
        "Bis ein richtiges Support-System eingerichtet ist, konnen Antworten etwas dauern."
      ]
    },
    fr: {
      slug: "contact",
      title: "Contact",
      summary:
        "Comment joindre le responsable du site pour une correction, un retour, une question publicitaire ou une suggestion de contenu.",
      body: [
        "Si vous voulez signaler une erreur, proposer un sujet de guide ou poser une question sur le projet, utilisez l'adresse de contact ci-dessous.",
        "Pour la publicite, une collaboration ou une question generale, vous pouvez utiliser une adresse provisoire jusqu'a la mise en place d'un email definitif.",
        "Adresse de contact recommandee: hello@minecraftforbeginners.example",
        "Tant qu'un vrai systeme de support n'est pas en place, les reponses peuvent prendre un peu de temps."
      ]
    }
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const gameTermCatalog = [
  {
    key: "craftingTable",
    images: ["crafting_table_front.png"],
    locales: {
      en: { label: "Crafting table", aliases: ["crafting table", "crafting tables"] },
      de: { label: "Werkbank", aliases: ["werkbank", "werkbanken"] },
      fr: { label: "Table de craft", aliases: ["table de craft", "tables de craft"] }
    }
  },
  {
    key: "furnace",
    images: ["furnace_front.png"],
    locales: {
      en: { label: "Furnace", aliases: ["furnace", "furnaces"] },
      de: { label: "Ofen", aliases: ["ofen", "ofenblock", "ofenblocks"] },
      fr: { label: "Four", aliases: ["four", "fours"] }
    }
  },
  {
    key: "chest",
    images: ["chest.png"],
    locales: {
      en: { label: "Chest", aliases: ["chest", "chests"] },
      de: { label: "Truhe", aliases: ["truhe", "truhen"] },
      fr: { label: "Coffre", aliases: ["coffre", "coffres"] }
    }
  },
  {
    key: "coal",
    images: ["coal.png"],
    locales: {
      en: { label: "Coal", aliases: ["coal"] },
      de: { label: "Kohle", aliases: ["kohle"] },
      fr: { label: "Charbon", aliases: ["charbon"] }
    }
  },
  {
    key: "charcoal",
    images: ["charcoal.png"],
    locales: {
      en: { label: "Charcoal", aliases: ["charcoal"] },
      de: { label: "Holzkohle", aliases: ["holzkohle"] },
      fr: { label: "Charbon de bois", aliases: ["charbon de bois"] }
    }
  },
  {
    key: "coalOre",
    images: ["coal_ore.png"],
    locales: {
      en: { label: "Coal ore", aliases: ["coal ore"] },
      de: { label: "Kohleerz", aliases: ["kohleerz"] },
      fr: { label: "Minerai de charbon", aliases: ["minerai de charbon"] }
    }
  },
  {
    key: "ironOre",
    images: ["iron_ore.png"],
    locales: {
      en: { label: "Iron ore", aliases: ["iron ore"] },
      de: { label: "Eisenerz", aliases: ["eisenerz"] },
      fr: { label: "Minerai de fer", aliases: ["minerai de fer"] }
    }
  },
  {
    key: "rawIron",
    images: ["raw_iron.png"],
    locales: {
      en: { label: "Raw iron", aliases: ["raw iron"] },
      de: { label: "Roheisen", aliases: ["roheisen"] },
      fr: { label: "Fer brut", aliases: ["fer brut"] }
    }
  },
  {
    key: "ironIngot",
    images: ["iron_ingot.png"],
    locales: {
      en: { label: "Iron ingot", aliases: ["iron ingot", "iron ingots"] },
      de: { label: "Eisenbarren", aliases: ["eisenbarren"] },
      fr: { label: "Lingot de fer", aliases: ["lingot de fer", "lingots de fer"] }
    }
  },
  {
    key: "torch",
    images: ["torch.png"],
    locales: {
      en: { label: "Torch", aliases: ["torch", "torches"] },
      de: { label: "Fackel", aliases: ["fackel", "fackeln"] },
      fr: { label: "Torche", aliases: ["torche", "torches"] }
    }
  },
  {
    key: "oakLog",
    images: ["oak_log.png"],
    locales: {
      en: { label: "Wood log", aliases: ["wood log", "wood logs", "log", "logs"] },
      de: { label: "Holzstamm", aliases: ["holzstamm", "holzstamme"] },
      fr: { label: "Tronc", aliases: ["tronc", "troncs de bois", "tronc de bois"] }
    }
  },
  {
    key: "oakPlanks",
    images: ["oak_planks.png"],
    locales: {
      en: { label: "Wooden planks", aliases: ["wooden planks", "planks"] },
      de: { label: "Holzbretter", aliases: ["holzbretter", "bretter"] },
      fr: { label: "Planches", aliases: ["planches", "planches de bois"] }
    }
  },
  {
    key: "bed",
    images: ["red_bed.png"],
    locales: {
      en: { label: "Bed", aliases: ["bed", "beds"] },
      de: { label: "Bett", aliases: ["bett", "betten"] },
      fr: { label: "Lit", aliases: ["lit", "lits"] }
    }
  },
  {
    key: "village",
    images: ["oak_door_bottom.png", "red_bed.png", "hay_block_top.png"],
    locales: {
      en: { label: "Village", aliases: ["village", "villages"] },
      de: { label: "Dorf", aliases: ["dorf", "dorfer"] },
      fr: { label: "Village", aliases: ["village", "villages"] }
    }
  },
  {
    key: "villager",
    images: ["oak_door_bottom.png", "red_bed.png", "hay_block_top.png"],
    locales: {
      en: { label: "Villager", aliases: ["villager", "villagers"] },
      de: { label: "Dorfbewohner", aliases: ["dorfbewohner", "dorfbewohnern"] },
      fr: { label: "Villageois", aliases: ["villageois", "villageoise", "villageoises"] }
    }
  },
  {
    key: "hay",
    images: ["hay_block_top.png"],
    locales: {
      en: { label: "Hay bale", aliases: ["hay bale", "hay bales"] },
      de: { label: "Heuballen", aliases: ["heuballen"] },
      fr: { label: "Botte de foin", aliases: ["botte de foin", "bottes de foin"] }
    }
  },
  {
    key: "coordinates",
    images: ["map.png", "compass_00.png"],
    locales: {
      en: { label: "Coordinates", aliases: ["coordinates"] },
      de: { label: "Koordinaten", aliases: ["koordinaten"] },
      fr: { label: "Coordonnees", aliases: ["coordonnees"] }
    }
  },
  {
    key: "map",
    images: ["map.png"],
    locales: {
      en: { label: "Map", aliases: ["map", "maps"] },
      de: { label: "Karte", aliases: ["karte", "karten"] },
      fr: { label: "Carte", aliases: ["carte", "cartes"] }
    }
  },
  {
    key: "compass",
    images: ["compass_00.png"],
    locales: {
      en: { label: "Compass", aliases: ["compass"] },
      de: { label: "Kompass", aliases: ["kompass"] },
      fr: { label: "Boussole", aliases: ["boussole"] }
    }
  },
  {
    key: "door",
    images: ["oak_door_bottom.png"],
    locales: {
      en: { label: "Door", aliases: ["door", "doors"] },
      de: { label: "Tur", aliases: ["tur", "turen"] },
      fr: { label: "Porte", aliases: ["porte", "portes"] }
    }
  },
  {
    key: "cobblestone",
    images: ["cobblestone.png"],
    locales: {
      en: { label: "Cobblestone", aliases: ["cobblestone"] },
      de: { label: "Bruchstein", aliases: ["bruchstein"] },
      fr: { label: "Cobblestone", aliases: ["cobblestone"] }
    }
  },
  {
    key: "stonePickaxe",
    images: ["stone_pickaxe.png"],
    locales: {
      en: { label: "Stone pickaxe", aliases: ["stone pickaxe", "stone tools"] },
      de: { label: "Steinspitzhacke", aliases: ["steinspitzhacke", "steinwerkzeuge"] },
      fr: { label: "Pioche en pierre", aliases: ["pioche en pierre", "outils en pierre"] }
    }
  },
  {
    key: "stoneAxe",
    images: ["stone_axe.png"],
    locales: {
      en: { label: "Stone axe", aliases: ["stone axe"] },
      de: { label: "Steinaxt", aliases: ["steinaxt"] },
      fr: { label: "Hache en pierre", aliases: ["hache en pierre"] }
    }
  },
  {
    key: "woodenPickaxe",
    images: ["wooden_pickaxe.png"],
    locales: {
      en: { label: "Wooden pickaxe", aliases: ["wooden pickaxe"] },
      de: { label: "Holzspitzhacke", aliases: ["holzspitzhacke"] },
      fr: { label: "Pioche en bois", aliases: ["pioche en bois"] }
    }
  },
  {
    key: "woodenSword",
    images: ["wooden_sword.png"],
    locales: {
      en: { label: "Wooden sword", aliases: ["wooden sword"] },
      de: { label: "Holzschwert", aliases: ["holzschwert"] },
      fr: { label: "Epee en bois", aliases: ["epee en bois"] }
    }
  },
  {
    key: "wheatSeeds",
    images: ["wheat_seeds.png"],
    locales: {
      en: { label: "Wheat seeds", aliases: ["wheat seeds", "seeds"] },
      de: { label: "Weizensamen", aliases: ["weizensamen", "samen"] },
      fr: { label: "Graines de ble", aliases: ["graines de ble"] }
    }
  },
  {
    key: "shield",
    images: ["iron_ingot.png", "oak_planks.png", "wooden_sword.png"],
    locales: {
      en: { label: "Shield", aliases: ["shield"] },
      de: { label: "Schild", aliases: ["schild"] },
      fr: { label: "Bouclier", aliases: ["bouclier"] }
    }
  },
  {
    key: "stick",
    images: ["stick.png"],
    locales: {
      en: { label: "Stick", aliases: ["stick", "sticks"] },
      de: { label: "Stock", aliases: ["stock", "stocke"] },
      fr: { label: "Baton", aliases: ["baton", "batons"] }
    }
  },
  {
    key: "wool",
    images: ["white_wool.png"],
    locales: {
      en: { label: "Wool", aliases: ["wool"] },
      de: { label: "Wolle", aliases: ["wolle"] },
      fr: { label: "Laine", aliases: ["laine", "laines"] }
    }
  },
  {
    key: "sheep",
    images: ["white_wool.png", "red_bed.png"],
    locales: {
      en: { label: "Sheep", aliases: ["sheep"] },
      de: { label: "Schaf", aliases: ["schaf", "schafe", "schafen"] },
      fr: { label: "Mouton", aliases: ["mouton", "moutons"] }
    }
  },
  {
    key: "axe",
    images: ["wooden_axe.png"],
    locales: {
      en: { label: "Axe", aliases: ["axe", "axes"] },
      de: { label: "Axt", aliases: ["axt", "axte"] },
      fr: { label: "Hache", aliases: ["hache", "haches"] }
    }
  },
  {
    key: "shovel",
    images: ["wooden_shovel.png"],
    locales: {
      en: { label: "Shovel", aliases: ["shovel", "shovels"] },
      de: { label: "Schaufel", aliases: ["schaufel", "schaufeln"] },
      fr: { label: "Pelle", aliases: ["pelle", "pelles"] }
    }
  },
  {
    key: "pickaxe",
    images: ["stone_pickaxe.png"],
    locales: {
      en: { label: "Pickaxe", aliases: ["pickaxe", "pickaxes"] },
      de: { label: "Spitzhacke", aliases: ["spitzhacke", "spitzhacken"] },
      fr: { label: "Pioche", aliases: ["pioche", "pioches"] }
    }
  },
  {
    key: "farm",
    images: ["wheat_seeds.png", "hay_block_top.png"],
    locales: {
      en: { label: "Farm", aliases: ["farm", "farms", "farmland"] },
      de: { label: "Farm", aliases: ["farm", "farmen", "ackerboden"] },
      fr: { label: "Ferme", aliases: ["ferme", "fermes", "terre agricole"] }
    }
  },
  {
    key: "wheat",
    images: ["wheat_seeds.png", "hay_block_top.png"],
    locales: {
      en: { label: "Wheat", aliases: ["wheat"] },
      de: { label: "Weizen", aliases: ["weizen"] },
      fr: { label: "Ble", aliases: ["ble"] }
    }
  },
  {
    key: "food",
    images: ["cooked_beef.png"],
    locales: {
      en: { label: "Food", aliases: ["food"] },
      de: { label: "Essen", aliases: ["essen", "nahrung"] },
      fr: { label: "Nourriture", aliases: ["nourriture"] }
    }
  },
  {
    key: "beef",
    images: ["beef.png", "cooked_beef.png"],
    locales: {
      en: { label: "Beef", aliases: ["beef", "raw beef", "cooked beef"] },
      de: { label: "Rindfleisch", aliases: ["rindfleisch"] },
      fr: { label: "Boeuf", aliases: ["boeuf", "boeuf cru", "boeuf cuit"] }
    }
  },
  {
    key: "sand",
    images: ["sand.png"],
    locales: {
      en: { label: "Sand", aliases: ["sand"] },
      de: { label: "Sand", aliases: ["sand"] },
      fr: { label: "Sable", aliases: ["sable"] }
    }
  },
  {
    key: "glass",
    images: ["glass.png"],
    locales: {
      en: { label: "Glass", aliases: ["glass"] },
      de: { label: "Glas", aliases: ["glas"] },
      fr: { label: "Verre", aliases: ["verre"] }
    }
  },
  {
    key: "grass",
    images: ["grass_block_top.png", "grass_block_side.png"],
    locales: {
      en: { label: "Grass", aliases: ["grass"] },
      de: { label: "Gras", aliases: ["gras"] },
      fr: { label: "Herbe", aliases: ["herbe"] }
    }
  },
  {
    key: "cave",
    images: ["stone.png", "torch.png"],
    locales: {
      en: { label: "Cave", aliases: ["cave", "caves"] },
      de: { label: "Hohle", aliases: ["hohle", "hohlen"] },
      fr: { label: "Grotte", aliases: ["grotte", "grottes"] }
    }
  },
  {
    key: "shelter",
    images: ["oak_door_bottom.png", "torch.png", "dirt.png"],
    locales: {
      en: { label: "Shelter", aliases: ["shelter"] },
      de: { label: "Unterschlupf", aliases: ["unterschlupf"] },
      fr: { label: "Abri", aliases: ["abri", "abris"] }
    }
  },
  {
    key: "house",
    images: ["oak_door_bottom.png", "chest.png", "red_bed.png"],
    locales: {
      en: { label: "House", aliases: ["house", "starter house", "base"] },
      de: { label: "Haus", aliases: ["haus", "starthaus", "basis"] },
      fr: { label: "Maison", aliases: ["maison", "maison de depart", "base"] }
    }
  },
  {
    key: "nether",
    images: ["map.png", "torch.png", "iron_ingot.png"],
    locales: {
      en: { label: "Nether", aliases: ["nether"] },
      de: { label: "Nether", aliases: ["nether"] },
      fr: { label: "Nether", aliases: ["nether"] }
    }
  },
  {
    key: "portal",
    images: ["map.png", "compass_00.png", "torch.png"],
    locales: {
      en: { label: "Portal", aliases: ["portal", "portals", "nether portal"] },
      de: { label: "Portal", aliases: ["portal", "portale", "nether-portal"] },
      fr: { label: "Portail", aliases: ["portail", "portails", "portail du nether"] }
    }
  },
  {
    key: "blocks",
    images: ["cobblestone.png", "oak_planks.png", "dirt.png"],
    locales: {
      en: { label: "Blocks", aliases: ["block", "blocks", "building blocks"] },
      de: { label: "Blocke", aliases: ["blocke", "blocken", "baublocke"] },
      fr: { label: "Blocs", aliases: ["bloc", "blocs", "blocs de construction"] }
    }
  },
  {
    key: "bread",
    images: ["hay_block_top.png", "wheat_seeds.png"],
    locales: {
      en: { label: "Bread", aliases: ["bread"] },
      de: { label: "Brot", aliases: ["brot"] },
      fr: { label: "Pain", aliases: ["pain"] }
    }
  },
  {
    key: "wheat",
    images: ["wheat_seeds.png", "hay_block_top.png"],
    locales: {
      en: { label: "Wheat", aliases: ["wheat"] },
      de: { label: "Weizen", aliases: ["weizen"] },
      fr: { label: "Ble", aliases: ["ble"] }
    }
  }
];

const gameTermsByLocale = Object.fromEntries(
  locales.map((locale) => [
    locale,
    gameTermCatalog.map((entry) => ({
      key: entry.key,
      label: entry.locales[locale].label,
      aliases: entry.locales[locale].aliases,
      images: entry.images
    }))
  ])
);

const gameTermLookup = Object.fromEntries(
  locales.map((locale) => {
    const pairs = [];
    for (const def of gameTermsByLocale[locale]) {
      for (const alias of def.aliases) {
        pairs.push([alias.toLowerCase(), def]);
      }
    }
    return [locale, Object.fromEntries(pairs)];
  })
);

const gameTermPatternByLocale = Object.fromEntries(
  locales.map((locale) => {
    const aliases = gameTermsByLocale[locale]
      .flatMap((def) => def.aliases)
      .sort((a, b) => b.length - a.length)
      .map((alias) => escapeRegExp(alias));
    return [locale, new RegExp(`(${aliases.join("|")})`, "gi")];
  })
);

function renderTermChip(def) {
  const images = def.images
    .map(
      (image) =>
        `<img class="term-chip-texture" src="/assets/minecraft/${image}" alt="${escapeHtml(def.label)}" />`
    )
    .join("");
  const iconClass = def.images.length > 1 ? "term-chip-icon term-chip-icon-stack" : "term-chip-icon";
  return `<span class="term-chip" title="${escapeHtml(def.label)} in Minecraft">
    <span class="${iconClass}" aria-hidden="true">${images}</span>
  </span>`;
}

function annotateGameTerms(locale, text) {
  if (!text) {
    return "";
  }

  const regex = gameTermPatternByLocale[locale];
  const lookup = gameTermLookup[locale];
  let lastIndex = 0;
  let result = "";

  for (const match of text.matchAll(regex)) {
    const matchedText = match[0];
    const index = match.index ?? 0;
    const def = lookup[matchedText.toLowerCase()];
    result += escapeHtml(text.slice(lastIndex, index));
    result += escapeHtml(matchedText);
    if (def) {
      result += renderTermChip(def);
    }
    lastIndex = index + matchedText.length;
  }

  result += escapeHtml(text.slice(lastIndex));
  return result;
}

function collectGuideTerms(locale, page) {
  const textBlocks = [
    page.summary,
    page.quickAnswer,
    ...(page.steps || []),
    ...(page.mistakes || []),
    ...(page.tips || []),
    ...(page.crafting?.ingredients || []),
    ...(page.crafting?.notes || []),
    page.crafting?.intro,
    page.crafting?.result
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return gameTermsByLocale[locale].filter((def) =>
    def.aliases.some((alias) => textBlocks.includes(alias.toLowerCase()))
  );
}

function renderGameTermLegend(locale, page, labels) {
  const terms = collectGuideTerms(locale, page).slice(0, 12);
  if (!terms.length) {
    return "";
  }

  const cards = terms
    .map((term) => {
      const images = term.images
        .map(
          (image) =>
            `<img class="term-legend-texture" src="/assets/minecraft/${image}" alt="${escapeHtml(term.label)}" />`
        )
        .join("");
      const visualClass =
        term.images.length > 1 ? "term-legend-visual term-legend-visual-stack" : "term-legend-visual";
      return `<article class="term-legend-card">
        <div class="${visualClass}">${images}</div>
        <h3>${escapeHtml(term.label)}</h3>
      </article>`;
    })
    .join("");

  return `<section class="term-legend-section">
    <h2>${escapeHtml(labels.terms)}</h2>
    <p>${escapeHtml(labels.termsNote)}</p>
    <div class="term-legend-grid">${cards}</div>
  </section>`;
}

function pageTitle(locale, title) {
  return `${escapeHtml(title)} | ${siteName}`;
}

function buildFooterLinks(locale) {
  const nav = navLabels[locale];
  const links = [
    { href: `/${locale}/${infoPages.about[locale].slug}/`, label: nav.about },
    { href: `/${locale}/${infoPages.privacy[locale].slug}/`, label: nav.privacy },
    { href: `/${locale}/${infoPages.contact[locale].slug}/`, label: nav.contact }
  ];

  return links
    .map((link) => `<a class="footer-link" href="${link.href}">${escapeHtml(link.label)}</a>`)
    .join("");
}

function renderAdsenseHead() {
  if (!adsenseEnabled) {
    return "";
  }

  return `
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtml(
      adsenseClient
    )}" crossorigin="anonymous"></script>`;
}

function renderAdSlot({ slot, className = "ad-slot", label = "Advertisement" }) {
  if (!adsenseEnabled || !slot) {
    return "";
  }

  return `<div class="${className}">
    <p class="ad-slot-label">${escapeHtml(label)}</p>
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${escapeHtml(adsenseClient)}"
      data-ad-slot="${escapeHtml(slot)}"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  </div>`;
}

function buildLanguageLinks(currentLocale, guide) {
  return locales
    .map((locale) => {
      const href = guide
        ? `/${locale}/${guide.pages[locale].slug}/`
        : `/${locale}/`;
      const label = homeCopy[locale].langName;
      const active = locale === currentLocale ? "active" : "";
      return `<a class="lang-link ${active}" href="${href}">${escapeHtml(label)}</a>`;
    })
    .join("");
}

function buildInfoLanguageLinks(currentLocale, pageKey) {
  return locales
    .map((locale) => {
      const page = infoPages[pageKey][locale];
      const label = homeCopy[locale].langName;
      const active = locale === currentLocale ? "active" : "";
      return `<a class="lang-link ${active}" href="/${locale}/${page.slug}/">${escapeHtml(label)}</a>`;
    })
    .join("");
}

function renderLayout({ locale, title, description, hero, main, guide, pageKey }) {
  const nav = navLabels[locale];
  const canonicalPath = guide
    ? `/${locale}/${guide.pages[locale].slug}/`
    : pageKey
      ? `/${locale}/${infoPages[pageKey][locale].slug}/`
      : `/${locale}/`;
  const hreflangs = locales
    .map((altLocale) => {
      const href = guide
        ? `${siteOrigin}/${altLocale}/${guide.pages[altLocale].slug}/`
        : pageKey
          ? `${siteOrigin}/${altLocale}/${infoPages[pageKey][altLocale].slug}/`
          : `${siteOrigin}/${altLocale}/`;
      return `<link rel="alternate" hreflang="${altLocale}" href="${href}" />`;
    })
    .join("\n    ");
  const languageLinks = pageKey
    ? buildInfoLanguageLinks(locale, pageKey)
    : buildLanguageLinks(locale, guide);
  const guideNavLink = pageKey ? `/${locale}/#guides` : "#guides";
  return `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle(locale, title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${siteOrigin}${canonicalPath}" />
    ${hreflangs}
    <link rel="alternate" hreflang="x-default" href="${siteOrigin}/en/" />
    <link rel="stylesheet" href="/styles.css" />
    ${renderAdsenseHead()}
    <script src="/crafting-sim.js" defer></script>
  </head>
  <body>
    <div class="page-shell guide-theme">
      <header class="topbar">
        <a class="brand" href="/${locale}/">${siteName}</a>
        <nav class="topnav">
          <a href="/${locale}/">${escapeHtml(nav.home)}</a>
          <a href="${guideNavLink}">${escapeHtml(nav.guides)}</a>
        </nav>
        <div class="lang-switch" aria-label="${escapeHtml(nav.language)}">
          ${languageLinks}
        </div>
      </header>
      ${hero}
      ${main}
      <footer class="site-footer">
        <p>${escapeHtml(homeCopy[locale].footer)}</p>
        <div class="footer-links">${buildFooterLinks(locale)}</div>
      </footer>
    </div>
  </body>
  </html>`;
}

function guideCards(locale) {
  const nav = navLabels[locale];
  return guides
    .map((guide) => {
      const page = guide.pages[locale];
      return `<article class="guide-card">
        <p class="guide-kicker">${escapeHtml(nav[guide.category])}</p>
        <h3>${escapeHtml(page.title)}</h3>
        <p>${escapeHtml(page.summary)}</p>
        <a class="inline-link" href="/${locale}/${page.slug}/">${escapeHtml(nav.read)}</a>
      </article>`;
    })
    .join("");
}

function renderHome(locale) {
  const copy = homeCopy[locale];
  const firstGuide = guides[0].pages[locale];
  const hero = `<section class="hero hero-guide-site">
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
      <h1>${escapeHtml(copy.title)}</h1>
      <p class="lede">${escapeHtml(copy.subtitle)}</p>
      <div class="hero-actions">
        <a class="primary-button" href="/${locale}/${firstGuide.slug}/">${escapeHtml(copy.primary)}</a>
        <a class="ghost-button" href="#guides">${escapeHtml(copy.secondary)}</a>
      </div>
    </div>
    <div class="hero-panel">
      <div class="hero-panel-inner">
        <p class="panel-label">2026</p>
        <h2>Minecraft For Beginners</h2>
        <p>English, Deutsch, Francais</p>
        <ul>
          <li>Beginner-only structure</li>
          <li>Short search-driven answers</li>
          <li>Built for ad-friendly guide traffic</li>
        </ul>
      </div>
    </div>
  </section>`;

  const compare = copy.compareCards
    .map(
      (card) => `<article class="compare-card">
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.text)}</p>
      </article>`
    )
    .join("");

  const categories = copy.categories
    .map(
      (card) => `<article class="mini-card">
        <h3>${escapeHtml(card.label)}</h3>
        <p>${escapeHtml(card.text)}</p>
      </article>`
    )
    .join("");

  const main = `<main>
    <section class="section-block">
      <div class="section-head">
        <h2>${escapeHtml(copy.compareTitle)}</h2>
      </div>
      <div class="compare-grid">${compare}</div>
    </section>

    ${renderAdSlot({
      slot: adsenseInlineSlot,
      className: "ad-slot ad-slot-home",
      label: locale === "de" ? "Werbung" : locale === "fr" ? "Publicite" : "Advertisement"
    })}

    <section id="guides" class="section-block">
      <div class="section-head">
        <h2>${escapeHtml(copy.sectionTitle)}</h2>
        <p>${escapeHtml(copy.sectionText)}</p>
      </div>
      <div class="guides-grid">${guideCards(locale)}</div>
    </section>

    <section class="section-block">
      <div class="section-head">
        <h2>${escapeHtml(copy.categoriesTitle)}</h2>
      </div>
      <div class="mini-grid">${categories}</div>
    </section>
  </main>`;

  return renderLayout({
    locale,
    title: copy.title,
    description: copy.subtitle,
    hero,
    main
  });
}

function renderInfoPage(locale, pageKey) {
  const nav = navLabels[locale];
  const page = infoPages[pageKey][locale];
  const hero = `<section class="hero hero-article">
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(nav[pageKey])}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="lede">${escapeHtml(page.summary)}</p>
      <div class="hero-actions">
        <a class="ghost-button" href="/${locale}/">${escapeHtml(nav.back)}</a>
      </div>
    </div>
  </section>`;

  const body = page.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  const main = `<main class="article-main article-main-wide">
    <article class="article-card">
      <section class="info-page-copy">
        ${body}
      </section>
    </article>
  </main>`;

  return renderLayout({
    locale,
    title: page.title,
    description: page.summary,
    hero,
    main,
    pageKey
  });
}

function relatedLinks(locale, currentId) {
  const currentGuide = guides.find((guide) => guide.id === currentId);
  const prioritized = [
    ...guides.filter(
      (guide) => guide.id !== currentId && currentGuide && guide.category === currentGuide.category
    ),
    ...guides.filter(
      (guide) => guide.id !== currentId && (!currentGuide || guide.category !== currentGuide.category)
    )
  ];

  return prioritized
    .slice(0, 4)
    .map((guide) => {
      const page = guide.pages[locale];
      return `<li><a href="/${locale}/${page.slug}/">${escapeHtml(page.title)}</a></li>`;
    })
    .join("");
}

function renderGuide(locale, guide) {
  const page = guide.pages[locale];
  const nav = navLabels[locale];
  const hero = `<section class="hero hero-article">
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(nav[guide.category])}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="lede">${annotateGameTerms(locale, page.summary)}</p>
      <div class="hero-actions">
        <a class="ghost-button" href="/${locale}/">${escapeHtml(nav.back)}</a>
      </div>
    </div>
  </section>`;

  const steps = page.steps.map((item) => `<li>${annotateGameTerms(locale, item)}</li>`).join("");
  const mistakes = page.mistakes.map((item) => `<li>${annotateGameTerms(locale, item)}</li>`).join("");
  const tips = page.tips.map((item) => `<li>${annotateGameTerms(locale, item)}</li>`).join("");

  const labels = {
    en: {
      locale: "en",
      quick: "Quick Answer",
      steps: "Step-by-Step Guide",
      mistakes: "Common Mistakes",
      tips: "Beginner Tips",
      related: "Related Guides",
      visual: "What to recognize",
      visualNote: "Use these simple visual cues so you know what to look for in-game.",
      terms: "Game terms in this guide",
      termsNote: "These are the blocks, items and places mentioned below, shown with Minecraft-style visuals.",
      ad: "Advertisement",
      ingredients: "Ingredients",
      result: "Result",
      notes: "What it looks like and how to use it"
    },
    de: {
      locale: "de",
      quick: "Kurze Antwort",
      steps: "Schritt-fur-Schritt-Guide",
      mistakes: "Haufige Fehler",
      tips: "Tipps fur Anfanger",
      related: "Verwandte Guides",
      visual: "Was du erkennen solltest",
      visualNote: "Diese einfachen Bilder helfen dir, wichtige Dinge im Spiel schneller zu erkennen.",
      terms: "Spielbegriffe in diesem Guide",
      termsNote: "Diese Blocke, Gegenstande und Orte werden unten erwahnt und hier mit Minecraft-Optik gezeigt.",
      ad: "Werbung",
      ingredients: "Materialien",
      result: "Ergebnis",
      notes: "So sieht es aus und so benutzt du es"
    },
    fr: {
      locale: "fr",
      quick: "Reponse rapide",
      steps: "Guide etape par etape",
      mistakes: "Erreurs frequentes",
      tips: "Conseils debutants",
      related: "Guides lies",
      visual: "Ce qu'il faut reconnaitre",
      visualNote: "Utilisez ces reperes visuels simples pour savoir quoi chercher dans le jeu.",
      terms: "Termes du jeu dans ce guide",
      termsNote: "Voici les blocs, objets et lieux mentionnes plus bas, montres avec des visuels de style Minecraft.",
      ad: "Publicite",
      ingredients: "Ingredients",
      result: "Resultat",
      notes: "A quoi cela ressemble et comment l'utiliser"
    }
  }[locale];

  const visual = renderGuideVisual(locale, guide.visual);
  const termLegend = renderGameTermLegend(locale, page, labels);
  const crafting = renderCraftingSection(page.crafting, labels);
  const simulator = guide.id === "crafting-table" ? renderCraftingSimulator(locale) : "";
  const furnaceSimulator = guide.id === "furnace-guide" ? renderFurnaceSimulator(locale) : "";
  const isWide = guide.id === "crafting-table" || guide.id === "furnace-guide";
  const mainClass = isWide ? "article-main article-main-wide" : "article-main";
  const main = `<main class="${mainClass}">
    <article class="article-card">
      <section>
        <h2>${escapeHtml(labels.visual)}</h2>
        <p>${escapeHtml(labels.visualNote)}</p>
        ${visual}
      </section>
      ${termLegend}
      ${crafting}
      ${simulator}
      ${furnaceSimulator}
      ${renderAdSlot({
        slot: adsenseInlineSlot,
        className: "ad-slot ad-slot-inline",
        label: labels.ad
      })}
      <section>
        <h2>${escapeHtml(labels.quick)}</h2>
        <p>${annotateGameTerms(locale, page.quickAnswer)}</p>
      </section>
      <section>
        <h2>${escapeHtml(labels.steps)}</h2>
        <ol>${steps}</ol>
      </section>
      <section>
        <h2>${escapeHtml(labels.mistakes)}</h2>
        <ul>${mistakes}</ul>
      </section>
      <section>
        <h2>${escapeHtml(labels.tips)}</h2>
        <ul>${tips}</ul>
      </section>
    </article>
    <aside class="sidebar-card">
      ${renderAdSlot({
        slot: adsenseSidebarSlot,
        className: "ad-slot ad-slot-sidebar",
        label: labels.ad
      })}
      <h3>${escapeHtml(labels.related)}</h3>
      <ul>${relatedLinks(locale, guide.id)}</ul>
    </aside>
  </main>`;

  return renderLayout({
    locale,
    title: page.title,
    description: page.summary,
    hero,
    main,
    guide
  });
}

function renderCraftingSimulator(locale) {
  const copy = {
    en: {
      title: "Beginner workbench simulator",
      intro:
        "Click a slot, choose a material, and see whether it matches one of the early-game recipes new players actually need.",
      how: "How to use it",
      howSteps: [
        "Drag a material icon from below into a square in the 3x3 grid.",
        "You can still click a square first, then click a material if you prefer.",
        "Build a recipe pattern and the result updates automatically."
      ],
      grid: "Workbench grid",
      palette: "Drag these beginner materials",
      result: "Crafting result",
      empty: "No beginner recipe matched yet.",
      clear: "Clear grid",
      recipes: "Included beginner recipes",
      presets: "Try a preset recipe"
    },
    de: {
      title: "Werkbank-Simulator fur Anfanger",
      intro:
        "Klicke ein Feld an, waehle ein Material und sieh sofort, ob es zu einem wichtigen Anfangsrezept passt.",
      how: "So benutzt du es",
      howSteps: [
        "Ziehe ein Materialsymbol von unten in ein Feld des 3x3-Rasters.",
        "Du kannst alternativ auch erst ein Feld anklicken und dann auf ein Material klicken.",
        "Baue ein Rezept nach und das Ergebnis aktualisiert sich automatisch."
      ],
      grid: "Werkbank-Raster",
      palette: "Ziehbare Anfangsmaterialien",
      result: "Crafting-Ergebnis",
      empty: "Noch kein passendes Einsteiger-Rezept erkannt.",
      clear: "Raster leeren",
      recipes: "Enthaltene Anfangsrezepte",
      presets: "Ein Rezept direkt einfullen"
    },
    fr: {
      title: "Simulateur de table de craft pour debutants",
      intro:
        "Cliquez sur une case, choisissez un materiau et voyez tout de suite si cela correspond a une recette utile du debut de partie.",
      how: "Comment l'utiliser",
      howSteps: [
        "Faites glisser un materiau depuis la zone du bas vers une case de la grille 3x3.",
        "Vous pouvez aussi cliquer sur une case puis cliquer sur un materiau.",
        "Reproduisez une recette et le resultat se met a jour automatiquement."
      ],
      grid: "Grille de craft",
      palette: "Materiaux debutant a glisser",
      result: "Resultat",
      empty: "Aucune recette debutant reconnue pour l'instant.",
      clear: "Vider la grille",
      recipes: "Recettes debutant incluses",
      presets: "Essayer une recette pre-remplie"
    }
  }[locale];

  const data = {
    labels: copy,
    items: [
      { id: "oak_log", name: "Oak Log", image: "/assets/minecraft/oak_log.png" },
      { id: "oak_planks", name: "Oak Planks", image: "/assets/minecraft/oak_planks.png" },
      { id: "stick", name: "Stick", image: "/assets/minecraft/stick.png" },
      { id: "white_wool", name: "White Wool", image: "/assets/minecraft/white_wool.png" },
      { id: "coal", name: "Coal", image: "/assets/minecraft/coal.png" },
      { id: "charcoal", name: "Charcoal", image: "/assets/minecraft/charcoal.png" },
      { id: "cobblestone", name: "Cobblestone", image: "/assets/minecraft/cobblestone.png" }
    ],
    recipes: [
      {
        id: "planks",
        name: "Oak Planks x4",
        resultImage: "/assets/minecraft/oak_planks.png",
        resultText: "1 oak log becomes 4 oak planks.",
        pattern: [["oak_log"]]
      },
      {
        id: "sticks",
        name: "Sticks x4",
        resultImage: "/assets/minecraft/stick.png",
        resultText: "2 planks stacked vertically make 4 sticks.",
        pattern: [["oak_planks"], ["oak_planks"]]
      },
      {
        id: "crafting-table",
        name: "Crafting Table",
        resultImage: "/assets/minecraft/crafting_table_front.png",
        resultText: "4 planks in a 2x2 square make 1 crafting table.",
        pattern: [
          ["oak_planks", "oak_planks"],
          ["oak_planks", "oak_planks"]
        ]
      },
      {
        id: "wooden-pickaxe",
        name: "Wooden Pickaxe",
        resultImage: "/assets/minecraft/wooden_pickaxe.png",
        resultText: "3 planks on top and 2 sticks in the middle column.",
        pattern: [
          ["oak_planks", "oak_planks", "oak_planks"],
          [null, "stick", null],
          [null, "stick", null]
        ]
      },
      {
        id: "wooden-axe",
        name: "Wooden Axe",
        resultImage: "/assets/minecraft/wooden_axe.png",
        resultText: "Use 3 planks and 2 sticks in an axe shape.",
        patterns: [
          [
            ["oak_planks", "oak_planks"],
            ["oak_planks", "stick"],
            [null, "stick"]
          ],
          [
            ["oak_planks", "oak_planks"],
            ["stick", "oak_planks"],
            ["stick", null]
          ]
        ]
      },
      {
        id: "wooden-shovel",
        name: "Wooden Shovel",
        resultImage: "/assets/minecraft/wooden_shovel.png",
        resultText: "1 plank above 2 sticks in the center column.",
        pattern: [[null, "oak_planks", null], [null, "stick", null], [null, "stick", null]]
      },
      {
        id: "torch",
        name: "Torches x4",
        resultImage: "/assets/minecraft/torch.png",
        resultText: "1 coal or charcoal above 1 stick makes 4 torches.",
        patterns: [
          [["coal"], ["stick"]],
          [["charcoal"], ["stick"]]
        ]
      },
      {
        id: "chest",
        name: "Chest",
        resultImage: "/assets/minecraft/chest.png",
        resultText: "8 planks around an empty center slot make 1 chest.",
        pattern: [
          ["oak_planks", "oak_planks", "oak_planks"],
          ["oak_planks", null, "oak_planks"],
          ["oak_planks", "oak_planks", "oak_planks"]
        ]
      },
      {
        id: "furnace",
        name: "Furnace",
        resultImage: "/assets/minecraft/furnace_front.png",
        resultText: "8 cobblestone around an empty center slot make 1 furnace.",
        pattern: [
          ["cobblestone", "cobblestone", "cobblestone"],
          ["cobblestone", null, "cobblestone"],
          ["cobblestone", "cobblestone", "cobblestone"]
        ]
      },
      {
        id: "bed",
        name: "Bed",
        resultImage: "/assets/minecraft/red_bed.png",
        resultText: "3 wool on top and 3 planks in the middle row make 1 bed.",
        pattern: [
          ["white_wool", "white_wool", "white_wool"],
          ["oak_planks", "oak_planks", "oak_planks"]
        ]
      }
    ]
  };

  const recipeNames = data.recipes
    .map((recipe) => `<li>${escapeHtml(recipe.name)}</li>`)
    .join("");
  const presetButtons = data.recipes
    .map(
      (recipe) =>
        `<button type="button" class="sim-preset" data-preset-id="${escapeHtml(recipe.id)}">${escapeHtml(
          recipe.name
        )}</button>`
    )
    .join("");
  const steps = copy.howSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");

  return `<section class="crafting-sim-section" data-crafting-sim='${escapeHtml(
    JSON.stringify(data)
  )}'>
    <h2>${escapeHtml(copy.title)}</h2>
    <p>${escapeHtml(copy.intro)}</p>
    <div class="crafting-sim-grid">
      <div class="crafting-sim-card">
        <h3>${escapeHtml(copy.how)}</h3>
        <ol>${steps}</ol>
        <h3>${escapeHtml(copy.presets)}</h3>
        <div class="sim-presets">${presetButtons}</div>
        <h3>${escapeHtml(copy.recipes)}</h3>
        <ul>${recipeNames}</ul>
      </div>
      <div class="crafting-sim-card">
        <div class="sim-head">
          <h3>${escapeHtml(copy.grid)}</h3>
          <button type="button" class="sim-clear">${escapeHtml(copy.clear)}</button>
        </div>
        <div class="sim-grid" role="grid" aria-label="${escapeHtml(copy.grid)}"></div>
        <h3>${escapeHtml(copy.palette)}</h3>
        <div class="sim-palette"></div>
      </div>
      <div class="crafting-sim-card">
        <h3>${escapeHtml(copy.result)}</h3>
        <div class="sim-result">
          <div class="sim-result-image"></div>
          <p class="sim-result-name">${escapeHtml(copy.empty)}</p>
          <p class="sim-result-text"></p>
        </div>
      </div>
    </div>
  </section>`;
}

function renderFurnaceSimulator(locale) {
  const copy = {
    en: {
      title: "Beginner furnace simulator",
      intro:
        "Try a smelting recipe here first so you know what should go in the top slot, what should go in the fuel slot, and what result you should expect.",
      top: "Item slot",
      bottom: "Fuel slot",
      materials: "Drag these early-game items",
      result: "Smelting result",
      empty: "No smelting recipe matched yet.",
      clear: "Clear furnace",
      presets: "Try a preset smelt",
      notes: "Fuel note"
    },
    de: {
      title: "Ofen-Simulator fur Anfanger",
      intro:
        "Teste ein Schmelzrezept zuerst hier, damit du weiust, was oben hinein muss, was als Brennstoff unten liegt und welches Ergebnis herauskommt.",
      top: "Oben: Material",
      bottom: "Unten: Brennstoff",
      materials: "Diese Anfangsgegenstande kannst du ziehen",
      result: "Schmelz-Ergebnis",
      empty: "Noch kein passendes Schmelzrezept erkannt.",
      clear: "Ofen leeren",
      presets: "Ein Schmelzrezept vorfullen",
      notes: "Brennstoff-Hinweis"
    },
    fr: {
      title: "Simulateur de four pour debutants",
      intro:
        "Testez ici une recette de cuisson pour savoir quoi mettre en haut, quel combustible mettre en bas et quel resultat attendre.",
      top: "Slot du haut",
      bottom: "Slot du bas",
      materials: "Materiaux du debut a faire glisser",
      result: "Resultat de cuisson",
      empty: "Aucune recette de cuisson reconnue pour l'instant.",
      clear: "Vider le four",
      presets: "Essayer une cuisson pre-remplie",
      notes: "Note sur le combustible"
    }
  }[locale];

  const data = {
    labels: copy,
    items: [
      { id: "raw_iron", name: "Raw Iron", image: "/assets/minecraft/raw_iron.png", slot: "input" },
      { id: "beef", name: "Raw Beef", image: "/assets/minecraft/beef.png", slot: "input" },
      { id: "sand", name: "Sand", image: "/assets/minecraft/sand.png", slot: "input" },
      { id: "coal", name: "Coal", image: "/assets/minecraft/coal.png", slot: "fuel" },
      { id: "charcoal", name: "Charcoal", image: "/assets/minecraft/charcoal.png", slot: "fuel" },
      { id: "oak_log", name: "Oak Log", image: "/assets/minecraft/oak_log.png", slot: "fuel" },
      { id: "oak_planks", name: "Oak Planks", image: "/assets/minecraft/oak_planks.png", slot: "fuel" },
      { id: "stick", name: "Stick", image: "/assets/minecraft/stick.png", slot: "fuel" }
    ],
    recipes: [
      {
        id: "iron-ingot",
        input: "raw_iron",
        fuels: ["coal", "charcoal", "oak_log", "oak_planks", "stick"],
        name: "Iron Ingot",
        resultImage: "/assets/minecraft/iron_ingot.png",
        resultText: "Raw iron smelts into an iron ingot.",
        fuelNote: "Coal and charcoal are the best beginner choices because they last much longer than sticks."
      },
      {
        id: "cooked-beef",
        input: "beef",
        fuels: ["coal", "charcoal", "oak_log", "oak_planks", "stick"],
        name: "Cooked Beef",
        resultImage: "/assets/minecraft/cooked_beef.png",
        resultText: "Raw beef becomes cooked beef with better food value.",
        fuelNote: "Avoid wasting rare coal on just one food item if charcoal is easy for you to make."
      },
      {
        id: "glass",
        input: "sand",
        fuels: ["coal", "charcoal", "oak_log", "oak_planks", "stick"],
        name: "Glass",
        resultImage: "/assets/minecraft/glass.png",
        resultText: "Sand smelts into glass.",
        fuelNote: "Glass is useful, but for pure survival it is usually less urgent than iron or food."
      }
    ]
  };

  const presetButtons = data.recipes
    .map(
      (recipe) =>
        `<button type="button" class="furnace-preset" data-furnace-preset="${escapeHtml(recipe.id)}">${escapeHtml(
          recipe.name
        )}</button>`
    )
    .join("");

  return `<section class="furnace-sim-section" data-furnace-sim='${escapeHtml(JSON.stringify(data))}'>
    <h2>${escapeHtml(copy.title)}</h2>
    <p>${escapeHtml(copy.intro)}</p>
    <div class="furnace-sim-grid">
      <div class="crafting-sim-card">
        <h3>${escapeHtml(copy.presets)}</h3>
        <div class="sim-presets">${presetButtons}</div>
        <h3>${escapeHtml(copy.materials)}</h3>
        <div class="furnace-palette"></div>
      </div>
      <div class="crafting-sim-card furnace-core-card">
        <div class="sim-head">
          <h3>Furnace</h3>
          <button type="button" class="furnace-clear">${escapeHtml(copy.clear)}</button>
        </div>
        <div class="furnace-core">
          <div class="furnace-column">
            <p class="furnace-label">${escapeHtml(copy.top)}</p>
            <button type="button" class="furnace-slot" data-furnace-slot="input"></button>
          </div>
          <div class="furnace-arrow" aria-hidden="true">→</div>
          <div class="furnace-column">
            <p class="furnace-label">${escapeHtml(copy.result)}</p>
            <div class="furnace-result-box">
              <div class="furnace-result-image"></div>
              <p class="furnace-result-name">${escapeHtml(copy.empty)}</p>
            </div>
          </div>
        </div>
        <div class="furnace-fuel-row">
          <p class="furnace-label">${escapeHtml(copy.bottom)}</p>
          <button type="button" class="furnace-slot" data-furnace-slot="fuel"></button>
        </div>
      </div>
      <div class="crafting-sim-card">
        <h3>${escapeHtml(copy.result)}</h3>
        <div class="sim-result furnace-result-panel">
          <p class="furnace-result-text"></p>
          <div class="furnace-fuel-note-wrap">
            <h4>${escapeHtml(copy.notes)}</h4>
            <p class="furnace-fuel-note"></p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderCraftingSection(crafting, labels) {
  if (!crafting) return "";

  const ingredients = crafting.ingredients
    .map((item) => `<li>${annotateGameTerms(labels.locale, item)}</li>`)
    .join("");
  const notes = crafting.notes.map((item) => `<li>${annotateGameTerms(labels.locale, item)}</li>`).join("");

  return `<section class="crafting-section">
    <h2>${escapeHtml(crafting.title)}</h2>
    <p>${annotateGameTerms(labels.locale, crafting.intro)}</p>
    <div class="crafting-grid">
      <div class="crafting-box">
        <h3>${escapeHtml(labels.ingredients)}</h3>
        <ul>${ingredients}</ul>
      </div>
      <div class="crafting-box">
        <h3>${escapeHtml(labels.result)}</h3>
        <p class="crafting-result">${annotateGameTerms(labels.locale, crafting.result)}</p>
      </div>
    </div>
    <div class="crafting-box crafting-notes">
      <h3>${escapeHtml(labels.notes)}</h3>
      <ul>${notes}</ul>
    </div>
  </section>`;
}

function svgCard({ title, subtitle, bg = "#f4ead6", accent = "#3e8c52", art }) {
  return `<div class="visual-card" style="--card-bg:${bg};--card-accent:${accent}">
    <div class="visual-art">${art}</div>
    <div class="visual-copy">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(subtitle)}</p>
    </div>
  </div>`;
}

function mcTexture(path, alt) {
  return `<img class="mc-texture" src="/assets/minecraft/${path}" alt="${escapeHtml(
    alt
  )}" loading="lazy" decoding="async" />`;
}

function mcTextureStack(items) {
  return `<div class="mc-stack">${items
    .map((item) => mcTexture(item.path, item.alt))
    .join("")}</div>`;
}

function visualSet(locale) {
  return {
    en: {
      firstDay: [
        ["Tree logs", "Your first priority. Punch a tree immediately."],
        ["Bed", "Three wool and three planks let you skip the night."],
        ["Shelter", "A tiny dirt or wood shelter is enough for day one."]
      ],
      wood: [
        ["Oak log", "Punch logs first, then upgrade to an axe fast."],
        ["Planks", "Logs become planks, and planks become almost everything."],
        ["Stone axe", "This is the first speed upgrade worth making."]
      ],
      craftingTable: [
        ["Log to planks", "One log is enough to start the whole chain."],
        ["2x2 grid", "Four planks in your inventory make the table."],
        ["Crafting table", "This unlocks the full 3x3 recipe grid."]
      ],
      bed: [
        ["Sheep wool", "You need three wool, usually from sheep."],
        ["Wood planks", "Three planks go under the wool."],
        ["Bed", "Place it inside shelter and sleep immediately."]
      ],
      furnaceGuide: [
        ["Cobblestone", "Mine 8 cobblestone blocks first."],
        ["Furnace", "A gray block with a dark front opening."],
        ["Fuel", "Coal and charcoal are the best early choices."]
      ],
      torch: [
        ["Coal", "Black specks in stone on hills or in caves."],
        ["Stick", "Made from planks in the inventory grid."],
        ["Torch", "Use it for light and to mark your path home."]
      ],
      coal: [
        ["Coal ore", "Stone block with dark black specks."],
        ["Hill stone", "Look on open hills and mountain sides first."],
        ["Charcoal", "If no coal appears, smelt logs into charcoal."]
      ],
      iron: [
        ["Iron ore", "Stone block with light brown spots."],
        ["Stone pickaxe", "Minimum tool required to mine iron."],
        ["Furnace", "Smelt raw iron into ingots before crafting."]
      ],
      food: [
        ["Wheat seeds", "Break grass early so you can start farming."],
        ["Animals", "Cows, sheep and chickens are easy starter food."],
        ["Hay bales", "Villages can solve food problems very fast."]
      ],
      lost: [
        ["Torch trail", "Place torches in a repeatable pattern."],
        ["Coordinates", "Screenshot or write your home location."],
        ["Landmark", "Use hills, rivers and villages as anchors."]
      ],
      house: [
        ["Base marker", "Tall pillar or torch line helps from far away."],
        ["High ground", "Climb to scan the area before running farther."],
        ["Return path", "Search from the last place you clearly remember."]
      ],
      chest: [
        ["Wood planks", "Planks are the only material you need."],
        ["Chest", "Your first real storage block for base supplies."],
        ["Base storage", "Keep chest, table and furnace close together."]
      ],
      village: [
        ["Village beds", "Fast sleep and a safer first night."],
        ["Hay bales", "One of the fastest early food boosts."],
        ["Village houses", "Useful shelter, but not perfect safety at night."]
      ],
      netherPrep: [
        ["Food stack", "Bring enough food before the first trip."],
        ["Portal note", "Record coordinates before you go in."],
        ["Base supplies", "Blocks, torch marks and backup gear matter more than speed."]
      ],
      shield: [
        ["Iron ingot", "You need one iron ingot for the recipe."],
        ["Wood planks", "Six planks form the main body of the shield."],
        ["Defense tool", "Use it early to stop arrows and panic damage."]
      ],
      safeMining: [
        ["Torches", "Light your path so the cave stays readable."],
        ["Stone pickaxe", "Bring reliable tools, not just one weak spare."],
        ["Food and blocks", "Safe mining always starts with preparation."]
      ],
      villagerTrade: [
        ["Village houses", "A village is the base for all early trading."],
        ["Hay bales", "Simple village value often starts with easy food."],
        ["Useful trades", "Start with practical help, not perfect systems."]
      ],
      starterHouse: [
        ["Door", "Close yourself off from the outside fast."],
        ["Bed", "Sleeping safely matters more than style."],
        ["Chest and furnace", "Your first house should hold your core survival setup."]
      ],
      breadGuide: [
        ["Wheat", "Three wheat in a row become simple early bread."],
        ["Seeds", "Always keep some seeds for replanting."],
        ["Bread", "Stable food beats random panic hunting."]
      ],
      doorGuide: [
        ["Wood planks", "The whole recipe starts with cheap planks."],
        ["Door", "A fast safety upgrade for any tiny shelter."],
        ["Torch-lit entrance", "A door works best with a lit interior."]
      ],
      stonePickaxeGuide: [
        ["Cobblestone", "You need 3 cobblestone for the tool head."],
        ["Sticks", "Two sticks form the handle."],
        ["Stone pickaxe", "This is the first real mining upgrade."]
      ],
      enderDragon: [
        ["Portal route", "Know how you get in and how you recover."],
        ["Food reserves", "Good supplies matter more than bravery."],
        ["End goal", "The dragon fight should come after long preparation."]
      ]
    },
    de: {
      firstDay: [
        ["Baumstamme", "Deine erste Prioritat. Sofort Holz holen."],
        ["Bett", "Drei Wolle und drei Bretter uberspringen die Nacht."],
        ["Unterschlupf", "Ein kleiner Schutz aus Erde oder Holz reicht."]
      ],
      wood: [
        ["Holzstamm", "Erst Holz schlagen, dann schnell auf Axt wechseln."],
        ["Bretter", "Aus Stammen werden Bretter, daraus fast alles andere."],
        ["Steinaxt", "Das erste sinnvolle Geschwindigkeits-Upgrade."]
      ],
      craftingTable: [
        ["Stamm zu Brettern", "Ein Stamm reicht fur den Start."],
        ["2x2-Feld", "Vier Bretter im Inventar geben die Werkbank."],
        ["Werkbank", "Damit schaltest du das 3x3-Feld frei."]
      ],
      bed: [
        ["Schafwolle", "Du brauchst drei Wolle, meist von Schafen."],
        ["Holzbretter", "Drei Bretter kommen unter die Wolle."],
        ["Bett", "Im Schutzraum platzieren und sofort schlafen."]
      ],
      furnaceGuide: [
        ["Bruchstein", "Sammle zuerst 8 Bruchstein."],
        ["Ofen", "Ein grauer Block mit dunkler Offnung vorne."],
        ["Brennstoff", "Kohle und Holzkohle sind fruh am besten."]
      ],
      torch: [
        ["Kohle", "Schwarze Punkte im Stein an Bergen oder in Hohlen."],
        ["Stock", "Wird aus Brettern hergestellt."],
        ["Fackel", "Fur Licht und als Wegmarkierung nach Hause."]
      ],
      coal: [
        ["Kohleerz", "Steinblock mit dunklen schwarzen Punkten."],
        ["Offener Stein", "Suche zuerst an Hugeln und Bergen."],
        ["Holzkohle", "Wenn du keine Kohle findest, nutze Holzkohle."]
      ],
      iron: [
        ["Eisenerz", "Steinblock mit hellbraunen Flecken."],
        ["Steinspitzhacke", "Mindestwerkzeug fur Eisen."],
        ["Ofen", "Schmelze Roheisen erst zu Barren."]
      ],
      food: [
        ["Weizensamen", "Zerstore fruh Gras fur deine erste Farm."],
        ["Tiere", "Kuhe, Schafe und Huhner sind gute Startnahrung."],
        ["Heuballen", "Dorfer losen fruh viele Essensprobleme."]
      ],
      lost: [
        ["Fackelspur", "Setze Fackeln nach einem festen Muster."],
        ["Koordinaten", "Screenshot oder notiere dein Zuhause."],
        ["Merkpunkt", "Flusse, Hugel und Dorfer helfen bei der Orientierung."]
      ],
      house: [
        ["Basismarkierung", "Ein hoher Pfeiler oder Fackelweg hilft aus der Ferne."],
        ["Hoher Punkt", "Steig hoch, bevor du noch weiter weglaust."],
        ["Ruckweg", "Suche vom letzten sicheren Punkt aus."]
      ],
      chest: [
        ["Holzbretter", "Mehr brauchst du fur eine Truhe nicht."],
        ["Truhe", "Dein erster richtiger Lagerblock fur Startmaterialien."],
        ["Basislager", "Truhe, Werkbank und Ofen gehoren nah zusammen."]
      ],
      village: [
        ["Dorfbetten", "Schnelles Schlafen und eine sicherere erste Nacht."],
        ["Heuballen", "Einer der schnellsten fruhen Essensschube."],
        ["Dorfhauser", "Guter Schutz, aber nachts nicht automatisch sicher."]
      ],
      netherPrep: [
        ["Essensvorrat", "Nimm genug Nahrung fur den ersten Trip mit."],
        ["Portal-Notiz", "Koordinaten vor dem Durchgang sichern."],
        ["Basisvorrate", "Blocke, Markierungen und Ersatzzeug zahlen mehr als Tempo."]
      ],
      shield: [
        ["Eisenbarren", "Du brauchst einen Eisenbarren fur das Rezept."],
        ["Holzbretter", "Sechs Bretter bilden den Hauptteil des Schilds."],
        ["Verteidigung", "Nutze es fruh gegen Pfeile und Panikschaden."]
      ],
      safeMining: [
        ["Fackeln", "Beleuchte den Weg, damit die Hohle lesbar bleibt."],
        ["Steinspitzhacke", "Nimm verlassliche Werkzeuge statt nur einen Notbehelf."],
        ["Essen und Blocke", "Sicheres Mining beginnt immer mit Vorbereitung."]
      ],
      villagerTrade: [
        ["Dorfhauser", "Ein Dorf ist die Grundlage fur fruhen Handel."],
        ["Heuballen", "Einfacher Dorfwert beginnt oft mit schneller Nahrung."],
        ["Nutzliche Handel", "Starte praktisch statt perfekt."]
      ],
      starterHouse: [
        ["Tur", "Schlie dich schnell von drauen ab."],
        ["Bett", "Sicher schlafen ist wichtiger als Stil."],
        ["Truhe und Ofen", "Dein erstes Haus soll dein Uberlebens-Setup tragen."]
      ],
      breadGuide: [
        ["Weizen", "Drei Weizen in einer Reihe ergeben fruh Brot."],
        ["Samen", "Behalte immer genug zum Nachpflanzen."],
        ["Brot", "Stabiles Essen ist besser als hektische Jagd."]
      ],
      doorGuide: [
        ["Holzbretter", "Das ganze Rezept startet mit einfachen Brettern."],
        ["Tur", "Ein schnelles Sicherheits-Upgrade fur jeden kleinen Schutzraum."],
        ["Beleuchteter Eingang", "Eine Tur ist mit Licht innen noch wertvoller."]
      ],
      stonePickaxeGuide: [
        ["Bruchstein", "Du brauchst 3 Bruchstein fur den Kopf."],
        ["Stocke", "Zwei Stocke bilden den Griff."],
        ["Steinspitzhacke", "Das ist das erste echte Mining-Upgrade."]
      ],
      enderDragon: [
        ["Portalweg", "Wisse, wie du hineingehst und wieder rauskommst."],
        ["Essensvorrat", "Gute Vorrate zahlen mehr als Mut."],
        ["Endziel", "Der Drachenkampf sollte nach langer Vorbereitung kommen."]
      ]
    },
    fr: {
      firstDay: [
        ["Troncs d'arbre", "Votre priorite numero un au debut."],
        ["Lit", "Trois laines et trois planches permettent de dormir."],
        ["Abri", "Un petit abri en terre ou en bois suffit le premier jour."]
      ],
      wood: [
        ["Tronc", "Tapez d'abord le bois, puis passez vite a la hache."],
        ["Planches", "Les troncs deviennent des planches, base de presque tout."],
        ["Hache en pierre", "Le premier vrai gain de vitesse."]
      ],
      craftingTable: [
        ["Tronc vers planches", "Un seul tronc suffit pour demarrer."],
        ["Grille 2x2", "Quatre planches dans l'inventaire donnent la table."],
        ["Table de craft", "Elle debloque toute la grille 3x3."]
      ],
      bed: [
        ["Laine de mouton", "Il faut trois laines."],
        ["Planches", "Trois planches vont sous la laine."],
        ["Lit", "Posez-le dans votre abri et dormez tout de suite."]
      ],
      furnaceGuide: [
        ["Cobblestone", "Recuperez d'abord 8 blocs de cobblestone."],
        ["Four", "Un bloc gris avec une ouverture sombre en facade."],
        ["Combustible", "Le charbon et le charbon de bois sont les meilleurs au debut."]
      ],
      torch: [
        ["Charbon", "Des points noirs dans la pierre en colline ou grotte."],
        ["Baton", "Fabrique a partir de planches."],
        ["Torche", "Pour la lumiere et pour retrouver le chemin."]
      ],
      coal: [
        ["Minerai de charbon", "Bloc de pierre avec taches noires."],
        ["Pierre exposee", "Cherchez d'abord sur collines et montagnes."],
        ["Charbon de bois", "Solution de secours si vous ne trouvez rien."]
      ],
      iron: [
        ["Minerai de fer", "Bloc de pierre avec taches brun clair."],
        ["Pioche en pierre", "Outil minimum pour miner le fer."],
        ["Four", "Faites fondre le fer brut avant de fabriquer."]
      ],
      food: [
        ["Graines de ble", "Cassez l'herbe tot pour lancer une ferme."],
        ["Animaux", "Vaches, moutons et poulets sont utiles au debut."],
        ["Bottes de foin", "Les villages reglent vite le probleme de nourriture."]
      ],
      lost: [
        ["Ligne de torches", "Placez-les toujours de facon coherente."],
        ["Coordonnees", "Notez ou capturez votre maison."],
        ["Repere", "Collines, rivieres et villages aident beaucoup."]
      ],
      house: [
        ["Marqueur de base", "Une haute colonne se voit de loin."],
        ["Hauteur", "Montez pour observer avant de partir plus loin."],
        ["Chemin retour", "Repartez du dernier point que vous reconnaissez."]
      ],
      chest: [
        ["Planches", "C'est le seul materiau necessaire."],
        ["Coffre", "Votre premier vrai bloc de stockage."],
        ["Stockage de base", "Coffre, table de craft et four doivent rester proches."]
      ],
      village: [
        ["Lits du village", "Dormir vite et passer une premiere nuit plus simple."],
        ["Bottes de foin", "Un des boosts de nourriture les plus rapides du debut."],
        ["Maisons du village", "Abri utile, mais pas securite parfaite la nuit."]
      ],
      netherPrep: [
        ["Reserve de nourriture", "Prenez assez de nourriture avant le premier passage."],
        ["Note du portail", "Enregistrez les coordonnees avant d'entrer."],
        ["Reserve de base", "Blocs, reperes et equipement de secours comptent plus que la vitesse."]
      ],
      shield: [
        ["Lingot de fer", "Il faut un lingot de fer pour la recette."],
        ["Planches", "Six planches forment la base du bouclier."],
        ["Outil defensif", "Utilisez-le tot contre les fleches et les degats surprises."]
      ],
      safeMining: [
        ["Torches", "Eclairez votre chemin pour garder la grotte lisible."],
        ["Pioche en pierre", "Prenez des outils fiables et pas seulement un secours fragile."],
        ["Nourriture et blocs", "Miner en securite commence toujours par la preparation."]
      ],
      villagerTrade: [
        ["Maisons du village", "Un village est la base du commerce du debut."],
        ["Bottes de foin", "La valeur simple du village commence souvent par la nourriture."],
        ["Echanges utiles", "Commencez pratique plutot que parfait."]
      ],
      starterHouse: [
        ["Porte", "Fermez-vous rapidement du danger exterieur."],
        ["Lit", "Dormir en securite compte plus que le style."],
        ["Coffre et four", "Votre premiere maison doit contenir le noyau de survie."]
      ],
      breadGuide: [
        ["Ble", "Trois ble alignes donnent un pain simple et utile."],
        ["Graines", "Gardez-en toujours pour replanter."],
        ["Pain", "Une nourriture stable vaut mieux qu'une chasse paniquee."]
      ],
      doorGuide: [
        ["Planches", "Toute la recette commence par des planches bon marche."],
        ["Porte", "Un upgrade de securite rapide pour un petit abri."],
        ["Entree eclairee", "Une porte devient encore meilleure avec un interieur lumineux."]
      ],
      stonePickaxeGuide: [
        ["Cobblestone", "Il faut 3 cobblestone pour la tete de l'outil."],
        ["Batons", "Deux batons forment le manche."],
        ["Pioche en pierre", "C'est le premier vrai upgrade de minage."]
      ],
      enderDragon: [
        ["Route du portail", "Sachez comment entrer et comment vous remettre d'un echec."],
        ["Reserve de nourriture", "Les bonnes provisions valent plus que le courage."],
        ["Objectif final", "Le combat contre le dragon doit venir apres une longue preparation."]
      ]
    }
  }[locale];
}

function renderGuideVisual(locale, visualKind) {
  const copy = visualSet(locale);
  const sets = {
    "first-day": [
      svgCard({
        title: copy.firstDay[0][0],
        subtitle: copy.firstDay[0][1],
        art: mcTexture("oak_log.png", "Oak log texture")
      }),
      svgCard({
        title: copy.firstDay[1][0],
        subtitle: copy.firstDay[1][1],
        art: mcTexture("red_bed.png", "Red bed item icon")
      }),
      svgCard({
        title: copy.firstDay[2][0],
        subtitle: copy.firstDay[2][1],
        art: mcTextureStack([
          { path: "grass_block_side.png", alt: "Grass block texture" },
          { path: "oak_door_bottom.png", alt: "Oak door texture" },
          { path: "torch.png", alt: "Torch texture" }
        ])
      })
    ],
    wood: [
      svgCard({
        title: copy.wood[0][0],
        subtitle: copy.wood[0][1],
        art: mcTexture("oak_log.png", "Oak log texture")
      }),
      svgCard({
        title: copy.wood[1][0],
        subtitle: copy.wood[1][1],
        art: mcTexture("oak_planks.png", "Oak planks texture")
      }),
      svgCard({
        title: copy.wood[2][0],
        subtitle: copy.wood[2][1],
        art: mcTexture("stone_axe.png", "Stone axe item icon")
      })
    ],
    "crafting-table": [
      svgCard({
        title: copy.craftingTable[0][0],
        subtitle: copy.craftingTable[0][1],
        art: mcTexture("oak_planks.png", "Oak planks texture")
      }),
      svgCard({
        title: copy.craftingTable[1][0],
        subtitle: copy.craftingTable[1][1],
        art: mcTextureStack([
          { path: "oak_log.png", alt: "Oak log texture" },
          { path: "oak_planks.png", alt: "Oak planks texture" },
          { path: "crafting_table_front.png", alt: "Crafting table texture" }
        ])
      }),
      svgCard({
        title: copy.craftingTable[2][0],
        subtitle: copy.craftingTable[2][1],
        art: mcTexture("crafting_table_front.png", "Crafting table texture")
      })
    ],
    bed: [
      svgCard({
        title: copy.bed[0][0],
        subtitle: copy.bed[0][1],
        art: mcTexture("white_wool.png", "White wool texture")
      }),
      svgCard({
        title: copy.bed[1][0],
        subtitle: copy.bed[1][1],
        art: mcTexture("oak_planks.png", "Oak planks texture")
      }),
      svgCard({
        title: copy.bed[2][0],
        subtitle: copy.bed[2][1],
        art: mcTexture("red_bed.png", "Red bed item icon")
      })
    ],
    "furnace-guide": [
      svgCard({
        title: copy.furnaceGuide[0][0],
        subtitle: copy.furnaceGuide[0][1],
        art: mcTexture("cobblestone.png", "Cobblestone texture")
      }),
      svgCard({
        title: copy.furnaceGuide[1][0],
        subtitle: copy.furnaceGuide[1][1],
        art: mcTexture("furnace_front.png", "Furnace texture")
      }),
      svgCard({
        title: copy.furnaceGuide[2][0],
        subtitle: copy.furnaceGuide[2][1],
        art: mcTextureStack([
          { path: "coal.png", alt: "Coal item icon" },
          { path: "charcoal.png", alt: "Charcoal item icon" },
          { path: "oak_log.png", alt: "Oak log texture" }
        ])
      })
    ],
    torch: [
      svgCard({
        title: copy.torch[0][0],
        subtitle: copy.torch[0][1],
        art: mcTexture("coal.png", "Coal item icon")
      }),
      svgCard({
        title: copy.torch[1][0],
        subtitle: copy.torch[1][1],
        art: mcTexture("stick.png", "Stick item icon")
      }),
      svgCard({
        title: copy.torch[2][0],
        subtitle: copy.torch[2][1],
        art: mcTexture("torch.png", "Torch texture")
      })
    ],
    coal: [
      svgCard({
        title: copy.coal[0][0],
        subtitle: copy.coal[0][1],
        art: mcTexture("coal_ore.png", "Coal ore texture")
      }),
      svgCard({
        title: copy.coal[1][0],
        subtitle: copy.coal[1][1],
        art: mcTextureStack([
          { path: "stone.png", alt: "Stone texture" },
          { path: "coal_ore.png", alt: "Coal ore texture" },
          { path: "grass_block_top.png", alt: "Grass block top texture" }
        ])
      }),
      svgCard({
        title: copy.coal[2][0],
        subtitle: copy.coal[2][1],
        art: mcTexture("charcoal.png", "Charcoal item icon")
      })
    ],
    iron: [
      svgCard({
        title: copy.iron[0][0],
        subtitle: copy.iron[0][1],
        art: mcTexture("iron_ore.png", "Iron ore texture")
      }),
      svgCard({
        title: copy.iron[1][0],
        subtitle: copy.iron[1][1],
        art: mcTexture("stone_pickaxe.png", "Stone pickaxe item icon")
      }),
      svgCard({
        title: copy.iron[2][0],
        subtitle: copy.iron[2][1],
        art: mcTexture("furnace_front.png", "Furnace texture")
      })
    ],
    food: [
      svgCard({
        title: copy.food[0][0],
        subtitle: copy.food[0][1],
        art: mcTexture("wheat_seeds.png", "Wheat seeds item icon")
      }),
      svgCard({
        title: copy.food[1][0],
        subtitle: copy.food[1][1],
        art: mcTexture("cooked_beef.png", "Cooked beef item icon")
      }),
      svgCard({
        title: copy.food[2][0],
        subtitle: copy.food[2][1],
        art: mcTexture("hay_block_top.png", "Hay bale texture")
      })
    ],
    lost: [
      svgCard({
        title: copy.lost[0][0],
        subtitle: copy.lost[0][1],
        art: mcTexture("torch.png", "Torch texture")
      }),
      svgCard({
        title: copy.lost[1][0],
        subtitle: copy.lost[1][1],
        art: mcTextureStack([
          { path: "map.png", alt: "Map item icon" },
          { path: "compass_00.png", alt: "Compass item icon" }
        ])
      }),
      svgCard({
        title: copy.lost[2][0],
        subtitle: copy.lost[2][1],
        art: mcTextureStack([
          { path: "oak_sign.png", alt: "Oak sign item icon" },
          { path: "torch.png", alt: "Torch texture" },
          { path: "grass_block_side.png", alt: "Grass block texture" }
        ])
      })
    ],
    house: [
      svgCard({
        title: copy.house[0][0],
        subtitle: copy.house[0][1],
        art: mcTextureStack([
          { path: "oak_sign.png", alt: "Oak sign item icon" },
          { path: "ladder.png", alt: "Ladder texture" },
          { path: "torch.png", alt: "Torch texture" }
        ])
      }),
      svgCard({
        title: copy.house[1][0],
        subtitle: copy.house[1][1],
        art: mcTextureStack([
          { path: "grass_block_top.png", alt: "Grass block top texture" },
          { path: "stone.png", alt: "Stone texture" },
          { path: "grass_block_side.png", alt: "Grass block side texture" }
        ])
      }),
      svgCard({
        title: copy.house[2][0],
        subtitle: copy.house[2][1],
        art: mcTextureStack([
          { path: "torch.png", alt: "Torch texture" },
          { path: "oak_sign.png", alt: "Oak sign item icon" },
          { path: "grass_block_side.png", alt: "Grass block side texture" }
        ])
      })
    ],
    chest: [
      svgCard({
        title: copy.chest[0][0],
        subtitle: copy.chest[0][1],
        art: mcTexture("oak_planks.png", "Oak planks texture")
      }),
      svgCard({
        title: copy.chest[1][0],
        subtitle: copy.chest[1][1],
        art: mcTexture("chest.png", "Chest texture")
      }),
      svgCard({
        title: copy.chest[2][0],
        subtitle: copy.chest[2][1],
        art: mcTextureStack([
          { path: "chest.png", alt: "Chest texture" },
          { path: "crafting_table_front.png", alt: "Crafting table texture" },
          { path: "furnace_front.png", alt: "Furnace texture" }
        ])
      })
    ],
    village: [
      svgCard({
        title: copy.village[0][0],
        subtitle: copy.village[0][1],
        art: mcTexture("red_bed.png", "Red bed item icon")
      }),
      svgCard({
        title: copy.village[1][0],
        subtitle: copy.village[1][1],
        art: mcTexture("hay_block_top.png", "Hay bale texture")
      }),
      svgCard({
        title: copy.village[2][0],
        subtitle: copy.village[2][1],
        art: mcTextureStack([
          { path: "oak_door_bottom.png", alt: "Oak door texture" },
          { path: "torch.png", alt: "Torch texture" },
          { path: "grass_block_side.png", alt: "Grass block texture" }
        ])
      })
    ],
    netherPrep: [
      svgCard({
        title: copy.netherPrep[0][0],
        subtitle: copy.netherPrep[0][1],
        art: mcTexture("cooked_beef.png", "Cooked beef item icon")
      }),
      svgCard({
        title: copy.netherPrep[1][0],
        subtitle: copy.netherPrep[1][1],
        art: mcTextureStack([
          { path: "map.png", alt: "Map item icon" },
          { path: "compass_00.png", alt: "Compass item icon" }
        ])
      }),
      svgCard({
        title: copy.netherPrep[2][0],
        subtitle: copy.netherPrep[2][1],
        art: mcTextureStack([
          { path: "iron_ingot.png", alt: "Iron ingot item icon" },
          { path: "torch.png", alt: "Torch texture" },
          { path: "oak_log.png", alt: "Oak log texture" }
        ])
      })
    ],
    shield: [
      svgCard({
        title: copy.shield[0][0],
        subtitle: copy.shield[0][1],
        art: mcTexture("iron_ingot.png", "Iron ingot item icon")
      }),
      svgCard({
        title: copy.shield[1][0],
        subtitle: copy.shield[1][1],
        art: mcTexture("oak_planks.png", "Oak planks texture")
      }),
      svgCard({
        title: copy.shield[2][0],
        subtitle: copy.shield[2][1],
        art: mcTextureStack([
          { path: "iron_ingot.png", alt: "Iron ingot item icon" },
          { path: "oak_planks.png", alt: "Oak planks texture" },
          { path: "wooden_sword.png", alt: "Wooden sword item icon" }
        ])
      })
    ],
    safeMining: [
      svgCard({
        title: copy.safeMining[0][0],
        subtitle: copy.safeMining[0][1],
        art: mcTexture("torch.png", "Torch texture")
      }),
      svgCard({
        title: copy.safeMining[1][0],
        subtitle: copy.safeMining[1][1],
        art: mcTexture("stone_pickaxe.png", "Stone pickaxe item icon")
      }),
      svgCard({
        title: copy.safeMining[2][0],
        subtitle: copy.safeMining[2][1],
        art: mcTextureStack([
          { path: "cooked_beef.png", alt: "Cooked beef item icon" },
          { path: "cobblestone.png", alt: "Cobblestone texture" },
          { path: "torch.png", alt: "Torch texture" }
        ])
      })
    ],
    villagerTrade: [
      svgCard({
        title: copy.villagerTrade[0][0],
        subtitle: copy.villagerTrade[0][1],
        art: mcTextureStack([
          { path: "oak_door_bottom.png", alt: "Oak door texture" },
          { path: "red_bed.png", alt: "Red bed item icon" },
          { path: "torch.png", alt: "Torch texture" }
        ])
      }),
      svgCard({
        title: copy.villagerTrade[1][0],
        subtitle: copy.villagerTrade[1][1],
        art: mcTexture("hay_block_top.png", "Hay bale texture")
      }),
      svgCard({
        title: copy.villagerTrade[2][0],
        subtitle: copy.villagerTrade[2][1],
        art: mcTextureStack([
          { path: "chest.png", alt: "Chest texture" },
          { path: "iron_ingot.png", alt: "Iron ingot item icon" },
          { path: "cooked_beef.png", alt: "Cooked beef item icon" }
        ])
      })
    ],
    starterHouse: [
      svgCard({
        title: copy.starterHouse[0][0],
        subtitle: copy.starterHouse[0][1],
        art: mcTexture("oak_door_bottom.png", "Oak door texture")
      }),
      svgCard({
        title: copy.starterHouse[1][0],
        subtitle: copy.starterHouse[1][1],
        art: mcTexture("red_bed.png", "Red bed item icon")
      }),
      svgCard({
        title: copy.starterHouse[2][0],
        subtitle: copy.starterHouse[2][1],
        art: mcTextureStack([
          { path: "chest.png", alt: "Chest texture" },
          { path: "furnace_front.png", alt: "Furnace texture" },
          { path: "crafting_table_front.png", alt: "Crafting table texture" }
        ])
      })
    ],
    breadGuide: [
      svgCard({
        title: copy.breadGuide[0][0],
        subtitle: copy.breadGuide[0][1],
        art: mcTextureStack([
          { path: "wheat_seeds.png", alt: "Wheat seeds item icon" },
          { path: "hay_block_top.png", alt: "Hay bale texture" }
        ])
      }),
      svgCard({
        title: copy.breadGuide[1][0],
        subtitle: copy.breadGuide[1][1],
        art: mcTexture("wheat_seeds.png", "Wheat seeds item icon")
      }),
      svgCard({
        title: copy.breadGuide[2][0],
        subtitle: copy.breadGuide[2][1],
        art: mcTexture("hay_block_top.png", "Hay bale texture")
      })
    ],
    doorGuide: [
      svgCard({
        title: copy.doorGuide[0][0],
        subtitle: copy.doorGuide[0][1],
        art: mcTexture("oak_planks.png", "Oak planks texture")
      }),
      svgCard({
        title: copy.doorGuide[1][0],
        subtitle: copy.doorGuide[1][1],
        art: mcTexture("oak_door_bottom.png", "Oak door texture")
      }),
      svgCard({
        title: copy.doorGuide[2][0],
        subtitle: copy.doorGuide[2][1],
        art: mcTextureStack([
          { path: "oak_door_bottom.png", alt: "Oak door texture" },
          { path: "torch.png", alt: "Torch texture" }
        ])
      })
    ],
    stonePickaxeGuide: [
      svgCard({
        title: copy.stonePickaxeGuide[0][0],
        subtitle: copy.stonePickaxeGuide[0][1],
        art: mcTexture("cobblestone.png", "Cobblestone texture")
      }),
      svgCard({
        title: copy.stonePickaxeGuide[1][0],
        subtitle: copy.stonePickaxeGuide[1][1],
        art: mcTexture("stick.png", "Stick item icon")
      }),
      svgCard({
        title: copy.stonePickaxeGuide[2][0],
        subtitle: copy.stonePickaxeGuide[2][1],
        art: mcTexture("stone_pickaxe.png", "Stone pickaxe item icon")
      })
    ],
    enderDragon: [
      svgCard({
        title: copy.enderDragon[0][0],
        subtitle: copy.enderDragon[0][1],
        art: mcTextureStack([
          { path: "map.png", alt: "Map item icon" },
          { path: "compass_00.png", alt: "Compass item icon" }
        ])
      }),
      svgCard({
        title: copy.enderDragon[1][0],
        subtitle: copy.enderDragon[1][1],
        art: mcTexture("cooked_beef.png", "Cooked beef item icon")
      }),
      svgCard({
        title: copy.enderDragon[2][0],
        subtitle: copy.enderDragon[2][1],
        art: mcTextureStack([
          { path: "iron_ingot.png", alt: "Iron ingot item icon" },
          { path: "torch.png", alt: "Torch texture" },
          { path: "map.png", alt: "Map item icon" }
        ])
      })
    ]
  };

  return `<div class="visual-grid">${sets[visualKind].join("")}</div>`;
}

function resolveRoute(pathname) {
  if (pathname === "/" || pathname === "") {
    return { type: "redirect", location: "/en/" };
  }

  const staticExt = extname(pathname);
  if (staticExt) {
    return { type: "static", pathname };
  }

  const cleaned = pathname.replace(/^\/+|\/+$/g, "");
  const parts = cleaned.split("/");
  const locale = parts[0];

  if (!locales.includes(locale)) {
    return { type: "not-found" };
  }

  if (parts.length === 1) {
    return { type: "home", locale };
  }

  const slug = parts[1];
  for (const [pageKey, pages] of Object.entries(infoPages)) {
    if (pages[locale].slug === slug) {
      return { type: "info", locale, pageKey };
    }
  }

  const guide = guides.find((item) => item.pages[locale].slug === slug);
  if (!guide) {
    return { type: "not-found" };
  }

  return { type: "guide", locale, guide };
}

function buildSitemapXml() {
  const urls = [];
  for (const locale of locales) {
    urls.push(`${siteOrigin}/${locale}/`);
    for (const pages of Object.values(infoPages)) {
      urls.push(`${siteOrigin}/${locale}/${pages[locale].slug}/`);
    }
    for (const guide of guides) {
      urls.push(`${siteOrigin}/${locale}/${guide.pages[locale].slug}/`);
    }
  }

  const body = urls
    .map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`;
}

function buildAdsTxt() {
  if (adsensePublisherId) {
    return `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`;
  }

  return `# Add your Google AdSense publisher id in ADSENSE_CLIENT to enable ads.txt automatically.\n# Expected format: google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`;
}

async function serveStatic(pathname, res) {
  try {
    const relativePath = pathname.replace(/^\/+/, "");
    const filePath = normalize(join(publicDir, relativePath));
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    const file = await readFile(filePath);
    const mime =
      {
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".svg": "image/svg+xml"
      }[extname(pathname)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const route = resolveRoute(url.pathname);

  if (route.type === "redirect") {
    res.writeHead(302, { Location: route.location });
    res.end();
    return;
  }

  if (url.pathname === "/robots.txt") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(buildRobotsTxt());
    return;
  }

  if (url.pathname === "/ads.txt") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(buildAdsTxt());
    return;
  }

  if (url.pathname === "/sitemap.xml") {
    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    res.end(buildSitemapXml());
    return;
  }

  if (route.type === "static") {
    await serveStatic(url.pathname, res);
    return;
  }

  if (route.type === "home") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderHome(route.locale));
    return;
  }

  if (route.type === "info") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderInfoPage(route.locale, route.pageKey));
    return;
  }

  if (route.type === "guide") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderGuide(route.locale, route.guide));
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Page not found");
});

server.listen(port, () => {
  console.log(`Minecraft For Beginners running at http://localhost:${port}`);
});
