// Проверка существования неймспейса.
if(typeof PermGuide == "undefined")
	PermGuide = {};

PermGuide.deadRadius = 15;

/**
 * Плагин для jQuery, который позволяет использовать события тача, если тач
 * не поддерживается, то он эмулируется за счет мыши. 
 */
(function ($) {
	
	$.support.touch = typeof Touch === 'object';
	if (!$.fn.browserTouchSupport.touches) {
		// Если тач не поддерживается, то используем события мыши.
		$.fn.touchstart = function(fn, stopPropagation) {
			var newFn = function (event, propagation)
			{
				if (stopPropagation)
					event.stopPropagation();
				event.preventDefault();
				fn({
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
			$(this).on("mousedown", newFn);
		};
		
		$.fn.touchmove = function(fn, propagation) {
			var newFn = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				fn({
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
			$(this).on("mousemove", newFn);
		};
		
		$.fn.touchend = function(fn, propagation) {
			var newFn = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				fn({
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
			$(this).on("mouseup", newFn);
		};
		
		$.fn.touchclick = function(fn, propagation) {
			
			var touchclickState = null;
			
			var downHandler = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				touchclickState = {
					x: event.clientX,
					y: event.clientY
				}
			};
			
			var upHandler = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				if (touchclickState == null)
					return;
				
				var touchclickStateTmp = touchclickState;
				touchclickState = null;
				if (Math.abs(event.clientX - touchclickStateTmp.x) < PermGuide.deadRadius &&
					Math.abs(event.clientY - touchclickStateTmp.y) < PermGuide.deadRadius)
				{
					fn({
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
			
			$(this).on("mousedown", downHandler);
			$(this).on("mouseup", upHandler);
		};
	} else {
		// Если тач поддерживается, то используем нужные события.
		$.fn.touchstart = function(fn, propagation) {
			var newFn = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchstart", newFn);
			});		
		};
		
		$.fn.touchmove = function(fn, propagation) {
			var newFn = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchmove", newFn);
			});		
		};
		
		$.fn.touchend = function(fn, propagation) {
			var newFn = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				fn(event);
			}
			$(this).each( function () {
				this.addEventListener("touchend", newFn);
			});		
		};	

		$.fn.touchclick = function(fn, propagation) {
			
			var touchclickState = null;
			
			var downHandler = function (event)
			{
				if (propagation)
					event.stopPropagation();
				event.preventDefault();
				touchclickState = {
					x: event.changedTouches[0].clientX,
					y: event.changedTouches[0].clientY
				}
			}
			
			var upHandler = function (event)
			{
				event.preventDefault();
				if (touchclickState == null)
					return;
				var touchclickStateTmp = touchclickState;
				touchclickState = null;
				if (Math.abs(event.changedTouches[0].clientX - touchclickStateTmp.x) < 10 &&
					Math.abs(event.changedTouches[0].clientY - touchclickStateTmp.y) < 10)
					fn(event);
			}
			
			$(this).each( function () {
				this.addEventListener("touchstart", downHandler);
				this.addEventListener("touchend", upHandler);
			});		
		};	
	}
	

})(jQuery);