<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_tagsindex extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$this->hlp = plugin_load('helper', 'translation');

		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'tagsindex', NULL);
		$controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this,
		                           'checkaccess', NULL);
    }

    function checkaccess($event, $param) {
		global $ID;

		if (Wikiguide::isTagsIndex($ID)) {
			if ($event->data == 'edit' ||
				$event->data == 'revisions')
				$event->data = 'show';
		}
	}

    /**
     * Hook js script into page headers.
     */
    function tagsindex(&$event, $param) {
		global $ID;

		if (Wikiguide::isTagsIndex($ID)) {
			$lang = $this->hlp->realLC($this->hlp->getLangPart($ID));
			$langPrefix = $this->hlp->getLangPart($ID);
			if ($langPrefix)
				$langPrefix = $langPrefix.":";

			$area = Wikiguide::getAreaByPageId($ID);
			$wikiguideData = new WikiguideData($area);
			$tags = $wikiguideData->getTags();

			$txt = " [[{$langPrefix}area:{$area}|Содержание (о {$area}) ]] | [[{$langPrefix}area:{$area}:objects|Список объектов]]\n\n";
			$txt .= " ===== Список тэгов ===== \n";
			foreach ($tags as $tag) {
				$txt .= "  * [[{$langPrefix}area:{$area}:tags:{$tag->getId()}|{$tag->getName($lang)}]]\n";
			}
			$txt .= "**Внимание!** Данная страница генерируется автоматически, не пытайтесь её изменить.";
			$txt .= "\n\n [[{$langPrefix}area:{$area}|Содержание (о {$area}) ]] | [[{$langPrefix}area:{$area}:objects|Список объектов]]\n";
			$event->data = $txt;
		}
	}
}
?>