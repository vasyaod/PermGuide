<?php

class Object {};

class Guide2wiki {
	public $resourcesPath;
	public $wikiPath;
	public $defaultLang = "ru";
	public $area = "perm";

	public function __construct($resourcesPath, $wikiPath) {
		$this->resourcesPath = $resourcesPath;
		$this->wikiPath = $wikiPath;
	}

	public function export() {
		$this->exportObjects("ru");
		$this->exportObjects("en");
		$this->exportFiles();
	}

	private function exportObjects($lang) {
		$isDefaultLang = false;
		$path = "{$this->wikiPath}/pages/{$lang}/area/{$this->area}";

		if ($this->defaultLang == $lang) {
			$isDefaultLang = true;
			$path = "{$this->wikiPath}/pages/area/{$this->area}";
		}

		@mkdir($path."/objects", 0755, true);
		echo "Export objects to $path for lang $lang \n";
		$data = json_decode(file_get_contents($this->resourcesPath."/data.json"));
		// Сформирекм файлы с описанием объектов.
		$index = "";
		foreach ($data->objects as $object) {
			$txt = "";
			if ($isDefaultLang)
				$txt = '<map lat="'.$object->point->lat.'" lng="'.$object->point->lng.'"/>';

			if ($object->name && $object->name->$lang)
				$txt .= "\n<name>{$object->name->$lang}</name>";

			if ($object->description->$lang)
				$txt .= "\n<description>{$object->description->$lang}</description>";

			if (@$object->contacts) {
				if (@$object->contacts->address && $object->contacts->address->$lang) {
					$txt .= "\n<address>{$object->contacts->address->$lang}</address>";
				}
				if ($isDefaultLang && @$object->contacts->phoneNumber) {
					$txt .= "\n<phone>".$object->contacts->phoneNumber."</phone>";
				}
			}

			if ($isDefaultLang && @$object->tags) {
				$txt .= "\n<tags>";
				$i = 0;
				foreach ($object->tags as $tag) {
					$i++;
					$txt .= $tag;
					if($i != count($object->tags))
						$txt .= ",";
				}
				$txt .= "</tags>";
			}

			$photos = array();
			if (@$object->mainPicture != "") {
				$photos[] = str_replace("objphotos/", "", $object->mainPicture);
			}
			if ($object->pictures) {
				foreach ($object->pictures as $picture) {
					$photos[] = str_replace("objphotos/", "", $picture);
				}
			}
			if ($isDefaultLang && count($photos) > 0) {
				$txt .= "\n<photos>\n";
				$i = 0;
				foreach ($photos as $photo) {
					$i++;
					$txt .= "\t".$photo;
					if($i != count($photos)) {
						$txt .= ",\n";
					} else {
						$txt .= "\n";
					}
				}
				$txt .= "</photos>";
			}
			if ($isDefaultLang && @$object->audio)
				$txt .= "\n<audio>".$object->audio."</audio>";

			file_put_contents($path."/objects/".$object->id.".txt", $txt);

			// Формируем список объектов.
			//$index .= "  * [[area:".$this->area.":objects:".$object->id."|".$object->name->ru."]]\n";
		}
		//file_put_contents($path."/objects.txt", $index);
		file_put_contents($path."/objects.txt", "");

		////
		// Сформируем файл со списком всех тэгов.
		@mkdir($path."/tags", 0755, true);
		$index = "";
		foreach ($data->tags as $tag) {
			$txt = "";

			if ($tag->name->$lang)
				$txt .= "\n<name>".$tag->name->$lang."</name>";
			if ($isDefaultLang)
				$txt .= "\n<color>".$tag->color."</color>";
			file_put_contents($path."/tags/".$tag->id.".txt", $txt);

			//$index .= "  * [[area:".$this->area.":tags:".$tag->id."|".$tag->name->ru."]]\n";
		}
		//file_put_contents($path."/tags.txt", $index);
		file_put_contents($path."/tags.txt", "");

		//$areaIndex  = "";
		//$areaIndex .= "  * [[area:".$this->area.":objects|Список объектов]]\n";
		//$areaIndex .= "  * [[area:".$this->area.":tags|Список тэгов]]\n";
		//file_put_contents($this->wikiPath."/pages/area/".$this->area.".txt", $areaIndex);
		file_put_contents($path.".txt", "");
	}

	private function exportFiles() {
		$path = $this->wikiPath."/media/area/".$this->area."/";
		@mkdir($path."/objphotos", 0777, true);
		@mkdir($path."/audio", 0777, true);
		echo "Export photos to ".$path."\n";
		$data = json_decode(file_get_contents($this->resourcesPath."/data.json"));
		// Сформирекм файлы с описанием объектов.
		foreach ($data->objects as $object) {
			if (@$object->mainPicture != "") {
				copy($this->resourcesPath.$object->mainPicture, $path.$object->mainPicture);
			}
			if ($object->pictures) {
				foreach ($object->pictures as $picture) {
					if ($picture != "")
						copy($this->resourcesPath.$picture, $path.$picture);
				}
			}

			if (@$object->audio != "") {
				copy($this->resourcesPath."/audio/".$object->audio.".mp3", $path."/audio/".$object->audio.".mp3");
				copy($this->resourcesPath."/audio/".$object->audio.".ogg", $path."/audio/".$object->audio.".ogg");
			}
		}
	}
};

$guide2wiki = new Guide2Wiki("../../client/resources/", "./wiki");
$guide2wiki->export();

?>