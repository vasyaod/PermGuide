<?php

require_once 'inc/Area.php';
require_once 'lib/JSON.php';

/**
 * Indents a flat JSON string to make it more human-readable.
 *
 * @param string $json The original JSON string to process.
 *
 * @return string Indented version of the original JSON string.
 */
function indent($json) {

    $result      = '';
    $pos         = 0;
    $strLen      = strlen($json);
    $indentStr   = '  ';
    $newLine     = "\n";
    $prevChar    = '';
    $outOfQuotes = true;

    for ($i=0; $i<=$strLen; $i++) {

        // Grab the next character in the string.
        $char = substr($json, $i, 1);

        // Are we inside a quoted string?
        if ($char == '"' && $prevChar != '\\') {
            $outOfQuotes = !$outOfQuotes;

        // If this character is the end of an element,
        // output a new line and indent the next line.
        } else if(($char == '}' || $char == ']') && $outOfQuotes) {
            $result .= $newLine;
            $pos --;
            for ($j=0; $j<$pos; $j++) {
                $result .= $indentStr;
            }
        }

        // Add the character to the result string.
        $result .= $char;

        // If the last character was the beginning of an element,
        // output a new line and indent the next line.
        if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
            $result .= $newLine;
            if ($char == '{' || $char == '[') {
                $pos ++;
            }

            for ($j = 0; $j < $pos; $j++) {
                $result .= $indentStr;
            }
        }

        $prevChar = $char;
    }

    return $result;
}


class Wiki2guide {
	private $resourcesPath;
	private $wikiPath;

	public $defaultLang = "ru";
	public $areaId = "perm";

	public function __construct($wikiPath, $resourcesPath) {
		$this->resourcesPath = $resourcesPath;
		$this->wikiPath = $wikiPath;

		$this->area = new Area($this->areaId, $wikiPath);
	}

