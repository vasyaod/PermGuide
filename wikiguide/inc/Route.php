<?php
require_once 'GeneralObject.php';

class Route extends GeneralObject {
	private $id;

	public function __construct($dataProvider, $id) {
		$this->id = $id;
		$this->dataProvider = $dataProvider;

		$this->readForLang("en");
		$this->readForLang("ru");
	}

	private function readForLang($lang) {
		$area = $this->dataProvider->getArea();
		$id = $this->id;

		$isDefaultLang = false;
		if ($lang == $this->dataProvider->defaultLang)
			$isDefaultLang = true;

		if ($isDefaultLang) {
			$fileName = "{$this->dataProvider->getDataPath()}/data/pages/area/{$area}/routes/{$id}.txt";
			if (!file_exists($fileName)) {
				throw new Exception('Tag file is not exist: '.$fileName);
			}
		} else {
			$fileName = "{$this->dataProvider->getDataPath()}/data/pages/{$lang}/area/{$area}/routes/{$id}.txt";
			if (!file_exists($fileName)) {
				return;
			}
		}
		$content = file_get_contents($fileName);

		$this->getReadAttribute($content, "name", $lang, true);
		$this->getReadAttribute($content, "description", $lang, true);
		$this->getReadAttribute($content, "color", null, false);
	}

	public function getId() {
		return $this->id;
	}

	public function getName($lang = null) {
		return $this->getAttribute("name", $lang);
	}

	public function getDescription($lang = null) {
		return $this->getAttribute("description", $lang);
	}
}

?>
