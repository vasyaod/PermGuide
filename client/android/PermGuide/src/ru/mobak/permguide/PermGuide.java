package ru.mobak.permguide;


import java.util.Locale;

import android.os.Bundle; 

import com.phonegap.*;

public class PermGuide extends DroidGap
{
	//@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		super.setIntegerProperty("loadUrlTimeoutValue", 40000);
		
		String langParam = "";
		if (Locale.getDefault().getLanguage().equals("ru"))
			langParam = "&lang=ru";
			
		// В 13 и 14 версия sdk есть касяк который не дает передовать параметры
		// в дщкальный урл. Например: file://index.html?p=1 выдает ошибку. 
		// Этот кастыль какраз сделан что бы избежать этой ошибки. 
		int currentapiVersion = android.os.Build.VERSION.SDK_INT;
		//if (currentapiVersion >= 13){
			super.loadUrl("file:///android_asset/www/index.html");
		//} else {
		//	super.loadUrl("file:///android_asset/www/index.html?phonegap=1"+langParam);
		//}
	}
}