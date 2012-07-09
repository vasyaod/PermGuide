<?php

class CenterPoint extends Point {

	public $zoom;

	public function __construct($lat, $lng, $zoom) {
		$this->lat = $lat;
		$this->lng = $lng;
		$this->zoom = $zoom;
	}

	public function getZoom() {
		return $this->zoom;
	}
}

?>
