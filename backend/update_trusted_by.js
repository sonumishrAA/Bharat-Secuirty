const prisma = require('./src/config/prisma');

async function main() {
    console.log("Updating Trusted By Data...");

    const trustedByData = [
        { "id": 1, "name": "FinTech Corp", "logo": "🏦" },
        { "id": 2, "name": "HealthCare Plus", "logo": "🏥" },
        { "id": 3, "name": "E-Commerce Hub", "logo": "🛒" },
        { "id": 4, "name": "Enterprise Solutions", "logo": "🏢" },
        { "id": 5, "name": "TechStartup Inc", "logo": "🚀" },
        { "id": 6, "name": "GovSecure", "logo": "🏛️" }
    ];

    // Store as JSON string as required by the schema/controller
    const content = JSON.stringify(trustedByData);

    await prisma.homepageContent.upsert({
        where: { sectionKey: 'trustedBy' },
        update: { content: content },
        create: { sectionKey: 'trustedBy', content: content, isActive: true }
    });

    console.log("Trusted By Data Updated Successfully!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
