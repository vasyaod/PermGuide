<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_wikiguide_address extends DokuWiki_Syntax_Plugin {

	function getType() { return 'disabled'; }
	function getPType() { return 'block'; }
	function getSort() { return 32; }

	function connectTo($mode) {
		$this->Lexer->addEntryPattern('<address>(?=.*?</address>)',$mode,'plugin_wikiguide_address');
	}
	
	function postConnect() { 
		$this->Lexer->addExitPattern('</address>','plugin_wikiguide_address');
	}
                                                                                                                          
	function handle($match, $state, $pos, &$handler) {                                                                   
		return array($state, trim($match));
	}                                                    
                                                                                                                          
    function render($mode, &$renderer, $data) {                                                                           
	if ($mode == 'xhtml') {
			list($state, $match) = $data;
			if ($state == DOKU_LEXER_UNMATCHED)
			{			
				$renderer->doc .= '<div class="object_address">'.htmlspecialchars($match).'</div>';
				return true;
			}
		}
		
		return false;
	}
}
