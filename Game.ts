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

	// LOADER
	public static loader: PIXI.Loader = new PIXI.Loader();
	// loading queue
	private loadingQueue: {
		name: string;
		url: string;
		callBack?: () => void;
	}[] = [];

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

		for (const toload of config.toLoad) {
			Game.loader.add(toload.name, toload.url);
		}

		Game.loader.load(() => {
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
	public static GetLoadedTexture(name: string): PIXI.Texture | undefined {
		const textureToReturn: PIXI.Texture | undefined = Game.loader.resources[
			name
		]
			? Game.loader.resources[name].texture
			: undefined;
		return textureToReturn;
	}

	public static GetLoadedSpritesheet(name: string): PIXI.Spritesheet {
		const potentialSpriteSheetRes = Game.loader.resources[name];

		if (!potentialSpriteSheetRes || !potentialSpriteSheetRes.spritesheet) {
			throw new Error("No sprite sheet found");
		}

		const spritesheetToReturn: PIXI.Spritesheet =
			potentialSpriteSheetRes.spritesheet;

		return spritesheetToReturn;
	}

	public static GetLoadedData(name: string): any {
		const dataToReturn: any = Game.loader.resources[name].data;
		return dataToReturn;
	}

	public AddToStage(order: number, object: PIXI.DisplayObject) {
		this.toDisplayObjects.push({ order: order, object: object });
		this.renderObjectsToDisplay();
	}
	//#endregion

	/**
	 * Ajoute des ressources à la queue de chargemenet et les load dès que possible.
	 * Les callbacks passées dans les objets de ressources seront à la fin de tout le
	 * loading queue quoi qu'il arrive : inutile d'en faire un usage individuel.
	 */
	public AddToLoad(
		toload: { name: string; url: string; callBack?: () => void }[]
	) {
		/**
		 * Cette array est très IMPORTANTE car durant l'exécution de cet appel
		 * de cette fonction, d'autres appels de cette même fonction vont être
		 * fait simultanément dans d'autres partie du code.
		 *
		 * Et donc cette liste peut varier durant l'exécution de cet appel
		 * lui même.
		 *
		 * C'est pour quoi il faut bien supprimer UNIQUEMENT les ressources qui ont été
		 * ajoutée au loader pixi avant l'appel de load et pas simplement toute
		 * la loadingQueue.
		 *
		 * TODO FIXME (POSSIBLE FIX) simplement ajouter les ressources de toload
		 * après avoir vérifier si "loading" est true & les renvoyés avec la fonction
		 * AddToLoad dans le timeout.
		 *
		 * je sais pas si c'est vraiment plus efficace mais plus propre en tout cas,
		 * un jour je m'y mettrais peut-être;
		 */
		const toRemoveFromQueue: any[] = [];
		this.loadingQueue.push(...toload);

		if (Game.loader.loading) {
			setTimeout(() => {
				this.AddToLoad([]);
			}, 100);
			return;
		}

		for (const ressource of this.loadingQueue) {
			Game.loader.add(ressource.name, ressource.url);

			toRemoveFromQueue.push(ressource);
		}

		Game.loader.load(() => {
			for (const ressource of toRemoveFromQueue) {
				this.loadingQueue = this.loadingQueue.filter((loadingRes) => {
					if (loadingRes === ressource) {
						ressource.callBack();
					}
					return loadingRes != ressource;
				});
			}
		});
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
