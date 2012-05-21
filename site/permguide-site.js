
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

/**
 * Различный код работы с сайтом.
 */
PermGuide.Site = {
	/**
	 * Адрес, где находится основное приложение.
	 */
	appUrl: 'http://permguide.ru/app',
	
	/**
	 * Обработчик параметров передоваемых в урле.
	 */
	urlParamsProcessor: function () {
		// Дефолтные параметры.
		var params = {
			lang: "ru"
		};
		if ($.cookie('lang'))
			params.lang=$.cookie('lang');
		
		var appUrlObject= $.url.parse(this.appUrl);
		appUrlObject.source = null;
		// Если параметров нет, то создадим объект с параметрами.
		if (!appUrlObject.params)
			appUrlObject.params = {};

		// Копируем параметры из урла страницы в урл приложения
		var pageUrlObject = $.url.parse(document.URL);
		pageUrlObject.source = null;
		if (pageUrlObject.params) {
			$.extend(params, pageUrlObject.params);
		}
		// Сохраним язык в куках
		$.cookie('lang', params.lang);
		
		// Пускай у приложения и страницы будут одинаковые параметры.
		appUrlObject.params = params;
		pageUrlObject.params = params;
		
		////
		// Изменим урл текущей страницы.
		pageUrlObject.anchor = '';
		window.location.href = $.url.build(pageUrlObject)+"#";
		
		this.pageUrlObject = pageUrlObject;
		this.appUrlObject = appUrlObject;
	},
	
	/**
	 * Метод возвращает URL приложения, который должен распологаться в iframe.
	 */
	getAppURL: function () {
		return $.url.build(this.appUrlObject);
	}
};

