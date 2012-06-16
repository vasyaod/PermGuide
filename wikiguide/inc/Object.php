<?php

class Object {
	private $id;
	private $name; // Имя объекта. Обязательное поле.
	private $description; // Описание объекта.
	private $tags = array(); // Содержит список id тэгов привязанных к объекту.

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
			$fileName = "{$this->dataProvider->getDataPath()}/data/pages/area/{$area}/objects/{$id}.txt";
			if (!file_exists($fileName)) {
				throw new Exception('Object file is not exist: '.$fileName);
			}
		} else {
			$fileName = "{$this->dataProvider->getDataPath()}/data/pages/{$lang}/area/{$area}/objects/{$id}.txt";
			if (!file_exists($fileName)) {
				return;
			}
		}
		$content = file_get_contents($fileName);
		
		if (preg_match('/\<name\>([\s\S]*)\<\/name\>/m', $content, $matches)) {
			if ($this->name == null)
				$this->name = (object)array();
			$this->name->$lang = $matches[1];
		} else if($isDefaultLang) {
			throw new Exception("Object $id shout have name.");
		}

		if (preg_match('/\<tags\>([\d\,\s]*)\<\/tags\>/m', $content, $matches)) {

			$this->tags = array();
			foreach (split(",", $matches[1]) as $res) {
				$res = trim($res);
				if ($res != "")
					$this->tags[] = $res;
			}

		}
	}

	public function getId() {
		return $this->id;
	}

	public function getName($lang = null) {
		if ($lang == null)
			return $this->name->{$this->dataProvider->defaultLang};
		else if($this->name->$lang)
			return $this->name->{$lang};

		return $this->name->{$this->dataProvider->defaultLang};
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
