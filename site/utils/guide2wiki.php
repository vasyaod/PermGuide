<?php
require_once 'inc/copy-utils.php';

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
		$isDefaultLang = $this->defaultLang == $lang;

		if ($isDefaultLang)
			$path = "{$this->wikiPath}/pages/area/{$this->area}";
		else
			$path = "{$this->wikiPath}/pages/{$lang}/area/{$this->area}";

		$data = json_decode(file_get_contents($this->resourcesPath."/data.json"));

		@mkdir($path."/objects", 0755, true);
		echo "Export objects to {$path}/objects for lang $lang \n";

		// Сформирекм файлы с описанием объектов.
		foreach ($data->objects as $object) {
			$txt = "";
			if ($isDefaultLang)
				$txt = '<map lat="'.$object->point->lat.'" lng="'.$object->point->lng.'"/>';

			if ($object->name && $object->name->$lang)
				$txt .= "\n<name>{$object->name->$lang}</name>";

			if ($object->description && $object->description->$lang)
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
				$txt .= join(",", $object->tags);
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
				$txt .= "\n<photos>\n\t".join(",\n\t", $photos)."\n</photos>";
			}

			if ($isDefaultLang && @$object->audio)
				$txt .= "\n<audio>".strtolower($object->audio)."</audio>";

			file_put_contents($path."/objects/".$object->id.".txt", $txt);
		}
		file_put_contents($path."/objects.txt", "");

		////
		// Сформируем список маршрутов.
		@mkdir($path."/routes", 0755, true);
		echo "Export routes to {$path}/routes for lang $lang \n";

		$i = 0;
		foreach ($data->routes as $route) {
			$txt = "";
			$i++;

			if ($route->name && $route->name->$lang)
				$txt .= "\n<name>{$route->name->$lang}</name>\n";

			if ($object->description && $route->description->$lang)
				$txt .= "\n<description>{$route->description->$lang}</description>\n";

			if ($isDefaultLang) {
				$txt .= "\n<color>{$route->color}</color>\n";
			}

			if ($isDefaultLang && @$route->tags) {
				$txt .= "\n<tags>";
				$txt .= join(",", $route->tags);
				$txt .= "</tags>\n";
			}
			
			$txt .= "\n";

			if ($isDefaultLang) {
				foreach ($route->points as $point) {
					$txt .= '<point lat="'.$point->lat.'" lng="'.$point->lng.'" objectId="'.$point->id.'"/>'."\n";
				}
			}

			file_put_contents($path."/routes/".$i.".txt", $txt);
		}
		file_put_contents($path."/routes.txt", "");
		
		////
		// Сформируем файл со списком всех тэгов.
		@mkdir($path."/tags", 0755, true);
		echo "Export tags to {$path}/tags for lang $lang \n";
		$index = "";
		foreach ($data->tags as $tag) {
			$txt = "";

			if ($tag->name->$lang)
				$txt .= "\n<name>".$tag->name->$lang."</name>";
			if ($isDefaultLang)
				$txt .= "\n<color>".$tag->color."</color>";
			if ($isDefaultLang)
				$txt .= "\n<zIndex>".$tag->id."</zIndex>";
			file_put_contents($path."/tags/".$tag->id.".txt", $txt);

		}
		file_put_contents($path."/tags.txt", "");

		////
		// Копирование данных wiki.
		//@mkdir($path."/wiki", 0755, true);
		//rcopy("{$this->resourcesPath}/wiki/{$lang}", "{$path}/wiki");
		//file_put_contents($path.".txt", "");
	}

	private function exportFiles() {
		$path = $this->wikiPath."/media/area/".$this->area."/";
		@mkdir($path."/photos", 0777, true);
		@mkdir($path."/audio", 0777, true);
		echo "Export photos to ".$path."\n";
		$data = json_decode(file_get_contents($this->resourcesPath."/data.json"));
		// Сформирекм файлы с описанием объектов.
		foreach ($data->objects as $object) {
			if (@$object->mainPicture != "") {
				$fileName = str_replace("objphotos/", "", $object->mainPicture);
				copy($this->resourcesPath.$object->mainPicture, $path."/photos/".$fileName);
			}
			if ($object->pictures) {
				foreach ($object->pictures as $picture) {
					if ($picture != "") {
						$fileName = str_replace("objphotos/", "", $picture);
						copy($this->resourcesPath.$picture, $path."/photos/".$fileName);
					}
				}
			}

			if (@$object->audio != "") {
				copy($this->resourcesPath."/audio/".$object->audio.".mp3", $path."/audio/".strtolower($object->audio).".mp3");
				copy($this->resourcesPath."/audio/".$object->audio.".ogg", $path."/audio/".strtolower($object->audio).".ogg");
			}
		}
	}
};

$guide2wiki = new Guide2Wiki("../../client/resources/", "./wiki");
$guide2wiki->export();

?>