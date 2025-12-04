import { watchkeeper } from "../modules/config.js";
// Convention Note: Usually sheets are in "modules/sheets/...", not "templates/sheets/..."
// But if your files are there, this import is fine.
import { WKitemSheet } from "../templates/sheets/WKitemSheet.js";
import { WKnamedCharacterSheet } from "../templates/sheets/WKnamedCharacterSheet.js";

Hooks.once("init", async () => {
    console.log("watchkeeper | Initalizing WATCHKEEPER Core System");

    CONFIG.watchkeeper = watchkeeper;
    CONFIG.INIT = true;

    // Load templates
    preloadHandlebarsTemplates();
    
    // Register helpers
    registerHandelbarsHelpers();  

    // --- ITEM SHEETS ---
    // Unregister default core sheet
    Items.unregisterSheet("core", ItemSheet);
    // Register Custom Sheet
    Items.registerSheet("watchkeeper", WKitemSheet, {
        types: ["weapon", "armor", "utility", "genomes", "consumables", "miscellanous", "vehicle"],
        makeDefault: true
    });

    // --- ACTOR SHEETS ---
    // Unregister default core sheet
    Actors.unregisterSheet("core", ActorSheet);
    // Register Custom Sheet
    // IMPORTANT: Ensure "hero" matches the type in your template.json
    Actors.registerSheet("watchkeeper", WKnamedCharacterSheet, { 
        types: ["hero"], 
        makeDefault: true
    });
});

Hooks.once("ready", async () => {
    CONFIG.INIT = false;

    if(!game.user.isGM) return; 
    
    // Migrations / Data integrity checks
    // IMPORTANT: Ensure "hero" matches the type used in init and template.json
    const actorsToFix = game.actors.filter(a => a.type === "hero" && !a.system.psychology);
    
    for(const actor of actorsToFix) {
        console.log(`watchkeeper | Initializing psychology for ${actor.name}`);
        await actor.update({
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
});

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        // "systems/watchkeeper/templates/partials/template.hbs",
    ];
    // FIX: Use the global loadTemplates function
    return loadTemplates(templatePaths);
};

function registerHandelbarsHelpers() {

    Handlebars.registerHelper("equals", function(v1, v2) { return (v1 === v2)});
    Handlebars.registerHelper("contains", function(element, search) { return (element?.includes(search))});

    // FIX: Using ...args to safely handle the Handlebars options object
    Handlebars.registerHelper("concat", function(...args) {
        args.pop(); // Remove the options object (last argument)
        return args.join("");
    });

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