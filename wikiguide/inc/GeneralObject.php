<?php

class GeneralObject {

	protected function getAttribute($name, $lang = null) {
		if ($lang == null)
			return $this->{$name}->{$this->dataProvider->defaultLang};
		else if($this->{$name}->$lang)
			return $this->{$name}->{$lang};

		return $this->{$name}->{$this->dataProvider->defaultLang};
	}

	protected function getReadAttribute($content, $name, $lang, $required) {
		$isDefaultLang = false;
		if ($lang == $this->dataProvider->defaultLang)
			$isDefaultLang = true;

		if (preg_match('/\<'.$name.'\>([\s\S]*)\<\/'.$name.'\>/m', $content, $matches)) {
			if (@$this->{$name} == null)
				@$this->{$name} = (object)array();

			if ($lang != null)
				$this->{$name}->{$lang} = $matches[1];
			else
				$this->{$name} = $matches[1];
		} else if($required && $isDefaultLang) {
			throw new Exception("Object {$this->id} shout have attribute $name.");
		}
	}

	protected function getReadArrayAttribute($content, $name, $required) {
		if (preg_match('/\<'.$name.'\>([\S\s]*)\<\/'.$name.'\>/m', $content, $matches)) {

			if (@$this->{$name} == null)
				@$this->{$name} = array();
			foreach (split(",", $matches[1]) as $res) {
				$res = trim($res);
				if ($res != "")
					$this->{$name}[] = $res;
			}

		} else if($required) {
			throw new Exception("Object {$this->id} shout have attribute '$name'.");
		}
	}
}

?>
