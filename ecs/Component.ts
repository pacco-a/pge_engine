import Entity from "./Entity";

export default abstract class Component {
	/** Le nom du component. Donner impérativement le même nom que celui de la class.*/
	abstract readonly name: string;

	/** Le component peut-il être présent deux fois sur une même entitée. */
	abstract readonly isDuplicable: boolean;

	/** Nom des components necessaire au fontionnement de celui ci */
	abstract readonly dependentComponent: string[];

	/** L'entitée qui détient ce component */
	private _parentEntity: Entity | undefined = undefined;

	/**
	 * Défini l'entitée parente. Ne doit être utilisée que dans
	 * la classe entitée parente quand elle ajoute le component.
	 */
	public setParentEntity(parentEntity: Entity) {
		this._parentEntity = parentEntity;
	}

	/**
	 * Retourne l'entitée parente du component
	 */
	public getParentEntity(): Entity {
		if (!this._parentEntity) {
			throw new Error(
				`Tentative de récupérer le parent d'une entitée non assignée (impossible).
					Ne pas intéragir avec le parent dans le constructeur mais dans onReady.`
			);
		}

		return this._parentEntity;
	}

	/** Callback appelée lorsque le component est "pret",
	 * c'est à dire quand on peut intéragir avec son entitée parent.
	 */
	public abstract onReady(): void;

	/**
	 * Callback appelée dans la boucle principale du jeu.
	 * @param dt Le delta est égal à 1 avec un framerate habituel (60), supérieur si le framerate diminue, inférieur s'il augmente.
	 */
	public abstract update(dt: number): void;
}
