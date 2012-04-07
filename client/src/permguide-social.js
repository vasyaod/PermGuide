
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.showShareWindow = function(socialNetwork, object) {
	var documentUrl = "http://permguide.ru?objectId="+object.id;
	var title = object.name;
	var description = object.description;
//	photo_image = $(window.cache[iteration]).children('img').attr('src') || '';
	
	var url = null;
	if(socialNetwork == 'vk') {
		var url = 'http://vk.com/share.php?';
		url += 'url=' + encodeURIComponent(documentUrl);
		url += '&title=' + encodeURIComponent(title);
		url += '&description=' + encodeURIComponent(description);
//		url += '&image=' + photo_image;
		url += '&noparse=true';
	} /*else if (socialNetwork == 'fb') {
		var url = 'http://www.facebook.com/dialog/feed?';
		url += 'app_id=' + window.fb_api_key;//initialise in buildpost()
		url += '&redirect_uri=http://www.facebook.com/?sk=nf/';
		url += '&link=' + encodeURIComponent(document_href);
		url += '&name=' + encodeURIComponent(temp_title);
		url += '&caption=' + encodeURIComponent(photo_description);
		url += '&picture=' + photo_image;
	} */else if(socialNetwork == 'tw') {
		url = 'http://twitter.com/share?';
		url += 'text=' + encodeURIComponent(((title.length > 140) ? title.slice(0,136) + '...' : title));
		url += '&url=' + encodeURIComponent(documentUrl);
	} else if(socialNetwork == 'od') {
		url = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
		url += '&st.comments=' + encodeURIComponent(title);
		url += '&st._surl=' + encodeURIComponent(documentUrl);
	}
	window.open(url); 
}
