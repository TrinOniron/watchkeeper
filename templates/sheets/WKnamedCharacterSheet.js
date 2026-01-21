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
        context.system.savesRemaining = (systemData.savesTotal || 250) - totalSavesSpent;
        
        // Calculate max fatigue if not manually set
          if (context.system.stats.fatigue.max === 0) {
            // Use saves.endurance instead of attributes.endurance
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

       // Prepare genomes from system.genomes array
       context.system.genomes = context.system.genomes || [];
       // Ensure genomes is always an array
       context.system.genomes = Array.isArray(context.system.genomes) 
       ? context.system.genomes 
       : [];
  
      // Initialize injuries if not present
      context.system.injuries = context.system.injuries || {
        skull: { severity: null, stabilized: false },
        face: { severity: null, stabilized: false },
        chest: { severity: null, stabilized: false },
        rightArm: { severity: null, stabilized: false },
        leftArm: { severity: null, stabilized: false },
        abdomen: { severity: null, stabilized: false },
        rightLeg: { severity: null, stabilized: false },
        leftLeg: { severity: null, stabilized: false }
      };
      // Get all items
          const allItems = context.actor.items;
  
          // Calculate available slots from apparel
          context.availableSlots = this.actor.items
            .filter(i => i.type === 'armor' && i.system.equipped === 'apparel')
            .reduce((sum, item) => sum + (item.system.inventorySlot || 0), 0);
  
          // Calculate used slots from inventory items
          context.usedSlots = this.actor.items
            .filter(i => i.system.inInventory)
            .reduce((sum, item) => sum + (item.system.weight || 0), 0);
  
          // Calculate if over limit
          context.overLimit = context.usedSlots > context.availableSlots;


          // Calculate available slots from equipped apparel
          context.availableSlots = this.actor.items
            .filter(i => i.type === 'armor' && i.system.equipped === 'apparel')
            .reduce((sum, item) => {
              const slots = parseInt(item.system.inventorySlot) || 0;
              return sum + slots;
            }, 0);
  
          

          // Categorize items
          context.primaryItems = this.actor.items.filter(i => 
            i.system.equipped === 'primary');
          context.secondaryItems = this.actor.items.filter(i => 
            i.system.equipped === 'secondary');
          context.tertiaryItems = this.actor.items.filter(i => 
            i.system.equipped === 'tertiary');
          context.apparelItems = this.actor.items.filter(i => 
            i.type === 'armor' && i.system.equipped === 'apparel');
          context.inventoryItems = this.actor.items.filter(i => 
            i.system.equipped === 'inventory');

            // Calculate used slots from items marked as in inventory
          context.usedSlots = this.actor.items
            .filter(i => i.system.equipped === 'inventory')
            .reduce((sum, item) => {
              const weight = parseInt(item.system.weight) || 0;
              return sum + weight;
            }, 0);
            console.log("Available Slots:", context.availableSlots);
            console.log("Used Slots:", context.usedSlots);
            console.log("Apparel Items:", context.apparelItems.map(i => i.name));
            console.log("Inventory Items:", context.inventoryItems.map(i => i.name));
          // Register Handlebars helpers
        this._registerHandlebarsHelpers();
        return context;
    }

      _registerHandlebarsHelpers() {
    // Register helper to localize item types
    Handlebars.registerHelper('localizeItemType', (type) => {
      return game.i18n.localize(`watchkeeper.item.types.${type}`);
    });
    
     }
    activateListeners(html) {
        super.activateListeners(html);

        // Register Handlebars helper
        Handlebars.registerHelper("localizeItemType", type => 
            game.i18n.localize(`watchkeeper.item.types.${type}`)
        );
        //Register the Skill Click Listener
        html.find('.skill-roll').click(this._onSkillRoll.bind(this));

        // Psychology input handling
       
        //html.find('.psychology-section input').on('input', this._onPsychologyInputChange.bind(this));
        html.find('.psychology-section input').on('blur', this._onPsychologyInputChange.bind(this)); //reverse typing fix

        // Save point controls
        html.find(".save-increase").click(this._onSaveIncrease.bind(this));
        html.find(".save-decrease").click(this._onSaveDecrease.bind(this));
        html.find(".saves-section input").on("change", this._onSaveInput.bind(this));
        // Total points controls
        html.find('.increment-total').click(this._onIncrementTotal.bind(this));
        html.find('.decrement-total').click(this._onDecrementTotal.bind(this));
        // Fatigue system
        html.find('input[name="system.saves.endurance"]').on("change", this._onEnduranceChange.bind(this));
        html.find(".current-fatigue, .max-fatigue").on("change", this._onFatigueChange.bind(this));
        //Register the Saves Click Listener
        html.find('.saves-roll').click(this._onSavesRoll.bind(this));
        // Item management


        // Injury severity cells
          html.find('.injury-cell').click(this._onInjuryCellClick.bind(this));
  
          // Stabilization checkboxes
          html.find('.stabilized-checkbox').change(this._onStabilizedChange.bind(this));
  
          // Genome drop zone
          const dropZone = html.find('.genomes-dropzone')[0];
          if (dropZone) {
            dropZone.addEventListener('dragover', this._onDragOver.bind(this));
            dropZone.addEventListener('drop', this._onGenomeDrop.bind(this));
          }
  
          // Genome removal
          html.find('.remove-genome').click(this._onRemoveGenome.bind(this));

          //  Inventory Drop Zone (Forces Equipped = false)
          // We bind to the specific list or the whole inventory section
          const inventoryDropZone = html.find('.inventory-list')[0]; 
          if (inventoryDropZone) {
            inventoryDropZone.addEventListener('drop', this._onInventoryDrop.bind(this));
          }
          // Roll handlers
          html.find('.rollable').click(this._onRollClick.bind(this));
  
          // Edit/delete handlers
          html.find('.item-edit').click(this._onIventoryItemEdit.bind(this));
          html.find('.item-delete').click(this._onIventoryItemDelete.bind(this));
  
          // Setup drop zones
         
          html.find('.equipment-table, .apparel-section, .inventory-items').each((i, zone) => {
              zone.addEventListener('dragover', this._onItemDragOver.bind(this));
              zone.addEventListener('drop', event => {
                const zoneType = event.currentTarget.dataset.dropzone;
                this._onItemDrop(event, zoneType);
              });
            });
            Hooks.on("updateItem", (item, change) => {
              if (item.parent === this.actor) {
                this.render();
              }
            });

            Hooks.on("createItem", (item, options, userId) => {
              if (item.parent === this.actor) {
                this.render();
              }
            });

            Hooks.on("deleteItem", (item, options, userId) => {
              if (item.parent === this.actor) {
                this.render();
              }
            });
            html.find('tr[data-item-id]').each((i, row) => {
              row.setAttribute('draggable', true);
              row.addEventListener('dragstart', this._onItemDragStart.bind(this));
            });
            Hooks.on('updateActor', (actor, data) => {
              if (actor.id === this.actor.id) {
                this.render(true);
              }
            });
            // Refresh sheet when items change
            Hooks.once('renderActorSheet', (app, html, data) => {
              if (app.actor.id === this.actor.id) {
                Hooks.on('updateItem', (item, change) => {
                  if (item.parent === this.actor) this.render();
                });
    
                Hooks.on('deleteItem', (item, options, userId) => {
                  if (item.parent === this.actor) this.render();
                });
              }
            });
    }

    // Psychology input handler
    _onPsychologyInputChange(event) {

        const input = event.currentTarget;
        //console.warn("Input : ", input);
        const tr = input.closest('tr');
        
        const isDisorder = input.name.includes('disorder');
        const type = isDisorder ? 'disorders' : 'mutations';
        //console.warn("Type : ", type);
        const field = input.name.split('.')[4]; // "name", "minimal", etc.
        
        //console.warn("Field : ", field);
        //const index = tr.dataset.index;
        const index = event.currentTarget.getAttribute("data-index");;
        //console.warn("Index : ", index);
        const value = input.value;
        //console.warn("Value : ", value);
        // Get current data

        const currentData = this.actor.system.psychology[type][index];
  
        // Update specific field
        currentData[field] = input.value;
  
        // Update actor
        this.actor.update({
        [`system.psychology.${type}.${index}`]: currentData
        });
  
        
    }

    //Skill roll handler
    async _onSkillRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    // Get the key (e.g., "athletics")
    const skillKey = element.dataset.key;

    // Get the value from the Actor data
    // Based on your template.json, skills are numbers like: "athletics": 20
    const skillValue = this.actor.system.skills[skillKey];

    // Safety Check
    if (skillValue === undefined) {
      return ui.notifications.error(`Skill "${skillKey}" not found in system data.`);
    }

    // Perform the Async Roll
    const roll = new Roll("1d100");
    await roll.evaluate();

    // Determine Success (Equal to or Under)
    const isSuccess = roll.total <= skillValue;
    const resultLabel = isSuccess ? "SUCCESS" : "FAILURE";
    const resultColor = isSuccess ? "green" : "red";

    // Create Chat Message
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const label = game.i18n.localize(`watchkeeper.skills.${skillKey.charAt(0).toUpperCase() + skillKey.slice(1)}`); // Capitalize for label if needed, or use element.innerText

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

  //Saves roll handler
    async _onSavesRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    
    // Get the key (e.g., "athletics")
    const savesKey = element.dataset.key;

    // Get the value from the Actor data
    // Based on your template.json, skills are numbers like: "athletics": 20
    const savesValue = this.actor.system.saves[savesKey];

    // Safety Check
    if (savesValue === undefined) {
      return ui.notifications.error(`Saves "${savesKey}" not found in system data.`);
    }

    // Perform the Async Roll
    const roll = new Roll("1d100");
    await roll.evaluate();

    // Determine Success (Equal to or Under)
    const isSuccess = roll.total <= savesValue;
    const resultLabel = isSuccess ? "SUCCESS" : "FAILURE";
    const resultColor = isSuccess ? "green" : "red";

    // Create Chat Message
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const label = game.i18n.localize(`watchkeeper.skills.${savesKey.charAt(0).toUpperCase() + savesKey.slice(1)}`); // Capitalize for label if needed, or use element.innerText

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
    _onIncrementTotal(event) {
      const currentTotal = this.actor.system.savesTotal || 250;
      this.actor.update({ "system.savesTotal": currentTotal + 1 });
    }

    _onDecrementTotal(event) {
      const currentTotal = this.actor.system.savesTotal || 250;
      this.actor.update({ 
        "system.savesTotal": Math.max(0, currentTotal - 1) 
      });
    }
    // Fatigue system handlers
    _onEnduranceChange(event) {
        /*const newEndurance = parseInt(event.target.value) || 0;
        const updates = {
            "system.saves.endurance": newEndurance
        };
        
        if (this.actor.system.stats.fatigue.max === Math.floor(this.actor.system.saves.endurance / 4)) {
            updates["system.stats.fatigue.max"] = Math.floor(newEndurance / 4);
        }
        
        this.actor.update(updates);*/
        const newEndurance = parseInt(event.target.value) || 0;
          const updates = {
            "system.saves.endurance": newEndurance
          };
  
          // Calculate current max fatigue based on endurance
          //const newMaxFatigue = Math.floor(newEndurance / 4);
          const newMaxFatigue = Math.floor(newEndurance / 4) || 0; // Add fallback
  
          // Always update max fatigue if it's not set or matches calculated value
          const currentMax = this.actor.system.stats.fatigue.max;
          if (currentMax === 0 || currentMax === Math.floor(this.actor.system.saves.endurance / 4)) {
            updates["system.stats.fatigue.max"] = newMaxFatigue;
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
    _onInjuryCellClick(event) {
      const cell = event.currentTarget;
      const part = cell.dataset.part;
      const severity = cell.dataset.severity;
  
      // Toggle severity
      const currentSeverity = this.actor.system.injuries[part].severity;
      const newSeverity = currentSeverity === severity ? null : severity;
  
      this.actor.update({
        [`system.injuries.${part}.severity`]: newSeverity
      });
    }

    _onStabilizedChange(event) {
      const checkbox = event.currentTarget;
      const part = checkbox.name.split('.')[2]; // system.injuries.part.stabilized
      const stabilized = checkbox.checked;
  
      this.actor.update({
        [`system.injuries.${part}.stabilized`]: stabilized
      });
    }

    _onDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      event.currentTarget.style.borderColor = '#ff9d00';
    }

    async _onGenomeDrop(event) {
      console.warn("Genome drop");
      event.preventDefault();
      event.stopPropagation(); // Prevent default Foundry drop behavior
      const dropzone = event.currentTarget;
      dropzone.style.borderColor = '#666';
  
      try {
        // Get dropped item data
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (data.type !== 'Item') return;
    
        // Get item from Foundry
        const item = await Item.implementation.fromDropData(data);
        if (item.type !== 'genomes') return;
    
        // Create genome copy without adding to inventory
        const genomeData = {
          id: item.id,
          name: item.name,
          img: item.img,
          description: item.system.description || "",
          effects: item.system.effects || ""
        };
        console.warn("Genome data", genomeData);
        // Safely get current genomes
        const currentGenomes = Array.isArray(this.actor.system.genomes) 
        ? this.actor.system.genomes 
        : [];
        // Update actor - add to genomes array
        await this.actor.update({
        "system.genomes": [...currentGenomes, genomeData]
        });
      } catch (err) {
        console.error("Error handling genome drop:", err);
      }
    }

    _onRemoveGenome(event) {
      const button = event.currentTarget;
      const index = button.closest('.genome-item').dataset.index;
  
      // Remove genome from array
      const genomes = [...this.actor.system.genomes];
      genomes.splice(index, 1);
  
      this.actor.update({"system.genomes": genomes});
    }

  /**
   * Handles dropping items into the Inventory (Carried) section
   */
  async _onInventoryDrop(event) {
  console.warn("Inventory drop");
    // We only want to intercept GENOMES. 
    // Let default Foundry behavior handle weapons/armor sorting.
    const data = TextEditor.getDragEventData(event);
    if (data.type !== 'Item') return;

    const item = await Item.fromDropData(data);
    
    // If it's not a genome, allow the default Foundry sheet listener to handle it (Sorting, etc.)
    if (item.type !== 'genomes') return;

    // If it IS a genome, we take control to ensure it is "unequipped"
    event.preventDefault();
    event.stopPropagation();

    // SCENARIO A: Moving an item already on this actor (Genomes -> Inventory)
    if (item.parent?.id === this.actor.id) {
      return this.actor.updateEmbeddedDocuments("Item", [{
        _id: item.id,
        "system.equipped": false
      }]);
    }

    // SCENARIO B: Dropping a new item from sidebar/compendium
    const itemData = item.toObject();
    itemData.system.equipped = false; // Force unequipped
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

    _onItemDragOver(event) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      event.currentTarget.classList.add('drag-over');
    }
    _onItemDragStart(event) {
      const itemId = event.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
  
      if (item) {
        const data = {
          type: "Item",
          id: itemId,
          actorId: this.actor.id
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
      }
    }

    _onIventoryItemEdit(event) {
      const itemId = event.currentTarget.closest('tr').dataset.itemId;
      const item = this.actor.items.get(itemId);
      item.sheet.render(true);
    }
    async _onIventoryItemDelete(event) {
      event.preventDefault();
      const row = event.currentTarget.closest('tr');
      const itemId = row.dataset.itemId;
  
      if (itemId) {
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        this.render();
      }
    }

    async _onRollClick(event) {
      event.preventDefault();
      const element = event.currentTarget;
      const rollType = element.dataset.roll;
      // Fallback: If the ID isn't on the TD, look at the TR parent
      const itemId = element.dataset.itemId || element.closest('tr')?.dataset.itemId;
  
      if (!itemId) return;
  
      const item = this.actor.items.get(itemId);
      if (!item) return;

        // Get the speaker for chat messages
        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get("core", "rollMode");
        switch(rollType) {
      case 'skill':
        // Get the Actor's base skill value (e.g. 50)
        // Adjust 'this.actor.system.skills' based on your template.json structure
        let skillKeyClean = item.system.skillUsed.toLowerCase();
        skillKeyClean = skillKeyClean.replace(/\s/g, '');
        const skillKey = skillKeyClean; // e.g. "Guns" or "Melee"
        console.log("skillKey: ", skillKey);
        
        // Safety check if skill exists
        if (!skillKey || !this.actor.system.skills[skillKey]) {
            ui.notifications.warn(`Skill "${skillKey}" not found on actor.`);
            return;
        }

        // Get the values
        // Assuming your actor.system.skills[key] is a number. 
        // If it's an object like {value: 50}, use .value
        const actorSkillValue = Number(this.actor.system.skills[skillKey]) || 0; 
        const itemModifier = Number(item.system.skillModifier) || 0;
        
        const targetValue = actorSkillValue + itemModifier;

        // Create the Roll
        const roll = new Roll("1d100");
        await roll.evaluate(); // <--- Async evaluation

        // Logic
        const success = roll.total <= targetValue;
        const resultLabel = success ? "SUCCESS" : "FAILURE";
        const color = success ? "green" : "red";

        //  Message
        roll.toMessage({
            speaker: speaker,
            flavor: `
                <h3>${item.name}: ${skillKey} Check</h3>
                <div>Target: <strong>${targetValue}</strong> (Skill ${actorSkillValue} + Mod ${itemModifier})</div>
                <div style="font-weight:bold; color:${color}; font-size:1.2em; text-align:center; margin-top:5px;">
                    ${resultLabel}
                </div>
            `,
            rollMode: rollMode
        });
        break;
    
      case 'damage':
        // Get the formula (Force string in case it was initialized as 0)
        const damageFormula = String(item.system.damage);

        // Validate
        // We check for "0" because your template.json initializes it as 0
        if (!damageFormula || damageFormula === "0") {
            return ui.notifications.warn(`No damage formula defined for ${item.name}.`);
        }

        try {
            //Create the Roll instance (Foundry parses "2d6+2" automatically)
            const dmgRoll = new Roll(damageFormula);
            
            //Async Evaluation (Critical for V12/V13)
            await dmgRoll.evaluate();

            //Send to Chat
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
        // Logic: Roll 1d10. If result > current durability, item breaks?
        // For now, keeping your 1d10 roll logic.
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

    async _onItemDrop(event, equipLocation) {
      event.preventDefault();
      event.stopPropagation();
  
      // Remove drag-over styling
      event.currentTarget.classList.remove('drag-over');
  
      const data = JSON.parse(event.dataTransfer.getData('text/plain'));
  
      if (data.type === 'Item') {
        try {
          // Handle items within same actor
          if (data.actorId === this.actor.id) {
            const item = this.actor.items.get(data.id);
            // Handle apparel drops
            if (equipLocation === 'apparel') {
            
              // Only allow armor items in apparel section
              if (item.type === 'armor') {
                await item.update({"system.equipped": "apparel",
              // Reset inventory status
              "system.inInventory": false});
              } else {
                ui.notifications.warn("Only armor items can be equipped as apparel.");
              }
            } 
            // For equipment moves
            else if (['primary', 'secondary', 'tertiary'].includes(equipLocation)) {
              await item.update({"system.equipped": equipLocation});
            } 
            // Move to inventory
            else if (equipLocation === 'inventory') {
              await item.update({"system.equipped": "inventory"});
            }
          } 
          // Handle new items
          else {
            const item = await Item.implementation.fromDropData(data);
            const itemData = foundry.utils.duplicate(item.toObject());
           // Handle apparel drops
            if (equipLocation === 'apparel') {
              // Only allow armor items in apparel section
              if (itemData.type === 'armor') {
                itemData.system.equipped = 'apparel';
                itemData.system.inInventory = false;
                await this.actor.createEmbeddedDocuments('Item', [itemData]);
              } else {
                ui.notifications.warn("Only armor items can be equipped as apparel.");
              }

            } 
            // Handle other drops
            else {
              itemData.system.equipped = equipLocation;
              await this.actor.createEmbeddedDocuments('Item', [itemData]);
            }
          }
           this.render(true);
        } catch (err) {
          console.error("Error handling item drop:", err);
        }
      }

    }
}