jquery.formValidation
=====================

Un plugin jQuery pour valider très simplement un formulaire. Extrêmement paramétrable

Fonctionnement :
----------------
Se sert d'un attribut `data-field-type` pour définir le type de donnees a valider sur le champs et d'un attribut `data-field-error` pour le message d'erreur a afficher.

Liste des types pris en charge actuellement :

* name
* address
* phoneFR
* city
* zipFR
* int
* notEmpty (non vide, par defaut)

Applique ces tests uniquement sur les champs requis (attribut html5 `required`)
Personnalise le message d'erreur en se servant du message stocké dans l'attribut `data-field-error`


----------

Exemple basique :
-----------------

html :

	<form method="post" action="" class="my-form">
		<div class="control-group error">
			<label class="control-label" for="inputNom">Nom</label>
			<div class="controls">
				<input type="text" id="inputNom" name="nom" placeholder="Nom" data-field-type="name" data-field-error="Veuillez entrer un nom correct" required>
			</div>
		</div>
	</form>
    <script>
	    $(document).ready(function(){
	        $('.my-form').formValidation();
	    });
    </script>


----------

A savoir :
-----------------
	
Le plugin est initialement prevu pour la structure HTML du Bootstrap Twitter mais il peut très bien fonctionner sur une autre structure et d'autres classes étant donné que presque tout est paramétrable. La seule "restriction" est d'utiliser le HTML5 afin de pouvoir utiliser les attributs `data-*` et `required`

Comme toute validation en javascript, elle ne reagit qu'apres que le navigateur lui ait envoyé l'information
Si le navigateur bloque l'envoi via son propre controle en HTML5 (`required`, `type="email"`, `pattern`) il le fera avant l'appel du JS.

Par defaut, le plugin sert de "bloqueur" sur l'évenement submit. 
Si tous les tests sont passes avec succes, la fonction laisse le submit se derouler normalement
Si l'un des tests echoue, la fonction bloque le formulaire et met en surbrillance les champs ayant echoues


----------

Etendre les fonctionnalités du plugin :
-----------------

###Ajouter des règles supplémentaires
Le plugin peut etre etendu avec des tests supplémentaires

**Exemple :**

	$('form.form-contact').formValidation({
		rules: {
			ip:/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
		}
	});
	<input type="text" name="myIP" data-field-type="ip" data-field-error="IP invalide">
	
Les tests deja présents dans le plugin peuvent aussi etre modifiés par ce biais



###Gérer l'envoi en cas de réussite
On peut etendre les fonctionalites du plugin en passant une fonction à l'attribut `success`.  
Cette fonction reçoit l'event en paramètre. Ce qui permet de le bloquer si l'on souhaite faire une requete ajax par exemple.

**Exemple :**

	$('form.form-contact').formValidation({
		success:function(event){
			alert('ok par fonction utilisateur. elle se charge du preventDefault()');
			event.preventDefault();
		}
	});	



###Gérer les erreurs
Comme pour la réussite avec `success` on peut étendre les fonctionalites du plugin en passant une fonction à l'attribut `error`.  
Cette fonction recoit en parametre un tableau des objets jQuery ayant été en erreur.

**Exemple :**

	$('form.form-contact').formValidation({
		error:function(data){
			console.log(data);
		}
	});	



###Déclencher des actions avant et après l'appel du plugin
On peut passer en argument une fonction aux attributs `before` et `after`.  
Ces fonctions ne prennent aucun parametre mais sont appellées par le plugin au tout debut de l'action (before) et a la toute fin, juste avant le `success` ou `error` (after).  
Ca peut etre utile dans le cas ou on souhaite formater les champs juste avant de les valider puis les remettre en forme juste après.  
Par exemple, pour un numero de telephone FR ou on aura mis un espace tous les 2 characteres

**Exemple :**

	$('form.form-contact').formValidation({
		before:function(){
			// annulation d'une mise en forme des champs
		},
		after:function(){
			// remise en forme des champs
		},
	});	



###Mettre en évidence les champs requis
Le plugin ajoute automatiquement une asterisque sur l'element parent du champ obligatoire.  
Ce comportement est parametrable, pour le desactiver :

	$('form.form-contact').formValidation({
		showRequiredLabels:false, // default TRUE
	});	

Pour le personnaliser :

	$('form.form-contact').formValidation({
		requiredLabelsHtml:'<strong>R</strong>' // default : <span class="required-badge">*</span>
	});	



###Structure des champs du formulaire
Par défaut, le plugin est prevu pour une organisation de champ de formulaire typique du bootstrap twitter

**Exemple :**

	<div class="control-group">
		<label class="control-label" for="inputAdresse">Adresse</label>
		<div class="controls">
			<input type="text" id="inputAdresse" name="adresse">
		</div>
	</div>

Les selecteurs des parents `control-group` et `control-label` peuvent être personnalisés

**Exemple :**

	$('form.form-contact').formValidation({
		groupSelector:'div.MY-control-group', // default : '.control-group'
		labelSelector:'div.MY-control-label' // default : '.control-label'
	});	



###Structure des champs après qu'une erreur ait été détectée
Le plugin gere tout seul l'affichage des champs ayant des données invalides en ajoutant une classe `error` au `control-group` et insere une balise span avec la classe `help-inline` au meme niveau que le champs affecté.

**Exemple :**

	<div class="control-group error">
		<label class="control-label" for="inputNom">Nom <span class="required-badge">*</span></label>
		<div class="controls">
			<input type="text" id="inputNom" name="nom" placeholder="Nom" data-field-type="name" data-field-error="Veuillez entrer un nom correct" required>
			<span class="help-inline">Veuillez entrer un nom correct</span>
		</div>
	</div>

Le plugin permet de modifier ce comportement en personnalisant les parametres :

* `groupErrorClass`  classe a ajouter sur l'element en erreur
* `errorMessageClass`  classe utilisee sur l'element contenant le message d'erreur
* `errorMessageElement` type d'element contenant le message d'erreur (defaut : span)

**Exemple :**

	$('form.form-contact').formValidation({
		groupErrorClass:'MY-error',
		errorMessageClass:'MY-helper-message',
		errorMessageElement:'div' // default : span
	});	




###Desactiver la gestion de l'affichage des erreurs
Vous pouvez aussi parametrer le plugin pour qu'il ne gere tout simplement pas l'affichage des messages d'erreur.   Dans ce cas, seulement la methode `error()` sera appellee (si elle est definie)  
Les ojets en erreur sont retourne dans la fonction `error()` ce qui vous permet de gerer vous meme l'affichage des erreurs

**Exemple :**

	$('form.form-contact').formValidation({
		showErrors:false,
		error:function(data){
			// actions sur les elements
		}
	});	





###Champs ajoutés dynamiquement et gestion des évènements
Le plugin gere aussi les champs ayant été ajoutés dynamiquement (après l'appel du plugin).  
Il utilise la methode `on()` de jQuery ajoutee a la [version 1.7](http://api.jquery.com/category/version/1.7/)

Bien que le controle d'un formulaire se fait habituellement sur l'évènement submit, vous pouvez parametrer le ou les evenements a ecouter (si plusieurs, séparer par un espace)

**Exemple :**

	$('form.form-contact').formValidation({
		events:'submit hover'
	});	

