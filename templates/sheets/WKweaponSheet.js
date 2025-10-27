export default class WKweaponSheet extends ItemSheet{
	get template(){
		return 'systems/watchkeeper/templates/items/weapon-sheet.html';
	}
	getData(){
		const data = super.getData();
		data.config = CONFIG.watchkeeper;
		return data;
	}
}