
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

String.prototype.trim = function () {
	return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

/**
 * Небольшой плагин для интернационазизации интерфейса.
 */
$.fn.i18n = function(props) {
	this.each(function(index){
		var text = PermGuide.Language.getInterfaceString($(this).text());
		$(this).html(text);
	});
};

/**
 * Объект отвечает за работу с мультиизычностью.
 */
PermGuide.Language = {
	/**
	* Флаг того, что пользователь выбрал язык.
	*/
	languageSelected: false,
	
	/**
	 * Язак с которым работает программа.
	 */
	currentLanguage: "ru",
	
	/**
	 * Ссылка на языковые ресурсы.
	 */
	languageResource: null,
		
	/**
	 * Метод устанавливает текущий язык.
	 */
	setCurrentLanguage: function (currentLanguage) {
		this.languageSelected = true;
		this.currentLanguage = currentLanguage;
		
		//var res = $.url.parse(document.URL);
		//res.source = null;
		//if (!res.params)
		//	res.params = {};
		//res.params.lang = currentLanguage;
		//window.location.href = $.url.build(res);
	},
	
	/**
	 * Возвращает строку на основании текущего(выбранного) языка.
	 */
	getString: function(object)
	{
		if (object == null)
			return null;
		
		// Если объект уже является строкой, то возвразщаем строку.
		if (typeof obj === "string")
			return obj;
			
		if (this.currentLanguage == "ru" && object[this.currentLanguage] == null)
			return object["rus"];
		
		return object[this.currentLanguage];
	},

	/**
	 * Возвращает строку из языковых ресурсов в соответствии с выбранным 
	 * языком.
	 */
	getInterfaceString: function(key)
	{
		if (!this.languageResource)
			this.languageResource = PermGuide.lr;
		
		var object = this.languageResource[key.trim()];
		if (object == null)
			return key;
		
		return this.getString(object);
	}
}
