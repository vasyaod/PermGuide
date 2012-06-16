<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

class action_plugin_wikiguide_disablecache extends DokuWiki_Action_Plugin {

    function register($controller) {
        $controller->register_hook('PARSER_CACHE_USE', 'BEFORE', $this,
                                   'disablecache');
    }

    /**
     * Hook js script into page headers.
     */
    function disablecache($event, $param) {
		$event->preventDefault();
		$event->stopPropagation();
		$event->result = false;
	}
}
?>