const ADMIN_WHATSAPP = '919999999999' // ← sirf ek jagah

export const sendWhatsAppOrder = async (api, order, cartItems, user, totalAmount) => {
   let message = `*BLUSHVEIL — NEW ORDER*\n`
            message += `━━━━━━━━━━━━━━━━━━\n`
            message += `*Order ID:* ${order.orderNumber}\n`
            message += `*Date:* ${new Date().toLocaleString()}\n`
            message += `━━━━━━━━━━━━━━━━━━\n\n`

            message += `*ORDER ITEMS*\n\n`

            cartItems.forEach((item, i) => {
                message += `*Item ${i + 1}*\n`
                message += `Name: ${item.dress.name}\n`
                message += `Size: ${item.selectedSize}\n`
                message += `Color: ${item.selectedColor || 'N/A'}\n`
                message += `Qty: ${item.quantity}\n`
                message += `Price: ₹${item.dress.price} × ${item.quantity} = ₹${item.dress.price * item.quantity}\n`
                message += `------------------------------\n`
            })

            message += `\n*ORDER SUMMARY*\n`
            message += `Total Items: ${totalItems}\n`
            message += `Total Amount: *₹${totalAmount}*\n`

            message += `\n━━━━━━━━━━━━━━━━━━\n`
            message += `*DELIVERY ADDRESS*\n`
            message += `${user.address.street}\n`
            message += `${user.address.city}, ${user.address.state}\n`
            message += `PIN: ${user.address.pincode}\n`
            message += `${user.address.country}\n`

            message += `\n*CUSTOMER DETAILS*\n`
            message += `Name: ${user.fullName}\n`
            message += `Phone: ${user.phoneNumber}\n`

            message += `\n━━━━━━━━━━━━━━━━━━\n`
            message += `Thank you for shopping with *BlushVeil* `

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')
}