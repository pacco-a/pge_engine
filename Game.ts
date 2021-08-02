import * as pl from "planck-js";
import * as PIXI from "pixi.js";
import Entity from "./ecs/Entity";

export default class Game {
	// pixi renderer
	protected renderer: PIXI.Renderer;
	private _stage: PIXI.Container;
	protected graphics: PIXI.Graphics;

	// planckjs world
	private world: pl.World;

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
	protected loader!: PIXI.Loader;

	// entities
	private _entities: Entity[] = [];

	private _config: IGameConfig;

	public static Instance: Game;

	constructor(config: IGameConfig) {
		this._config = config;
		// singleton
		Game.Instance = this;

		// create renderer
		this.renderer = new PIXI.Renderer({
			view: config.view,
			width: config.width,
			height: config.height,
			backgroundColor: config.backgroundColor,
		});

		// planck js
		this.world = new pl.World({
			gravity: new pl.Vec2(1, 1),
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
			this.update(this.ticker.deltaTime);
			// draw
			this.draw();
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
			if (entity.isReady) {
				entity.superupdate(dt);
				for (const component of entity.getComponents()) {
					component.update(dt);
				}
			}
		}
	}

	protected addEntity<Type extends Entity>(entityToAdd: Type): Type {
		this._entities.push(entityToAdd);
		entityToAdd.load();
		return entityToAdd;
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
		// load ressources THEN call create

		this.loader = new PIXI.Loader();
		for (const toload of this._config.toLoad) {
			this.loader.add(toload.name, toload.url);
		}

		this.loader.load(() => {
			this.create();
			this.renderObjectsToDisplay();
			this.ticker.start();
		});
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

	/**
	 * Permet de charger une ou plusieurs ressources selon leur url.
	 * @param urls Les ou la url(s) de(s) (la) ressource(s) à charger.
	 * @param callback La callback executée après le chargement de la ou des ressource(s).
	 */
	public LoadRessources(urls: string[], callback: () => void) {
		if (this.loader.loading) {
			setTimeout(() => {
				this.LoadRessources(urls, callback);
			}, 100);
			return;
		}

		// Supprimer les ressources déjà chargées de la liste.
		for (const url of urls) {
			if (this.loader.resources[url]) {
				urls = urls.filter((urlInArray) => {
					return urlInArray !== url;
				});
			}
		}

		this.loader.add(urls);
		this.loader.load(callback);
	}
}

interface IGameConfig {
	width: number;
	height: number;
	backgroundColor: number;
	fps: number;
	view: HTMLCanvasElement;
	toLoad: { name: string; url: string }[];
}
