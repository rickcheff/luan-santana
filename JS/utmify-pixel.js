// Utmify Pixel Code
window.pixelId = "6a2b6531458940c8bc182dce";
var a = document.createElement("script");
a.setAttribute("async", "");
a.setAttribute("defer", "");
a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
document.head.appendChild(a);

// Helper function to track Purchase event
function trackUtmifyPurchase(orderId, totalValue, itemCount) {
  if (typeof window.utmifyPixel !== 'undefined' && window.utmifyPixel.track) {
    window.utmifyPixel.track('Purchase', {
      order_id: orderId,
      value: totalValue,
      currency: 'EUR',
      num_items: itemCount
    });
  }
}

// Helper function to track AddToCart event
function trackUtmifyAddToCart(totalValue, itemCount) {
  if (typeof window.utmifyPixel !== 'undefined' && window.utmifyPixel.track) {
    window.utmifyPixel.track('AddToCart', {
      value: totalValue,
      currency: 'EUR',
      num_items: itemCount
    });
  }
}

