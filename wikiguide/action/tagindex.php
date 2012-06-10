<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_tagindex extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'tagindex', NULL);
    }

    /**
     * Hook js script into page headers.
     */
    function tagindex(&$event, $param) {
		global $ID;

		if (Wikiguide::isTagsIndex($ID)) {
			
			$area = Wikiguide::getAreaByPageId($ID);
			$wikiguideData = new WikiguideData($area);
			$tags = $wikiguideData->getTags();

			$txt = " ===== Список тэгов ===== \n";
			foreach ($tags as $tag) {
				$txt .= "  * [[area:{$area}:tags:{$tag->getId()}|{$tag->getName()}]]\n";
			}
			$txt .= "**Внимание!** Данная страница генерируется автоматически, не пытайтесь её изменить.";
			$event->data = $txt;
		}

	}
}
?>