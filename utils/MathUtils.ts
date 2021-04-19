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

export { Vector2, findGridPosition };
