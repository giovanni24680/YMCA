import SwiftUI
import WebKit

struct WebAppView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let wv = WKWebView(frame: .zero, configuration: config)
        wv.isOpaque = false
        wv.backgroundColor = UIColor(red: 0.04, green: 0.03, blue: 0.02, alpha: 1)
        wv.scrollView.contentInsetAdjustmentBehavior = .never

        if let indexUrl = Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "web"
        ) {
            wv.loadFileURL(
                indexUrl,
                allowingReadAccessTo: indexUrl.deletingLastPathComponent()
            )
        }
        return wv
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
