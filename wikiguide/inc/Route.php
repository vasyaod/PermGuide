<?php
require_once 'GeneralObject.php';
require_once 'RoutePoint.php';

class Route extends GeneralObject {

	private $id;
	private $points = array();

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
			$fileName = "{$this->dataProvider->getDataPath()}/pages/area/{$area}/routes/{$id}.txt";
			if (!file_exists($fileName)) {
				throw new Exception('Route file is not exist: '.$fileName);
			}
		} else {
			$fileName = "{$this->dataProvider->getDataPath()}/pages/{$lang}/area/{$area}/routes/{$id}.txt";
			if (!file_exists($fileName)) {
				return;
			}
		}
		$content = file_get_contents($fileName);

		$this->getReadAttribute($content, "name", $lang, true);
		$this->getReadAttribute($content, "description", $lang, false);
		$this->getReadAttribute($content, "color", null, false);

		if (preg_match_all('/<point lat\="([\.\d]+?)" lng\="([\.\d]+?)" (objectId\="(.+?)")*\/>/im', $content, $matches)) {
			$this->points = array();
			for ($index = 0; $index < count($matches[0]); $index++) {
				$this->points[] = new RoutePoint($matches[1][$index], $matches[2][$index], $matches[4][$index]);
			}
			
		} else if($isDefaultLang) {
			throw new Exception("Route shout have point.");
		}
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

	public function getPoints() {
		return $this->points;
	}
}

?>
