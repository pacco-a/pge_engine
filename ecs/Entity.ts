import Component from "./Component";
import TemplateGame from "../..";

export default abstract class Entity {
	// component
	private _components: Component[] = [];
	/** Liste des noms de components pratique pour garder la trace des components
	 * déjà présents, plutôt que d'itérer sur chaque component à chaque fois. */
	private _componentsNames: string[] = [];
	// entités filles
	private _childEntities: Entity[] = [];
	// loading / ready
	// . ressources
	protected abstract urlsToLoad: string[];
	// . life cycle state
	private _isReady: boolean = false;
	public get isReady() {
		return this._isReady;
	}

	constructor() {}

	protected addComponent<Type extends Component>(componentToAdd: Type): Type {
		// vérifier que les component-dépendances du component
		// - soient présentes sinon throw une erreur.
		for (const dependentComponent of componentToAdd.dependentComponent) {
			if (this._componentsNames.includes(dependentComponent) === false) {
				throw new Error(`Le component ${dependentComponent} necessaire pour le
                    component ${componentToAdd.name} n'est pas présent sur l'entité.`);
			}
		}

		// si le component n'est pas dupliquable (qu'il doit apparaitre qu'une seule fois max),
		// - vérifier doublon.
		if (
			componentToAdd.isDuplicable === false &&
			this._componentsNames.includes(componentToAdd.name)
		) {
			throw new Error(`Le component non dupliquable ${componentToAdd.name}
                 est déjà présent sur l'entité`);
		}

		// définir le parent du component sur cette entité courante
		componentToAdd.setParentEntity(this);

		// ajouter le component à la liste des components (et de leur noms)
		this._componentsNames.push(componentToAdd.name);
		this._components.push(componentToAdd);

		// loader le component
		componentToAdd.onReady();

		this._isReady = true;

		return componentToAdd;
	}

	/**
	 * Retourne le component à trouver en fonction de son nom.
	 * @param componentName Le nom du component à trouver.
	 * @returns Le component à trouver.
	 */
	public getComponent<Type extends Component>(componentName: string): Type {
		const componentToReturn = this._components.find((component) => {
			return component.name === componentName;
		});

		if (!componentToReturn) {
			throw new Error(
				`Le component ${componentName} n'est pas présent sur l'entité.`
			);
		}

		return componentToReturn as Type;
	}

	/**
	 * Retourne tous les components enfant de l'entité.
	 */
	public GetComponents(): Component[] {
		return this._components;
	}

	/**
	 * Supprime le component passé en paramètre.
	 */
	protected removeComponent(componentToRemove: Component) {
		// Supprimer la component de la liste des noms
		this._componentsNames = this._componentsNames.filter(
			(componentName) => {
				return componentName !== componentToRemove.name;
			}
		);

		// Supprimer le component de la liste des components
		this._components = this._components.filter((component) => {
			return component !== componentToRemove;
		});
	}

	protected addEntity<Type extends Entity>(entityToAdd: Type): Type {
		this._childEntities.push(entityToAdd);
		return entityToAdd;
	}

	protected removeEntity(entityToRemove: Entity) {
		this._childEntities = this._childEntities.filter((entity) => {
			return entity !== entityToRemove;
		});
	}

	/** Callback appelée lorsque l'entité est "prete" (possibilité d'intéragir avec entité fille / components),
	 * N'utiliser le constructeur que pour définir des valeurs de base, pour initialiser.
	 */
	public abstract onReady(): void;

	//#region life-cycle

	public load(): void {
		TemplateGame.Instance.LoadRessources(this.urlsToLoad, () => {
			this.onReady();
		});
	}

	/**
	 * Callback appelée dans la boucle principale du jeu.
	 * (Important d'appeler super.update())
	 * @param dt Le delta est égal à 1 avec un framerate habituel (60), supérieur si le framerate diminue, inférieur s'il augmente.
	 */
	public update(dt: number): void {
		for (const entity of this._childEntities) {
			if (entity.isReady) {
				entity.update(dt);
				for (const component of entity.GetComponents()) {
					component.update(dt);
				}
			}
		}
	}

	//#endregion
}
