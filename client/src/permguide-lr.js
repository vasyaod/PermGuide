
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Файл с языковыми ресурсами.
 */
PermGuide.lr = {
	
	"Пермский гид": {
		ru: "Пермский гид",
		en: "Perm guide"
	},
	"Места": {
		ru: "Места",
		en: "Places"
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
		en: "Photo"
	},
	"Back": {
		ru: "Назад",
		en: "Back"
	},
	"Популярные места": {
		ru: "Популярные места",
		en: "Popular places"
	},
	"Ближайшие места": {
		ru: "Ближайшие места",
		en: "Places near"
	},
	"Интересные маршруты": {
		ru: "Интересные маршруты",
		en: "Интересные маршруты"
	},
	"Найти на карте": {
		ru: "Найти на карте",
		en: "Find on map"
	},	
	"подробнее": {
		ru: "подробнее",
		en: "more"
	},
	
	"MapLoadFailTitle": {
		ru: "Карта не была загружена",
		en: "Карта не была загружена"
	},
	// Все строки MapLoadFailText1..5 следует читать сплошным текстом.
	"MapLoadFailText1": {
		ru: "Возможно у вас отсутствует соединение с интернетом, установите соединение и нажмите",
		en: "Возможно у вас отсутствует соединение с интернетом, установите соединение и нажмите"
	},
	"MapLoadFailText2": {
		ru: "обновить",
		en: "обновить"
	},	
	"MapLoadFailText3": {
		ru: ". В случаи отсутствия связи, Вы можете ",
		en: ". В случаи отсутствия связи, Вы можете "
	},	
	"MapLoadFailText4": {
		ru: "перейти",
		en: "перейти"
	},	
	"MapLoadFailText5": {
		ru: "в режим списка.",
		en: "в режим списка."
	},
	"MapLoadingTitle": {
		ru: "Идет загрузка карты",
		en: "Идет загрузка карты"
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
