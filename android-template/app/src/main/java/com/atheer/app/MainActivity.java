package com.atheer.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;

public class MainActivity extends Activity {
    private WebView wv;
    @Override protected void onCreate(Bundle saved){
        super.onCreate(saved);
        wv = new WebView(this);
        WebSettings ws = wv.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        wv.setWebViewClient(new WebViewClient());
        setContentView(wv);
        wv.loadUrl("file:///android_asset/www/index.html");
    }
    @Override public void onBackPressed(){
        if(wv != null && wv.canGoBack()) wv.goBack(); else super.onBackPressed();
    }
}
