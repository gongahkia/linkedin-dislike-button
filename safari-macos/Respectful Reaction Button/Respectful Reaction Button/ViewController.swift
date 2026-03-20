//
//  ViewController.swift
//  Respectful Reaction Button
//
//  Created by Gabriel Ong Zhe Mian on 20/3/26.
//

import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "com.gongahkia.respectfulreactionbutton.extension"
let documentationURL = "https://github.com/gongahkia/linkedin-dislike-button/blob/main/README2.md"
let privacyURL = "https://github.com/gongahkia/linkedin-dislike-button/blob/main/README2.md#privacy-and-support"
let supportURL = "https://github.com/gongahkia/linkedin-dislike-button/issues"
let auditURL = "https://github.com/gongahkia/linkedin-dislike-button/blob/main/AUDIT.md"

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show(\(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show(\(state.isEnabled), false)")
                }
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? String else {
            return;
        }

        if body == "open-preferences" {
            SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
                DispatchQueue.main.async {
                    NSApplication.shared.terminate(nil)
                }
            }
            return
        }

        let knownURLs = [
            "open-docs": documentationURL,
            "open-privacy": privacyURL,
            "open-support": supportURL,
            "open-audit": auditURL
        ]

        guard let targetURL = knownURLs[body], let url = URL(string: targetURL) else {
            return
        }

        NSWorkspace.shared.open(url)
    }

}
