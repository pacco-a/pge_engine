import * as PIXI from "pixi.js";
import { Vector2 } from "../utils/MathUtils";

interface Key {
	down: boolean;
	justDown: boolean;
	framesDown: number;
}

interface MouseButton {
	down: boolean;
	justDown: boolean;
	framesDown: number;
}

interface Mouse {
	globalPosition: Vector2;
	rightButton: MouseButton;
	leftButton: MouseButton;
}

export default class KeyboardInputHandler {
	// ARROW
	public rightKey: Key = { down: false, justDown: false, framesDown: 0 };
	public leftKey: Key = { down: false, justDown: false, framesDown: 0 };
	public upKey: Key = { down: false, justDown: false, framesDown: 0 };
	public downKey: Key = { down: false, justDown: false, framesDown: 0 };
	// SPECIALS
	public spaceKey: Key = { down: false, justDown: false, framesDown: 0 };
	public enterKey: Key = { down: false, justDown: false, framesDown: 0 };

	private mouse: Mouse = {
		globalPosition: new Vector2(0, 0),
		rightButton: {
			down: false,
			justDown: false,
			framesDown: 0,
		},
		leftButton: {
			down: false,
			justDown: false,
			framesDown: 0,
		},
	};

	private keys: Key[] = [
		// arrows
		this.rightKey,
		this.leftKey,
		this.upKey,
		this.downKey,
		// specials
		this.spaceKey,
		this.enterKey,
	];

	constructor(pageDocument: Document) {
		pageDocument.addEventListener(
			"keydown",
			(e) => this.keyDownHandler(e),
			false
		);

		pageDocument.addEventListener(
			"keyup",
			(e) => this.keyUpHandler(e),
			false
		);

		pageDocument.addEventListener("mousedown", (e) => {
			this.mouseDownHandler(e);
		});

		pageDocument.addEventListener("mouseup", (e) => {
			this.mouseUpHandler(e);
		});

		pageDocument.addEventListener("mousemove", (e) => {
			this.mouseMoveHandler(e);
		});
	}

	private keyDownHandler(event: KeyboardEvent) {
		// arrows
		if (event.code == "ArrowRight") {
			this.rightKey.down = true;
		} else if (event.code == "ArrowLeft") {
			this.leftKey.down = true;
		}

		if (event.code == "ArrowUp") {
			this.upKey.down = true;
		} else if (event.code == "ArrowDown") {
			this.downKey.down = true;
		}

		// specials
		if (event.code == "Space") {
			this.spaceKey.down = true;
		}

		if (event.code === "Enter") {
			this.enterKey.down = true;
		}
	}

	private keyUpHandler(event: KeyboardEvent) {
		if (event.code == "ArrowRight") {
			this.rightKey.down = false;
		} else if (event.code == "ArrowLeft") {
			this.leftKey.down = false;
		}

		if (event.code == "ArrowUp") {
			this.upKey.down = false;
		} else if (event.code == "ArrowDown") {
			this.downKey.down = false;
		}

		// specials
		if (event.code == "Space") {
			this.spaceKey.down = false;
		}

		if (event.code === "Enter") {
			this.enterKey.down = false;
		}
	}

	private mouseDownHandler(event: MouseEvent) {
		switch (event.button) {
			case 0:
				this.mouse.leftButton.down = true;
				break;
			case 2:
				this.mouse.rightButton.down = true;
				break;
			default:
				break;
		}
	}

	private mouseUpHandler(event: MouseEvent) {
		switch (event.button) {
			case 0:
				this.mouse.leftButton.down = false;
				break;
			case 2:
				this.mouse.leftButton.down = false;
				break;
			default:
				break;
		}
	}

	private mouseMoveHandler(event: MouseEvent) {
		this.mouse.globalPosition.x = event.x;
		this.mouse.globalPosition.y = event.y;
	}

	//#region public methods (key/buttons getters)

	// right key
	public GetRightKeyDown(): boolean {
		return this.rightKey.down;
	}

	public GetRightKeyJustDown(): boolean {
		return this.rightKey.justDown;
	}

	// left key
	public GetLeftKeyDown(): boolean {
		return this.leftKey.down;
	}

	public GetLeftKeyJustDown(): boolean {
		return this.leftKey.justDown;
	}

	// up key
	public GetUpKeyDown(): boolean {
		return this.upKey.down;
	}

	public GetUpKeyJustDown(): boolean {
		return this.upKey.justDown;
	}

	// down key
	public GetDownKeyDown(): boolean {
		return this.downKey.down;
	}

	public GetDownKeyJustDown(): boolean {
		return this.downKey.justDown;
	}

	// right mouse button

	public GetMouseRightButtonDown(): boolean {
		return this.mouse.rightButton.down;
	}

	public GetMouseRightButtonJustDown(): boolean {
		return this.mouse.rightButton.justDown;
	}

	// left mouse button

	public GetMouseLeftButtonDown(): boolean {
		return this.mouse.leftButton.down;
	}

	public GetMouseLeftButtonJustDown(): boolean {
		return this.mouse.leftButton.justDown;
	}

	//#endregion

	/**
	 * La classe InputHandler doit être updatée dans la boucle principale
	 * de la scene pour fonctionner correctement.
	 * @param dt le deltaTime (en secondes, ex : 0.0016)
	 */
	public update(dt: number): void {
		// sert à gérer le "just down"
		// pour les keys
		for (const key of this.keys) {
			if (key.down === true) {
				if (key.framesDown === 0) {
					key.justDown = true;
				} else {
					key.justDown = false;
				}

				key.framesDown++;
			} else {
				key.justDown = false;
				key.framesDown = 0;
			}
		}
		// pour les buttons de la mouse
		if (this.mouse.rightButton.down === true) {
			if (this.mouse.rightButton.framesDown === 0) {
				this.mouse.rightButton.justDown = true;
			} else {
				this.mouse.rightButton.justDown = false;
			}

			this.mouse.rightButton.framesDown++;
		} else {
			this.mouse.rightButton.justDown = false;
			this.mouse.rightButton.framesDown = 0;
		}

		if (this.mouse.leftButton.down === true) {
			if (this.mouse.leftButton.framesDown === 0) {
				this.mouse.leftButton.justDown = true;
			} else {
				this.mouse.leftButton.justDown = false;
			}

			this.mouse.leftButton.framesDown++;
		} else {
			this.mouse.leftButton.justDown = false;
			this.mouse.leftButton.framesDown = 0;
		}
	}
}
