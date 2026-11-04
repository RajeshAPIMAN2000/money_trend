let checkoutPromise

export function loadRazorpayCheckout() {
  if (typeof window.Razorpay === 'function') return Promise.resolve(window.Razorpay)
  if (checkoutPromise) return checkoutPromise

  checkoutPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      if (typeof window.Razorpay === 'function') resolve(window.Razorpay)
      else reject(new Error('Razorpay Checkout did not load. Refresh the page and try again.'))
    }
    script.onerror = () => reject(new Error('Razorpay Checkout did not load. Refresh the page and try again.'))
    document.head.appendChild(script)
  }).catch((error) => {
    checkoutPromise = null
    throw error
  })

  return checkoutPromise
}