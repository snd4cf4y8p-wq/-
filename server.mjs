import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 3000);

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
  return `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle(locale, title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
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
  const nav = navLabels[locale];
  return guides
    .filter((guide) => guide.id !== currentId)
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
