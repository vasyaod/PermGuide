
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.HTMLAudio = {
	
	_init: function() {
		this.audioElement = document.createElement('audio');
		
		this.audioElement.addEventListener("playing", $.proxy(function (){
			this._onplay();
		}, this));

		this.audioElement.addEventListener("ended",function (){
			this._onstop();
		}, this);
		
		this.audioElement.addEventListener("error",function (){
			this._onerror();
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
	},
	
	_onerror: function() {
	},

	_onplay: function() {
	},

	_onstop: function() {
	}
	
};

PermGuide.PhonegapAudio = {
		
	_init: function() {
	},

	_supportedFormat: function() {
		return ".mp3";
	},
			
	_play: function(url) {
		
		if (PermGuide.isAndroid && url.indexOf('file:///mnt/sdcard/') != -1)
			url = url.substr(19);
		else if (PermGuide.isAndroid && url.indexOf('/mnt/sdcard/') != -1)
			url = url.substr(12);
		
		console.log("Play audio: "+url);
		
		this.media = new Media(
			url,
			$.proxy(function() {
				//this._onstop();
			}, this),
			$.proxy(function(err) {
				this._onerror();
				alert("Phonegap audio error: "+err.code);
			}, this)
		);
		
		var media = this.media;
		var self = this;
		this.mediaTimer = setInterval(function() {
			// get my_media position
			self.media.getCurrentPosition(
				// success callback
				function(position) {
					if (position > -1) {
						self._onplay();
						clearInterval(self.mediaTimer);
					}
				},
				// error callback
				function(e) {
					//alert("error");
				}
			);
		}, 1000);
		
		this.media.play();
		
	},
		
	_stop: function() {
		if (this.media)
		{
			clearInterval(this.mediaTimer);
			this.media.stop();
			this.media.release();
		}
	},

	_onerror: function() {
	},

	_onplay: function() {
	},

	_onstop: function() {
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
		};

		this._onplay = function() {
			$(".sndWait").removeClass("sndWait").addClass("sndPlay");
		};
		
		this._onstop = function() {
			$(".sndWait").removeClass("sndWait");
			$(".sndPlay").removeClass("sndPlay");
		};
		
		this._onerror = function() {
			$(".sndWait").removeClass("sndWait");
			$(".sndPlay").removeClass("sndPlay");
		};

		this._init();
	},

	play: function(object) {
		this.init();
		this.stop();
		var supportedFormat = this._supportedFormat();

		if (supportedFormat && object.audio) {
			var fileName = object.audio;
			var url = "http://permguide.ru/audio/"+fileName+supportedFormat;

			// Если это фонегап, то качество файлов должно быть низкое.
			if (PermGuide.isPhonegap)
				url = PermGuide.ResourceManager.getResourceURL(
						"audio/lowquality/"+fileName+supportedFormat
					);
			
			this._play(url);
			return true;
		}
		return false;
	},
	
	stop: function() {
		this.init();
		$(".sndWait").removeClass("sndWait");
		$(".sndPlay").removeClass("sndPlay");
		this._stop();
	}
};
