export const migrateActorData = function(actor) {
  if (actor.type === "character") {
    // Ensure all fields exist
    const system = actor.system;
    
    // Personal section
    system.personal = system.personal || {};
    setIfUndefined(system.personal, "pseudonym", "");
    setIfUndefined(system.personal, "pronouns", "");
    // ... other personal fields
    
    // Repeat for other sections...
  }
  return actor;
};

function setIfUndefined(obj, key, value) {
  if (obj[key] === undefined || obj[key] === null) {
    obj[key] = value;
  }
}