<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_areaindex extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'areaindex', NULL);
		$controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this,
		                           'checkaccess', NULL);
    }

    function checkaccess($event, $param) {
		global $ID;
		/*
		if (Wikiguide::isAreaIndex($ID)) {
			if ($event->data == 'edit' ||
				$event->data == 'revisions')
				$event->data = 'show';
		}
		*/

	}

    /**
     * Hook js script into page headers.
     */
    function areaindex($event, $param) {
		global $ID, $ACT;

		if ($ACT != 'show')
			return;

		if (Wikiguide::isAreaIndex($ID)) {
			
			$areaId = Wikiguide::getAreaByPageId($ID);

			//$txt .= " === Доступные разделы === \n";
			$txt .= "\n\n";
			$txt .= "  * [[area:{$areaId}:wiki:index|Энциклопедия, сведения о городе]]\n";
			$txt .= "  * [[area:{$areaId}:objects|Список объектов]]\n";
			$txt .= "  * [[area:{$areaId}:routes|Список маршрутов]]\n";
			$txt .= "  * [[area:{$areaId}:tags|Список тэгов]]\n";
			$event->data .= $txt;
		}

	}
}
?>