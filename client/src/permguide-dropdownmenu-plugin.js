
(function ($) {

	$.fn.dropdownmenu = function(props) {
		// Вешаем обработчик на книпку "свернуть/развернуть"
		this.each( function() {
			var state = {
				closed: true,
				position: null,
				element: this
			};
			state.position = $(this).position();
			$(this).css("width", $(this).parent().width());
			
			$(this).children(".toggleButton").touchclick( function (event){
				var topPosition = 0;
				if (!state.closed)
					topPosition = state.position.top;
				state.closed = !state.closed;
				
				$(state.element).animate({
					top: topPosition
				}, 500);
			});
		});
	};	

})(jQuery);