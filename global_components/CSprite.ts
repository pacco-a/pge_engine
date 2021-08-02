import * as PIXI from "pixi.js";
import Component from "../../pge_engine/ecs/Component";
import Entity from "../../pge_engine/ecs/Entity";
import CPosition from "./CPosition";
import ChatGame from "../..";
import { Vector2 } from "../../pge_engine/utils/MathUtils";

interface CSpriteOptions {
	scale?: Vector2;
}

export default class CSprite extends Component {
	protected toLoad: string[] = [];
	// meta-data
	public name: string = "CSprite";
	public isDuplicable: boolean = false;
	public dependentComponent: string[] = ["CPosition"];
	// data
	// . options
	private _options: CSpriteOptions;
	// . parent entity
	public parentEntity!: Entity;
	private _parentEntityPosition!: CPosition;
	// . sprite
	private _sprite!: PIXI.Sprite;
	private _spriteTexture: PIXI.Texture;
	private _spriteOrder: number;

	constructor(
		spriteTexture: PIXI.Texture,
		spriteOrder: number,
		options: CSpriteOptions
	) {
		super();
		this._spriteTexture = spriteTexture;
		this._spriteOrder = spriteOrder;
		this._options = options;
	}

	public onReady(): void {
		this.parentEntity = this.getParentEntity();

		this._parentEntityPosition =
			this.parentEntity.getComponent<CPosition>("CPosition");

		// créer le sprite container (pixi)
		this._sprite = new PIXI.Sprite(this._spriteTexture);
		// set la position initiale du container sur celle de la position
		// - de l'entitée mère.
		this._sprite.position.set(
			this._parentEntityPosition.position.x,
			this._parentEntityPosition.position.y
		);
		if (this._options.scale) {
			this._sprite.scale.set(
				this._options.scale.x,
				this._options.scale.y
			);
		}
		// ajouter le sprite dans le jeu

		ChatGame.Instance.AddToStage(this._spriteOrder, this._sprite);
	}

	public update(dt: number): void {
		// mettre à jour la position du sprite
		// - sur la position de l'entitée mère.
		this._sprite.position.set(
			this._parentEntityPosition.position.x,
			this._parentEntityPosition.position.y
		);
	}
}
