<?php
require_once 'GeneralObject.php';
require_once 'RoutePoint.php';

class Route extends GeneralObject {

	private $id;
	private $points = array();

	public function __construct($area, $id) {
		$this->checkId("route", $area, $id);

		$this->id = $id;
		$this->area = $area;

		$this->readForLang("en");
		$this->readForLang("ru");
	}

	private function readForLang($lang) {

		$isDefaultLang = false;
		if ($lang == $this->area->defaultLang)
			$isDefaultLang = true;

		$content = $this->readFile("route", $this->getArea(), $this->getId(), $lang);

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

	public function getArea() {
		return $this->area;
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
