<?php

class Tag {
	private $id;
	private $name;

	public function __construct($dataProvider, $area, $id) {
		$this->id = $id;
		$fileName = $dataProvider->getDataPath()."/data/pages/area/".$area."/tags/".$id.".txt";
		if (!file_exists($fileName)) {
			throw new Exception('Tag file is not exist: '.$fileName);
		}
		$content = file_get_contents($fileName);

		if (preg_match("/\<name\>(.*?)\<\/name\>/", $content, $matches)) {
			$this->name = $matches[1];
		} else {
			throw new Exception("Tag $id shout have name.");
		}
	}

	public function getId() {
		return $this->id;
	}

	public function getName() {
		return $this->name;
	}
}

?>
