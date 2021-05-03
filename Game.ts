import * as PIXI from "pixi.js";

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

		// ticker

		this.ticker = new PIXI.Ticker();
		this.ticker.add(() => {
			// update
			this.update(this.ticker.elapsedMS / 1000);
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
	public GetLoadedTexture(name: string): PIXI.Texture | undefined {
		const textureToReturn: PIXI.Texture | undefined = this.loader.resources[
			name
		]
			? this.loader.resources[name].texture
			: undefined;
		return textureToReturn;
	}

	public GetLoadedSpriteseet(name: string): PIXI.Spritesheet | undefined {
		const spritesheetToReturn: PIXI.Spritesheet | undefined = this.loader
			.resources[name]
			? this.loader.resources[name].spritesheet
			: undefined;

		return spritesheetToReturn;
	}

	public GetLoadedData(name: string): any {
		const dataToReturn: any = this.loader.resources[name].data;
		return dataToReturn;
	}

	public AddToStage(order: number, object: PIXI.DisplayObject) {
		this.toDisplayObjects.push({ order: order, object: object });
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
