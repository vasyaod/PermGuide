
(function ($) {

	$.fn.dropdownmenu = function(props) {
		// Вешаем обработчик на книпку "свернуть/развернуть"
		this.each( function() {
			var state = {
				closed: true,
				position: {top: 0},
				element: this,
			
				// Метод изменения размера и позиции меню.
				resize: function() {
					var separatorHeight =  $(state.element).parent().children(".dropDownMenuSeparator").height();
					var contentHeight = $(state.element).find(".vScroller").height()+10;
					var dropdownmenuHeight = (contentHeight+separatorHeight);
					//alert(dropdownmenuHeight);
					$(this.element).css("height", dropdownmenuHeight+"px");
					$(this.element).find(".dropDownMenuContent").css("height", contentHeight+"px");
					$(this.element).find(".toggleButton").css("height", separatorHeight+"px");
					
					// Вычисляем верхнюю позицию меню.
					var top = dropdownmenuHeight - separatorHeight;
					$(this.element).offset({
						top: -top
					});
					this.position.top = -top;
				},
			
				close: function() {
					if (this.closed)
						return;
	
					this.closed = !this.closed;
					var topPosition = this.position.top;
	
					$(".dropDownMenuBg").css("display", "none");
					$(this.element).animate({
						top: topPosition
					}, 500);
				},
			
				open: function() {
					if (!this.closed)
						return;
	
					this.closed = !this.closed;
					var topPosition = 0;
	
					$(".dropDownMenuBg").css("display", "block");
					$(this.element).animate({
						top: topPosition
					}, 500);
				},
				
				toggle: function() {
					if (this.closed)
						this.open();
					else
						this.close();
				}
			};

			state.resize();
			// При изменении размера окна изменим размеры меню.
			$(window).resize(function() {
				state.resize();
			});
			
			
			// Вешаем событие на кнопку сварачивания меню.
			$(this).children(".toggleButton").touchclick( function (event){
				state.toggle();
			});
			
			// Если произошел клик внутри меню, надо его задержать.
			$(this).touchclick( function (event){
			}, true);

			// Клик вне меню, должен закрыть его!
			$(".dropDownMenuBg").touchclick( function (event){
				state.close();
			}, true);
			
			$(this).data("state", state);
		});
	};	

})(jQuery);