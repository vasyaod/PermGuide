
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
	
	defaultLanguage: "ru",
	
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
		
		// Проверяем, что язык состоит из 2-х символов.
		if (currentLanguage.match(/^\w\w$/)) {
			this.currentLanguage = currentLanguage;
		} else {
			this.currentLanguage = this.defaultLanguage;
		}
		
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
			
		var res = null;
		
		if (res == null)
			res = object[this.currentLanguage];
		if (res == null)
			res = object["ru"];
		
		return res;
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
