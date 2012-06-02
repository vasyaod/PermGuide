<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_wikiguide_audio extends DokuWiki_Syntax_Plugin {
    
	public function __construct() {
		//trigger_error("__construct");	
	}

	function getType() { return 'disabled'; }
	function getPType() { return 'block'; }
    function getSort() { return 32; }

	function connectTo($mode) {
		$this->Lexer->addEntryPattern('<audio>(?=.*?</audio>)',$mode,'plugin_wikiguide_audio');
	}
	
    function postConnect() { 
		$this->Lexer->addExitPattern('</audio>','plugin_wikiguide_audio');
	}
                                                                                                                          
    function handle($match, $state, $pos, &$handler) {                                                                   
		return array($state, trim($match));
    }                                                                                                                     
                                                                                                                          
    function render($mode, &$renderer, $data) {                                                                           
        
		if ($mode == 'xhtml') {
			list($state, $match) = $data;
			if ($state == DOKU_LEXER_UNMATCHED)
			{			
				$fileName = htmlspecialchars($match);
				$renderer->doc .= '
					<div class="object_audio">
						<a href="/dokuwiki/lib/exe/detail.php?media=perm:audio:'.$fileName.'.mp3">'.$fileName.'.mp3</a><br/>
						<a href="/dokuwiki/lib/exe/detail.php?media=perm:audio:'.$fileName.'.ogg">'.$fileName.'.ogg</a><br/>
					</div>
				';
			}
			return true;
		}
		
		return false;
	}
}
