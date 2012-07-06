<?php

require_once 'Tag.php';
require_once 'Object.php';
require_once 'Route.php';

class Area {

	private $id;
	private $dataPath;

	public $defaultLang = "ru";

	public function __construct($id, $dataPath) {
		$this->id = $id;
		if (!$dataPath)
			$this->dataPath = DOKU_INC."/data/";
		else
			$this->dataPath = $dataPath;
	}

	public function getDataPath() {
		return $this->dataPath;
	}

	public function getId() {
		return $this->id;
	}

	public function getArea() {
		return $this->id;
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
		$pattern = "{$this->getDataPath()}/pages/area/{$this->getId()}/routes/*.txt";
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
		try {
			return new Tag($this, $id);
		} catch (Exception $exc) {
			return null;
		}
	}
}

?>
