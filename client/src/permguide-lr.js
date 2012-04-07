
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Файл с языковыми ресурсами.
 */
PermGuide.lr = {
	
	"Loading": {
		ru: "Загрузка приложения",
		en: "Loading"
	},
	"Пермский гид": {
		ru: "Гид Перми",
		en: "Perm guide"
	},
	"Места": {
		ru: "Места",
		en: "Sights"
	},
	"Маршруты": {
		ru: "Маршруты",
		en: "Routes"
	},
	"О Перми": {
		ru: "О Перми",
		en: "About Perm"
	},
	
	"Описание": {
		ru: "Описание",
		en: "Description"
	},
	"Фото": {
		ru: "Фото",
		en: "Photos"
	},
	"Посмотреть все фото": {
		ru: "Посмотреть все фото",
		en: "Show all photos"
	},
	"Back": {
		ru: "Назад",
		en: "Back"
	},
	"Популярные места": {
		ru: "Популярные места",
		en: "Featured"
	},
	"Ближайшие места": {
		ru: "Ближайшие места",
		en: "Nearest"
	},
	"Интересные маршруты": {
		ru: "Интересные маршруты",
		en: "Intrested routes"
	},
	"Найти на карте": {
		ru: "Найти на карте",
		en: "See on the map"
	},	
	"подробнее": {
		ru: "подробнее",
		en: "more information"
	},
	
	"MapLoadFailTitle": {
		ru: "Карта не была загружена",
		en: "The map has not been loaded"
	},
	// Все строки MapLoadFailText1..5 следует читать сплошным текстом.
	"MapLoadFailText1": {
		ru: "Возможно у вас отсутствует соединение с интернетом, проверьте соединение и попробуйте",
		en: "There may be connection problems. Please check the connection and try"
	},
	"MapLoadFailText2": {
		ru: "обновить",
		en: "again"
	},	
	"MapLoadFailText3": {
		ru: ". В случаи отсутствия связи, Вы можете ",
		en: ". If you don not have Internet connection , you can "
	},	
	"MapLoadFailText4": {
		ru: "перейти",
		en: "go to"
	},	
	"MapLoadFailText5": {
		ru: "в режим списка.",
		en: "the list."
	},
	"MapLoadingTitle": {
		ru: "Идет загрузка карты",
		en: "Loading..."
	},

	"Address": {
		ru: "Адрес: ",
		en: "Address: "
	},
	"Phone": {
		ru: "Телефон: ",
		en: "Phone: "
	},
	
	"meters": {
		ru: "м",
		en: "m"
	},
	"kilometers": {
		ru: "км",
		en: "km"
	}
}
/**
 * Небольшой плагин для интернационазизации интерфейса.
 */
$.fn.i18n = function(props) {
	this.each(function(index){
		var text = PermGuide.Language.getInterfaceString($(this).text());
		$(this).text(text);
	});
};

/**
 * Объект отвечает за работу с мультиизычностью.
 */
PermGuide.Language = {

	// Флаг того, что пользователь выбрал язык.
	languageSelected: false,
	
	// Пока язык задан статично.
	currentLanguage: "ru",

	init: function () {
		var res = $.url.parse(document.URL);
		if (res.params && res.params.lang) {
			this.languageSelected = true;
			this.currentLanguage = res.params.lang;
		}
	},
	
	/**
	 * Метод устанавливает текущий язык.
	 */
	setCurrentLanguage: function (currentLanguage) {
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
		var object = PermGuide.lr[key];
		if (object == null)
			return key;
		
		return this.getString(object);
	}
}
