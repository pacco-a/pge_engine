import Component from "./Component";

export default abstract class Entity {
	// COMPONENTS
	private _components: Component[] = [];
	/** Liste des noms de components pratique pour garder la trace des components
	 * déjà présents, plutôt que d'itérer sur chaque component à chaque fois. */
	private _componentsNames: string[] = [];

	constructor() {}

	protected addComponent(componentToAdd: Component) {
		// vérifier que les component-dépendances du component
		// - soient présentes sinon throw une erreur.
		for (const dependentComponent of componentToAdd.dependentComponent) {
			if (this._componentsNames.includes(dependentComponent) === false) {
				throw new Error(`Le component ${dependentComponent} necessaire pour le
                    component ${componentToAdd.name} n'est pas présent sur l'entitée.`);
			}
		}

		// si le component n'est pas dupliquable (qu'il doit apparaitre qu'une seule fois max),
		// - vérifier doublon.
		if (
			componentToAdd.isDuplicable === false &&
			this._componentsNames.includes(componentToAdd.name)
		) {
			throw new Error(`Le component non dupliquable ${componentToAdd.name}
                 est déjà présent sur l'entitée`);
		}

		// définir le parent du component sur cette entitée courante
		componentToAdd.setParentEntity(this);

		// ajouter le component à la liste des components (et de leur noms)
		this._componentsNames.push(componentToAdd.name);
		this._components.push(componentToAdd);

		// après ces opérations le component est prêt à être utilisé
		componentToAdd.onReady();
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
				`Le component ${componentName} n'est pas présent sur l'entitée.`
			);
		}

		return componentToReturn as Type;
	}

	/**
	 * Retourne tous les components enfant de l'entitée.
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
				return componentName != componentToRemove.name;
			}
		);

		// Supprimer le component de la liste des components
		this._components = this._components.filter((component) => {
			return component != componentToRemove;
		});
	}

	/**
	 * Callback appelée dans la boucle principale du jeu.
	 * @param dt Le delta est égal à 1 avec un framerate habituel (60), supérieur si le framerate diminue, inférieur s'il augmente.
	 */
	public abstract update(dt: number): void;
}
