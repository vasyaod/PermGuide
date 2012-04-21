// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.deadRadius = 15;

/**
 * Плагин для jQuery, который позволяет использовать события тача, если тач
 * не поддерживается, то он эмулируется за счет мыши. 
 */
(function ($) {
	
	if (!$.fn.browserTouchSupport.touches) {
		// Если тач не поддерживается, то используем события мыши.
		$.fn.touchstart = function(fn, stopPropagation) {
			$(this).each( function () {
				var self = this;
				var mousedownHandler = function (event, propagation)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn.call(self, {
						type: "touchstart",
						target: event.target,
						changedTouches: 
						[
							{
								clientX: event.clientX,
								clientY: event.clientY,
								screenX: event.screenX,
								screenY: event.screenY,
								pageX: event.pageX,
								pageY: event.pageY
							}
						]
					});
				}
				//$(this).on("mousedown", newFn);
				this.addEventListener("mousedown", mousedownHandler);
			});
			
		};
		
		$.fn.touchmove = function(fn, stopPropagation) {
			$(this).each( function () {
				var self = this;
				var mousemoveHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn.call(self, {
						type: "touchmove",
						target: event.target,
						changedTouches: 
						[
							{
								clientX: event.clientX,
								clientY: event.clientY,
								screenX: event.screenX,
								screenY: event.screenY,
								pageX: event.pageX,
								pageY: event.pageY
							}
						]
					});
				}
				
				//$(this).on("mousemove", newFn);
				this.addEventListener("mousemove", mousemoveHandler);
			});
			
		};
		
		$.fn.touchend = function(fn, stopPropagation) {
			$(this).each( function () {
				var down = false;
				var self = this;
				var mousedownHandler = function (event) {
					down = true;
					return true;
				}
				
				var mouseupHandler = function (event) {
					if (!down)
						return;
					down = false;

					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn.call(self, {
						type: "touchend",
						target: event.target,
						changedTouches: 
						[
							{
								clientX: event.clientX,
								clientY: event.clientY,
								screenX: event.screenX,
								screenY: event.screenY,
								pageX: event.pageX,
								pageY: event.pageY
							}
						]
					});
				}
				var mouseleaveHandler = function (event) {
					if (!down)
						return;
					upHandler(event);
				}
				//$(this).on("mousedown", downHandler);
				//$(this).on("mouseup", upHandler);
				//$(this).on("mouseleave", outHandler);
				this.addEventListener("mousedown", mousedownHandler);
				this.addEventListener("mouseup", mouseupHandler);
				this.addEventListener("mouseleave", mouseleaveHandler);
			});
		};
		
		$.fn.touchclick = function(fn, stopPropagation) {
			
			$(this).each( function () {
				
				var touchclickState = null;
				var self = this;

				var mousedownHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					touchclickState = {
						x: event.clientX,
						y: event.clientY
					}
					return true;
				};
				
				var mouseupHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					if (touchclickState == null)
						return true;
					
					var touchclickStateTmp = touchclickState;
					touchclickState = null;
					if (Math.abs(event.clientX - touchclickStateTmp.x) < PermGuide.deadRadius &&
						Math.abs(event.clientY - touchclickStateTmp.y) < PermGuide.deadRadius)
					{
						return fn.call(self, {
							type: "touchclick",
							target: event.target,
							changedTouches: 
							[
								{
									clientX: event.clientX,
									clientY: event.clientY,
									screenX: event.screenX,
									screenY: event.screenY,
									pageX: event.pageX,
									pageY: event.pageY
								}
							]
						});
					}
				};
			
//				$(this).on("mousedown", downHandler);
//				$(this).on("mouseup", upHandler);

				this.addEventListener("mousedown", mousedownHandler);
				this.addEventListener("mouseup", mouseupHandler);
			});
		};
	} else {
		// Если тач поддерживается, то используем нужные события.
		$.fn.touchstart = function(fn, stopPropagation) {
			$(this).each( function () {
				var self = this;

				var touchstartHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn.call(self, event);
				}
				
				this.addEventListener("touchstart", touchstartHandler);
			});
		};
		
		$.fn.touchmove = function(fn, stopPropagation) {
			$(this).each( function () {
				var self = this;
				var touchmoveHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn.call(self, event);
				}
				
				this.addEventListener("touchmove", touchmoveHandler);
			});
		};
		
		$.fn.touchend = function(fn, stopPropagation) {
			$(this).each( function () {
				var self = this;
				var touchendHander = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn.call(self, event);
				}
				
				this.addEventListener("touchend", touchendHander);
			});
		};	

		$.fn.touchclick = function(fn, stopPropagation) {
			
			$(this).each( function () {
				var touchclickState = null;
				var self = this;
			
				var touchstartHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					touchclickState = {
						x: event.changedTouches[0].clientX,
						y: event.changedTouches[0].clientY
					}
					//console.log("down");
					return true;
				}
				
				var touchendHandler = function (event)
				{
					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					if (touchclickState == null)
						return;
					var touchclickStateTmp = touchclickState;
					touchclickState = null;
					//console.log("up");
					if (Math.abs(event.changedTouches[0].clientX - touchclickStateTmp.x) < PermGuide.deadRadius &&
						Math.abs(event.changedTouches[0].clientY - touchclickStateTmp.y) < PermGuide.deadRadius) {
						return fn.call(self, event);
					}
					
					return true;
				}
			
				this.addEventListener("touchstart", touchstartHandler);
				this.addEventListener("touchend", touchendHandler);
			});
		};	
	}
	

})(jQuery);