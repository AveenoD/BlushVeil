export const ADMIN_WHATSAPP = '918080161421' // ← sirf ek jagah number

export const buildWhatsAppMessage = (order, items, user, totalAmount) => {
    let message = `🛍️ *BLUSHVEIL — NEW ORDER*\n`
    message += `━━━━━━━━━━━━━━━━━━\n`
    message += `🧾 *Order ID:* ${order.orderNumber}\n`
    message += `📅 *Date:* ${new Date().toLocaleString()}\n`
    message += `━━━━━━━━━━━━━━━━━━\n\n`
    message += `📦 *ORDER ITEMS*\n\n`

    items.forEach((item, i) => {
        const name = item.name || item.dress?.name
        const size = item.size || item.selectedSize
        const color = item.color || item.selectedColor || 'N/A'
        const price = item.price || item.dress?.price
        message += `🔹 *Item ${i + 1}*\n`
        message += `Name: ${name}\n`
        message += `Size: ${size}\n`
        message += `Color: ${color}\n`
        message += `Qty: ${item.quantity}\n`
        message += `Price: ₹${price} × ${item.quantity} = ₹${price * item.quantity}\n`
        message += `------------------------------\n`
    })

    message += `\n💰 *ORDER SUMMARY*\n`
    message += `Total Items: ${items.reduce((s, i) => s + i.quantity, 0)}\n`
    message += `Total Amount: *₹${totalAmount}*\n`
    message += `\n━━━━━━━━━━━━━━━━━━\n`
    message += `🚚 *DELIVERY ADDRESS*\n`
    message += `${user.address.street}\n`
    message += `${user.address.city}, ${user.address.state}\n`
    message += `PIN: ${user.address.pincode}\n`
    message += `${user.address.country || ''}\n`
    message += `\n👤 *CUSTOMER DETAILS*\n`
    message += `Name: ${user.fullName}\n`
    message += `Phone: ${user.phoneNumber}\n`
    message += `\n━━━━━━━━━━━━━━━━━━\n`
    message += `Thank you for shopping with *BlushVeil* ❤️`

    return message
}

export const openWhatsApp = (message) => {
    window.location.href = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}