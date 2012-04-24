<?php
function getFiles($directory = "./", $exempt = array('.', '..'), &$files = array()) {
	$handle = opendir($directory);
	while (false !== ($resource = readdir($handle))) {
		if (!in_array(strtolower($resource), $exempt)) {
			if (is_dir($directory . $resource . '/')) {
				if ($directory == "." || $directory == "./")
					array_merge($files, getFiles($resource . '/', $exempt, $files));
				else
					array_merge($files, getFiles($directory . $resource . '/', $exempt, $files));
			} else {
				if ($directory == "." || $directory == "./")
					$files[] = $resource;
				else
					$files[] = $directory . $resource;
			}
		}
	}
	closedir($handle);
	return $files;
};

class Resource {
	
	public $name;
	public $hash;
	public $size;

	public function __construct($resourcePath) { 
		$this->name = $resourcePath;
		$this->hash = md5_file($resourcePath);
		$this->size = filesize($resourcePath);
	} 
}

class Index {
	
	public $revision;
	public $totalSize = 0;
	public $resources = array();
	
	public function __construct($revision) {
		$this->revision = $revision;
	}
	
	public function addPath($path) {
		$files = array();
		getFiles($path, array('.', '..', 'resources.json'), $files);
		foreach ($files as $file) {
			$resource = new Resource($file);
			$this->totalSize += $resource->size;
			$this->resources[] = $resource;
		}
		
	}
	
	public function toJSON() {
		return json_encode($this);
	}
	
};

chdir("../../client/data/");
$index = new Index(3);
$index->addPath("./");
file_put_contents("resources.json", $index->toJSON());
?>