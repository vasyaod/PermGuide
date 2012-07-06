<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class action_plugin_wikiguide_tagfooter extends DokuWiki_Action_Plugin {

    function register(&$controller) {
		$controller->register_hook('PARSER_WIKITEXT_PREPROCESS', 'BEFORE', $this,
		                           'tagfooter', NULL);
    }

    /**
     * Hook js script into page headers.
     */
    function tagfooter(&$event, $param) {
		global $ID;
		$tagId = Wikiguide::isTagPage($ID);
		if ($tagId) {
			$areaId = Wikiguide::getAreaByPageId($ID);
			$area = new Area($areaId);
			
			$objects = $area->getObjectsByTagId($tagId);

			$txt = "\n==== Помеченные объекты ====\n";
			foreach ($objects as $object) {
				$txt .= "  * [[area:{$areaId}:objects:{$object->getId()}|{$object->getName()}]]\n";
			}

			$txt .= "\n\n [[area:{$areaId}|Содердание (о {$areaId}) ]] | [[area:{$areaId}:tags|Список тэгов]] | \n";
			$event->data .= $txt;
		}
	}
}
?>