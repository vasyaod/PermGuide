
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Файл с языковыми ресурсами.
 */
PermGuide.lr = {
	
	"PrevButton": {
		ru: "влево",
		en: "to left"
	},
	
	"NextButton": {
		ru: "влево",
		en: "to right"
	},
	"ТoggleButton": {
		ru: "Жми сюда, здесь метки",
		en: "Click here"
	},
	"Intro": {
		ru: "Красивая картинка и менюшка!",
		en: "Beautiful picture and menus!"
	}
	
}

/**
 * Объект отвечает за работу с мультиизычностью.
 */
PermGuide.Language = {

	// Флаг того, что пользователь выбрал язык.
	languageSelected: false,
	
	// Пока язык задан статично.
	currentLanguage: "ru",
	
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
		var object = PermGuide.lr[key];
		if (object == null)
			return key;
		
		return this.getString(object);
	}
}
