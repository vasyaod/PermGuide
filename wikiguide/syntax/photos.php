<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_wikiguide_photos extends DokuWiki_Syntax_Plugin {
    
	public function __construct() {
		//trigger_error("__construct");	
	}

	function getType() { return 'disabled'; }
	function getPType() { return 'block'; }
    function getSort() { return 32; }

	function connectTo($mode) {
		$this->Lexer->addEntryPattern('<photos>(?=.*?</photos>)',$mode,'plugin_wikiguide_photos'); 
	}
	
    function postConnect() { 
		$this->Lexer->addExitPattern('</photos>','plugin_wikiguide_photos'); 
	}
                                                                                                                          
    function handle($match, $state, $pos, &$handler) {                                                                   
		return array($state, trim($match));
    }                                                                                                                     
                                                                                                                          
    function render($mode, &$renderer, $data) {                                                                           
        
		if ($mode == 'xhtml') {
			list($state, $match) = $data;
			if ($state == DOKU_LEXER_UNMATCHED)
			{			
				$photos = array();
				foreach (split(",", $match) as $res) {
					$res = trim($res);
					if ($res != "")
						$photos[] = $res;
				}
				if (count($photos) > 0) {
					foreach ($photos as $photo) {
						$renderer->doc .= '
							<a href="/dokuwiki/lib/exe/detail.php?media='.$photo.'">
								<div class="object_photo" style="background-image: url(/dokuwiki/lib/exe/fetch.php?media='.$photo.')">'.$photo.'</div>
							</a>
						';
					}
				}
			}
			return true;
		}
		
		return false;
	}
}
