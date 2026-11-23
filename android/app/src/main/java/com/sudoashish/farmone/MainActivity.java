package com.sudoashish.farmone;

import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (this.bridge != null) {
            this.bridge.setWebViewClient(new BridgeWebViewClient(this.bridge) {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    WebResourceResponse response = super.shouldInterceptRequest(view, request);
                    if (response != null) {
                        Map<String, String> headers = response.getResponseHeaders();
                        Map<String, String> newHeaders = new HashMap<>(headers != null ? headers : new HashMap<>());
                        newHeaders.put("Cross-Origin-Opener-Policy", "same-origin");
                        newHeaders.put("Cross-Origin-Embedder-Policy", "require-corp");
                        newHeaders.put("Cross-Origin-Resource-Policy", "cross-origin");
                        newHeaders.put("Access-Control-Allow-Origin", "*");
                        response.setResponseHeaders(newHeaders);
                    }
                    return response;
                }
            });
        }
    }
}
