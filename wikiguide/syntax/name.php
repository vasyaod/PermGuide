<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_wikiguide_name extends DokuWiki_Syntax_Plugin {

	function getType() { return 'disabled'; }
	function getPType() { return 'block'; }
	function getSort() { return 32; }

	function connectTo($mode) {
		$this->Lexer->addEntryPattern('<name>(?=.*?</name>)',$mode,'plugin_wikiguide_name');
	}
	
	function postConnect() { 
		$this->Lexer->addExitPattern('</name>','plugin_wikiguide_name');
	}
                                                                                                                          
	function handle($match, $state, $pos, &$handler) {                                                                   
		return array($state, trim($match));
	}                                                    
                                                                                                                          
    function render($mode, &$renderer, $data) {                                                                           
	if ($mode == 'xhtml') {
			list($state, $match) = $data;
			if ($state == DOKU_LEXER_UNMATCHED)
			{			
				$renderer->doc .= '<h2>'.htmlspecialchars($match).'</h2>';
				return true;
			}
		}
		
		return false;
	}
}