	public function export() {
		$res = (object)array();

		$photoFiles = $this->getPhotoFiles();
		$audioFiles = $this->getAudioFiles();

		if (@$this->area->center) {
			$res->center = $this->area->getCenter();

			// Сля совместимости со старими версиями файла сформируем старый формат.
			$res->centerLat = $this->area->getCenter()->getLat();
			$res->centerLng = $this->area->getCenter()->getLng();
			$res->zoom = $this->area->getCenter()->getZoom();
		}
		else {
			echo "Error! Area must have center\n";
			return;
		}

		// Сформируем сведения ою области
		if (@$this->area->name)
			$res->name = $this->area->name;
		else {
			echo "Error! Area must have name\n";
			return;
		}

		if (@$this->area->description)
			$res->description = $this->area->description;

		// Сформируем список объектов.
		$res->objects = array();
		foreach ($this->area->getObjects() as $object) {

			$obj = (object)array();
			$obj->id = $object->getId();
			
			if (@$object->point) {
				$obj->point = $object->point;
			} else {
				echo "Warning! Object must have point\n";
				continue;
			}
			if (@$object->name) {
				$obj->name = $object->name;
			} else {
				echo "Warning! Object must have name\n";
				continue;
			}

			if (@$object->description)
				$obj->description = $object->description;

			if (@$object->phone || @$object->address) {
				$obj->contacts = (object)array();
				if (@$object->address)
					$obj->contacts->address = $object->address;
				if (@$object->phone)
					$obj->contacts->phoneNumber = $object->phone;
			}

			$tags = $object->getTags();
			if (count($tags) > 0) {
				$obj->tags = array();
				foreach ($tags as $tag) {
					$obj->tags[] = $tag->getId();
				}
			}

			$photos = $object->getPhotos();
			if (count($photos) > 0) {
				if (count($photos) > 1)
					$obj->pictures = array();

				$i = 0;
				@mkdir($this->resourcesPath."/objphotos", 0777, true);
				foreach ($photos as $photo) {
					if (!in_array($photo, $photoFiles)) {
						echo "Warning! Photo file $photo is not exist!\n";
						continue;
					}

					if ($i == 0)
						$obj->mainPicture = "objphotos/".$photo;
					else
						$obj->pictures[] = "objphotos/".$photo;

					copy("{$this->wikiPath}/media/area/{$this->area->getId()}/photos/{$photo}", "{$this->resourcesPath}/objphotos/{$photo}");
					$i++;
				}
			}

			if (@$object->audio) {
				if (!in_array($object->audio, $audioFiles)) {
					echo "Warning! Audio file {$object->audio} is not exist!\n";
					continue;
				}
				@mkdir($this->resourcesPath."/audio", 0777, true);

				$obj->audio = $object->audio;
				copy("{$this->wikiPath}/media/area/{$this->area->getId()}/audio/{$object->audio}.mp3", "{$this->resourcesPath}/audio/{$object->audio}.mp3");
				copy("{$this->wikiPath}/media/area/{$this->area->getId()}/audio/{$object->audio}.ogg", "{$this->resourcesPath}/audio/{$object->audio}.ogg");
			}

			$res->objects[] = $obj;
		}

		$res->routes = array();
		foreach ($this->area->getRoutes() as $route) {
			$obj = (object)array();

			if (@$route->name) {
				$obj->name = $route->name;
			} else {
				continue;			// TODO: Выдать сообщение. Это обязательное поле.
			}

			if (@$route->description)
				$obj->description = $route->description;

			if (@$route->color) {
				$color = str_replace("#", "", $route->color);
				$obj->color = "#".$color;
			} else {
				continue;			// TODO: Выдать сообщение. Это обязательное поле.
			}

			$points = $route->getPoints();
			// Если точек меньше двух, то маршрут дефектный.
			if (count($points) < 2) {
				continue;			// TODO: Выдать сообщение. Это обязательное поле. Должно быть 2 точки, как минимум.
			}

			$obj->points[] = array();
			foreach ($points as $point) {
				$obj->points[] = $point;
			}

			$res->routes[] = $obj;
		}

		$res->tags = array();
		foreach ($this->area->getTags() as $tag) {
			$obj = (object)array();
			$obj->id = $tag->getId();

			if (@$tag->name)
				$obj->name = $tag->name;

			if (@$tag->color) {
				$color = str_replace("#", "", $tag->color);
				$obj->color = "#".$color;
				$obj->picture = "img/box_{$color}.png";
			}

			$res->tags[] = $obj;
		}

		@mkdir($this->resourcesPath, 0755, true);
		$json = new Services_JSON();
		file_put_contents($this->resourcesPath."/data.json", indent($json->encode($res)));
	}

	/**
	 * Метод возвращает список существующих фотографий.
	 */
	private function getPhotoFiles() {
		$pattern = "{$this->area->getDataPath()}/media/area/{$this->area->getId()}/photos/*";
		$res = array();
		foreach (glob($pattern) as $filename) {
			$res[] = basename($filename);
		}
		return $res;
	}

	/**
	 * Метод возвращает список названий аудио файлов для которых существует
	 * и mp3 формат и ogg.
	 */
	private function getAudioFiles() {
		$pattern = "{$this->area->getDataPath()}/media/area/{$this->area->getId()}/audio/*.mp3";
		$mp3Files = array();
		foreach (glob($pattern) as $filename) {
			$mp3Files[] = basename($filename, ".mp3");
		}

		$pattern = "{$this->area->getDataPath()}/media/area/{$this->area->getId()}/audio/*.ogg";
		$oggFiles = array();
		foreach (glob($pattern) as $filename) {
			$oggFiles[] = basename($filename, ".ogg");
		}

		return array_uintersect($mp3Files, $oggFiles, "strcasecmp");
	}

};

$wiki2guide = new Wiki2guide("./wiki", "./resources");
$wiki2guide->export();

?>