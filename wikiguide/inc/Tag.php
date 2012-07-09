<?php
require_once 'GeneralObject.php';

class Tag extends GeneralObject {
	private $id;

	public function __construct($area, $id) {
		// Проверяем существует ли
		$this->checkId("tag", $area, $id);

		$this->id = $id;
		$this->area = $area;

		$this->readForLang("en");
		$this->readForLang("ru");
	}

	private function readForLang($lang) {

		$isDefaultLang = false;
		if ($lang == $this->area->defaultLang)
			$isDefaultLang = true;

		$content = $this->readFile("tag", $this->getArea(), $this->getId(), $lang);

		$this->getReadAttribute($content, "name", $lang, true);
		$this->getReadAttribute($content, "color", null, false);
	}

	public function getId() {
		return $this->id;
	}

	public function getArea() {
		return $this->area;
	}

	public function getName($lang = null) {
		return $this->getAttribute("name", $lang);
	}
}

?>
