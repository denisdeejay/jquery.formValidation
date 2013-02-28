/**
	Plugin jQuery formValidation
	@author denisdeejay

	Utilise en partie le boilerplate : http://fr.jqueryboilerplate.com/
	Necessite jQuery 1.7+

	Fonctionnement :
	Se sert de l'attribut "data-field-type" pour definir le type de donnees a valider sur le champs
	Exemple :
	- name
	- address
	- phoneFR
	- city
	- zipFR
	- int
	- notEmpty (non vide, par defaut)
	
	Applique ces tests uniquement sur les champs requis (attribut html5 "required")
	Personnalise le message d'erreur en se servant du message stocké dans l'attribut "data-field-error"

	Est prevu pour la structure HTML du Bootstrap Twitter

	Comme toute validation en javascript, elle ne reagit qu'apres que le navigateur lui ait envoye l'information
	Si le navigateur bloque l'envoi via son propre controle en HTML5 (required, type="email", pattern) il le fera avant l'appel du JS
	
	Le plugin peut etre etendu avec des tests supplémentaires
	Exemple :
		$('form.form-contact').formValidation({
			rules: {
				ip:/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
			}
		});
		<input type="text" name="myIP" data-field-type="ip" data-field-error="IP invalide">

	Les tests deja enregistres peuvent aussi etre modifies par ce biais


	Par defaut, le plugin sert de "bloqueur" sur l'evenement submit. 
	Si tous les tests sont passes avec succes, la fonction laisse le submit se derouler normalement
	Si l'un des tests echoue, la fonction bloque le formulaire et met en surbrillance les champs ayant echoues

	On peut etendre les fonctionalites du plugin en passant une fonction à l'attribut "success".
	Cette fonction recoit l'event en parametre. Ce qui permet de le bloquer si l'on souhaite faire une requete ajax
	Exemple :
		$('form.form-contact').formValidation({
			success:function(event){
				alert('ok par fonction utilisateur. elle se charge du preventDefault()');
				event.preventDefault();
			}
		});	

	On peut etendre les fonctionalites du plugin en passant une fonction à l'attribut "error".
	Cette fonction recoit en parametre un tableau des objets jQuery ayant ete en erreur.
	Exemple :
		$('form.form-contact').formValidation({
			error:function(data){
				console.log(data);
			}
		});	

	On peut etendre les fonctionalites du plugin en passant une fonction aux attributs "before" et "after".
	Ces fonctions ne prennent aucun parametres mais sont appelles par le plugin au tout debut de l'action (before) et a la toute fin, juste avant le "success" ou "error" (after).
	Ca peut etre utile dans le cas ou on souhaite formater les champs juste avant de les valider puis les remettre en forme juste apres
	Par exemple, pour un numero de telephone FR ou on aura mis un espace tous les 2 characteres
	Exemple :
		$('form.form-contact').formValidation({
			before:function(){
				// annulation d'une mise en forme des champs
			},
			after:function(){
				// remise en forme des champs
			},
		});	


	Le plugin ajoute automatiquement une asterisque sur l'element parent du champ obligatoire.
	Ce comportement est parametrable, pour le desactiver :
		$('form.form-contact').formValidation({
			showRequiredLabels:false, // default TRUE
		});	

	Pour le personnaliser :
		$('form.form-contact').formValidation({
			requiredLabelsHtml:'<strong>R</strong>' // default : <span class="required-badge">*</span>
		});	

	
	Par defaut, le plugin est prevu pour une organisation de champ de formulaire typique du bootstrap twitter
	Exemple :
		<div class="control-group">
			<label class="control-label" for="inputAdresse">Adresse</label>
			<div class="controls">
				<input type="text" id="inputAdresse" name="adresse">
			</div>
		</div>

	Les selecteurs des parents "control-group" et "control-label" peuvent etre remplaces
	Exemple :
	Pour le personnaliser :
		$('form.form-contact').formValidation({
			groupSelector:'div.MY-control-group',
			labelSelector:'div.MY-control-label'
		});	

	Par defaut, le plugin gere tout seul l'affichage des chaps ayant des donnees invalides en
	ajoutant une classe error au "control-group" et insere une balise span avec la classe "help-inline" 
	Au meme niveau que le champs affecte.
	Exemple :
	<div class="control-group error">
		<label class="control-label" for="inputNom">Nom <span class="required-badge">*</span></label>
		<div class="controls">
			<input type="text" id="inputNom" name="nom" placeholder="Nom" data-field-type="name" data-field-error="Veuillez entrer un nom correct" required>
			<span class="help-inline">Veuillez entrer un nom correct</span>
		</div>
	</div>

	Le plugin permet de modifier ce comportement en personnalisant les parametres :
		groupErrorClass : classe a ajouter sur l'element en erreur
		errorMessageClass : classe utilisee sur l'element contenant le message d'erreur
		errorMessageElement : type d'element contenant le message d'erreur (defaut : span)

	Exemple :
		$('form.form-contact').formValidation({
			groupErrorClass:'MY-error',
			errorMessageClass:'MY-helper-message',
			errorMessageElement:'div' // default : span
		});	

	Vous pouvez aussi parametrer le plugin pour qu'il ne gere tout simplement pas l'affichage 
	des messages d'erreur. Dans ce cas, seulement la methode error() sera appellee (si elle est definie)
	Les ojets en erreur sont retourne dans la fonction error() ce qui vous permet de gerer vous meme l'affichage des erreurs
	Exemple :
		$('form.form-contact').formValidation({
			showErrors:false,
			error:function(data){
				// actions sur les elements
			}
		});	

	Le plugin gere aussi les champs ayant ete ajoutes dynamiquement (apres l'appel du plugin).
	Il utilise la methode on() de jQuery ajoutee a la version 1.7
	@see: http://api.jquery.com/category/version/1.7/

	Bien que le controle d'un formulaire se fait habituellement sur l'evenement submit,
	vous pouvez parametrer le ou les evenements a ecouter (si plusieurs, separer par un espace)
	Exemple :
		$('form.form-contact').formValidation({
			events:'submit hover'
		});	


	@TODO : Prevoir dans le futur un attribut "data-field-pattern" ou utiliser l'attribut "pattern" de html5
*/


