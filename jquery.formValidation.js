/**
	Plugin jQuery formValidation
	@author denisdeejay

	Utilise en partie le boilerplate : http://fr.jqueryboilerplate.com/
	Necessite jQuery 1.7+


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