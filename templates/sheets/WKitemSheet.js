// Import the necessary ApplicationV2 classes
const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

export class WKitemSheet extends HandlebarsApplicationMixin(DocumentSheetV2) {
  
  static DEFAULT_OPTIONS = {
    tag: "form",
    window: {
      title: "Item Sheet",
      resizable: true,
    },
    classes: ["watchkeeper", "sheet", "item"],
    position: { width: 500, height: 600 }
  };

  static PARTS = {
    body: {
      template: "systems/watchkeeper/templates/items/item-sheet.hbs"
    }
  };


 async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // Access the item via this.document
    const item = this.document; 
    
    context.item = item;
    context.system = item.system;
    context.labels = this._getFieldLabels();
    context.bodyParts = this._getBodyParts();
    context.values = this._getValues();
    context.config = {
        values: {
            "common": game.i18n.localize("watchkeeper.item.values.common"),
            "valuable": game.i18n.localize("watchkeeper.item.values.valuable"),
            "rare": game.i18n.localize("watchkeeper.item.values.rare"),
            "legendary": game.i18n.localize("watchkeeper.item.values.legendary")
        },
        bodyParts: {
            "torso": game.i18n.localize("watchkeeper.item.bodyParts.torso"),
            "head": game.i18n.localize("watchkeeper.item.bodyParts.head"),
            "arms": game.i18n.localize("watchkeeper.item.bodyParts.arms"),
            "legs": game.i18n.localize("watchkeeper.item.bodyParts.legs"),
            "fullBody": game.i18n.localize("watchkeeper.item.bodyParts.fullBody")
        }
    };
    return context;
  }

  
  async _onSubmit(event, form, formData) {
    await this.document.update(formData.object);
  }

  // Handlebars helpers should be registered globally in watchkeeper.js (init hook),
  // but if they are specific to this sheet, keep them there.
  // Note: ApplicationV2 handles rendering differently; standard Handlebars helpers 
  // registered in init will automatically be available in the template.

  _getFieldLabels() {
    // Keep your existing localization logic here
    return {
      description: game.i18n.localize("watchkeeper.item.fields.description"),
      weight: game.i18n.localize("watchkeeper.item.fields.weight"),
      values: game.i18n.localize("watchkeeper.item.fields.values"),
      attackWith: game.i18n.localize("watchkeeper.item.fields.attackWith"),
      skillUsed: game.i18n.localize("watchkeeper.item.fields.skillUsed"),
      skillModifier: game.i18n.localize("watchkeeper.item.fields.skillModifier"),
      damage: game.i18n.localize("watchkeeper.item.fields.damage"),
      range: game.i18n.localize("watchkeeper.item.fields.range"),
      damageRadius: game.i18n.localize("watchkeeper.item.fields.damageRadius"),
      concealment: game.i18n.localize("watchkeeper.item.fields.concealment"),
      durability: game.i18n.localize("watchkeeper.item.fields.durability"),
      loaded: game.i18n.localize("watchkeeper.item.fields.loaded"),
      magazines: game.i18n.localize("watchkeeper.item.fields.magazines"),
      protectionValue: game.i18n.localize("watchkeeper.item.fields.protectionValue"),
      insulation: game.i18n.localize("watchkeeper.item.fields.insulation"),
      bodyPart: game.i18n.localize("watchkeeper.item.fields.bodyPart"),
      inventorySlot: game.i18n.localize("watchkeeper.item.fields.inventorySlot"),
      utilityValue: game.i18n.localize("watchkeeper.item.fields.utilityValue"),
      genomeValue: game.i18n.localize("watchkeeper.item.fields.genomeValue"),
      difficulty: game.i18n.localize("watchkeeper.item.fields.difficulty"),
      xenosisGain: game.i18n.localize("watchkeeper.item.fields.xenosisGain"),
      abilityTrait: game.i18n.localize("watchkeeper.item.fields.abilityTrait"),
      healthRegen: game.i18n.localize("watchkeeper.item.fields.healthRegen"),
      acceleration: game.i18n.localize("watchkeeper.item.fields.acceleration"),
      frame: game.i18n.localize("watchkeeper.item.fields.frame"),
      handling: game.i18n.localize("watchkeeper.item.fields.handling"),
      stoppingPower: game.i18n.localize("watchkeeper.item.fields.stoppingPower"),
      weapons: game.i18n.localize("watchkeeper.item.fields.weapons"),
      inventory: game.i18n.localize("watchkeeper.item.fields.inventory"),
      spFront: game.i18n.localize("watchkeeper.item.fields.spFront"),
      spSide: game.i18n.localize("watchkeeper.item.fields.spSide"),
      spBack: game.i18n.localize("watchkeeper.item.fields.spBack"),
      travelSpeed: game.i18n.localize("watchkeeper.item.fields.travelSpeed"),
      combatSpeed: game.i18n.localize("watchkeeper.item.fields.combatSpeed"),
      fuelConsumption: game.i18n.localize("watchkeeper.item.fields.fuelConsumption"),
      fuelCurrent: game.i18n.localize("watchkeeper.item.fields.fuelCurrent"),
      fuelMax: game.i18n.localize("watchkeeper.item.fields.fuelMax"),
      inventorySlots: game.i18n.localize("watchkeeper.item.fields.inventorySlots"),
      armor: game.i18n.localize("watchkeeper.item.fields.armor"),
      movement: game.i18n.localize("watchkeeper.item.fields.movement"),
      fuel: game.i18n.localize("watchkeeper.item.fields.fuel"),
      personal: game.i18n.localize("watchkeeper.item.fields.personal")
    };
  }

  _getBodyParts() {
    return {
      torso: game.i18n.localize("watchkeeper.item.bodyParts.torso"),
      head: game.i18n.localize("watchkeeper.item.bodyParts.head"),
      arms: game.i18n.localize("watchkeeper.item.bodyParts.arms"),
      legs: game.i18n.localize("watchkeeper.item.bodyParts.legs"),
      fullBody: game.i18n.localize("watchkeeper.item.bodyParts.fullBody")
    };
  }

  _getValues() {
    return {
      common: game.i18n.localize("watchkeeper.item.values.common"),
      valuable: game.i18n.localize("watchkeeper.item.values.valuable"),
      rare: game.i18n.localize("watchkeeper.item.values.rare"),
      legendary: game.i18n.localize("watchkeeper.item.values.legendary")     
    };
  }
}