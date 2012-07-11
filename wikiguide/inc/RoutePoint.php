<?php

class RoutePoint extends Point {

	public $id = "0";

	public function __construct($lat, $lng, $objectId = "0") {
		$this->lat = $lat;
		$this->lng = $lng;
		$this->id = $objectId;
	}

	public function getObjectId() {
		return $this->id;
	}
}

?>
