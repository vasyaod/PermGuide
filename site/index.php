<?php
	require_once('Browser.php');
	
	$browser = new Browser();
	if( $browser->getBrowser() == Browser::BROWSER_IPHONE) {
		require_once "iphone-version.html";
	} elseif( $browser->getBrowser() == Browser::BROWSER_ANDROID) {
		require_once "android-version.html";
	} else {
		require_once "full-version.html";
	}
?>