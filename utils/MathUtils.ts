class Vector2 {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public isZero() {
		return this.x === 0 && this.y === 0;
	}

	public change(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public setZero() {
		this.x = 0;
		this.y = 0;
	}
}

function findGridPosition(
	absoluteXPoint: number,
	absoluteYPoint: number,
	mapSizeX: number,
	mapSizeY: number,
	numberTileX: number,
	numberTileY: number
): Vector2 {
	const tileX = Math.floor((absoluteXPoint * numberTileX) / mapSizeX);
	const tileY = Math.floor((absoluteYPoint * numberTileY) / mapSizeY);

	return new Vector2(tileX, tileY);
}

function v2Distance(
	v1: { x: number; y: number },
	v2: { x: number; y: number }
) {
	let a = v1.x - v2.x;
	let b = v1.y - v2.y;

	return Math.sqrt(a * a + b * b);
}

export { Vector2, findGridPosition, v2Distance };
