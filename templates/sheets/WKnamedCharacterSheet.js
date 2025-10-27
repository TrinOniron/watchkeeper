export class WKnamedCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["watchkeeper", "sheet", "actor"],
            template: "systems/watchkeeper/templates/actor/namedCharacter.hbs",
            width: 800,
            height: 700,
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "personal",
            }],
            scrollY: [".scrollable"],
        });
    }

    getData() {
        const context = super.getData();
        
        // Create a single systemData object to handle all system properties
        const systemData = context.actor.system || {};
        
        // Initialize all sections in a single consolidated block
        const defaultData = {
            personal: {
                pseudonym: "",
                pronouns: "",
                identity: "",
                drive: "",
                callsign: "",
                age: 0,
                origin: "",
                role: "",
                fate: "",
                mementos: "",
                beliefs: "",
            },
            stats: {
                hp: { value: 0, max: 10 },
                movement: 0,
                fatigue: { current: 0, max: 0 },
                morale: 0,
                xenosis: 0,
            },
            skills: {
                athletics: 20,
                acrobatics: 10,
                firstAid: 20,
                lightFirearms: 30,
                search: 10,
                bluntMelee: 30,
                brawling: 20,
                stealth: 10,
                // ... all other skills with default values ...
            },
            psychology: {
                disorders: Array(3).fill({ 
                    name: "", 
                    minimal: "", 
                    severe: "", 
                    critical: "" 
                }),
                mutations: Array(3).fill({ 
                    name: "", 
                    minimal: "", 
                    severe: "", 
                    critical: "" 
                })
            },
            traits: "",
            saves: {
                endurance: 50,
                resolve: 50,
                perception: 50,
                agility: 50,
                charisma: 50
            }
        };

        // Merge defaults with existing data
        context.system = foundry.utils.mergeObject(defaultData, systemData);
        
        // Calculate derived stats
        const totalSavesSpent = Object.values(context.system.saves).reduce((sum, val) => sum + val, 0);
        context.system.savesRemaining = 250 - totalSavesSpent;
        
        // Calculate max fatigue if not manually set
        if (context.system.stats.fatigue.max === 0) {
            context.system.stats.fatigue.max = Math.floor(context.system.saves.endurance / 4);
        }

        // Prepare items with localized type labels
        context.items = context.actor.items.map(item => ({
            ...item.toObject(),
            typeLabel: game.i18n.localize(`watchkeeper.item.types.${item.type}`)
        }));

        // Prepare skills for display
        context.skills = Object.entries(context.system.skills).map(([key, value]) => ({
            key,
            value,
            label: game.i18n.localize(`watchkeeper.skills.${key}`)
        }));

        // Static data
        context.itemTypes = [
            "weapon", "armor", "utility", "genomes", 
            "consumables", "miscellanous", "vehicle"
        ];
        
        context.fate = {
            guerrilla: game.i18n.localize("watchkeeper.fate.guerrilla"),
            watchkeeper: game.i18n.localize("watchkeeper.fate.watchkeeper"),
            penal: game.i18n.localize("watchkeeper.fate.penal"),
            stray: game.i18n.localize("watchkeeper.fate.stray"),
            nihilist: game.i18n.localize("watchkeeper.fate.nihilist"),
            zealot: game.i18n.localize("watchkeeper.fate.zealot")
        };

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Register Handlebars helper
        Handlebars.registerHelper("localizeItemType", type => 
            game.i18n.localize(`watchkeeper.item.types.${type}`)
        );

        // Psychology input handling
        html.find('.psychology-section input').on('input', this._onPsychologyInputChange.bind(this));

        // Save point controls
        html.find(".save-increase").click(this._onSaveIncrease.bind(this));
        html.find(".save-decrease").click(this._onSaveDecrease.bind(this));
        html.find(".saves-section input").on("change", this._onSaveInput.bind(this));
        
        // Fatigue system
        html.find('input[name="system.saves.endurance"]').on("change", this._onEnduranceChange.bind(this));
        html.find(".current-fatigue, .max-fatigue").on("change", this._onFatigueChange.bind(this));
        
        // Item management
        html.find(".item-edit").click(this._onItemEdit.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".item").each((i, li) => {
            li.setAttribute("draggable", true);
            li.addEventListener("dragstart", this._onDragStart.bind(this), false);
        });
    }

    // Psychology input handler
    _onPsychologyInputChange(event) {
        const input = event.currentTarget;
        const name = input.name;
        const value = input.value;
        
        this.actor.update({ [name]: value });
        this._updateCellBackground(input);
    }

    _updateCellBackground(input) {
        const level = input.dataset.level;
        input.classList.remove('minimal-bg', 'severe-bg', 'critical-bg');
        
        if (input.value.trim() !== '') {
            input.classList.add(`${level}-bg`);
        }
    }

    // Item handlers
    _onItemCreate(event) {
        event.preventDefault();
        const li = event.currentTarget.closest(".item-create-group");
        const type = li.querySelector(".item-type-select").value;

        this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize(`watchkeeper.item.types.${type}`),
            type: type,
            system: {}
        }]);
    }

    _onItemEdit(event) {
        const li = event.currentTarget.closest(".item");
        this.actor.items.get(li.dataset.itemId)?.sheet.render(true);
    }

    _onItemDelete(event) {
        const li = event.currentTarget.closest(".item");
        this.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
    }

    _onDragStart(event) {
        const li = event.currentTarget;
        event.dataTransfer.setData("text/plain", JSON.stringify({
            type: "Item",
            id: li.dataset.itemId,
            pack: null
        }));
    }

    // Save system handlers
    _onSaveIncrease(event) {
        this._adjustSave(event.currentTarget.dataset.save, 1);
    }

    _onSaveDecrease(event) {
        this._adjustSave(event.currentTarget.dataset.save, -1);
    }

    _onSaveInput(event) {
        const input = event.currentTarget;
        const saveType = input.name.replace("system.saves.", "");
        const newValue = Math.clamped(parseInt(input.value) || 0, 20, 65);
        
        this.actor.update({ [`system.saves.${saveType}`]: newValue });
    }

    async _adjustSave(saveType, delta) {
        const currentValue = this.actor.system.saves[saveType] || 50;
        const newValue = currentValue + delta;
        
        if (newValue < 20 || newValue > 65) return;
        
        const totalSpent = Object.values(this.actor.system.saves).reduce((sum, val) => sum + val, 0);
        
        if (delta > 0 && (250 - totalSpent) < 1) {
            ui.notifications.warn("Not enough points remaining!");
            return;
        }

        await this.actor.update({ [`system.saves.${saveType}`]: newValue });
    }

    // Fatigue system handlers
    _onEnduranceChange(event) {
        const newEndurance = parseInt(event.target.value) || 0;
        const updates = {
            "system.saves.endurance": newEndurance
        };
        
        if (this.actor.system.stats.fatigue.max === Math.floor(this.actor.system.saves.endurance / 4)) {
            updates["system.stats.fatigue.max"] = Math.floor(newEndurance / 4);
        }
        
        this.actor.update(updates);
    }

    _onFatigueChange(event) {
        const input = event.currentTarget;
        const field = input.name;
        let value = parseInt(input.value) || 0;
        
        if (field === "system.stats.fatigue.current") {
            value = Math.min(value, this.actor.system.stats.fatigue.max);
        }
        
        this.actor.update({ [field]: value });
    }
}