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
//		$this->hash = md5_file($resourcePath);
		$this->hash = dechex(crc32(file_get_contents($resourcePath)));
		$this->size = filesize($resourcePath);
	} 
}

class Object {};

class Index {
	public $filters = array();
	
	public function __construct($revision, $version) {
		
		$this->data = new Object();
		$this->data->version = $version;
		$this->data->revision = $revision;
		$this->data->totalSize = 0;
		$this->data->cacheSize = 0;
		$this->data->resources = array();
		
	}
	
	/**
	 * Метод добавляет новый фильтр в список фильтров.
	 * 
	 * @param type $filter 
	 */
	public function addFilter($filter) {
		$this->filters[] = $filter;
	}

	/**
	 * Метод возвращает true если ресурс допущен всеми фильрами.
	 * 
	 * @param type $filter 
	 */
	private function isAllowed($resource) {
		$res = true;
		foreach ($this->filters as $filter) {
			$res = $res && $filter($resource);
		}
		return $res;
	}
	
	public function addPath($path) {
		$files = array();
		getFiles($path, array('.', '..', 'index.json'), $files);
		foreach ($files as $file) {
			$resource = new Resource($file);
			if ($this->isAllowed($resource)) {
				$this->data->totalSize += $resource->size;
				if (@!$resource->serverLocation)
					$this->data->cacheSize += $resource->size;
				
				$this->data->resources[] = $resource;
			}
		}
		
	}
	
	public function toJSON() {
		return json_encode($this->data);
	}
	
};

/**
 * Филтр, который ничего не фильтрует, но смотрит что это ogg-файл и делает 
 * пометку, что его кэшировать приложению не нужно.
 */
$filterOggFile = function($resource) {
	
	$pos = strpos($resource->name, ".ogg");

	if ($pos !== false)
		$resource->doNotCache = true;	// Говорит, что данный ресурс не надо кэшировать.
//	} else {
//		$resource->serverLocation = false;
//	}
	
	
	return true;
};

$indexVersion = "1.3.1";

chdir("../../client/resources/");
$index = new Index(7, $indexVersion);
$index->addFilter($filterOggFile);
$index->addPath("./");
file_put_contents("index.json", $index->toJSON());

chdir("../../client/src/resources/");
$index = new Index(1, $indexVersion);  // У локальных ресурсов пускай номер ревизии будет 1.
$index->addFilter($filterOggFile);
$index->addPath("./");
file_put_contents("index.json", $index->toJSON());
?>