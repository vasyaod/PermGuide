<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_areaindex extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'areaindex', NULL);
    }

    /**
     * Hook js script into page headers.
     */
    function areaindex($event, $param) {
		global $ID;

		if (Wikiguide::isAreaIndex($ID)) {
			
			$area = Wikiguide::getAreaByPageId($ID);

			$txt = " ===== Доступные разделы ===== \n";
			$txt .= "  * [[area:{$area}:objects|Список объектов]]\n";
			$txt .= "  * [[area:{$area}:tags|Список тэгов]]\n";
			$txt .= "**Внимание!** Данная страница генерируется автоматически, не пытайтесь её изменить.";
			$event->data = $txt;
		}

	}
}
?>