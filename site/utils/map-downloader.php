<?php
/*
$lat1 = 58.015578;
$lng1 = 56.185802;

$lat2 = 58.002458;
$lng2 = 56.267856;
*/

$lat1 = 58.026287;
$lng1 = 56.18191;

$lat2 = 58.00176;
$lng2 = 56.283705;

$count = 0;
for ($zoom = 1; $zoom < 18; $zoom++) {
	echo $zoom.": ";	
	
	$xtile1 = floor((($lng1 + 180) / 360) * pow(2, $zoom));
	$ytile1 = floor((1 - log(tan(deg2rad($lat1)) + 1 / cos(deg2rad($lat1))) / pi()) /2 * pow(2, $zoom));
	
	$xtile2 = floor((($lng2 + 180) / 360) * pow(2, $zoom));
	$ytile2 = floor((1 - log(tan(deg2rad($lat2)) + 1 / cos(deg2rad($lat2))) / pi()) /2 * pow(2, $zoom));
	
	
	for($xtile = $xtile1; $xtile <= $xtile2; $xtile++) {
		for($ytile = $ytile1; $ytile <= $ytile2; $ytile++) {
			$count++;
			$tile = file_get_contents("http://otile1.mqcdn.com/tiles/1.0.0/osm/".$zoom."/".$xtile."/".$ytile.".png");
			@mkdir("map/".$zoom."/".$xtile, 0700, true);
			file_put_contents("map/".$zoom."/".$xtile."/".$ytile.".png", $tile);
			echo ".";
		}	
	}
	echo "\n";
}
echo "Tile downloaded: ".$count."\n";
?>