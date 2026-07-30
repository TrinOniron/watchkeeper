const { ActorSheetV2 } = foundry.applications?.sheets || {};
const { HandlebarsApplicationMixin } = foundry.applications?.api || {};

export class WKnamedCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
         classes: ["watchkeeper", "sheet", "actor", "namedCharacterSheet-sheet"],
        tag: "form",
        position: {
            width: 850,
            height: 900
        },
        window: {
            resizable: true
        },
        form: {
            handler: WKnamedCharacterSheet.#onSubmitForm,
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            rollClick: WKnamedCharacterSheet.#onRollClickAction,
            skillRoll: WKnamedCharacterSheet.#onSkillRollAction,
            savesRoll: WKnamedCharacterSheet.#onSavesRollAction,
            saveIncrease: WKnamedCharacterSheet.#onSaveIncreaseAction,
            saveDecrease: WKnamedCharacterSheet.#onSaveDecreaseAction,
            incrementTotal: WKnamedCharacterSheet.#onIncrementTotalAction,
            decrementTotal: WKnamedCharacterSheet.#onDecrementTotalAction,
            itemCreate: WKnamedCharacterSheet.#onItemCreateAction,
            itemEdit: WKnamedCharacterSheet.#onItemEditAction,
            itemDelete: WKnamedCharacterSheet.#onItemDeleteAction,
            injuryCellClick: WKnamedCharacterSheet.#onInjuryCellClickAction,
            removeGenome: WKnamedCharacterSheet.#onRemoveGenomeAction,
            tabClick: WKnamedCharacterSheet._onTabClick
        }
    };

    
    static PARTS = {
        overview: {
            template: "systems/watchkeeper/templates/actor/namedCharacter.hbs"
        },
        navigation: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabs.hbs"
        },
        tabone: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabone.hbs",
            scrollable: [""]
        },
        tabtwo: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabtwo.hbs",
            scrollable: [""]
        },
        tabthree: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabthree.hbs",
            scrollable: [""]
        },
        tabfour: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabfour.hbs",
            scrollable: [""]
        },
        tabfive: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabfive.hbs",
            scrollable: [""]
        },
        tabsix: {
            template: "systems/watchkeeper/templates/actor/parts/namedCharacter-tabsix.hbs",
            scrollable: [""]
        }
    };

    
    static TABS = {
        primary: {
        tabs: [
                { id: "tabone", group: "primary" },
                { id: "tabtwo", group: "primary" },
                { id: "tabthree", group: "primary" },
                { id: "tabfour", group: "primary" },
                { id: "tabfive", group: "primary" },
                { id: "tabsix", group: "primary" }
        ],
        initial: "tabone"
        }
    };

    
    async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        
        // Ensure V1/V2 compatibility properties are present for Handlebars templates
        context.actor = this.actor;
        context.document = this.actor;
        context.data = this.actor.toObject(false);
        context.config = CONFIG;
        context.CONFIG = CONFIG;
        context.user = game.user;
        context.editable = this.isEditable;
        context.cssClass = this.isEditable ? "editable" : "locked";
        context.isCharacter = this.actor.type === "character";
        context.isNPC = this.actor.type === "npc";
        context.isGM = game.user?.isGM || false;
        context.rollData = this.actor.getRollData?.() || {};
        context.tabs = this._getTabsConfig ? this._getTabsConfig("primary") : (this._prepareTabs ? this._prepareTabs("primary") : {});
        context.activeTab = this._sheetState?.tabs?.primary || this.tabGroups?.primary || "tabone";
        
        // Create a single systemData object to handle all system properties
        const systemData = this.actor.system || {};
        
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
                beliefs: ""
            },
            stats: {
                hp: { value: 0, max: 10 },
                movement: 0,
                fatigue: { current: 0, max: 0 },
                morale: 0,
                xenosis: 0
            },
            skills: {
                athletics: 20,
                acrobatics: 10,
                firstaid: 20,
                lightfirearms: 30,
                search: 10,
                bluntmelee: 30,
                brawling: 20,
                stealth: 10
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
        const totalSavesSpent = Object.values(context.system.saves || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
        context.system.savesRemaining = (systemData.savesTotal || 250) - totalSavesSpent;
        
        // Calculate max fatigue if not manually set
        if (context.system.stats.fatigue.max === 0) {
            context.system.stats.fatigue.max = Math.floor((context.system.saves.endurance || 0) / 4);
        }

        // Prepare items with localized type labels
        context.items = (this.actor.items || []).map(item => ({
            ...item.toObject(),
            typeLabel: game.i18n.localize(`watchkeeper.item.types.${item.type}`)
        }));

        // Prepare skills for display
        context.skills = Object.entries(context.system.skills || {}).map(([key, value]) => ({
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

        // Prepare choices from CONFIG.watchkeeper or fallbacks for dropdowns using selectOptions
        const wkConfig = CONFIG.watchkeeper || {};
        context.origins = context.origins || wkConfig.origins || wkConfig.origin || {};
        context.origin = context.origin || context.origins;
        context.roles = context.roles || wkConfig.roles || wkConfig.role || {};
        context.role = context.role || context.roles;
        context.drives = context.drives || wkConfig.drives || wkConfig.drive || {};
        context.drive = context.drive || context.drives;
        context.identities = context.identities || wkConfig.identities || wkConfig.identity || {};
        context.identity = context.identity || context.identities;
        context.pronouns = context.pronouns || wkConfig.pronouns || wkConfig.pronoun || {};

        // Prepare genomes from system.genomes array
        context.system.genomes = context.system.genomes || [];
        context.system.genomes = Array.isArray(context.system.genomes) 
            ? context.system.genomes 
            : [];
  
        // Initialize injuries if not present
         context.system.injuries = foundry.utils.mergeObject(
            this._getDefaultInjuries(),
            foundry.utils.duplicate(context.system.injuries || {})
        );
        context.injuryParts = {
            skull: {
                label: "watchkeeper.namedCharacterSheet.skull",
                bleeding: "watchkeeper.namedCharacterSheet.SkullBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.SkullInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.SkullMortalEffect",
                doubleDamage: true
            },
            face: {
                label: "watchkeeper.namedCharacterSheet.face",
                bleeding: "watchkeeper.namedCharacterSheet.FaceBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.FaceInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.FaceMortalEffect",
                doubleDamage: true
            },
            chest: {
                label: "watchkeeper.namedCharacterSheet.chest",
                bleeding: "watchkeeper.namedCharacterSheet.ChestBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.ChestInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.ChestMortalEffect"
            },
            rightArm: {
                label: "watchkeeper.namedCharacterSheet.rightArm",
                bleeding: "watchkeeper.namedCharacterSheet.rightArmBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.rightArmInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.rightArmMortalEffect"
            },
            leftArm: {
                label: "watchkeeper.namedCharacterSheet.leftArm",
                bleeding: "watchkeeper.namedCharacterSheet.leftArmBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.leftArmInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.leftArmMortalEffect"
            },
            abdomen: {
                label: "watchkeeper.namedCharacterSheet.abdomen",
                bleeding: "watchkeeper.namedCharacterSheet.AbdomenBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.AbdomenInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.AbdomenMortalEffect"
            },
            rightLeg: {
                label: "watchkeeper.namedCharacterSheet.rightLeg",
                bleeding: "watchkeeper.namedCharacterSheet.rightLegBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.rightLegInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.rightLegMortalEffect"
            },
            leftLeg: {
                label: "watchkeeper.namedCharacterSheet.leftLeg",
                bleeding: "watchkeeper.namedCharacterSheet.leftLegBleedingEffect",
                injury: "watchkeeper.namedCharacterSheet.leftLegInjuryEffect",
                mortal: "watchkeeper.namedCharacterSheet.leftLegMortalEffect"
            }
        };

        // Categorize items
        context.primaryItems = this.actor.items.filter(i => i.system.equipped === 'primary');
        context.secondaryItems = this.actor.items.filter(i => i.system.equipped === 'secondary');
        context.tertiaryItems = this.actor.items.filter(i => i.system.equipped === 'tertiary');
        context.apparelItems = this.actor.items.filter(i => i.type === 'armor' && i.system.equipped === 'apparel');
        context.inventoryItems = this.actor.items.filter(i => i.system.equipped === 'inventory');

        // Calculate available slots from equipped apparel
        context.availableSlots = this.actor.items
            .filter(i => i.type === 'armor' && i.system.equipped === 'apparel')
            .reduce((sum, item) => sum + (parseInt(item.system.inventorySlot) || 0), 0);

        // Calculate used slots from items marked as in inventory
        context.usedSlots = this.actor.items
            .filter(i => i.system.equipped === 'inventory' || i.system.inInventory)
            .reduce((sum, item) => sum + (parseInt(item.system.weight) || 0), 0);

        // Calculate if over limit
        context.overLimit = context.usedSlots > context.availableSlots;
        
        // Register Handlebars helpers
        this._registerHandlebarsHelpers();

        return context;
    }

    _registerHandlebarsHelpers() {
        if (!Handlebars.helpers['localizeItemType']) {
            Handlebars.registerHelper('localizeItemType', (type) => {
                if (!type) return "";
                return game.i18n.localize(`watchkeeper.item.types.${type}`);
            });
        }
         if (!Handlebars.helpers['localizeBodyPart']) {
            Handlebars.registerHelper('localizeBodyPart', (bodyPart) => {
                if (!bodyPart) return "";

                const translations = game.i18n.translations?.watchkeeper?.item?.fields?.bodyParts || {};
                const fallback = game.i18n._fallback?.watchkeeper?.item?.fields?.bodyParts || {};
                const choices = { ...fallback, ...translations };
                const storedKey = String(bodyPart).toLowerCase();
                const localeKey = Object.keys(choices).find(key => key.toLowerCase() === storedKey);

                return localeKey
                    ? game.i18n.localize(`watchkeeper.item.fields.bodyParts.${localeKey}`)
                    : bodyPart;
            });
        }
        // Safeguard built-in selectOptions against undefined/null choices when templates pass missing variables
        const origSelectOptions = Handlebars.helpers['selectOptions'];
        if (origSelectOptions && !origSelectOptions._wkSafeGuarded) {
            const safeSelectOptions = function(choices, options) {
                if (choices === undefined || choices === null || (typeof choices !== 'object' && typeof choices !== 'function')) {
                    return "";
                }
                return origSelectOptions.call(this, choices, options);
            };
            safeSelectOptions._wkSafeGuarded = true;
            Handlebars.registerHelper('selectOptions', safeSelectOptions);
        }
    }

    
    _onRender(context, options) {
        super._onRender(context, options);

        // A partial render replaces only the requested parts. Bind listeners
        // only inside those new DOM roots; binding against this.element would
        // duplicate listeners on every unchanged tab.
        const requestedParts = options.parts || [];
        const partRoots = requestedParts
            .map(partId => this.parts?.[partId])
            .filter(Boolean);
        const roots = partRoots.length ? partRoots : [this.element];
        const select = (selector) => {
            const elements = roots.flatMap(root => [
                ...(root.matches?.(selector) ? [root] : []),
                ...root.querySelectorAll(selector)
            ]);
            return [...new Set(elements)];
        };

        // An Actor update re-renders DocumentSheetV2. Restore UI state which
        // belongs to this application instance rather than to the Actor data.
        this._restoreSheetState();

        // Bind navigation once on the persistent application form. Unlike a
        // listener attached to a tab part, this survives partial tab renders.
        if (!this.element.dataset.wkTabsBound) {
            this.element.dataset.wkTabsBound = "true";
            this.element.addEventListener("click", (event) => {
                const tab = event.target.closest(".sheet-tabs [data-tab], .tabs [data-tab]");
                if (!tab || tab.dataset.action) return;
                event.preventDefault();

                const tabName = tab.dataset.tab;
                const groupName = tab.dataset.group || tab.closest("[data-group]")?.dataset.group || "primary";
                if (!tabName) return;

                this._rememberActiveTab(tabName, groupName);
                this._activateLegacyTab(tabName, groupName);
            });
        }

        for (const el of select(".skill-roll")) {
            if (!el.dataset.action) el.addEventListener("click", this._onSkillRoll.bind(this));
        }
        for (const el of select(".saves-roll")) {
            if (!el.dataset.action) el.addEventListener("click", this._onSavesRoll.bind(this));
        }
        for (const el of select(".rollable")) {
            if (!el.dataset.action) el.addEventListener("click", this._onRollClick.bind(this));
        }

        if (!this.isEditable) return;

        for (const el of select(".psychology-section input, .psychology-section textarea")) {
            el.addEventListener("blur", this._onPsychologyInputChange.bind(this));
        }
        for (const el of select(".save-increase")) {
            if (!el.dataset.action) el.addEventListener("click", this._onSaveIncrease.bind(this));
        }
        for (const el of select(".save-decrease")) {
            if (!el.dataset.action) el.addEventListener("click", this._onSaveDecrease.bind(this));
        }
        for (const el of select(".saves-section input")) {
            el.addEventListener("change", this._onSaveInput.bind(this));
        }
        for (const el of select(".increment-total")) {
            if (!el.dataset.action) el.addEventListener("click", this._onIncrementTotal.bind(this));
        }
        for (const el of select(".decrement-total")) {
            if (!el.dataset.action) el.addEventListener("click", this._onDecrementTotal.bind(this));
        }
        for (const el of select('input[name="system.saves.endurance"]')) {
            el.addEventListener("change", this._onEnduranceChange.bind(this));
        }
        for (const el of select(".current-fatigue, .max-fatigue")) {
            el.addEventListener("change", this._onFatigueChange.bind(this));
        }
        for (const el of select(".injury-cell")) {
            if (!el.dataset.action) el.addEventListener("click", this._onInjuryCellClick.bind(this));
        }
        for (const el of select(".stabilized-checkbox")) {
            el.addEventListener("change", this._onStabilizedChange.bind(this));
        }
        for (const el of select(".remove-genome")) {
            if (!el.dataset.action) el.addEventListener("click", this._onRemoveGenome.bind(this));
        }
        for (const el of select(".item-edit")) {
            if (!el.dataset.action) el.addEventListener("click", this._onIventoryItemEdit.bind(this));
        }
        for (const el of select(".item-delete")) {
            if (!el.dataset.action) el.addEventListener("click", this._onIventoryItemDelete.bind(this));
        }
        for (const el of select(".item-create")) {
            if (!el.dataset.action) el.addEventListener("click", this._onItemCreate.bind(this));
        }

        for (const dropZone of select(".genomes-dropzone")) {
            dropZone.addEventListener("dragover", this._onDragOver.bind(this));
            dropZone.addEventListener("drop", this._onGenomeDrop.bind(this));
        }
        for (const dropZone of select(".inventory-list")) {
            dropZone.addEventListener("drop", this._onInventoryDrop.bind(this));
        }
        for (const zone of select(".equipment-table, .apparel-section, .inventory-items")) {
            zone.addEventListener("dragover", this._onItemDragOver.bind(this));
            zone.addEventListener("drop", event => {
                const zoneType = event.currentTarget.dataset.dropzone
                    || (event.currentTarget.classList.contains("apparel-section") ? "apparel" : "inventory");
                this._onItemDrop(event, zoneType);
            });
        }
        for (const row of select("tr[data-item-id], li[data-item-id]")) {
            row.setAttribute("draggable", "true");
            row.addEventListener("dragstart", this._onItemDragStart.bind(this));
        }
    }

    /* -------------------------------------------- */
    /*  Static Action Handlers                      */
    /* -------------------------------------------- */

    static async #onSkillRollAction(event, target) {
         await this._onSkillRoll(event, target);
    }
    static async #onSavesRollAction(event, target) {
        await this._onSavesRoll(event);
    }
    static async #onRollClickAction(event, target) {
        await this._onRollClick(event);
    }
    static async #onSaveIncreaseAction(event, target) {
        await this._onSaveIncrease(event);
    }
    static async #onSaveDecreaseAction(event, target) {
        await this._onSaveDecrease(event);
    }
    static async #onIncrementTotalAction(event, target) {
        await this._onIncrementTotal(event);
    }
    static async #onDecrementTotalAction(event, target) {
        await this._onDecrementTotal(event);
    }
    static async #onItemCreateAction(event, target) {
        await this._onItemCreate(event);
    }
    static async #onItemEditAction(event, target) {
        await this._onIventoryItemEdit(event);
    }
    static async #onItemDeleteAction(event, target) {
        await this._onIventoryItemDelete(event);
    }
    static async #onInjuryCellClickAction(event, target) {
        await this._onInjuryCellClick(event);
    }
    static async #onRemoveGenomeAction(event, target) {
        await this._onRemoveGenome(event);
    }
     /* -------------------------------------------- */
    /*  Sheet UI State                              */
    /* -------------------------------------------- */

    /**
     * Find the element which actually owns the scrollbar in the current CSS
     * layout. Legacy sheets often scroll the form root or .sheet-body rather
     * than the old .scrollable element.
     */
    _getScrollContainers() {
        if (!this.element) return [];

        const explicit = [
            this.element,
            ...this.element.querySelectorAll(".scrollable, .sheet-body")
        ];
        const detected = [...this.element.querySelectorAll("*")].filter(element => {
            const style = getComputedStyle(element);
            return /auto|scroll|overlay/.test(style.overflowY)
                && element.scrollHeight > element.clientHeight;
        });

        return [...new Set([...explicit, ...detected])];
    }

    _getScrollContainerKey(element, index) {
        if (element === this.element) return "application-root";
        if (element.dataset.scrollId) return `data:${element.dataset.scrollId}`;
        if (element.id) return `id:${element.id}`;
        return `index:${index}`;
    }

    /**
     * Store state that should survive a reactive DocumentSheetV2 re-render.
     * This must be called while the current DOM is still mounted.
     */
    _captureSheetState() {
        const state = {
            // Only retain groups that are actually represented by this legacy
            // sheet's navigation. `tabGroups` can contain unrelated inherited
            // groups (for example "primary") which changeTab cannot resolve.
            tabs: { ...(this._sheetState?.tabs || {}) },
            scroll: []
        };

        // Support both native V2 navigation and legacy Watchkeeper navigation.
        this.element.querySelectorAll(".sheet-tabs [data-tab].active, .tabs [data-tab].active").forEach(nav => {
            const group = nav.dataset.group || nav.closest("[data-group]")?.dataset.group || "primary";
            state.tabs[group] = nav.dataset.tab;
        });

        // Capture the actual overflow container, including the V2 form root
        // when that is the element that owns the scrollbar.
        this._getScrollContainers().forEach((element, index) => {
            state.scroll.push({
                key: this._getScrollContainerKey(element, index),
                top: element.scrollTop,
                left: element.scrollLeft
            });
        });

        this._sheetState = state;
    }

    _rememberActiveTab(tab, group = "primary") {
        this._sheetState ??= { tabs: {}, scroll: [] };
        this._sheetState.tabs[group] = tab;
    }

    /**
     * Activate a tab using the existing Watchkeeper V1-compatible markup.
     * This is intentionally separate from ApplicationV2#changeTab because
     * the current template's group names are not yet mirrored by static TABS.
     */
    _activateLegacyTab(tab, group = "primary") {
        const navItems = this.element.querySelectorAll(".sheet-tabs [data-tab], .tabs [data-tab]");
        for (const nav of navItems) {
            const navGroup = nav.dataset.group
                || nav.closest("[data-group]")?.dataset.group
                || "primary";
            if (navGroup === group) nav.classList.toggle("active", nav.dataset.tab === tab);
        }

        this.element.querySelectorAll(".sheet-body[data-tab], .sheet-body [data-tab]").forEach(panel => {
            const panelGroup = panel.dataset.group || "primary";
            if (panelGroup === group) panel.classList.toggle("active", panel.dataset.tab === tab);
        });
    }

    /** Restore captured tab and scroll state after Application V2 re-renders. */
    _restoreSheetState() {
        const state = this._sheetState;
        if (!state) return;

        // Wait until Foundry has inserted the new HTML and the browser has
        // calculated scroll heights. A second render before this frame simply
        // uses the latest stored state.
        requestAnimationFrame(() => {
            if (!this.element?.isConnected) return;

            for (const [group, tab] of Object.entries(state.tabs || {})) {
                if (tab) this._activateLegacyTab(tab, group);
            }

            // Selecting a tab can change the scroll height. Restore after a
            // second frame, then once more on the next frame for images or
            // delayed layout inside the selected tab.
            const restoreScroll = () => {
                const scrollContainers = this._getScrollContainers();
                for (const saved of state.scroll || []) {
                    const element = scrollContainers.find((candidate, index) =>
                        this._getScrollContainerKey(candidate, index) === saved.key
                    );
                    if (!element) continue;
                    element.scrollTop = saved.top;
                    element.scrollLeft = saved.left;
                }
            };

            requestAnimationFrame(() => {
                restoreScroll();
                requestAnimationFrame(restoreScroll);
            });
        });
    }
    /* -------------------------------------------- */
    /*  Application V2 Form Handling                */
    /* -------------------------------------------- */

    /**
     * Persist ordinary Actor fields such as
     * name="system.skills.stealth". Application V2 form handlers receive
     * FormDataExtended; its `object` property is the update object suitable
     * for Actor#update.
     */
    static async #onSubmitForm(event, form, formData) {
        event.preventDefault();
        if (!this.isEditable) return;

        const updateData = formData.object;
        if (!updateData || !Object.keys(updateData).length) return;

        /*
         * The changed control already shows the user's new value. Avoid a
         * full reactive ActorSheetV2 re-render (and its visible flash) for
         * ordinary scalar form edits. The document still updates, broadcasts,
         * and runs its normal data preparation; only dependent Applications
         * are not re-rendered by this operation.
         */
        await this.actor.update(updateData, { render: false });
    }
    /* -------------------------------------------- */
    /*  Instance Event & Roll Handlers              */
    /* -------------------------------------------- */
     _getDefaultInjuries() {
        return {
            skull: { severity: null, stabilized: false },
            face: { severity: null, stabilized: false },
            chest: { severity: null, stabilized: false },
            rightArm: { severity: null, stabilized: false },
            leftArm: { severity: null, stabilized: false },
            abdomen: { severity: null, stabilized: false },
            rightLeg: { severity: null, stabilized: false },
            leftLeg: { severity: null, stabilized: false }
        };
    }

    /**
     * Read a complete, persistable injury map. `actor.system` may omit legacy
     * fields in V14 prepared data, so favour the raw source when available.
     */
    _getCompleteInjuries() {
        const sourceInjuries = this.actor.toObject()?.system?.injuries
            ?? this.actor.system?.injuries
            ?? {};
        return foundry.utils.mergeObject(
            this._getDefaultInjuries(),
            foundry.utils.duplicate(sourceInjuries)
        );
    }
     async _onPsychologyInputChange(event) {
        const input = event.currentTarget;
        if (!input.name?.startsWith("system.psychology.")) return;

        const isDisorder = input.name.includes(".disorders.");
        const type = isDisorder ? "disorders" : "mutations";
        const parts = input.name.split(".");
        const field = parts.at(-1);
        const index = input.dataset.index || input.closest("tr")?.dataset.index || parts.at(-2);
        if (index === undefined || !field) return;

        const currentData = foundry.utils.duplicate(this.actor.system?.psychology?.[type]?.[index] || {
            name: "",
            minimal: "",
            severe: "",
            critical: ""
        });
        currentData[field] = input.value;

        // The colouring is presentation state. Apply it immediately instead
        // of waiting for a full reactive sheet/template re-render.
        const colourClass = {
            minimal: "minimal-bg",
            severe: "severe-bg",
            critical: "critical-bg"
        }[field];
        if (colourClass) {
            input.classList.remove("minimal-bg", "severe-bg", "critical-bg");
            input.classList.toggle(colourClass, Boolean(input.value.trim()));
        }

        // The control already contains the new value, so suppress the Actor
        // sheet render. This prevents a name edit from returning to tab one.
        await this.actor.update({
            [`system.psychology.${type}.${index}`]: currentData
        }, { render: false });
    }

    async _onSkillRoll(event, actionTarget = null) {
        if (event.preventDefault) event.preventDefault();

        /*
         * A legacy DOM listener has the clicked .skill-roll element in
         * event.currentTarget. Application V2 delegates data-action events at
         * the application root and gives us the clicked action element as the
         * second handler parameter instead.
         */
        const element = actionTarget
            || event.currentTarget?.closest?.(".skill-roll")
            || event.target?.closest?.(".skill-roll");
        const skillKey = element?.dataset.key;
        const skills = this.actor.system?.skills;
        const skillValue = skillKey ? skills?.[skillKey] : undefined;

        if (skillValue === undefined) {
            console.warn("Watchkeeper | Skill roll could not resolve skill", {
                skillKey,
                actionTarget,
                currentTarget: event.currentTarget,
                eventTarget: event.target,
                skills
            });
            return ui.notifications.error(`Skill "${skillKey ?? "(missing data-key)"}" not found in system data.`);
        }
        const roll = new Roll("1d100");
        await roll.evaluate();
        const isSuccess = roll.total <= skillValue;
        const resultLabel = isSuccess ? game.i18n.localize("watchkeeper.namedCharacterSheet.success") : game.i18n.localize("watchkeeper.namedCharacterSheet.failure");
        const resultColor = isSuccess ? "green" : "red";
        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const label = game.i18n.localize(`watchkeeper.skills.${skillKey}`);
        const content = `
            <div class="watchkeeper-roll">
                <h3>${label} Check</h3>
                <div class="roll-details">
                    <span class="roll-target">Target: <strong>${skillValue}</strong></span>
                    <span class="roll-result">Rolled: <strong>${roll.total}</strong></span>
                </div>
                <hr>
                <div style="text-align: center; font-size: 1.5em; font-weight: bold; color: ${resultColor};">
                    ${resultLabel}
                </div>
            </div>
        `;
        roll.toMessage({
            speaker: speaker,
            flavor: content,
            rollMode: game.settings.get("core", "rollMode")
        });
    }

    async _onSavesRoll(event) {
        if (event.preventDefault) event.preventDefault();
        const element = event.currentTarget;
        const savesKey = element.dataset.key;
        const savesValue = this.actor.system.saves?.[savesKey];
        if (savesValue === undefined) {
            return ui.notifications.error(`Saves "${savesKey}" not found in system data.`);
        }
        const roll = new Roll("1d100");
        await roll.evaluate();
        const isSuccess = roll.total <= savesValue;
        const resultLabel = isSuccess ? "SUCCESS" : "FAILURE";
        const resultColor = isSuccess ? "green" : "red";
        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const label = game.i18n.localize(`watchkeeper.${savesKey.charAt(0).toUpperCase() + savesKey.slice(1)}`);
        const content = `
            <div class="watchkeeper-roll">
                <h3>${label} Check</h3>
                <div class="roll-details">
                    <span class="roll-target">Target: <strong>${savesValue}</strong></span>
                    <span class="roll-result">Rolled: <strong>${roll.total}</strong></span>
                </div>
                <hr>
                <div style="text-align: center; font-size: 1.5em; font-weight: bold; color: ${resultColor};">
                    ${resultLabel}
                </div>
            </div>
        `;
        roll.toMessage({
            speaker: speaker,
            flavor: content,
            rollMode: game.settings.get("core", "rollMode")
        });
    }

    async _onItemCreate(event) {
        if (event.preventDefault) event.preventDefault();
        const element = event.currentTarget;
        const group = element.closest(".item-create-group") || element.closest("[data-type]");
        const typeSelect = group?.querySelector(".item-type-select");
        const type = typeSelect ? typeSelect.value : (element.dataset.type || group?.dataset.type || "weapon");
        await this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize(`watchkeeper.item.types.${type}`),
            type: type,
            system: {}
        }]);
    }

    _onIventoryItemEdit(event) {
        const row = event.currentTarget.closest("tr, .item, li");
        const itemId = row?.dataset.itemId;
        if (!itemId) return;
        const item = this.actor.items.get(itemId);
        item?.sheet.render(true);
    }
    _onItemEdit(event) {
        this._onIventoryItemEdit(event);
    }

    async _onIventoryItemDelete(event) {
        if (event.preventDefault) event.preventDefault();
        const row = event.currentTarget.closest("tr, .item, li");
        const itemId = row?.dataset.itemId;
        if (itemId) {
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        }
    }
    async _onItemDelete(event) {
        await this._onIventoryItemDelete(event);
    }

    _onDragStart(event) {
        const li = event.currentTarget;
        const itemId = li.dataset.itemId;
        if (!itemId) return;
        const data = {
            type: "Item",
            id: itemId,
            actorId: this.actor.id,
            uuid: this.actor.items.get(itemId)?.uuid
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
    }
    _onItemDragStart(event) {
        this._onDragStart(event);
    }

    _onSaveIncrease(event) {
        if (event.preventDefault) event.preventDefault();
        this._adjustSave(event.currentTarget.dataset.save, 1);
    }
    _onSaveDecrease(event) {
        if (event.preventDefault) event.preventDefault();
        this._adjustSave(event.currentTarget.dataset.save, -1);
    }

    async _onSaveInput(event) {
        const input = event.currentTarget;
        const saveType = input.name.replace("system.saves.", "");
        const newValue = parseInt(input.value);
        if (isNaN(newValue)) return;

        const min = parseInt(input.min) || 20;
        const max = parseInt(input.max) || 65;
        const clampedValue = Math.min(Math.max(newValue, min), max);

        const totalSpent = Object.values(this.actor.system.saves || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
        const currentSpentWithoutThis = totalSpent - (Number(this.actor.system.saves[saveType]) || 0);
        const currentRemaining = (this.actor.system.savesTotal || 250) - currentSpentWithoutThis;

        if (clampedValue > (Number(this.actor.system.saves[saveType]) || 0) + currentRemaining) {
            ui.notifications.warn("Not enough points remaining!");
            return;
        }
       
        await this.actor.update({
            [`system.saves.${saveType}`]: clampedValue
        });
    }

    async _adjustSave(saveType, delta) {
        if (!saveType) return;
        const currentValue = Number(this.actor.system.saves[saveType]) || 50;
        const newValue = currentValue + delta;
        if (newValue < 20 || newValue > 65) return;

        const totalSpent = Object.values(this.actor.system.saves || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
        const currentRemaining = (this.actor.system.savesTotal || 250) - totalSpent;

        if (delta > 0 && currentRemaining < 1) {
            ui.notifications.warn("Not enough points remaining!");
            return;
        }
        
        await this.actor.update({ [`system.saves.${saveType}`]: newValue });
    }

    async _onIncrementTotal(event) {
        if (event.preventDefault) event.preventDefault();
        const currentTotal = Number(this.actor.system.savesTotal) || 250;
        
        await this.actor.update({ "system.savesTotal": currentTotal + 1 });
    }
    async _onDecrementTotal(event) {
        if (event.preventDefault) event.preventDefault();
        const currentTotal = Number(this.actor.system.savesTotal) || 250;
        
        await this.actor.update({ "system.savesTotal": Math.max(0, currentTotal - 1) });
    }

    async _onEnduranceChange(event) {
        const newEndurance = parseInt(event.target.value) || 0;
        const updates = {
            "system.saves.endurance": newEndurance
        };

        const newMaxFatigue = Math.floor(newEndurance / 4) || 0;
        const currentMax = Number(this.actor.system.stats?.fatigue?.max) || 0;
        const currentEndurance = Number(this.actor.system.saves?.endurance) || 0;
        if (currentMax === 0 || currentMax === Math.floor(currentEndurance / 4)) {
            updates["system.stats.fatigue.max"] = newMaxFatigue;
        }
        
        await this.actor.update(updates);
    }

    async _onFatigueChange(event) {
        const input = event.currentTarget;
        const field = input.name;
        let value = parseInt(input.value) || 0;
        if (field === "system.stats.fatigue.current") {
            const maxFatigue = Number(this.actor.system.stats?.fatigue?.max) || 0;
            value = Math.min(value, maxFatigue);
        }
        
        await this.actor.update({ [field]: value });
    }

     async _onInjuryCellClick(event) {
        const cell = event.currentTarget;
        const part = cell.dataset.part;
        const severity = cell.dataset.severity;
        if (!part || !severity) return;

        const injuries = this._getCompleteInjuries();
        const currentSeverity = injuries[part]?.severity;
        const newSeverity = currentSeverity === severity ? null : severity;
        injuries[part].severity = newSeverity;

        // Update only the clicked row's visual state; do not wait for a
        // Handlebars rerender merely to apply the `marked` CSS class.
        cell.closest("tr")?.querySelectorAll(".injury-cell").forEach(injuryCell => {
            injuryCell.classList.toggle(
                "marked",
                injuryCell.dataset.severity === newSeverity
            );
        });

        // Persist the complete map. A dot-path update on a legacy partial
        // injury object can otherwise leave only the clicked body part after
        // V14 data preparation.
        await this.actor.update({ "system.injuries": injuries }, { render: false });
    }

    async _onStabilizedChange(event) {
        const checkbox = event.currentTarget;
        const parts = checkbox.name.split(".");
        const part = parts.at(-2);
        if (!part) return;

        const injuries = this._getCompleteInjuries();
        if (!injuries[part]) return;
        injuries[part].stabilized = checkbox.checked;

        // The browser already changed the checkbox. Save without replacing
        // the tab, and retain every other body-location record.
        await this.actor.update({ "system.injuries": injuries }, { render: false });
    }

    _onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        if (event.currentTarget && event.currentTarget.style) {
            event.currentTarget.style.borderColor = '#ff9d00';
        }
    }
    _onItemDragOver(event) {
        event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        if (event.currentTarget && event.currentTarget.classList) {
            event.currentTarget.classList.add('drag-over');
        }
    }

    async _onGenomeDrop(event) {
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        const dropzone = event.currentTarget;
        if (dropzone && dropzone.style) dropzone.style.borderColor = '#666';

        try {
            let data;
            try {
                data = TextEditor.getDragEventData(event);
            } catch (e) {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            }
            if (!data || data.type !== 'Item') return;

            const item = await Item.implementation.fromDropData(data);
            if (!item || item.type !== 'genomes') return;

            const genomeData = {
                id: item.id,
                name: item.name,
                img: item.img,
                description: item.system.description || "",
                effects: item.system.effects || "",
                value: item.system.value || "",
                difficulty: item.system.difficulty || "",
                xenosisGain: item.system.xenosisGain || "",
                abilityTrait: item.system.abilityTrait || ""
            };
            const currentGenomes = Array.isArray(this.actor.system.genomes) 
                ? [...this.actor.system.genomes] 
                : [];
                this._captureSheetState();
            await this.actor.update({
                "system.genomes": [...currentGenomes, genomeData]
            });
        } catch (err) {
            console.error("Error handling genome drop:", err);
        }
    }

    async _onRemoveGenome(event) {
        if (event.preventDefault) event.preventDefault();
        const button = event.currentTarget;
        const index = button.closest('.genome-item')?.dataset.index;
        if (index === undefined) return;

        const genomes = Array.isArray(this.actor.system.genomes) ? [...this.actor.system.genomes] : [];
        genomes.splice(index, 1);
        
        await this.actor.update({"system.genomes": genomes});
    }

    async _onInventoryDrop(event) {
        let data;
        try {
            data = TextEditor.getDragEventData(event);
        } catch (e) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return;
            }
        }
        if (!data || data.type !== 'Item') return;

        let item;
        try {
            item = await Item.implementation.fromDropData(data);
        } catch (err) {
            return;
        }
        if (!item || item.type !== 'genomes') return;

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();

        if (item.parent?.id === this.actor.id) {
            return this.actor.updateEmbeddedDocuments("Item", [{
                _id: item.id,
                "system.equipped": false
            }]);
        }
        const itemData = foundry.utils.duplicate(item.toObject());
        itemData.system.equipped = false;
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    async _onItemDrop(event, equipLocation) {
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        if (event.currentTarget && event.currentTarget.classList) {
            event.currentTarget.classList.remove('drag-over');
        }

        let data;
        try {
            data = TextEditor.getDragEventData(event);
        } catch (e) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return;
            }
        }
        if (!data || data.type !== 'Item') return;
        this._captureSheetState();
        let changed = false;
         try {
            if (data.actorId === this.actor.id || data.uuid?.includes(this.actor.id)) {
                const item = this.actor.items.get(data.id || data._id)
                    || (data.uuid ? await fromUuid(data.uuid) : null);
                if (!item || item.parent?.id !== this.actor.id) return;

                if (equipLocation === "apparel") {
                    if (item.type !== "armor") {
                        ui.notifications.warn("Only armor items can be equipped as apparel.");
                        return;
                    }
                    await item.update({
                        "system.equipped": "apparel",
                        "system.inInventory": false
                    }, { render: false });
                    changed = true;
                } else if (["primary", "secondary", "tertiary", "inventory"].includes(equipLocation)) {
                    await item.update({ "system.equipped": equipLocation }, { render: false });
                    changed = true;
                }
            } else {
                const item = await Item.implementation.fromDropData(data);
                if (!item) return;
                const itemData = foundry.utils.duplicate(item.toObject());

                if (equipLocation === "apparel") {
                    if (itemData.type !== "armor") {
                        ui.notifications.warn("Only armor items can be equipped as apparel.");
                        return;
                    }
                    itemData.system.equipped = "apparel";
                    itemData.system.inInventory = false;
                } else if (["primary", "secondary", "tertiary", "inventory"].includes(equipLocation)) {
                    itemData.system.equipped = equipLocation;
                } else {
                    return;
                }

                await this.actor.createEmbeddedDocuments("Item", [itemData], { render: false });
                changed = true;
            }

            if (changed) await this.render({ parts: ["tabfour"] });
        } catch (err) {
            console.error("Watchkeeper | Error handling item drop:", err);
        }
    }

    /**
     * Override ApplicationV2 / DocumentSheetV2 general item drop handler
     */
    async _onDropItem(event, data) {
        if (!this.actor.isOwner) return false;
        
        const dropZoneEl = event.target?.closest("[data-dropzone], .genomes-dropzone, .inventory-list, .equipment-table, .apparel-section, .inventory-items");
        if (dropZoneEl) {
            if (dropZoneEl.classList.contains("genomes-dropzone")) {
                return this._onGenomeDrop(event);
            }
            if (dropZoneEl.classList.contains("inventory-list")) {
                return this._onInventoryDrop(event);
            }
            const zoneType = dropZoneEl.dataset.dropzone || 
                (dropZoneEl.classList.contains("apparel-section") ? "apparel" : "inventory");
            return this._onItemDrop(event, zoneType);
        }
        
        return super._onDropItem(event, data);
    }

     _getActorSkills() {
        const prepared = this.actor.system?.skills;
        if (prepared && typeof prepared === "object") return prepared;

        const source = this.actor.toObject()?.system?.skills;
        if (source && typeof source === "object") return source;

        return {};
    }

    _normaliseSkillKey(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
    }

    /** Resolve a displayed item skill such as "Light Firearms" to its actor key. */
    _resolveActorSkill(rawSkillKey) {
        const skills = this._getActorSkills();
        const normalised = this._normaliseSkillKey(rawSkillKey);
        const key = Object.keys(skills).find(candidate =>
            this._normaliseSkillKey(candidate) === normalised
        );
        return {
            skills,
            skillKey: key,
            skillValue: key ? skills[key] : undefined
        };
    }

    async _onRollClick(event) {
        if (event.preventDefault) event.preventDefault();
        const element = event.currentTarget;
        const rollType = element.dataset.roll;
        const itemId = element.dataset.itemId || element.closest('tr, .item, li')?.dataset.itemId;
        if (!itemId) return;

        const item = this.actor.items.get(itemId);
        if (!item) return;

        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get("core", "rollMode");

        switch (rollType) {
            case "skill": {
                // Older Watchkeeper item data used `skill`; newer items use
                // `skillUsed`. Accept both and resolve labels/spacing against
                // the actor's actual skill keys.
                const itemSkill = item.system.skillUsed ?? item.system.skill ?? "";
                const { skills, skillKey, skillValue } = this._resolveActorSkill(itemSkill);
                if (!skillKey || skillValue === undefined) {
                    console.warn("Watchkeeper | Item skill is not present on actor", {
                        item,
                        itemSkill,
                        actorSkills: skills
                    });
                    ui.notifications.warn(`Skill "${itemSkill || "(not set)"}" not found on actor.`);
                    return;
                }
                const actorSkillValue = Number(skillValue) || 0;
                const itemModifier = Number(item.system.skillModifier) || 0;
                const targetValue = actorSkillValue + itemModifier;

                const roll = new Roll("1d100");
                await roll.evaluate();
                const success = roll.total <= targetValue;
                const resultLabel = success ? "SUCCESS" : "FAILURE";
                const color = success ? "green" : "red";
                const label = game.i18n.localize(`watchkeeper.skills.${skillKey}`);

                roll.toMessage({
                    speaker: speaker,
                    flavor: `
                        <div class="watchkeeper-roll">
                            <h3>${item.name}: ${label} Check</h3>
                            <div>Target: <strong>${targetValue}</strong> (Skill ${actorSkillValue} + Mod ${itemModifier})</div>
                            <div style="font-weight:bold; color:${color}; font-size:1.2em; text-align:center; margin-top:5px;">
                                ${resultLabel}
                            </div>
                        </div>
                    `,
                    rollMode: rollMode
                });
                break;
            }

            case "damage":
                const damageFormula = String(item.system.damage || "");
                if (!damageFormula || damageFormula === "0") {
                    return ui.notifications.warn(`No damage formula defined for ${item.name}.`);
                }
                try {
                    const dmgRoll = new Roll(damageFormula);
                    await dmgRoll.evaluate();
                    dmgRoll.toMessage({
                        speaker: speaker,
                        flavor: `
                            <div class="watchkeeper-roll">
                                <h3>${item.name} Damage</h3>
                                <div class="roll-formula">Formula: ${damageFormula}</div>
                            </div>
                        `,
                        rollMode: rollMode
                    });
                } catch (err) {
                    ui.notifications.error(`Invalid damage formula: "${damageFormula}"`);
                    console.error(err);
                }
                break;

            case 'durability':
                const durRoll = new Roll("1d10");
                await durRoll.evaluate();
                durRoll.toMessage({
                    speaker: speaker,
                    flavor: `<h3>${item.name} Durability Check</h3>`,
                    rollMode: rollMode
                });
                break;
        }
    }
    static _onTabClick(event, target) {
        const app = target.closest(".application");
        const tabName = target.dataset.tab;

        // 1. Remove active class from all tabs
        app.querySelectorAll(".sheet-tabs .item").forEach(el => el.classList.remove("active"));
    
        // 2. Add active class to clicked tab
        target.classList.add("active");

        // 3. Hide all tab content
        app.querySelectorAll(".sheet-body .tab").forEach(el => el.classList.remove("active"));

        // 4. Show target tab content
        app.querySelector(`.sheet-body .tab[data-tab="${tabName}"]`).classList.add("active");
    }
}