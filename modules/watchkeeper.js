import { watchkeeper } from "../modules/config.js";
import { WKitemSheet } from "../templates/sheets/WKitemSheet.js";
import { WKnamedCharacterSheet } from "../templates/sheets/WKnamedCharacterSheet.js";

Hooks.once("init", async () => {
    console.log("watchkeeper | Initializing WATCHKEEPER Core System");

    CONFIG.watchkeeper = watchkeeper;
    CONFIG.INIT = true;

    // Load templates using the correct V13+ namespace
    await foundry.applications.handlebars.loadTemplates([]); 
    
    // Register helpers
    registerHandelbarsHelpers();  

    // --- ITEM SHEETS ---
    // Register your ApplicationV2 sheets
    // Note: Items/Actors global objects are still available, 
    // but we use the namespaced versions for strict V13+ compliance.
    const ItemsCollection = foundry.documents.collections.Items;
    
    ItemsCollection.registerSheet("watchkeeper", WKitemSheet, {
        types: ["weapon", "armor", "utility", "genomes", "consumables", "miscellanous", "vehicle"],
        makeDefault: true
    });

    // --- ACTOR SHEETS ---
    const ActorsCollection = foundry.documents.collections.Actors;

    ActorsCollection.registerSheet("watchkeeper", WKnamedCharacterSheet, { 
        types: ["insurgent", "npc"], 
        makeDefault: true
    });
});

Hooks.once("ready", async () => {
    CONFIG.INIT = false;

    if(!game.user.isGM) return; 
    
    // Migrations / Data integrity checks
    const actorsToFix = game.actors.filter(a => a.type === "insurgent" && !a.system.psychology);
    
    for(const actor of actorsToFix) {
        console.log(`watchkeeper | Initializing psychology for ${actor.name}`);
        await actor.update({
            "system.psychology": {
                disorders: Array(3).fill({name: "", minimal: "", severe: "", critical: ""}),
                mutations: Array(3).fill({name: "", minimal: "", severe: "", critical: ""})
            }
        });
    }

    Hooks.once("ready", async () => {
        if (!game.user.isGM) return;

        for (const actor of game.actors) {
            // If the actor is an insurgent and is missing the skills object
            if (actor.type === "insurgent" && !actor.system.skills) {
                console.log(`watchkeeper | Migrating skills for ${actor.name}`);
                await actor.update({
                    "system.skills": {
                        athletics: 20,
                        acrobatics: 10,
                        firstaid: 20,
                        lightfirearms: 30,
                        search: 10,
                        bluntmelee: 30,
                        brawling: 20,
                        stealth: 10
                    }
                });
            }
        }
    });
});

function registerHandelbarsHelpers() {

    // Register helper to localize item types
    Handlebars.registerHelper('localizeItemType', (type) => {
      const key = `watchkeeper.item.types.${type}`;
      return game.i18n?.has(key) ? game.i18n.localize(key) : type;
    });

    Handlebars.registerHelper("equals", (v1, v2) => v1 === v2);
    Handlebars.registerHelper("contains", (element, search) => element?.includes(search));
    Handlebars.registerHelper("concat", (...args) => { args.pop(); return args.join(""); });
    Handlebars.registerHelper("isGreater", (p1, p2) => p1 > p2);
    Handlebars.registerHelper("isEqualORGreater", (p1, p2) => p1 >= p2);
    Handlebars.registerHelper("ifOR", (c1, c2) => c1 || c2);
    Handlebars.registerHelper("doLog", (value) => console.log(value));
    Handlebars.registerHelper("toBoolean", (string) => string === "true");

    Handlebars.registerHelper('for', function(from, to, incr, content) {
        let result = "";
        for(let i = from; i < to; i += incr) result += content.fn(i);
        return result;
    });

    Handlebars.registerHelper("times", function(n, content) {
        let result = "";
        for(let i = 0; i < n; i++) result += content.fn(i);
        return result;
    });

    Handlebars.registerHelper("notEmpty", (value) => {
        if (value == 0 || value == "0") return true;
        if (value == null || value === "") return false;
        return true;
    });
}