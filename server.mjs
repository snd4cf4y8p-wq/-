import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const siteOrigin = process.env.PUBLIC_SITE_URL || "http://localhost:3000";

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
    language: "Language"
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
    language: "Sprache"
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
    language: "Langue"
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
  }
];

const locales = ["en", "de", "fr"];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pageTitle(locale, title) {
  return `${escapeHtml(title)} | ${siteName}`;
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

function renderLayout({ locale, title, description, hero, main, guide }) {
  const nav = navLabels[locale];
  const canonicalPath = guide ? `/${locale}/${guide.pages[locale].slug}/` : `/${locale}/`;
  const hreflangs = locales
    .map((altLocale) => {
      const href = guide
        ? `${siteOrigin}/${altLocale}/${guide.pages[altLocale].slug}/`
        : `${siteOrigin}/${altLocale}/`;
      return `<link rel="alternate" hreflang="${altLocale}" href="${href}" />`;
    })
    .join("\n    ");
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
    <script src="/crafting-sim.js" defer></script>
  </head>
  <body>
    <div class="page-shell guide-theme">
      <header class="topbar">
        <a class="brand" href="/${locale}/">${siteName}</a>
        <nav class="topnav">
          <a href="/${locale}/">${escapeHtml(nav.home)}</a>
          <a href="#guides">${escapeHtml(nav.guides)}</a>
        </nav>
        <div class="lang-switch" aria-label="${escapeHtml(nav.language)}">
          ${buildLanguageLinks(locale, guide)}
        </div>
      </header>
      ${hero}
      ${main}
      <footer class="site-footer">
        <p>${escapeHtml(homeCopy[locale].footer)}</p>
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
      <p class="lede">${escapeHtml(page.summary)}</p>
      <div class="hero-actions">
        <a class="ghost-button" href="/${locale}/">${escapeHtml(nav.back)}</a>
      </div>
    </div>
  </section>`;

  const steps = page.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const mistakes = page.mistakes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const tips = page.tips.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const labels = {
    en: {
      quick: "Quick Answer",
      steps: "Step-by-Step Guide",
      mistakes: "Common Mistakes",
      tips: "Beginner Tips",
      related: "Related Guides",
      visual: "What to recognize",
      visualNote: "Use these simple visual cues so you know what to look for in-game.",
      ingredients: "Ingredients",
      result: "Result",
      notes: "What it looks like and how to use it"
    },
    de: {
      quick: "Kurze Antwort",
      steps: "Schritt-fur-Schritt-Guide",
      mistakes: "Haufige Fehler",
      tips: "Tipps fur Anfanger",
      related: "Verwandte Guides",
      visual: "Was du erkennen solltest",
      visualNote: "Diese einfachen Bilder helfen dir, wichtige Dinge im Spiel schneller zu erkennen.",
      ingredients: "Materialien",
      result: "Ergebnis",
      notes: "So sieht es aus und so benutzt du es"
    },
    fr: {
      quick: "Reponse rapide",
      steps: "Guide etape par etape",
      mistakes: "Erreurs frequentes",
      tips: "Conseils debutants",
      related: "Guides lies",
      visual: "Ce qu'il faut reconnaitre",
      visualNote: "Utilisez ces reperes visuels simples pour savoir quoi chercher dans le jeu.",
      ingredients: "Ingredients",
      result: "Resultat",
      notes: "A quoi cela ressemble et comment l'utiliser"
    }
  }[locale];

  const visual = renderGuideVisual(locale, guide.visual);
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
      ${crafting}
      ${simulator}
      ${furnaceSimulator}
      <section>
        <h2>${escapeHtml(labels.quick)}</h2>
        <p>${escapeHtml(page.quickAnswer)}</p>
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
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const notes = crafting.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<section class="crafting-section">
    <h2>${escapeHtml(crafting.title)}</h2>
    <p>${escapeHtml(crafting.intro)}</p>
    <div class="crafting-grid">
      <div class="crafting-box">
        <h3>${escapeHtml(labels.ingredients)}</h3>
        <ul>${ingredients}</ul>
      </div>
      <div class="crafting-box">
        <h3>${escapeHtml(labels.result)}</h3>
        <p class="crafting-result">${escapeHtml(crafting.result)}</p>
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
