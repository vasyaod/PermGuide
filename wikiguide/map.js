// Проверка существования неймспейса.
if(typeof WikiGuide == "undefined")
	WikiGuide = {};

if(typeof WikiGuide.ObjectEditor == "undefined")
	WikiGuide.ObjectEditor = {};

WikiGuide.ObjectEditor.initMap = function() {
	
	var text = jQuery("#wiki__text").val();
	if (!text)
		return;

	var matches = text.match(/<map lat\="([\.\d]+?)" lng\="([\.\d]+?)"\/>/im);
	var coordinates;

	if (matches) {
		coordinates = {
			lat: matches[1],
			lng: matches[2]
		}
	} else {
		coordinates = {
			lat: matches[1],
			lng: matches[2]
		}
	}

	WikiGuide.ObjectEditor.map = new ymaps.Map("object_map_editor", {
		center: [coordinates.lat, coordinates.lng],
		zoom: 14,
		behaviors: ['default', 'scrollZoom']
	});
	WikiGuide.ObjectEditor.map.controls.add('zoomControl')

	var myPlacemark = new  ymaps.Placemark(
		[coordinates.lat, coordinates.lng]
	);
	
	WikiGuide.ObjectEditor.map.events.add('click', function (e) {
		var newCoords = e.get('coordPosition');
		var newVal = "<map lat=\""+newCoords[0].toPrecision(7)+"\" lng=\""+newCoords[1].toPrecision(7)+"\"/>"
		myPlacemark.geometry.setCoordinates([
                    newCoords[0],
                    newCoords[1]
                ]);

		var text = jQuery("#wiki__text").val();
		if (!text)
			return;

		if (text.match(/<map lat\="([\.\d]+?)" lng\="([\.\d]+?)"\/>/im)) {
			text = text.replace(/<map lat\="([\.\d]+?)" lng\="([\.\d]+?)"\/>/im, newVal);
		} else {
			text = newVal+"\n"+text;
		}
		jQuery("#wiki__text").val(text);
	});

	WikiGuide.ObjectEditor.map.geoObjects.add(myPlacemark);
}

WikiGuide.ObjectEditor.loadMap = function() {
	ymaps.ready(WikiGuide.ObjectEditor.initMap);
}