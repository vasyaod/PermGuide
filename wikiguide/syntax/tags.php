<?php
if(!defined('DOKU_INC')) die();

if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once(DOKU_PLUGIN.'syntax.php');

require_once(DOKU_INC.'lib/plugins/wikiguide/inc/Wikiguide.php');

class syntax_plugin_wikiguide_tags extends DokuWiki_Syntax_Plugin {
    
	public function __construct() {
		//trigger_error("__construct");	
	}

	function getType() { return 'disabled'; }
	function getPType() { return 'block'; }
    function getSort() { return 32; }

	function connectTo($mode) {
		$this->Lexer->addEntryPattern('<tags>(?=.*?</tags>)',$mode,'plugin_wikiguide_tags');
	}
	
    function postConnect() { 
		$this->Lexer->addExitPattern('</tags>','plugin_wikiguide_tags');
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
				$tags = array();
				foreach (split(",", $match) as $res) {
					$res = trim($res);
					if ($res != "")
						$tags[] = $res;
				}
				
				if (count($tags) > 0) {
					$this->hlp = plugin_load('helper', 'translation');
					$lang = $this->hlp->realLC($this->hlp->getLangPart($ID));
					$langPrefix = $this->hlp->getLangPart($ID);
					if ($langPrefix)
						$langPrefix = $langPrefix.":";

					$areaId = Wikiguide::getAreaByPageId($ID);
					$area = new Area($areaId);

					$renderer->doc .= '<div class="tags_list">';
					foreach ($tags as $tagId) {
						$tagId = htmlspecialchars($tagId);
						$tag = $area->getTagById($tagId);
						$renderer->doc .= "<a href='".DOKU_BASE."/doku.php?id={$langPrefix}area:{$areaId}:tags:{$tagId}'>{$tag->getName($lang)}</a>";
					}
					$renderer->doc .= '</div>';
				}

				
			}
			return true;
		}
		
		return false;
	}
}
