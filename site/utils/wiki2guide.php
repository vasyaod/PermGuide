<?php

require_once 'inc/WikiguideData.php';
class Object {};

class Wiki2guide {
	public $resourcesPath;
	public $wikiPath;
	public $defaultLang = "ru";
	public $area = "perm";

	public function __construct($wikiPath, $resourcesPath) {
		$this->resourcesPath = $resourcesPath;
		$this->wikiPath = $wikiPath;
	}

	public function export() {
		$this->exportFiles();
	}

};

$wiki2guide = new Wiki2guide("./wiki", "./resources");
$wiki2guide->export();

?>