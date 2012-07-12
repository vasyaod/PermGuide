<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_objectsindex extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$this->hlp = plugin_load('helper', 'translation');

		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'objectsindex', NULL);
		$controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this,
		                           'checkaccess', NULL);
    }

    function checkaccess($event, $param) {
		global $ID;

		if (Wikiguide::isObjectsIndex($ID)) {
			if ($event->data == 'edit' ||
				$event->data == 'revisions')
				$event->data = 'show';
		}
	}
    /**
     * Hook js script into page headers.
     */
    function objectsindex($event, $param) {
		global $ID, $ACT;

		if ($ACT != 'show')
			return;

		if (Wikiguide::isObjectsIndex($ID)) {
			$lang = $this->hlp->realLC($this->hlp->getLangPart($ID));
			$langPrefix = $this->hlp->getLangPart($ID);
			if ($langPrefix)
				$langPrefix = $langPrefix.":";

			$areaId = Wikiguide::getAreaByPageId($ID);
			$area = new Area($areaId);
			$objects = $area->getObjects();

			$txt =  " [[{$langPrefix}area:{$areaId}|Содержание (о {$areaId}) ]] | [[{$langPrefix}area:{$areaId}:tags|Список тэгов]]\n\n";
			$txt .= " ===== Список объектов ===== \n";
			foreach ($objects as $object) {
				$txt .= "  * [[{$langPrefix}area:{$areaId}:objects:{$object->getId()}|{$object->getName($lang)}]]\n";
			}
			$txt .= "**Внимание!** Данная страница генерируется автоматически, не пытайтесь её изменить.";
			$txt .= "\n\n [[{$langPrefix}area:{$areaId}|Содержание (о {$areaId}) ]] | [[{$langPrefix}area:{$areaId}:tags|Список тэгов]]\n";
			$event->data = $txt;
		}
	}
}
?>