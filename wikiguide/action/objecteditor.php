<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

class action_plugin_wikiguide_objecteditor extends DokuWiki_Action_Plugin {

    function register(&$controller) {
        $controller->register_hook('TPL_ACT_RENDER', 'BEFORE', $this,
                                   'mapeditor');
    }

    /**
     * Hook js script into page headers.
     */
    function mapeditor(&$event, $param) {
		global $ID, $ACT;
		// Данная карта должна изображаться только при редактировании страницы.
		if (Wikiguide::isObjectPage($ID) && $ACT == 'edit') {
			$html = '
			<div id="object_map_editor"></div>
			<script type="text/javascript" charset="utf-8">
				WikiGuide.ObjectEditor.loadMap();
			</script>';

			echo $html;
		}
	}
}

?>