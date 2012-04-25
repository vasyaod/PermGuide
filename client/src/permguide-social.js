
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.showShareWindow = function(socialNetwork, object) {
	
	var documentUrl = "http://permguide.ru?" +
	                  "lang="+PermGuide.Language.currentLanguage +  // Сохраним в урле информацию о языке.
	                  "&object="+object.id;
	var title = object.name;
	var description = object.description;
//	photo_image = $(window.cache[iteration]).children('img').attr('src') || '';
	
	//http://share.yandex.ru/go.xml?service=yaru&url=http%3A%2F%2Fpermguide.ru%2F&title=%D0%9C%D0%BE%D0%B1%D0%B8%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%B3%D0%B8%D0%B4%20%D0%9F%D0%B5%D1%80%D0%BC%D0%B8
	var url = null;
	if(socialNetwork == 'vk') {
		url = 'http://vk.com/share.php?';
		url += 'url=' + encodeURIComponent(documentUrl);
		url += '&title=' + encodeURIComponent(title);
		url += '&description=' + encodeURIComponent(description);
		//url += '&image=' + photo_image;
		url += '&noparse=true';
	} else if (socialNetwork == 'fb') {
		var url = 'http://www.facebook.com/sharer.php?';
		url += 'u=' + encodeURIComponent(documentUrl);
		url += '&t=' + encodeURIComponent(title);
		
		//var url = 'http://www.facebook.com/dialog/feed?';
		//url += 'app_id=' + window.fb_api_key;//initialise in buildpost()
		//url += '&redirect_uri=http://www.facebook.com/?sk=nf/';
		//url += '&link=' + encodeURIComponent(document_href);
		//url += '&name=' + encodeURIComponent(temp_title);
		//url += '&caption=' + encodeURIComponent(photo_description);
		//url += '&picture=' + photo_image;
	} else if(socialNetwork == 'tw') {
		url = 'http://twitter.com/share?';
		url += 'text=' + encodeURIComponent(((title.length > 140) ? title.slice(0,136) + '...' : title));
		url += '&url=' + encodeURIComponent(documentUrl);
	} else if(socialNetwork == 'od') {
		url = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
		url += '&st.comments=' + encodeURIComponent(title);
		url += '&st._surl=' + encodeURIComponent(documentUrl);
	}
	if (url) {
		if (PermGuide.isAndroid) {
			// В андройде используем специальный плагин, для открытия указанного
			// урла во внешнем браузере.
			window.plugins.childBrowser.openExternal(url);
		} else {
			window.open(url, '_blank');
		}
	}
}
