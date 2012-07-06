<?php

class Point {

	public $lat;
	public $lng;

	public function __construct($lat, $lng) {
		$this->lat = $lat;
		$this->lng = $lng;
	}

	public function getLat() {
		return $this->lat;
	}

	public function getLng() {
		return $this->lng;
	}

}

?>
