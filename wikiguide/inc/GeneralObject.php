<?php

class GeneralObject {

	/**
	 * Метод проверяет существование объекта с указаным id.
	 */
	protected function checkId($objectType, $area, $id) {

		if ($objectType == "area") {
			$pattern = "{$area->getDataPath()}/pages/area/*.txt";
		} else {
			$pattern = "{$area->getDataPath()}/pages/area/{$area->getId()}/{$objectType}s/*.txt";
		}
		
		$res = false;
		foreach (glob($pattern) as $filename) {
			$filename = basename($filename, ".txt");
			if( $filename == $id && $filename != ".." && $filename != ".") {
				$res = true;
				break;
			}

		}
		if (!$res)
			throw new Exception("Id($id) of {$objectType} is not exist.");
	}

	/**
	 * Метод читает файл с
	 */
	protected function readFile($objectType, $area, $id, $lang) {

		$isDefaultLang = false;
		if ($lang == $area->defaultLang)
			$isDefaultLang = true;

		if ($isDefaultLang) {
			if ($objectType == "area")
				$fileName = "{$area->getDataPath()}/pages/area/{$id}.txt";
			else
				$fileName = "{$area->getDataPath()}/pages/area/{$area->getId()}/{$objectType}s/{$id}.txt";

			if (!file_exists($fileName)) {
				throw new Exception('Object file is not exist: '.$fileName);
			}
		} else {
			if ($objectType == "area")
				$fileName = "{$area->getDataPath()}/pages/{$lang}/area/{$area->getId()}/{$id}.txt";
			else
				$fileName = "{$area->getDataPath()}/pages/{$lang}/area/{$area->getId()}/{$objectType}s/{$id}.txt";

			if (!file_exists($fileName)) {
				return;
			}
		}
		return file_get_contents($fileName);
	}


	protected function getAttribute($name, $lang = null) {
		if ($lang == null)
			return $this->{$name}->{$this->getArea()->defaultLang};
		else if($this->{$name}->$lang)
			return $this->{$name}->{$lang};

		return $this->{$name}->{$this->getArea()->defaultLang};
	}

	protected function getReadAttribute($content, $name, $lang, $required) {
		$isDefaultLang = false;
		if ($lang == $this->getArea()->defaultLang)
			$isDefaultLang = true;

		if (preg_match('/\<'.$name.'\>([\s\S]*)\<\/'.$name.'\>/m', $content, $matches)) {
			if (@$this->{$name} == null)
				@$this->{$name} = (object)array();

			if ($lang != null)
				$this->{$name}->{$lang} = $matches[1];
			else
				$this->{$name} = $matches[1];
		} else if($required && $isDefaultLang) {
			throw new Exception("Object {$this->id} shout have attribute $name.");
		}
	}

	protected function getReadArrayAttribute($content, $name, $required) {
		if (preg_match('/\<'.$name.'\>([\S\s]*)\<\/'.$name.'\>/m', $content, $matches)) {

			if (@$this->{$name} == null)
				@$this->{$name} = array();
			foreach (split(",", $matches[1]) as $res) {
				$res = trim($res);
				if ($res != "")
					$this->{$name}[] = $res;
			}

		} else if($required) {
			throw new Exception("Object {$this->id} shout have attribute '$name'.");
		}
	}
}

?>
