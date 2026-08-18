import Script from "next/script";
import { MetaPixelRouteListener } from "./MetaPixelRouteListener";

function getMetaPixelId(): string | null {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!id || !/^\d+$/.test(id)) return null;
  return id;
}

/**
 * Official Meta Pixel base snippet + PageView only.
 * No-ops when NEXT_PUBLIC_META_PIXEL_ID is unset so local/preview cannot crash.
 * Conversion events (Lead, Schedule, Contact, custom) are not initialized here.
 */
export function MetaPixel() {
  const pixelId = getMetaPixelId();
  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <MetaPixelRouteListener />
    </>
  );
}
