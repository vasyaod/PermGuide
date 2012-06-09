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
		$path = $dataProvider->getDataPath()."/pages/area/".$area."/tags/";
	}

	public function getTagById($id) {
		return new Tag($this, $this->area, $id);
	}
}

?>
