import * as PIXI from "pixi.js";
import Entity from "./ecs/Entity";

export default class Game {
	// pixi renderer
	protected renderer: PIXI.Renderer;
	private _stage: PIXI.Container;
	protected graphics: PIXI.Graphics;

	private _toDisplayObjects: {
		order: number;
		object: PIXI.DisplayObject;
	}[] = [];
	public get toDisplayObjects(): {
		order: number;
		object: PIXI.DisplayObject;
	}[] {
		return this._toDisplayObjects;
	}

	// pixi ticker
	protected ticker: PIXI.Ticker;
	// loader
	protected loader: PIXI.Loader;

	// entities
	private _entities: Entity[] = [];

	constructor(config: IGameConfig) {
		// create renderer
		this.renderer = new PIXI.Renderer({
			view: config.view,
			width: config.width,
			height: config.height,
			backgroundColor: config.backgroundColor,
		});

		// document.body.appendChild(this.renderer.view);

		// graphics (drawings)

		this.graphics = new PIXI.Graphics();

		// stage

		this._stage = new PIXI.Container();
		this.AddToStage(15, this.graphics);

		// ticker

		this.ticker = new PIXI.Ticker();
		this.ticker.add(() => {
			// update
			this.update(this.ticker.elapsedMS / 1000);
			// draw
			this.draw();
		});

		// load ressources THEN call create

		this.loader = new PIXI.Loader();
		for (const toload of config.toLoad) {
			this.loader.add(toload.name, toload.url);
		}

		this.loader.load(() => {
			this.create();
			this.renderObjectsToDisplay();
			this.start();
		});
	}

	/**
	 * Fonction qui doit s'executer avant la toute première frame
	 * pour se faire, la fonction start doit être appelée à la fin
	 * de celle ci.
	 *
	 * Cette fonction est appelée automatiquement quand les
	 * assets sont loadés par le Loader.
	 */
	protected create(): void {}

	/**
	 * Fonction qui s'execute à chaque frame.
	 * @param dt Le temps écoulés depuis la dernière frame en MS (ex. 0.0016)
	 */
	protected update(dt: number): void {
		// render the stage
		this.renderer.render(this._stage);
		// update les entitées et leurs components
		for (const entity of this._entities) {
			entity.update(dt);
			for (const component of entity.GetComponents()) {
				component.update(dt);
			}
		}
	}

	protected addEntity(entityToAdd: Entity): void {
		this._entities.push(entityToAdd);
	}

	protected removeEntity(entityToRemove: Entity): void {
		this._entities = this._entities.filter((entity) => {
			return entity != entityToRemove;
		});
	}

	/**
	 * Contient les dessins, il n'y a pas grand chose à mettre ici
	 * (mise à part les dessin avec graphics) si on utilise le système de stage.
	 */
	protected draw() {
		this.graphics.clear();
	}

	/**
	 * Lance le jeu (démarre le ticker), dans l'idéal il faut
	 * executer cette fonction à la fin de create().
	 */
	public start() {
		this.ticker.start();
	}

	private renderObjectsToDisplay(): void {
		this._stage.removeChildren();
		this.toDisplayObjects.sort((a, b) => {
			if (a.order < b.order) {
				return -1;
			}
			if (a.order > b.order) {
				return 1;
			}

			// a must be equal to b
			return 0;
		});
		for (const displayObj of this.toDisplayObjects) {
			this._stage.addChild(displayObj.object);
		}
	}

	//#region resources getters
	public GetLoadedTexture(name: string): PIXI.Texture {
		const textureToReturn = this.loader.resources[name].texture;

		if (!textureToReturn) {
			throw new Error(
				`La texture ${name} n'existe pas ou n'est pas chargée`
			);
		}

		return textureToReturn;
	}

	public GetLoadedSpriteseet(name: string): PIXI.Spritesheet {
		const spritesheetToReturn = this.loader.resources[name].spritesheet;

		if (!spritesheetToReturn) {
			throw new Error(
				`Le spritesheet ${name} n'existe pas ou n'est pas chargée`
			);
		}

		return spritesheetToReturn;
	}

	public GetLoadedData(name: string): any {
		const dataToReturn: any = this.loader.resources[name].data;
		return dataToReturn;
	}

	public AddToStage(order: number, object: PIXI.DisplayObject) {
		this.toDisplayObjects.push({ order: order, object: object });
		this.renderObjectsToDisplay();
	}
	//#endregion
}

interface IGameConfig {
	width: number;
	height: number;
	backgroundColor: number;
	fps: number;
	view: HTMLCanvasElement;
	toLoad: { name: string; url: string }[];
}
