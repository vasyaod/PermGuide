<?php

require_once 'Tag.php';
require_once 'Object.php';
require_once 'Route.php';

class WikiguideData {
	private $area;
	public $defaultLang = "ru";

	public function __construct($area) {
		$this->area = $area;
	}

	public function getDataPath() {
		return DOKU_INC;
	}

	public function getArea() {
		return $this->area;
	}

	/**
	 * Метод возвращает список тэгов.
	 *
	 * @return Tag
	 */
	public function getTags() {
		$pattern = $this->getDataPath()."/data/pages/area/".$this->area."/tags/*.txt";
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
		$pattern = $this->getDataPath()."/data/pages/area/".$this->area."/objects/*.txt";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$id = basename($filename, ".txt");
			$res[] = new Object($this, $id);
		}
		return $res;
	}

	/**
	 * Метод возвращает список маршрутов.
	 *
	 * @return Route[]
	 */
	public function getRoutes() {
		$pattern = $this->getDataPath()."/data/pages/area/".$this->area."/routes/*.txt";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$id = basename($filename, ".txt");
			$res[] = new Route($this, $id);
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
		return new Tag($this, $id);
	}
}

?>
