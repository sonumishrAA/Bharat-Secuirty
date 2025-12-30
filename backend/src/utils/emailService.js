// Simple email service mock (replace with Nodemailer/SendGrid in production)

const sendEmail = async ({ to, subject, html }) => {
    console.log('=================================================');
    console.log(`📧 SENDING EMAIL TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('CONTENT:');
    console.log(html);
    console.log('=================================================');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
};

const sendBookingConfirmation = async (client, booking, tempPassword) => {
    const loginUrl = 'http://localhost:4200/client/login'; // Update with env var

    const html = `
    <h1>Welcome to Bharat Security - Booking Confirmed 🔒</h1>
    <p>Hi ${client.name},</p>
    <p>Thank you for choosing Bharat Security!</p>
    
    <h3>📋 BOOKING DETAILS</h3>
    <p>Reference: <strong>${booking.referenceCode}</strong><br>
    Service: ${booking.service?.title || 'Security Service'}<br>
    Status: Submitted<br>
    Date: ${new Date().toLocaleDateString()}</p>
    
    <h3>🔐 YOUR CLIENT PORTAL ACCESS</h3>
    <p>Email: ${client.email}<br>
    Password: <strong>${tempPassword}</strong></p>
    
    <p>⚠️ Please change your password after first login.</p>
    
    <p><a href="${loginUrl}">Login to Client Portal</a></p>
    `;

    await sendEmail({
        to: client.email,
        subject: `Booking Confirmed - ${booking.referenceCode}`,
        html
    });
};

const sendAdminNewBookingAlert = async (booking, client) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bharatsecurity.com';
    const adminUrl = 'http://localhost:4200/admin/inquiries/' + booking.id;

    const html = `
    <h1>🔔 New Booking Received</h1>
    
    <h3>📋 Client Details</h3>
    <p>Name: ${client.name}<br>
    Company: ${client.company || 'N/A'}<br>
    Email: ${client.email}<br>
    Phone: ${client.phone || 'N/A'}</p>
    
    <h3>🛠️ Service Request</h3>
    <p>Service: ${booking.service?.title || 'Unknown'}<br>
    Priority: ${booking.priority}<br>
    Budget: ${booking.budget || 'N/A'}</p>
    
    <h3>📝 Project Scope</h3>
    <p>${booking.projectScope}</p>
    
    <p><a href="${adminUrl}">View in Admin Panel</a></p>
    `;

    await sendEmail({
        to: adminEmail,
        subject: `New Booking - ${client.name}`,
        html
    });
};

const sendStatusUpdate = async (client, booking, newStatus, note) => {
    const portalUrl = 'http://localhost:4200/client/booking/' + booking.id;

    const html = `
    <h1>Project Update - ${booking.referenceCode}</h1>
    <p>Hi ${client.name},</p>
    <p>Your project status has been updated!</p>
    
    <h3>📊 STATUS UPDATE</h3>
    <p>New Status: <strong>${newStatus.toUpperCase()}</strong><br>
    Note: ${note || 'Status updated by admin'}</p>
    
    <p><a href="${portalUrl}">View Details</a></p>
    `;

    await sendEmail({
        to: client.email,
        subject: `Status Update - ${booking.referenceCode}`,
        html
    });
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendAdminNewBookingAlert,
    sendStatusUpdate
};
