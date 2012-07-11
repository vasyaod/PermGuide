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
        
		global $ID;

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
					$area = Wikiguide::getAreaByPageId($ID);
					$renderer->doc .= '<div class="object_photos">';
					foreach ($photos as $photo) {
						$photo = htmlspecialchars($photo);
						$renderer->doc .= "
							<a href='".DOKU_BASE."/lib/exe/detail.php?media=area:{$area}:photos:{$photo}'>
								<div class='object_photo' style='background-image: url(".DOKU_BASE."/lib/exe/fetch.php?media=area:{$area}:photos:{$photo})'>area:{$area}:photos:{$photo}</div>
							</a>
						";
					}
					$renderer->doc .= '</div>';
				}
			}
			return true;
		}
		
		return false;
	}
}
