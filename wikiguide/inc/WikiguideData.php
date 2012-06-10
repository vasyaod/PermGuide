<?php

require_once 'Tag.php';

class WikiguideData {
	private $area;

	public function __construct($area) {
		$this->area = $area;
	}

	public function getDataPath() {
		return DOKU_INC;
	}

	public function getTags() {
		$pattern = $this->getDataPath()."/data/pages/area/".$this->area."/tags/*.txt";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$id = basename($filename, ".txt");
			$res[] = new Tag($this, $this->area, $id);
		}
		return $res;
	}

	public function getTagById($id) {
		return new Tag($this, $this->area, $id);
	}
}

?>
