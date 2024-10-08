import React from "react";
import env from "~/env";

declare global {
  interface Window {
    chatwootSDK: any;
    chatwootSettings: any;
  }
}
// interface ChatwootOptionsType {
//   BASE_URL: string | undefined;
//   WEBSITE_TOKEN: string | undefined;
// }
// interface ChatwootWidgetProps {
//   options: ChatwootOptionsType;
// }

class ChatwootWidget extends React.Component {
  componentDidMount() {
    // Add Chatwoot Settings
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right", // This can be left or right
      locale: "en", // Language to be set
      type: "standard", // [standard, expanded_bubble]
    };
    if (!env.CHATWOOT_MODE) {
      return;
    }

    // Paste the script from inbox settings except the <script> tag
    (function (d, t) {
      const BASE_URL = env.CHATWOOT_BASE_URL;
      const g = d.createElement(t) as HTMLScriptElement;
      const s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      if (!s.parentNode) {
        return;
      }
      s.parentNode.insertBefore(g, s);
      g.onload = () => {
        window.chatwootSDK.run({
          websiteToken: env.CHATWOOT_WEBSITE_TOKEN,
          baseUrl: BASE_URL,
        });
      };
    })(document, "script");
  }

  render() {
    return null;
  }
}

export default ChatwootWidget;
