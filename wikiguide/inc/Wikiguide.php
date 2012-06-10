<?php

require_once 'WikiguideData.php';

class Wikiguide {

	/**
	 * Возвращает значение "области" по id страницы.
	 *
	 * @param type $id
	 * @return type
	 */
	public static function getAreaByPageId($id) {
		$a = split(":", $id);
		if (count($a) < 2) {
			return null;
		} else if (count($a) == 2){
			if ($a[0] == "area")
				return $a[1];
			else
				return null;
		} else {
			if ($a[0] == "area")
				return $a[1];
			else if ($a[1] == "area")
				return $a[2];
			else
				return null;
		}
		return null;
	}

	/**
	 * Возвращает true если страница с данным id является оглавление некоторой
	 * области.
	 *
	 * @param type $id
	 * @return type
	 */
	public static function isAreaIndex($id) {
		$a = split(":", $id,5);

		if (count($a) == 2 && $a[0] == "area") {
			return true;
		} else if (count($a) == 3 && $a[1] == "area") {
			return true;
		}
		return false;
	}

	/**
	 * Возвращает true, если страница с данным id является индексом тэгов
	 *
	 * @param type $id
	 * @return type
	 */
	public static function isTagsIndex($id) {
		$a = split(":", $id);
		if (count($a) == 3 && $a[0] == "area" && $a[2] == "tags") {
			return true;
		} else if (count($a) == 4 && $a[1] == "area" && $a[3] == "tags") {
			return true;
		}
		return false;
	}

	/**
	 * Возвращает true, если страница с данным id является индексом объектов.
	 *
	 * @param type $id
	 * @return type
	 */
	public static function isObjectsIndex($id) {
		$a = split(":", $id);
		if (count($a) == 3 && $a[0] == "area" && $a[2] == "objects") {
			return true;
		} else if (count($a) == 4 && $a[1] == "area" && $a[3] == "objects") {
			return true;
		}
		return false;
	}
}

?>
