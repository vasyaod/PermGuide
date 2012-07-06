<?php

class RoutePoint extends Point {

	public $id;

	public function __construct($lat, $lng, $objectId) {
		$this->lat = $lat;
		$this->lng = $lng;
		$this->id = $objectId;
	}

	public function getObjectId() {
		return $this->id;
	}
}

?>
