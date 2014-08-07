<?php

class JSFile {
	public $name;
	public $path;
	public $content = "";
	public $depdencies = array();
	public $outputed = false;
	function __construct($file){
		$this->name = $file->getBasename(".js");
		$this->path = $file->getPathname();
	}
	
	private function loadContent(){
		if (strlen($this->content) === 0){
			$this->content = file_get_contents($this->path);
		}
	}
	
	function isDependent($otherFile){
		$this->loadContent();
		return $this !== $otherFile && preg_match(
			"/(?:^|\W)" . preg_quote($otherFile->name, "/") . "\\./",
			$this->content
		);
	}
	
	function getDependencies($otherFiles){
		return array_filter($otherFiles, array($this, "isDependent"));
	}
	
	function output(){
		$this->loadContent();
		echo $this->content . "\n\n";
		$this->outputed = true;
	}
}

header("Content-Type: text/javascript");

$files = array();
foreach (new DirectoryIterator("./") as $file){
	if ($file->getExtension() === "js"){
		$files[$file->getBasename(".js")] = new JSFile($file);
	}
}

$independent = array();
$dependent = array();
foreach ($files as $file){
	$dependencies = $file->getDependencies($files);
	if (count($dependencies)){
		$file->dependencies = $dependencies;
		$dependent[] = $file;
	}
	else {
		$independent[] = $file;
	}
}

foreach ($independent as $file){
	$file->output();
}

while (count($dependent)){
	$oldDependent = $dependent;
	$dependent = array();
	foreach ($oldDependent as $file){
		$allOutputed = true;
		foreach ($file->dependencies as $dep){
			if (!$dep->outputed){
				$allOutputed = false;
			}
		}
		if ($allOutputed){
			$file->output();
		}
		else {
			$dependent[] = $file;
		}
	}
}

?>