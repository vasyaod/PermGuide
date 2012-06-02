<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_wikiguide_map extends DokuWiki_Syntax_Plugin {
    
	public function __construct() {
		//trigger_error("__construct");	
	}

	function getType() { return 'disabled'; }
	function getPType() { return 'block'; }
	function getSort() { return 32; }

	function connectTo($mode) { 
		//trigger_error("connectTo".$mode);	
		$this->Lexer->addSpecialPattern('<map.+?/>',$mode,'plugin_wikiguide_map');
	}
	                                                                                                       
	function handle($match, $state, $pos, &$handler) {
		if (preg_match('/<map lat\="([\.\d]+?)" lng\="([\.\d]+?)"\/>/', $match, $matches))
		{
			trigger_error("handle1: ".$match);
			return array($state, $matches[1], $matches[2]);
		}
		else
		{
			trigger_error("handle2: ".$match);
			return array($state, $match);
		}

	}

	function render($mode, &$renderer, $data) {                                                 
		list($state, $lat, $lng) = $data;
		if ($mode == 'xhtml') {
			if (count($data) == 2) {
				$renderer->doc .= $lat;
			} else {
				//$renderer->doc .= 'lat: '.$lat.' lng: '.$lng;
        $renderer->doc .= '
<div id="object_map"></div>
<script type="text/javascript" charset="utf-8">

	$(document).ready(function() {
		var lat = '.$lat.';
		var lng = '.$lng.';
		var myMap = new ymaps.Map("object_map", {
			center: [lat, lng],
			zoom: 14
		});
		var myPlacemark = new  ymaps.Placemark([lat, lng]);
		myMap.geoObjects.add(myPlacemark);
	});

</script>                                                                                                       
';

			}
			return true;
		}

		return false;
	}
}
