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
			var newFn = function (event, propagation)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				return fn({
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
			$(this).each( function () {
				this.addEventListener("mousedown", newFn);
			});
			
		};
		
		$.fn.touchmove = function(fn, stopPropagation) {
			var newFn = function (event)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				return fn({
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
			$(this).each( function () {
				this.addEventListener("mousemove", newFn);
			});
			
		};
		
		$.fn.touchend = function(fn, stopPropagation) {
			$(this).each( function () {
				var down = false;
				var downHandler = function (event) {
					down = true;
					return true;
				}
				
				var upHandler = function (event) {
					if (!down)
						return;
					down = false;

					if (stopPropagation)
						event.stopPropagation();
					event.preventDefault();
					return fn({
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
				var outHandler = function (event) {
					if (!down)
						return;
					upHandler(event);
				}
				//$(this).on("mousedown", downHandler);
				//$(this).on("mouseup", upHandler);
				//$(this).on("mouseleave", outHandler);
				this.addEventListener("mousedown", downHandler);
				this.addEventListener("mouseup", upHandler);
				this.addEventListener("mouseleave", outHandler);
			});
		};
		
		$.fn.touchclick = function(fn, stopPropagation) {
			
			var touchclickState = null;
			
			var downHandler = function (event)
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
			
			var upHandler = function (event)
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
					return fn({
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
			
//			$(this).on("mousedown", downHandler);
//			$(this).on("mouseup", upHandler);
			$(this).each( function () {
				this.addEventListener("mousedown", downHandler);
				this.addEventListener("mouseup", upHandler);
			});
		};
	} else {
		// Если тач поддерживается, то используем нужные события.
		$.fn.touchstart = function(fn, stopPropagation) {
			var newFn = function (event)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				return fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchstart", newFn);
			});		
		};
		
		$.fn.touchmove = function(fn, stopPropagation) {
			var newFn = function (event)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				return fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchmove", newFn);
			});		
		};
		
		$.fn.touchend = function(fn, stopPropagation) {
			var newFn = function (event)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				return fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchend", newFn);
			});
		};	

		$.fn.touchclick = function(fn, stopPropagation) {
			
			var touchclickState = null;
			
			var downHandler = function (event)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				touchclickState = {
					x: event.changedTouches[0].clientX,
					y: event.changedTouches[0].clientY
				}
				
				return true;
			}
			
			var upHandler = function (event)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				if (touchclickState == null)
					return;
				var touchclickStateTmp = touchclickState;
				touchclickState = null;
				if (Math.abs(event.changedTouches[0].clientX - touchclickStateTmp.x) < PermGuide.deadRadius &&
					Math.abs(event.changedTouches[0].clientY - touchclickStateTmp.y) < PermGuide.deadRadius) {
					return fn(event);
				}
				
				return true;
			}
			
			$(this).each( function () {
				this.addEventListener("touchstart", downHandler);
				this.addEventListener("touchend", upHandler);
			});
		};	
	}
	

})(jQuery);