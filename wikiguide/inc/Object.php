<?php

require_once 'Point.php';
require_once 'GeneralObject.php';

class Object extends GeneralObject{
	private $id;
	protected $tags = array(); // Содержит список id тэгов привязанных к объекту.
	protected $photos = array(); // Содержит список фотографий.

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
			$fileName = "{$this->dataProvider->getDataPath()}/pages/area/{$area}/objects/{$id}.txt";
			if (!file_exists($fileName)) {
				throw new Exception('Object file is not exist: '.$fileName);
			}
		} else {
			$fileName = "{$this->dataProvider->getDataPath()}/pages/{$lang}/area/{$area}/objects/{$id}.txt";
			if (!file_exists($fileName)) {
				return;
			}
		}
		$content = file_get_contents($fileName);

		if (preg_match('/<map lat\="([\.\d]+?)" lng\="([\.\d]+?)"\/>/', $content, $matches)) {
			$this->point = new Point($matches[1], $matches[2]);
		} else if($isDefaultLang) {
			throw new Exception("Object {$this->id} shout have attribute $name.");
		}

		$this->getReadAttribute($content, "name", $lang, true);
		$this->getReadAttribute($content, "description", $lang, false);
		$this->getReadAttribute($content, "address", $lang, false);
		$this->getReadAttribute($content, "phone", null, false);
		$this->getReadAttribute($content, "audio", null, false);

		$this->getReadArrayAttribute($content, "tags", false);
		$this->getReadArrayAttribute($content, "photos", false);
	}

	public function getId() {
		return $this->id;
	}

	public function getPoint() {
		return $this->point;
	}

	public function getName($lang = null) {
		return $this->getAttribute("name", $lang);
	}

	public function getDescription($lang = null) {
		return $this->getAttribute("description", $lang);
	}

	public function getAddress($lang = null) {
		return $this->getAttribute("address", $lang);
	}

	public function getPhone() {
		return $this->phone;
	}

	public function getPhotos() {
		return $this->photos;
	}

	public function getAudio() {
		return $this->audio;
	}
	
	/**
	 * Метод возвращает массив id-шников тэгов.
	 */
	public function getTagIds() {
		return $this->tags;
	}

	/**
	 * Метод возвращает массив тэгов.
	 *
	 * @return Tag[]
	 */
	public function getTags() {
		$res = array();
		foreach ($this->tags as $tagId) {
			$tag = $this->dataProvider->getTagById($tagId);
			if ($tag != null)
				$res[] = $tag;
		}
		return $res;
	}
}

?>
