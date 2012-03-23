
(function ($) {

	$.fn.dropdownmenu = function(props) {
		// Вешаем обработчик на книпку "свернуть/развернуть"
		this.each( function() {
			var state = {
				closed: true,
				position: null,
				element: this
			};
			state.position = $(this).offset();
			
			var close = function() {
				if (state.closed)
					return;

				state.closed = !state.closed;
				var topPosition = state.position.top;

				$(".dropDownMenuBg").css("display", "none");
				$(state.element).animate({
					top: topPosition
				}, 500);
			};
			
			var open = function() {
				if (!state.closed)
					return;

				state.closed = !state.closed;
				var topPosition = 0;

				$(".dropDownMenuBg").css("display", "block");
				$(state.element).animate({
					top: topPosition
				}, 500);
			};
			
			$(this).children(".toggleButton").touchclick( function (event){
				if (state.closed)
					open();
				else
					close();
			});

			$(this).touchclick( function (event){
			}, true);

			$(".dropDownMenuBg").touchclick( function (event){
				close();
			}, true);
		});
	};	

})(jQuery);