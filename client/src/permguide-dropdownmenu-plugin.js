
(function ($) {

	$.fn.dropdownmenu = function(props) {
		// Вешаем обработчик на книпку "свернуть/развернуть"
		this.each( function() {
			var state = {
				closed: true,
				position: {top: 0},
				element: this
			};
			
			// Метод изменения размера и позиции меню.
			state.resize = function() {
				var separatorHeight =  $(state.element).parent().children(".dropDownMenuSeparator").height();
				var contentHeight = $(state.element).find(".vScroller").height()+10;
				var dropdownmenuHeight = (contentHeight+separatorHeight);
				alert(dropdownmenuHeight);
				$(state.element).css("height", dropdownmenuHeight+"px");
				$(state.element).find(".dropDownMenuContent").css("height", contentHeight+"px");
				$(state.element).find(".toggleButton").css("height", separatorHeight+"px");
				
				// Вычисляем верхнюю позицию меню.
				var top = dropdownmenuHeight - separatorHeight;
				$(state.element).offset({
					top: -top
				});
				state.position.top = -top;
			};
			
			state.close = function() {
				if (state.closed)
					return;

				state.closed = !state.closed;
				var topPosition = state.position.top;

				$(".dropDownMenuBg").css("display", "none");
				$(state.element).animate({
					top: topPosition
				}, 500);
			};
			
			state.open = function() {
				if (!state.closed)
					return;

				state.closed = !state.closed;
				var topPosition = 0;

				$(".dropDownMenuBg").css("display", "block");
				$(state.element).animate({
					top: topPosition
				}, 500);
			};

			state.resize();
			// При изменении размера окна изменим размеры меню.
			$(window).resize(function() {
				state.resize();
			});
			
			
			// Вешаем событие на кнопку сварачивания меню.
			$(this).children(".toggleButton").touchclick( function (event){
				if (state.closed)
					state.open();
				else
					state.close();
			});
			
			// Если произошел клик внутри меню, надо его задержать.
			$(this).touchclick( function (event){
			}, true);

			// Клик вне меню, должен закрыть его!
			$(".dropDownMenuBg").touchclick( function (event){
				state.close();
			}, true);
			
			$(this).data(state);
		});
	};	

})(jQuery);