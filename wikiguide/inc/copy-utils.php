<?php

/**
 * Взято отсюда:
 * http://php.net/manual/ru/function.copy.php
 * Из какого то коментария.
 */
// removes files and non-empty directories
function rrmdir($dir) {
  if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file)
    if ($file != "." && $file != "..") rrmdir("$dir/$file");
    rmdir($dir);
  }
  else if (file_exists($dir)) unlink($dir);
}

/**
 * Взято отсюда:
 * http://php.net/manual/ru/function.copy.php
 * Из какого то коментария.
 */
// copies files and non-empty directories
function rcopy($src, $dst) {
	if (file_exists($dst))
		rrmdir($dst);
	if (is_dir($src)) {
		mkdir($dst);
		$files = scandir($src);
		foreach ($files as $file)
			if ($file != "." && $file != "..")
				rcopy("$src/$file", "$dst/$file");
	}
	else if (file_exists($src))
		copy($src, $dst);
}

?>
