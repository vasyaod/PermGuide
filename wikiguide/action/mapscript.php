<?php

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'action.php';

class action_plugin_wikiguide_mapscript extends DokuWiki_Action_Plugin {

    function register(&$controller) {
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this,
                                   'insert_javascript');
    }

    /**
     * Hook js script into page headers.
     */
    function insert_javascript(&$event, $param) {

        $script = $this->getConf('script');
/*
        $event->data['script'][] = array(
                            'type'    => 'text/javascript',
                            'charset' => 'utf-8',
                            '_data'   => '',
                            'src'     => 'http://code.jquery.com/jquery-1.7.2.min.js');
*/
		$event->data['script'][] = array(
                            'type'    => 'text/javascript',
                            'charset' => 'utf-8',
                            '_data'   => '',
                            'src'     => 'http://api-maps.yandex.ru/2.0/?load=package.full&lang=ru-RU');

		$event->data['script'][] = array(
                            'type'    => 'text/javascript',
                            'charset' => 'utf-8',
                            '_data'   => '',
                            'src'     => DOKU_BASE.'lib/plugins/wikiguide/map.js');
	}
}

?>