// Le point-virgule avant l'invocation de la fonction est un filet de sécurité
// si le plugin est concaténé avec d'autre scripts et/ou d'autres plugin qui
// pourraient ne pas avoir été convenablement fermés.
;(function($, window, document, undefined ){

    // "undefined" est utilisé ici car sa variable globale est mutable en
    // ECMAScript 3, c'est-à-dire qu'elle peut être redéfinie par quelqu'un
    // d'autre. De plus, "undefined" n'est pas réélement passé à la
    // fonction, ainsi nous sommes certains que sa valeure est bien "undefined"
    // comme un "void 0". D'autre part en ES5, "undefined" n'est plus mutable.

    // "window" et "document" sont passé par des variables locales plutôt que
    // par les globales, cela accélère (relativement) le processus de résolution
    // et permet de mieux tirer avantage de la "minification" (tout
    // particulièrement quand les deux sont régulièrement référencés dans votre plugin).

	$.fn.formValidation = function(params){
		// fusion des parametres par defaut et utilisateurs
		var params = $.extend({
			rules:{},
			success:null,
			error:null,
			before:null,
			after:null,
			events:'submit',
			showRequiredLabels:true,
			requiredLabelsHtml:' <span class="required-badge">*</span>',
			groupSelector:'.control-group',
			labelSelector:'.control-label',
			showErrors:true,
			groupErrorClass:'error',
			errorMessageClass:'help-inline',
			errorMessageElement:'span',
		}, params);


		// les differents tests de validite
		var reg = {
			notEmpty:/\S/,
			zipFR: /^((0[1-9])|([1-8][0-9])|(9[0-8]))[0-9]{3}$/,
			phoneFR: /^(01|02|03|04|05|06|07|08|09)[0-9]{8}$/,
			email: /^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$/,
			int:/^[0-9]+$/, 
			name:/^[a-zA-ZàáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s-]{2,40}$/i,
			address:/^[a-zA-ZàáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s-]{2,150}$/i,
			city:/^[a-zA-ZàáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s-]{2,80}$/i
		}


		// Fusion des regles definis par l'utilisateur avec les regles deja ecrites
		reg = $.extend(params.rules, reg);


		// fonction centralisant les appels aux methodes de validation
		// @param type Type de donnee a valider
		// @param value Valeur a valider
		// @return bool
		function validate(type, value){
			return (type in reg) ? reg[type].test(value) : reg.notEmpty.test(value);
		}


		// Boucle sur tous les elements jQuery a affecter
		// on en profite pour retourner l'objet jQuery pour permettre le chainage
		return this.each(function(){
			// l'element a cibler
			var em 					= $(this);
			var requiredFields 		= em.find('[required]');

			// ajout de l'asterisque aux labels des champs obligatoires
			if(params.showRequiredLabels){
				var requiredLabels 		= requiredFields.parents(params.groupSelector).find(params.labelSelector);
				requiredLabels.append(params.requiredLabelsHtml);
			}

			// au submit du formulaire
			em.on(params.events, function(e){
				// appel de la methode before si elle est definie
				if($.isFunction(params.before)){
					params.before();
				}

				// RAZ des classes "error"
				$(this).find('.'+params.groupErrorClass).removeClass(params.groupErrorClass);
				// DELETE des elements "help-inline"
				$(this).find('.'+params.errorMessageClass).remove();
				// tableau d'erreurs
				var errorsField = new Array();

				// boucle sur les elements requis
				requiredFields.each(function(){
					var field 	= $(this);

					// determine le type a utiliser, par defaut "notEmpty"
					var type 	= field.data('field-type') || 'notEmpty';

					// le message d'erreur en cas d'echec
					var errMsg 	= field.data('field-error') || 'Non conforme';

					// on lance le test
					var isValid = validate(type, field.val());

					// si il ne correspond pas : 
					if(!isValid){
						// si l'affichage des erreurs est demande
						if(params.showErrors){
							// on ajoute la classe "error" au control-group parent
							field.parents(params.groupSelector).addClass(params.groupErrorClass);
							// on prend le message d'erreur et on l'insert dans <span class="help-inline">
							field.parent().append('<'+params.errorMessageElement+' class="'+params.errorMessageClass+'">'+errMsg+'</'+params.errorMessageElement+'>')
						}
						// incremente le compteur
						errorsField.push(field);
					}
				});


				// appel de la methode after si elle est definie
				if($.isFunction(params.after)){
					params.after();
				}


				// On return TRUE uniquement si 0 erreur et qu'aucune methode "success" n'est definie
				// (donc, le plugin ne bloque pas l'evenement, pour un submit, le formulaire sera poste)
				// Dans tous les autres cas, on return FALSE
				//
				// si 0 erreur
				if(errorsField.length == 0){
					// ici, si params.success on l'appelle et passe l'event a la fonction
					// c'est params.success qui se chargera de bloquer ou non l'event
					if($.isFunction(params.success)){
						params.success(e);
						return false;
					}					
					return true;
				} else {
					if($.isFunction(params.error)){
						params.error(errorsField);
					}
					return false;
				}
			});
		

		});

	}


})( jQuery, window, document );