import * as PIXI from "pixi.js";
import LDTKLevel from "./LDTKLevel";

export default class LDTKProject {
	private levels: LDTKLevel[] = [];
	constructor(dataObject: any, projectSpritesheet: PIXI.Spritesheet) {
		// create levels
		for (const level of dataObject.levels) {
			this.levels.push(
				new LDTKLevel(level, level.identifier, projectSpritesheet)
			);
		}
	}

	public GetLevel(levelIdentifier: number | string): LDTKLevel | undefined {
		if (typeof levelIdentifier === "number") {
			return this.levels[levelIdentifier];
		} else if (typeof levelIdentifier === "string") {
			return this.levels.find((level) => {
				return level.name === levelIdentifier;
			});
		}
	}
}
