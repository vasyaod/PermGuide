
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

				refresh: function() {
					var topPosition;
					
					if (this.closed) {
						topPosition = this.position.top;
						$(".dropDownMenuBg").css("display", "none");
					} else {
						topPosition = 0;
						$(".dropDownMenuBg").css("display", "block");
					}

					$(this.element).animate({
						top: topPosition
					}, 500);
				},
				
				close: function() {
					if (this.closed)
						return;
	
					this.closed = !this.closed;
					this.refresh();
				},
			
				open: function() {
					if (!this.closed)
						return;
	
					this.closed = !this.closed;
					this.refresh();
				},
				
				toggle: function() {
					this.closed = !this.closed;
					this.refresh();
				},
				
				down: function(event) {
					
					this.x = event.changedTouches[0].clientX;
					this.y = event.changedTouches[0].clientY;
					this.containerPosition = $(this.element).offset();
					
					this.draged = true;
					this.moved = false;
					
				},
					
				move: function(event) {
					
					if (!this.draged)
						return;
					var tX = event.changedTouches[0].clientX;
					var tY = event.changedTouches[0].clientY;
					// Если сдвиг не очень большой, то стоим на месте.
					if (!this.moved && Math.abs(tY - this.y) < PermGuide.deadRadius)
						return;
					this.moved = true;
					var top = this.containerPosition.top + (tY - this.y);
					
					if (top > 0)	// Окно не должно "отрываться" от верху.
						return;
					if (top < this.position.top)	// Окно не должно "уходить" верх больше чем нужно.
						return;
					
					$(this.element).offset({ 
						top: top
					});
				},
				
				up: function(event) {
					if (!this.draged)
						return;
					this.draged = false;
					
					if (!this.moved)
						return;
					this.moved = false;
					
					var tX = event.changedTouches[0].clientX;
					var tY = event.changedTouches[0].clientY;
					
					if (tY - this.y > 0 && Math.abs(tY - this.y) > $(this.element).height()*0.25)
						this.closed = false;
					else if (tY - this.y < 0 && Math.abs(tY - this.y) > $(this.element).height()*0.25)
						this.closed = true;

					this.refresh();
				}
			};

			state.resize();
			// При изменении размера окна изменим размеры меню.
			$(window).resize(function() {
				state.resize();
			});
			
			
			// Вешаем событие на кнопку сварачивания меню.
			$(this).children(".toggleButton").touchstart($.proxy(state.down, state));
			$(this).children(".toggleButton").touchmove($.proxy(state.move, state));
			$(this).children(".toggleButton").touchend($.proxy(state.up, state));
			$(this).children(".toggleButton").touchclick($.proxy(state.toggle, state));
			
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