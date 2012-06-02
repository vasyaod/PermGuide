<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_wikiguide_description extends DokuWiki_Syntax_Plugin {

	function getType() { return 'paragraphs'; }
	function getPType() { return 'normal'; }
	function getSort() { return 32; }
	function getAllowedTypes() { return array('container', 'formatting', 'substition', 'protected', 'disabled', 'paragraphs'); }

	function connectTo($mode) {
		$this->Lexer->addEntryPattern('<description>(?=.*?</description>)',$mode,'plugin_wikiguide_description');
	}

	function postConnect() { 
		$this->Lexer->addExitPattern('</description>','plugin_wikiguide_description');
	}

	function handle($match, $state, $pos, &$handler) {                                                                   
		return array($state, $match);
	}                                                    
                                                                                                                          
	function render($mode, &$renderer, $data) {                                                                           
		if ($mode == 'xhtml') {
			list($state, $match) = $data;
			if ($state == DOKU_LEXER_UNMATCHED)
			{
				$renderer->doc .= htmlspecialchars($match);
				return true;
			}
		}
		
		return false;
	}
}
