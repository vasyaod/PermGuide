<?php

class Point {

	private $lat;
	private $lng;
	private $objectId;

	public function __construct($lat, $lng, $objectId = null) {
		$this->lat = $lat;
		$this->objectId = $objectId;
	}

	public function getLat() {
		return $this->lat;
	}

	public function getLng() {
		return $this->lng;
	}

	public function getObjectId() {
		return $this->objectId;
	}

}

?>
