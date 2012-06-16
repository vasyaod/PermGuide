<?php

class Tag {
	private $id;
	private $name;

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
			$fileName = "{$this->dataProvider->getDataPath()}/data/pages/area/{$area}/tags/{$id}.txt";
			if (!file_exists($fileName)) {
				throw new Exception('Tag file is not exist: '.$fileName);
			}
		} else {
			$fileName = "{$this->dataProvider->getDataPath()}/data/pages/{$lang}/area/{$area}/tags/{$id}.txt";
			if (!file_exists($fileName)) {
				return;
			}
		}
		$content = file_get_contents($fileName);

		if (preg_match("/\<name\>([\s\S]*?)\<\/name\>/", $content, $matches)) {
			if ($this->name == null)
				$this->name = (object)array();
			$this->name->$lang = $matches[1];
		} else if($isDefaultLang) {
			throw new Exception("Tag $id shout have name.");
		}
	}

	public function getId() {
		return $this->id;
	}

	public function getName($lang) {
		if ($lang == null)
			return $this->name->{$this->dataProvider->defaultLang};
		else if($this->name->$lang)
			return $this->name->{$lang};

		return $this->name->{$this->dataProvider->defaultLang};
	}
}

?>
