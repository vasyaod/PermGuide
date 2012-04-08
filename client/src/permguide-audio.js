
// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.Audio = {
		
	play: function(object) {
		if (!this.audioElement)
		{
			this.audioElement = document.createElement('audio');
			this.audioElement.onerror = $.proxy(function (){
				this.stop();
				alert("audio error: "+this.audioElement.error.code);
			}, this);
		}
		
		if (object.audio) {
			var url = null;
			if (this.audioElement.canPlayType) {

				var canPlayMp3 = "" != this.audioElement.canPlayType('audio/mpeg');
				var canPlayOgg = "" != this.audioElement.canPlayType('audio/ogg; codecs="vorbis"');
				var fileName = object.audio;
				if(canPlayOgg)
					url = 'http://permguide.ru/audio/'+fileName+'.ogg';
				else if (canPlayMp3)
					url = 'http://permguide.ru/audio/'+fileName+'.mp3';
			}
			
			this.stop();
			
			if (url) {
				this.audioElement.setAttribute('src', url);
				this.audioElement.play();
				return true;
			}
		}
		return false;
	},

	stop: function() {
		$(".sndPlay").removeClass("sndPlay");
		this.audioElement.pause();
	}
}