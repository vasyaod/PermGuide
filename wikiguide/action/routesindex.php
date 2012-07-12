<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_routesindex extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$this->hlp = plugin_load('helper', 'translation');

		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'routesindex', NULL);
		$controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this,
		                           'checkaccess', NULL);
    }

    function checkaccess($event, $param) {
		global $ID;

		if (Wikiguide::isroutesindex($ID)) {
			if ($event->data == 'edit' ||
				$event->data == 'revisions')
				$event->data = 'show';
		}
	}

    /**
     * Hook js script into page headers.
     */
    function routesindex(&$event, $param) {
		global $ID, $ACT;

		if ($ACT != 'show')
			return;

		if (Wikiguide::isRoutesIndex($ID)) {
			$lang = $this->hlp->realLC($this->hlp->getLangPart($ID));
			$langPrefix = $this->hlp->getLangPart($ID);
			if ($langPrefix)
				$langPrefix = $langPrefix.":";

			$areaId = Wikiguide::getAreaByPageId($ID);
			$area = new Area($areaId);
			$routes = $area->getRoutes();

			$txt = " [[{$langPrefix}area:{$areaId}|Содержание (о {$areaId}) ]] \n\n";
			$txt .= " ===== Список тэгов ===== \n";
			foreach ($routes as $route) {
				$txt .= "  * [[{$langPrefix}area:{$areaId}:routes:{$route->getId()}|{$route->getName($lang)}]]\n";
			}
			$txt .= "**Внимание!** Данная страница генерируется автоматически, не пытайтесь её изменить.";
			$txt .= "\n\n [[{$langPrefix}area:{$areaId}|Содержание (о {$areaId}) ]] \n";
			$event->data = $txt;
		}
	}
}
?>