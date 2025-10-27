import { watchkeeper } from "../modules/config.js";
import { WKitemSheet } from "../templates/sheets/WKitemSheet.js";
//import { WKweaponSheet } from "../templates/sheets/WKweaponSheet.js";
import { WKnamedCharacterSheet } from "../templates/sheets/WKnamedCharacterSheet.js";



Hooks.once("init", async () => {

    console.log("watchkeeper | Initalizing WATCHKEEPER Core System");

    // Setting up the Global Configuration Object
    CONFIG.watchkeeper = watchkeeper;
    CONFIG.INIT = true;

    // Register custom Sheets and unregister the start Sheets
    // Items.unregisterSheet("core", ItemSheet);
    // Actors.unregisterSheet("core", ActorSheet);

    // Load all Partial-Handlebar Files
    preloadHandlebarsTemplates();

    // Register Additional Handelbar Helpers
    registerHandelbarsHelpers();  
     // Register item sheet
      Items.unregisterSheet("core", ItemSheet);
      Items.registerSheet("watchkeeper", WKitemSheet, {
        types: ["weapon", "armor", "utility", "genomes", "consumables", "miscellanous", "vehicle"],
        makeDefault: true});
      // Register actor sheet
        Actors.unregisterSheet("core", ActorSheet);
        Actors.registerSheet("watchkeeper", WKnamedCharacterSheet, { types: ["hero"],
        makeDefault:true});

     
});

Hooks.once("ready", async () => {

    // Finished Initalization Phase and release lock
    CONFIG.INIT = false;

    // Only execute when run as Gamemaster
    if(!game.user.isGM) return; 
    
    game.actors.forEach(actor => {
    if (actor.type === "character") {
      // Initialize psychology if missing
      if (!actor.system.psychology) {
        actor.update({
          "system.psychology": {
            disorders: [
              {name: "", minimal: "", severe: "", critical: ""},
              {name: "", minimal: "", severe: "", critical: ""},
              {name: "", minimal: "", severe: "", critical: ""}
            ],
            mutations: [
              {name: "", minimal: "", severe: "", critical: ""},
              {name: "", minimal: "", severe: "", critical: ""},
              {name: "", minimal: "", severe: "", critical: ""}
            ]
          }
        });
      }
    }
  });
});

function preloadHandlebarsTemplates() {

    const templatePaths = [

        // "systems/WATCHKEEPER/templates/partials/template.hbs",

    ];
    
    return loadTemplates(templatePaths);
};

function registerHandelbarsHelpers() {

    Handlebars.registerHelper("equals", function(v1, v2) { return (v1 === v2)});

    Handlebars.registerHelper("contains", function(element, search) { return (element.includes(search))});

    Handlebars.registerHelper("concat", function(s1, s2, s3 = "") { return s1 + s2 + s3;});

    Handlebars.registerHelper("isGreater", function(p1, p2) { return (p1 > p2)});

    Handlebars.registerHelper("isEqualORGreater", function(p1, p2) { return (p1 >= p2)});

    Handlebars.registerHelper("ifOR", function(conditional1, conditional2) { return (conditional1 || conditional2)});

    Handlebars.registerHelper("doLog", function(value) { console.log(value)});

    Handlebars.registerHelper("toBoolean", function(string) { return (string === "true")});

    Handlebars.registerHelper('for', function(from, to, incr, content) {

        let result = "";

        for(let i = from; i < to; i += incr)
            result += content.fn(i);

        return result;
    });

    Handlebars.registerHelper("times", function(n, content) {
        
        let result = "";
        
        for(let i = 0; i < n; i++)
            result += content.fn(i);

        return result;
    });

    Handlebars.registerHelper("notEmpty", function(value) {

        if (value == 0 || value == "0") return true;
        if (value == null|| value  == "") return false;
        return true;
    });
}


/* -------------------------------------------- */
/*  General Functions                           */
/* -------------------------------------------- */