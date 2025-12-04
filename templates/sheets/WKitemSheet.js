export class WKitemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["watchkeeper", "sheet", "item"],
      template: "systems/watchkeeper/templates/items/item-sheet.hbs",
      width: 500,
      height: 600
    });
  }

  getData() {
    const context = super.getData();
    context.system = context.item.system;
    context.labels = this._getFieldLabels();
    context.bodyParts = this._getBodyParts();
    context.values = this._getValues();
    
    // Register Handlebars helpers
    this._registerHandlebarsHelpers();
    
    return context;
  }

  _registerHandlebarsHelpers() {
    // Register helper to localize item types
    Handlebars.registerHelper('localizeItemType', (type) => {
      const key = `watchkeeper.item.types.${type}`;
      return game.i18n?.has(key) ? game.i18n.localize(key) : type;
    });

  }

  _getFieldLabels() {
    return {
      description: game.i18n.localize("watchkeeper.item.fields.description"),
      weight: game.i18n.localize("watchkeeper.item.fields.weight"),
      values: game.i18n.localize("watchkeeper.item.fields.values"),
      //weapon
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
      //armor
      protectionValue: game.i18n.localize("watchkeeper.item.fields.protectionValue"),
      insulation: game.i18n.localize("watchkeeper.item.fields.insulation"),
      bodyPart: game.i18n.localize("watchkeeper.item.fields.bodyPart"),
      inventorySlot: game.i18n.localize("watchkeeper.item.fields.inventorySlot"),
      //utility
      utilityValue: game.i18n.localize("watchkeeper.item.fields.utilityValue"),
      //genomes
      genomeValue: game.i18n.localize("watchkeeper.item.fields.genomeValue"),
      difficulty: game.i18n.localize("watchkeeper.item.fields.difficulty"),
      xenosisGain: game.i18n.localize("watchkeeper.item.fields.xenosisGain"),
      abilityTrait: game.i18n.localize("watchkeeper.item.fields.abilityTrait"),
      //consummable
      healthRegen: game.i18n.localize("watchkeeper.item.fields.healthRegen"),
      //vehicle
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

  activateListeners(html) {
    super.activateListeners(html);
    html.find('input, select, textarea, checkbox').on('change', this._onChangeInput.bind(this));

  


}
// In _onItemCreate method
_onItemCreate(event) {
  const type = "vehicle"; // Should be dynamic
  
  if (type === "vehicle") {
    
    itemData.system = {
      value: game.i18n.localize("watchkeeper.item.fields.values.common"),
      durability: 100,
      spFront: 10,
      spSide: 5,
      spBack: 3,
      travelSpeed: 80,
      combatSpeed: 40,
      fuelConsumption: 8,
      fuelCurrent: 50,
      fuelMax: 100,
      inventorySlots: 10,
      weapons: "None"
    };
  }
  
  return this.actor.createEmbeddedDocuments("Item", [itemData]);
}

  _onChangeInput(event) {
    const element = event.currentTarget;
    const value = element.value;
    const name = element.name;
    this.item.update({[name]: value});
    /*if (element.type === "checkbox") {
      this.item.update({[name]: element.checked});
    } else {
      this.item.update({[name]: value});
    }*/
  }
}