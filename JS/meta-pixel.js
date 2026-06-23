// Meta Pixel Code
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Initialize Meta Pixel
fbq('init', '972921458912309');
fbq('track', 'PageView');

// Helper function to track AddToCart event with details
function trackAddToCart(items) {
  if (!items || items.length === 0) return;

  var totalValue = 0;
  var contents = [];

  items.forEach(function(item) {
    totalValue += (item.qty * item.preco);
    contents.push({
      id: item.nome,
      quantity: item.qty,
      delivery_category: 'event_ticket'
    });
  });

  fbq('track', 'AddToCart', {
    content_name: 'Bilhetes - LUAN SANTANA',
    content_category: 'event_tickets',
    value: totalValue.toFixed(2),
    currency: 'EUR',
    contents: contents
  });

  // Also track in Utmify
  trackUtmifyAddToCart(totalValue, items.length);
}

// Helper function to track Purchase (call this on successful payment)
function trackPurchase(orderId) {
  var cartData = sessionStorage.getItem('bolCart');
  if (!cartData) return;

  try {
    var cart = JSON.parse(cartData);
    fbq('track', 'Purchase', {
      content_name: cart.show,
      content_category: 'event_tickets',
      value: cart.total.toFixed(2),
      currency: 'EUR',
      num_items: cart.totalBilhetes,
      contents: cart.items.map(function(item) {
        return {
          id: item.nome,
          quantity: item.qty,
          delivery_category: 'event_ticket'
        };
      })
    });

    // Also track purchase in Utmify
    trackUtmifyPurchase(orderId, cart.total, cart.totalBilhetes);

    // Clear cart after purchase
    sessionStorage.removeItem('bolCart');
  } catch(e) {
    console.log('Error tracking Purchase:', e);
  }
}
