import { Spinner } from "@/components/ui/shadcn-io/spinner";
import "@/index.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";

// Script to inject into iframe that reports its content height
const HEIGHT_REPORTER_SCRIPT = `
<script>
  function reportHeight() {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'iframe-height', height }, '*');
  }
  // Report on load
  window.addEventListener('load', reportHeight);
  // Report on DOM changes
  new MutationObserver(reportHeight).observe(document.body, { 
    childList: true, subtree: true, attributes: true 
  });
  // Report on resize
  new ResizeObserver(reportHeight).observe(document.body);
  // Initial report
  reportHeight();
</script>
`;

function wrapHtmlWithHeightReporter(html: string): string {
  // Inject script before closing </body> or at the end
  if (html.includes("</body>")) {
    return html.replace("</body>", `${HEIGHT_REPORTER_SCRIPT}</body>`);
  }
  return html + HEIGHT_REPORTER_SCRIPT;
}

function GenerativeUI() {
  const { isSuccess, responseMetadata } = useToolInfo<"generative-ui">();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200); // Default minimum height

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === "iframe-height" && typeof event.data.height === "number") {
      // Only update if the message is from our iframe
      if (iframeRef.current?.contentWindow === event.source) {
        setHeight(Math.max(event.data.height, 50)); // Minimum 50px
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  if (isSuccess) {
    const wrappedHtml = wrapHtmlWithHeightReporter(responseMetadata.html as string);
    return (
      <iframe
        ref={iframeRef}
        srcDoc={wrappedHtml}
        sandbox="allow-scripts"
        className="w-full border-0"
        style={{ height: `${height}px` }}
        title="Generated UI"
      />
    );
  }

  return (
    <div className="flex justify-center items-center h-50">
      <Spinner />
    </div>
  );
}

export default GenerativeUI;

mountWidget(<GenerativeUI />);
