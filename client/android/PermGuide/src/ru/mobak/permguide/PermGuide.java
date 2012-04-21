package ru.mobak.permguide;


import android.os.Bundle; 

import com.phonegap.*;                                                                                                        

public class PermGuide extends DroidGap
{
	//@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		super.setIntegerProperty("loadUrlTimeoutValue", 40000);
		super.loadUrl("file:///android_asset/www/index.html");
	}
}