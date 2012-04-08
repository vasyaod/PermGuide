
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.HTMLAudio = {
	
	_init: function() {
		this.audioElement = document.createElement('audio');
		this.audioElement.onerror = $.proxy(function (){
			this.stop();
			alert("HTML5 audio error: "+this.audioElement.error.code);
		}, this);
	},

	_supportedFormat: function() {
		if (this.audioElement.canPlayType) {
			var canPlayMp3 = "" != this.audioElement.canPlayType('audio/mpeg');
			var canPlayOgg = "" != this.audioElement.canPlayType('audio/ogg; codecs="vorbis"');
			if (canPlayOgg)
				return ".ogg";
			if (canPlayMp3)
				return ".mp3";
		}
		return null;
	},
		
	_play: function(url) {
		if (this.audioElement) {
			this.audioElement.setAttribute('src', url);
			this.audioElement.play();
		}
	},
	
	_stop: function() {
		if (this.audioElement)
			this.audioElement.pause();
	}
};

PermGuide.PhonegapAudio = {
		
	_init: function() {
	},

	_supportedFormat: function() {
		return ".mp3";
	},
			
	_play: function(url) {
		this.media = new Media(url);
		this.media.play();
	},
		
	_stop: function() {
		if (this.media)
		{
			this.media.stop();
			this.media.release();
		}
	}
};

PermGuide.Audio = {
	
	inited: false,
	
	init: function(object) {
		if (this.inited)
			return;
		this.inited = true;
		
		// Если это фонегап то наследуемся от определенного объекта
		if (PermGuide.isPhonegap) {
			$.extend(this, PermGuide.PhonegapAudio);
		} else {
			$.extend(this, PermGuide.HTMLAudio);
		}
		this._init();
	},

	play: function(object) {
		this.init();
		this.stop();
		var supportedFormat = this._supportedFormat();

		if (supportedFormat && object.audio) {
			var fileName = object.audio;
			var url = 'http://permguide.ru/audio/'+fileName+supportedFormat;
			
			this._play(url);
			return true;
		}
		return false;
	},
	
	stop: function() {
		this.init();
		$(".sndPlay").removeClass("sndPlay");
		this._stop();
	}
};
