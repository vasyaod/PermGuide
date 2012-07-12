<?php

require_once 'Tag.php';
require_once 'Object.php';
require_once 'Route.php';
require_once 'CenterPoint.php';

class Area extends GeneralObject {

	private $id;
	private $dataPath;

	public $defaultLang = "ru";

	public function __construct($id, $dataPath = null) {
		$this->id = $id;
		if (!$dataPath)
			$this->dataPath = DOKU_INC."/data/";
		else
			$this->dataPath = $dataPath;

		$this->checkId("area", $this, $id);

		$this->readForLang("en");
		$this->readForLang("ru");
	}

	private function readForLang($lang) {
		$isDefaultLang = false;
		if ($lang == $this->defaultLang)
			$isDefaultLang = true;

		$content = $this->readFile("area", $this, $this->getId(), $lang);

		if (preg_match('/<center lat\="([\.\d]+?)" lng\="([\.\d]+?)" zoom\="([\.\d]+?)"\/>/', $content, $matches)) {
			$this->center = new CenterPoint($matches[1], $matches[2], $matches[3]);
		} else if($isDefaultLang) {
			throw new Exception("Area {$this->getId()} shout have attribute 'center'.");
		}

		$this->getReadAttribute($content, "name", $lang, true);
		$this->getReadAttribute($content, "description", $lang, false);
	}

	public function getDataPath() {
		return $this->dataPath;
	}

	public function getId() {
		return $this->id;
	}

	public function getArea() {
		return $this;
	}

	public function getDefaultLang() {
		return $this->defaultLang;
	}

	/**
	 * Метод возвращает координаты центра куда должна позиционироваться карта.
	 *
	 * @return  CenterPoint
	 */
	public function getCenter() {
		return $this->center;
	}

	/**
	 * Метод возвращает список тэгов.
	 *
	 * @return Tag
	 */
	public function getTags() {
		$pattern = "{$this->getDataPath()}/pages/area/{$this->getId()}/tags/*.txt";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$id = basename($filename, ".txt");
			$res[] = new Tag($this, $id);
		}
		return $res;
	}

	/**
	 * Метод возвращает список объектов.
	 *
	 * @return Object[]
	 */
	public function getObjects() {
		$pattern = "{$this->getDataPath()}/pages/area/{$this->getId()}/objects/*.txt";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$id = basename($filename, ".txt");
			try {
				$res[] = new Object($this, $id);
			} catch (Exception $exc) {

			}
		}
		return $res;
	}

	/**
	 * Метод возвращает список маршрутов.
	 *
	 * @return Route[]
	 */
	public function getRoutes() {
		$pattern = "{$this->getDataPath()}/pages/area/{$this->getId()}/routes/*.txt";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$id = basename($filename, ".txt");
			try {
				$res[] = new Route($this, $id);
			} catch (Exception $exc) {

			}
		}
		return $res;
	}

	/**
	 * Возвращает список объектов по id тэга.
	 *
	 * @param type $tagId
	 * @return array
	 */
	public function getObjectsByTagId($tagId) {
		$res = array();
		foreach ( $this->getObjects() as $object) {
			if (in_array($tagId, $object->getTagIds())){
				$res[] = $object;
			}
		}
		return $res;
	}

	/**
	 * Метод возвращает тэг по его id.
	 * 
	 * @param type $id
	 * @return Tag 
	 */
	public function getTagById($id) {
		try {
			return new Tag($this, $id);
		} catch (Exception $exc) {
			return null;
		}
	}

	/**
	 * Метод возвращает объект по его id.
	 *
	 * @param type $id
	 * @return Object
	 */
	public function getObjectById($id) {
		try {
			return new Object($this, $id);
		} catch (Exception $exc) {
			return null;
		}
	}

}

?>
